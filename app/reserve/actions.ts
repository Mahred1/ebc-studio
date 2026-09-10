"use server"

// The only Server Action in the app: the reserve form is a client component, so
// the write has to be reachable from the browser. Lookups are plain server-side
// reads in `lib/reservations.ts` and deliberately are NOT actions.

import {
  validateReservation,
  type CreateReservationResult,
  type ReservationDraft,
} from "@/lib/reservation"
import { insertReservation } from "@/lib/reservations"

export async function createReservation(
  draft: ReservationDraft
): Promise<CreateReservationResult> {
  // Re-run the shared rules here. The form validates as you type, but that pass
  // is a UX affordance — anything can post to an action.
  const errors = validateReservation(draft)
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  try {
    return { ok: true, reservation: await insertReservation(draft) }
  } catch (error) {
    console.error("createReservation failed", error)
    return {
      ok: false,
      errors: {},
      message: "We couldn't save your reservation. Please try again.",
    }
  }
}
