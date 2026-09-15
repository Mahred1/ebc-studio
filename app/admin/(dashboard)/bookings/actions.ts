"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
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
 * Moves a reservation between statuses. The guard lives in the WHERE clause, so
 * a stale button (row already changed in another tab) is a harmless no-op
 * rather than a race — updateMany with status in the allowed set.
 */
async function setBookingStatus(reference: string, to: ReservationStatus) {
  await requireAdmin()

  const referenceNo = parseReference(reference)
  const transition = TRANSITIONS[to]
  if (!referenceNo || transition.from.length === 0) return

  const { count } = await prisma.studioReservation.updateMany({
    where: { referenceNo, status: { in: transition.from } },
    data: { status: to },
  })
  if (count > 0) revalidatePath(BOOKINGS_PATH)
}

export async function acceptBooking(reference: string) {
  await setBookingStatus(reference, "confirmed")
}

export async function rejectBooking(reference: string) {
  await setBookingStatus(reference, "declined")
}

export async function cancelBooking(reference: string) {
  await setBookingStatus(reference, "canceled")
}