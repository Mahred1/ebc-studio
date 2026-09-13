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
import { getSiteSettings } from "@/lib/site-settings"

export async function createReservation(
  draft: ReservationDraft
): Promise<CreateReservationResult> {
  // Re-check the pause flag here, not just on the page: the form is hidden
  // when paused, but anything can POST to an action. Pausing has to actually
  // stop writes, or it's decoration.
  if ((await getSiteSettings()).reservationsPaused) {
    return {
      ok: false,
      errors: {},
      message: "Reservations are paused right now — we're not accepting new bookings.",
    }
  }

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
