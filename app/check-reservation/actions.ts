"use server"

import { revalidatePath } from "next/cache"

import { cancelReservation, reinstateReservation } from "@/lib/reservations"

export async function cancelReservationAction(
  reference: string
): Promise<{ ok: boolean; reservation?: unknown; error?: string }> {
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

export async function reinstateReservationAction(
  reference: string
): Promise<{ ok: boolean; reservation?: unknown; error?: string }> {
  try {
    const reservation = await reinstateReservation(reference)
    if (!reservation) return { ok: false, error: "This reservation can't be reinstated." }

    revalidatePath("/check-reservation")

    return { ok: true, reservation }
  } catch {
    return { ok: false, error: "Failed to reinstate reservation." }
  }
}