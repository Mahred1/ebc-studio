// Shape + validation rules for a studio spot reservation.
// Kept free of React so the same rules can run again on the server once a
// backend exists — never trust the client-side pass alone.

export const CHANNELS = [
  { value: "tv1", label: "TV1" },
  { value: "tv2", label: "TV2" },
  { value: "tv3", label: "TV3" },
  { value: "news", label: "EBC News" },
  { value: "entertainment", label: "EBC Entertainment" },
] as const

export type Channel = (typeof CHANNELS)[number]["value"]

export const CURRENCY = { code: "ETB", symbol: "Br" } as const

export type ReservationDraft = {
  fullName: string
  email: string
  channel: Channel | ""
  goal: string
  location: string
  bid: string
}

export type ReservationErrors = Partial<Record<keyof ReservationDraft, string>>

export const EMPTY_RESERVATION: ReservationDraft = {
  fullName: "",
  email: "",
  channel: "",
  goal: "",
  location: "",
  bid: "",
}

export const GOAL_MIN = 10
export const GOAL_MAX = 500

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/

const CHANNEL_VALUES: readonly string[] = CHANNELS.map((c) => c.value)

/** Validates one field. Takes the whole draft so cross-field rules can be added later. */
export function validateField(
  field: keyof ReservationDraft,
  draft: ReservationDraft
): string | undefined {
  switch (field) {
    case "fullName": {
      const name = draft.fullName.trim()
      if (!name) return "Full name is required."
      if (name.length < 3) return "That name looks too short."
      if (name.length > 100) return "Keep the name under 100 characters."
      if (!name.includes(" ")) return "Enter your full name, not just one part."
      return undefined
    }

    case "email": {
      const email = draft.email.trim()
      if (!email) return "Email is required."
      if (!EMAIL_PATTERN.test(email)) return "Enter a valid email, like name@example.com."
      return undefined
    }

    case "channel": {
      if (!draft.channel) return "Pick the channel you want to record for."
      if (!CHANNEL_VALUES.includes(draft.channel)) return "That channel is not available."
      return undefined
    }

    case "goal": {
      const goal = draft.goal.trim()
      if (!goal) return "Tell us the goal of the recording."
      if (goal.length < GOAL_MIN)
        return `Add a little more detail — at least ${GOAL_MIN} characters.`
      if (goal.length > GOAL_MAX) return `Keep it under ${GOAL_MAX} characters.`
      return undefined
    }

    case "location": {
      const location = draft.location.trim()
      if (!location) return "Location is required."
      if (location.length < 3) return "That location looks too short."
      if (location.length > 120) return "Keep the location under 120 characters."
      return undefined
    }

    case "bid": {
      const bid = draft.bid.trim()
      if (!bid) return "Enter the amount you plan to spend."
      if (!MONEY_PATTERN.test(bid))
        return "Use digits only, with up to 2 decimal places."
      if (Number(bid) <= 0) return "The bid must be greater than 0."
      return undefined
    }
  }
}

export const RESERVATION_FIELDS = [
  "fullName",
  "email",
  "channel",
  "goal",
  "location",
  "bid",
] as const satisfies readonly (keyof ReservationDraft)[]

/** Validates every field. An empty object means the draft is valid. */
export function validateReservation(draft: ReservationDraft): ReservationErrors {
  const errors: ReservationErrors = {}
  for (const field of RESERVATION_FIELDS) {
    const message = validateField(field, draft)
    if (message) errors[field] = message
  }
  return errors
}

export function channelLabel(value: Channel | ""): string | undefined {
  return CHANNELS.find((c) => c.value === value)?.label
}

/* ------------------------------------------------------------------ lookup */

/**
 * Public reservation reference, e.g. RES-10001.
 *
 * The numeric part is a monotonic counter owned by the data layer — today the
 * stub in `reservation-store.ts`, later a DB sequence — so references are
 * unique by construction and need no collision retry. It's zero-padded to 5
 * digits but allowed to grow past that, so the pattern accepts 5 *or more*.
 */
export const REFERENCE_PREFIX = "RES-"
export const RESERVATION_ID_PATTERN = /^RES-\d{5,}$/i

export function formatReference(referenceNo: number): string {
  return `${REFERENCE_PREFIX}${String(referenceNo).padStart(5, "0")}`
}

/** Parses a reference back to its sequence number, or null if it isn't one. */
export function parseReference(value: string): number | null {
  const trimmed = value.trim()
  if (!RESERVATION_ID_PATTERN.test(trimmed)) return null
  const n = Number(trimmed.slice(REFERENCE_PREFIX.length))
  return Number.isSafeInteger(n) && n > 0 ? n : null
}

/** Canonical URL for a single reservation. */
export function reservationHref(reference: string): string {
  return `/check-reservation/${reference.trim().toLowerCase()}`
}

/** Canonical URL for every reservation booked with an email. */
export function reservationsByEmailHref(email: string): string {
  const query = new URLSearchParams({ email: email.trim().toLowerCase() })
  return `/check-reservation/results?${query}`
}

/** Reservations can be looked up by reference or by the email used to book. */
export type LookupKind = "id" | "email"

export function lookupKind(query: string): LookupKind | undefined {
  const value = query.trim()
  if (RESERVATION_ID_PATTERN.test(value)) return "id"
  if (EMAIL_PATTERN.test(value)) return "email"
  return undefined
}

export function validateLookup(query: string): string | undefined {
  const value = query.trim()
  if (!value) return "Enter your reservation ID or the email you booked with."
  if (!lookupKind(value))
    return "Use a reservation ID like RES-22112, or the email you booked with."
  return undefined
}

export const RESERVATION_STATUSES = {
  pending: {
    label: "Pending review",
    detail:
      "Our scheduling team is still reviewing this request. We'll email you as soon as there's a decision.",
  },
  confirmed: {
    label: "Confirmed",
    detail:
      "Your spot is booked. Please arrive 30 minutes before your recording time.",
  },
  declined: {
    label: "Declined",
    detail:
      "We couldn't accommodate this request. You're welcome to submit a new reservation.",
  },
} as const

export type ReservationStatus = keyof typeof RESERVATION_STATUSES

/**
 * A reservation as the UI consumes it: plain, serializable values only, so it
 * can cross the server/client boundary. Database rows are mapped into this
 * shape by the data layer (`bid` becomes a string, `createdAt` an ISO string).
 */
export type ReservationView = {
  reference: string
  status: ReservationStatus
  fullName: string
  email: string
  channel: Channel
  goal: string
  location: string
  bid: string
  createdAt: string
}
