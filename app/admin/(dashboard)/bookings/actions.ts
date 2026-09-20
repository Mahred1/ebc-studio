"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { getRequestOrigin, sendReservationEmail, type ReservationEmailKind } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { parseReference, type ReservationStatus } from "@/lib/reservation"

const BOOKINGS_PATH = "/admin/bookings"

/**
 * Legal transitions. Each target status lists the statuses it may be reached
 * from — accepting and rejecting only touch pending rows, canceling only a
 * confirmed one. Nothing ever returns to pending.
 */
const TRANSITIONS: Record<
  ReservationStatus,
  { from: ReservationStatus[] }
> = {
  confirmed: { from: ["pending"] },
  declined: { from: ["pending"] },
  canceled: { from: ["confirmed"] },
  pending: { from: [] },
}

/**
 * The booker-facing details an email needs, straight from the affected row.
 * Called only on a path that already changed the row, so the post-transition
 * reality is what lands in the mailbox.
 */
async function notifyBooker(code: string, kind: ReservationEmailKind): Promise<void> {
  const row = await prisma.studioReservation.findUnique({
    where: { code },
    select: {
      fullName: true,
      email: true,
      channel: true,
      location: true,
      bid: true,
    },
  })
  if (!row) return

  await sendReservationEmail(
    {
      reference: code,
      fullName: row.fullName,
      email: row.email,
      channel: row.channel,
      location: row.location,
      // Prisma hands back a Decimal; the mailer wants a fixed-2 string.
      bid: row.bid.toFixed(2),
    },
    await getRequestOrigin(),
    kind
  )
}

/**
 * Moves a reservation between statuses. The guard lives in the WHERE clause, so
 * a stale button (row already changed in another tab) is a harmless no-op
 * rather than a race — updateMany with status in the allowed set. `reopenAs`
 * remembers the pre-transition status on rows moving to canceled, so an admin
 * reinstate can restore it exactly. The booker is emailed only when the
 * transition actually happened, so a duplicated click can't spam them.
 */
async function setBookingStatus(
  reference: string,
  to: ReservationStatus,
  notify: ReservationEmailKind | null,
  reopenAs?: ReservationStatus
): Promise<{ ok: boolean }> {
  await requireAdmin()

  const code = parseReference(reference)
  const transition = TRANSITIONS[to]
  if (!code || transition.from.length === 0) return { ok: false }

  const { count } = await prisma.studioReservation.updateMany({
    where: { code, status: { in: transition.from } },
    data: { status: to, ...(reopenAs ? { reopenStatus: reopenAs } : {}) },
  })
  if (count === 0) return { ok: false }
  revalidatePath(BOOKINGS_PATH)
  if (notify) await notifyBooker(code, notify)
  return { ok: true }
}

export async function acceptBooking(reference: string) {
  return setBookingStatus(reference, "confirmed", "accepted")
}

export async function rejectBooking(reference: string) {
  return setBookingStatus(reference, "declined", "rejected")
}

export async function cancelBooking(reference: string) {
  // Admin cancels only ever run from confirmed, so remember that — reinstate
  // restores it exactly. `canceledByUser` stays false, so a user-canceled row
  // keeps its own public reinstate path and an admin-canceled one gets none.
  return setBookingStatus(reference, "canceled", "canceled-by-admin", "confirmed")
}

/**
 * Returns a canceled reservation to the status it had before canceling —
 * confirmed, since admin cancels only come from confirmed rows (older rows
 * predate reopenStatus, so they fall back to confirmed too). Clears the cancel
 * bookkeeping; the row acts like a normal confirmed booking again.
 */
export async function reinstateBooking(reference: string) {
  await requireAdmin()

  const code = parseReference(reference)
  if (!code) return { ok: false }

  const existing = await prisma.studioReservation.findUnique({
    where: { code },
    select: { status: true, reopenStatus: true },
  })
  if (!existing || existing.status !== "canceled") return { ok: false }

  const { count } = await prisma.studioReservation.updateMany({
    where: { code, status: "canceled" },
    data: {
      status: existing.reopenStatus ?? "confirmed",
      canceledByUser: false,
      reopenStatus: null,
    },
  })
  if (count > 0) revalidatePath(BOOKINGS_PATH)
  return { ok: count > 0 }
}

/**
 * Archives a reservation from the bookings list. The guard lives in the WHERE
 * clause — archiving an already-archived row is a no-op, not a race. Archived
 * rows sink to the end of the list and vanish from email lookups.
 */
export async function archiveBooking(reference: string) {
  await requireAdmin()

  const code = parseReference(reference)
  if (!code) return { ok: false }

  const { count } = await prisma.studioReservation.updateMany({
    where: { code, archived: false },
    data: { archived: true, archivedAt: new Date() },
  })
  if (count > 0) {
    revalidatePath(BOOKINGS_PATH)
    await notifyBooker(code, "archived-by-admin")
  }
  return { ok: count > 0 }
}

/** Returns an archived reservation to the active list. */
export async function unarchiveBooking(reference: string) {
  await requireAdmin()

  const code = parseReference(reference)
  if (!code) return { ok: false }

  const { count } = await prisma.studioReservation.updateMany({
    where: { code, archived: true },
    data: { archived: false, archivedAt: null },
  })
  if (count > 0) revalidatePath(BOOKINGS_PATH)
  return { ok: count > 0 }
}