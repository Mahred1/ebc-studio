// Server-only outbound email for reservation notifications. Sends through a
// Gmail SMTP account configured with GMAIL_USER / GMAIL_PASSWORD (an app
// password, since Gmail disallows the plain account password for SMTP).
//
// This module pulls in nodemailer only, so it never leaks into a client bundle.

import { headers } from "next/headers"

import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

import {
  CURRENCY,
  RESERVATION_TYPES,
  reservationHref,
  type ReservationType,
} from "@/lib/reservation"

/** Gmail's SMTP endpoint — TLS on 465, uses an app password for auth. */
const SMTP_HOST = "smtp.gmail.com"
const SMTP_PORT = 465

/** Sender shown on outbound mail, tied to the configured Gmail account. */
const FROM_NAME = "EBC Studio"

/** Formats the "YYYY-MM-DD" reservation days for an email. */
function formatDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// One transport per process, created lazily: the SMTP handshake is slow, and
// Node's nodemailer keeps the connection warm for reuse across sends.
let transport: Transporter | null = null

function getTransport(): Transporter {
  if (transport) return transport
  transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  })
  return transport
}

/**
 * The reservation fields an email body needs. `ReservationView` satisfies it
 * structurally, and the admin data layer can select just these columns.
 */
export type ReservationMail = {
  reference: string
  fullName: string
  email: string
  channel: string
  location: string
  bid: string
  /** Whether the booking is a studio recording or a live event. */
  reservationType: ReservationType
  /** The day it airs, as "YYYY-MM-DD". */
  broadcastDate: string
  /** The day the studio records, as "YYYY-MM-DD" — null for live events. */
  recordingDate: string | null
}

/** Each email everyone can get, named after why it fires. */
export type ReservationEmailKind =
  | "received"
  | "accepted"
  | "rejected"
  | "canceled-by-admin"
  | "canceled-by-user"
  | "archived-by-admin"

type Form = {
  subject: (reference: string) => string
  /** Lead line already naming the reservation, e.g. "reservation A1B2C34 was canceled." */
  lead: (reference: string) => string
  /** Body paragraph(s) after the details table. */
  body: string
  /** Button label and the full destination URL. */
  ctaLabel: string
  ctaHref: (origin: string, reservation: ReservationMail) => string
}

/** The reserve page — where a rejected/canceled booker can start over. */
const NEW_RESERVATION = (origin: string) => `${origin}/reserve`
/** The public status page for one reservation. */
const CHECK_RESERVATION = (origin: string, reservation: ReservationMail) =>
  `${origin}${reservationHref(reservation.reference)}`

const FORMS: Record<ReservationEmailKind, Form> = {
  received: {
    subject: (ref) => `Your reservation ${ref} was recorded`,
    lead: (ref) => `Your reservation ${ref} was recorded. Here's what we received:`,
    body:
      "Our scheduling team will review your request and email you once there's a decision. Keep your reference handy — you'll need it to check the reservation.",
    ctaLabel: "Check your reservation",
    ctaHref: CHECK_RESERVATION,
  },
  accepted: {
    subject: (ref) => `Your reservation ${ref} is confirmed`,
    lead: (ref) => `Good news — your reservation ${ref} is confirmed. Your spot is booked.`,
    body:
      "Please arrive 30 minutes before your recording time and keep your reference ready. We're looking forward to hosting you.",
    ctaLabel: "Check your reservation",
    ctaHref: CHECK_RESERVATION,
  },
  rejected: {
    subject: (ref) => `Update on your reservation ${ref}`,
    lead: (ref) => `We couldn't accommodate your reservation ${ref}.`,
    body:
      "We're sorry for the disappointment. You're welcome to submit a new reservation for a different spot — we'd love to host you.",
    ctaLabel: "Submit a new reservation",
    ctaHref: NEW_RESERVATION,
  },
  "canceled-by-admin": {
    subject: (ref) => `Your reservation ${ref} was canceled`,
    lead: (ref) => `Your reservation ${ref} was canceled by the studio.`,
    body:
      "No action is needed on your end. You're welcome to submit a new reservation whenever you're ready.",
    ctaLabel: "Submit a new reservation",
    ctaHref: NEW_RESERVATION,
  },
  "canceled-by-user": {
    subject: (ref) => `Your reservation ${ref} was canceled`,
    lead: (ref) => `You canceled your reservation ${ref}.`,
    body:
      "This reservation is no longer counted as upcoming. If you changed your mind, your reference still lets you reinstate it.",
    ctaLabel: "Check your reservation",
    ctaHref: CHECK_RESERVATION,
  },
  "archived-by-admin": {
    subject: (ref) => `Your reservation ${ref} was archived`,
    lead: (ref) => `Your reservation ${ref} was archived by the studio.`,
    body:
      "It's been moved out of the active bookings, but it's still reachable by your reference. If you believe this was a mistake, please contact us.",
    ctaLabel: "Check your reservation",
    ctaHref: CHECK_RESERVATION,
  },
}

/**
 * The public origin of the current request ("https://ebc-studio.example"),
 * derived from the request headers so an email link is absolute. Only works
 * inside a request (server components/actions) — falls back to localhost:3000
 * when the host header is missing, e.g. offline tests.
 */
export async function getRequestOrigin(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")
  const proto = headerList.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host ?? "localhost:3000"}`
}

/**
 * Sends the booker an email about their reservation — recorded, accepted,
 * rejected, canceled, or archived. `origin` is the site origin used to build
 * absolute links. Never throws: a broken mail config must not turn a saved
 * transition into an error.
 */
export async function sendReservationEmail(
  reservation: ReservationMail,
  origin: string,
  kind: ReservationEmailKind
): Promise<void> {
  // Not configured (or empty credential) — Gmail rejects empty auth anyway, so
  // better to note it than to queue a doomed send.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.warn(
      `sendReservationEmail (${kind}) skipped: GMAIL_USER/GMAIL_PASSWORD not set`
    )
    return
  }

  const { reference, email, fullName, channel, location, bid } = reservation
  const form = FORMS[kind]
  const subject = form.subject(reference)
  const lead = form.lead(reference)
  const ctaHref = form.ctaHref(origin, reservation)

  // Plain-text version with the same facts, for clients that won't render HTML.
  const text = [
    `Hi ${fullName},`,
    "",
    lead,
    "",
    `  Reference: ${reference}`,
    `  Channel:   ${channel}`,
    `  Type:      ${RESERVATION_TYPES[reservation.reservationType]}`,
    `  Broadcast: ${formatDay(reservation.broadcastDate)}`,
    // Live events air without a recording — show that instead of a dash.
    `  Recording: ${
      reservation.recordingDate
        ? formatDay(reservation.recordingDate)
        : "not recording (live)"
    }`,
    `  Location:  ${location}`,
    `  Bid:       ${CURRENCY.symbol}${bid} ${CURRENCY.code}`,
    "",
    form.body,
    "",
    `${form.ctaLabel}: ${ctaHref}`,
    "",
    "Thanks,",
    FROM_NAME,
  ].join("\n")

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <p style="margin: 0 0 16px;">Hi ${escapeHtml(fullName)},</p>
      <p style="margin: 0 0 16px;">${escapeHtml(lead)}</p>
      <table role="presentation" style="border-collapse: collapse; width: 100%; margin: 0 0 16px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7; width: 40%;">Reference</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${escapeHtml(reference)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Channel</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${escapeHtml(channel)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Type</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${escapeHtml(RESERVATION_TYPES[reservation.reservationType])}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Broadcast</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${escapeHtml(formatDay(reservation.broadcastDate))}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Recording</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${reservation.recordingDate ? escapeHtml(formatDay(reservation.recordingDate)) : "Not recording (live event)"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Location</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${escapeHtml(location)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2; background: #f7f7f7;">Bid</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e2e2;">${CURRENCY.symbol}${escapeHtml(bid)} ${CURRENCY.code}</td>
        </tr>
      </table>
      <p style="margin: 0 0 16px;">${escapeHtml(form.body)}</p>
      <p style="margin: 0 0 24px;">
        <a href="${escapeAttr(ctaHref)}" style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">${escapeHtml(form.ctaLabel)}</a>
      </p>
      <p style="margin: 0;">Thanks,<br/>${escapeHtml(FROM_NAME)}</p>
    </div>
  `

  try {
    await getTransport().sendMail({
      from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
    })
  } catch (error) {
    // A failed notification must never fail the reservation or transition.
    console.error(`Failed to send reservation email (${kind}) to`, email, error)
  }
}

/** Minimal HTML-escape for the user-supplied fields embedded in the email. */
function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string
  )
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;")
}