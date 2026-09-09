"use server"

// Data access for studio reservations. Replaces the sessionStorage stub that
// stood in for the backend — the function names and call sites are unchanged.
//
// Every export here is a Server Action, so these run only on the server even
// though client components call them directly. `createReservation` re-runs the
// shared validation before it writes: the client-side pass is a UX affordance,
// not a guarantee.

import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  formatReference,
  parseReference,
  validateReservation,
  type Channel,
  type CreateReservationResult,
  type ReservationDraft,
  type ReservationView,
} from "@/lib/reservation"

/** The columns a ReservationView needs — `id` is internal and stays server-side. */
const SELECT = {
  referenceNo: true,
  status: true,
  fullName: true,
  email: true,
  channel: true,
  goal: true,
  location: true,
  bid: true,
  createdAt: true,
} as const

/** Derived from the schema, so a column change surfaces here as a type error. */
type Row = Prisma.StudioReservationGetPayload<{ select: typeof SELECT }>

/**
 * Maps a row to the plain, serializable shape the UI consumes. Prisma hands
 * back a Decimal and a Date, neither of which can cross to a client component,
 * so `bid` becomes a fixed-2 string ("100.00") and `createdAt` an ISO string.
 */
function toView(row: Row): ReservationView {
  return {
    reference: formatReference(row.referenceNo),
    status: row.status,
    fullName: row.fullName,
    email: row.email,
    channel: row.channel as Channel,
    goal: row.goal,
    location: row.location,
    bid: row.bid.toFixed(2),
    createdAt: row.createdAt.toISOString(),
  }
}

/** Emails are stored and queried lowercased so the `email` index does the work. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function createReservation(
  draft: ReservationDraft
): Promise<CreateReservationResult> {
  const errors = validateReservation(draft)
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  try {
    const row = await prisma.studioReservation.create({
      data: {
        fullName: draft.fullName.trim(),
        email: normalizeEmail(draft.email),
        // validateReservation() already rejected anything outside CHANNELS.
        channel: draft.channel as Channel,
        goal: draft.goal.trim(),
        location: draft.location.trim(),
        // Prisma parses the string into the Decimal(12,2) column, so the amount
        // never passes through a float.
        bid: draft.bid.trim(),
      },
      select: SELECT,
    })

    return { ok: true, reservation: toView(row) }
  } catch (error) {
    console.error("createReservation failed", error)
    return {
      ok: false,
      errors: {},
      message: "We couldn't save your reservation. Please try again.",
    }
  }
}

/** One reservation by its public reference. Null when nothing matches. */
export async function getReservation(
  reference: string
): Promise<ReservationView | null> {
  const referenceNo = parseReference(reference)
  // Not a well-formed reference — no row could match, so skip the round trip.
  if (referenceNo === null) return null

  const row = await prisma.studioReservation.findUnique({
    where: { referenceNo },
    select: SELECT,
  })

  return row ? toView(row) : null
}

/** Every reservation booked with an email, newest first. */
export async function getReservationsByEmail(
  email: string
): Promise<ReservationView[]> {
  const normalized = normalizeEmail(email)
  if (!normalized) return []

  const rows = await prisma.studioReservation.findMany({
    where: { email: normalized },
    // `id` breaks ties between rows written in the same millisecond.
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: SELECT,
  })

  return rows.map(toView)
}
