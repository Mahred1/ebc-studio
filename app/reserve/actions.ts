"use server"

// The only Server Action in the app: the reserve form is a client component, so
// the write has to be reachable from the browser. Lookups are plain server-side
// reads in `lib/reservations.ts` and deliberately are NOT actions.

import { getVisibleChannelNames } from "@/lib/channels"
import { getRequestOrigin, sendReservationEmail } from "@/lib/mailer"
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

  // The channel rule is membership of the *live* inventory — the dropdown the
  // page rendered is just the snapshot from that request. Check it again so a
  // hidden or since-deleted channel can't slip through a crafted request.
  const visible = new Set(await getVisibleChannelNames())
  if (!visible.has(draft.channel)) {
    return {
      ok: false,
      errors: { channel: "That channel is not available." },
    }
  }

  try {
    const reservation = await insertReservation(draft)

    // A booked reference is the email's whole point — the form even promises
    // it ("We'll send your reservation reference here"). Sending is await-ed
    // so the notification is gone before the user sees the confirmation, but
    // it's non-fatal: sendReservationEmail catches its own failures.
    await sendReservationEmail(reservation, await getRequestOrigin(), "received")

    return { ok: true, reservation }
  } catch (error) {
    console.error("createReservation failed", error)
    return {
      ok: false,
      errors: {},
      message: "We couldn't save your reservation. Please try again.",
    }
  }
}
