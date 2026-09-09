// TEMPORARY stand-in for the backend. Every function here is the seam that real
// data access will replace — callers should not need to change when it does.
//
// It contains no seeded, sample, or hard-coded reservations: the only records
// that exist are ones the user submitted through the reserve form. Storage is
// sessionStorage, so a fresh tab starts empty.
//
// TODO: replace the bodies below with real data access (fetch / server action /
// DB query) and delete the storage helpers.

import {
  formatReference,
  type Channel,
  type ReservationDraft,
  type ReservationView,
} from "@/lib/reservation"

const STORAGE_KEY = "ebc-studio:reservations"
const SEQUENCE_KEY = "ebc-studio:reference-no"

/** Matches the placeholder shown in the lookup form, so demo IDs look real. */
const FIRST_REFERENCE_NO = 10001

/** Stubs the round trip so pending states are visible while clicking through. */
const LATENCY_MS = 600

function readAll(): ReservationView[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ReservationView[]) : []
  } catch {
    return []
  }
}

function writeAll(reservations: ReservationView[]) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
  } catch {
    // Storage unavailable (private mode, quota exceeded) — fail quietly.
  }
}

/** Stands in for the `Reservation.referenceNo` sequence a database would own. */
function nextReferenceNo(): number {
  if (typeof window === "undefined") return FIRST_REFERENCE_NO

  const current = Number(window.sessionStorage.getItem(SEQUENCE_KEY))
  const next =
    Number.isSafeInteger(current) && current >= FIRST_REFERENCE_NO
      ? current + 1
      : FIRST_REFERENCE_NO

  try {
    window.sessionStorage.setItem(SEQUENCE_KEY, String(next))
  } catch {
    // Storage unavailable — the reference is still usable for this submission.
  }
  return next
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function createReservation(
  draft: ReservationDraft
): Promise<ReservationView> {
  await delay(LATENCY_MS)

  const reservation: ReservationView = {
    reference: formatReference(nextReferenceNo()),
    status: "pending",
    fullName: draft.fullName.trim(),
    email: draft.email.trim(),
    channel: draft.channel as Channel,
    goal: draft.goal.trim(),
    location: draft.location.trim(),
    bid: draft.bid.trim(),
    createdAt: new Date().toISOString(),
  }

  writeAll([...readAll(), reservation])
  return reservation
}

/** One reservation by its public reference. Null when nothing matches. */
export async function getReservation(
  reference: string
): Promise<ReservationView | null> {
  await delay(LATENCY_MS)

  const wanted = reference.trim().toLowerCase()
  return readAll().find((r) => r.reference.toLowerCase() === wanted) ?? null
}

/** Every reservation booked with an email, newest first. */
export async function getReservationsByEmail(
  email: string
): Promise<ReservationView[]> {
  await delay(LATENCY_MS)

  const wanted = email.trim().toLowerCase()
  return readAll()
    .filter((r) => r.email.toLowerCase() === wanted)
    .reverse()
}
