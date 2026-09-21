"use server"

import { revalidatePath } from "next/cache"

import { cancelReservation, reinstateReservation } from "@/lib/reservations"
import type { ReservationView } from "@/lib/reservation"

export type CancelReservationResult =
  | { ok: true; reservation: ReservationView }
  | { ok: false; error: string }

export async function cancelReservationAction(
  reference: string
): Promise<CancelReservationResult> {
  try {
    const reservation = await cancelReservation(reference)
    if (!reservation) return { ok: false, error: "Reservation not found or not cancelable." }

    // Revalidate every page that can show a reservation, so the canceled status
    // lands on the status page and the email-results list without a hard reload.
    revalidatePath("/check-reservation")

    return { ok: true, reservation }
  } catch {
    return { ok: false, error: "Failed to cancel reservation." }
  }
}

export type ReinstateReservationResult =
  | { ok: true; reservation: ReservationView }
  | { ok: false; error: string }

export async function reinstateReservationAction(
  reference: string
): Promise<ReinstateReservationResult> {
  try {
    const reservation = await reinstateReservation(reference)
    if (!reservation) return { ok: false, error: "This reservation can't be reinstated." }

    revalidatePath("/check-reservation")

    return { ok: true, reservation }
  } catch {
    return { ok: false, error: "Failed to reinstate reservation." }
  }
}