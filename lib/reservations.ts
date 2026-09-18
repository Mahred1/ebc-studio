// Data access for studio reservations.
//
// These run on the server only — they import the Prisma client, so pulling this
// module into a client bundle fails the build. Reads are plain async functions
// called during server rendering, NOT Server Actions: an action is a POST
// endpoint meant for mutations, and exposing lookups as actions would both cost
// a round trip after hydration and widen the app's surface for no reason.
//
// The one mutation, createReservation, lives in `app/reserve/actions.ts`
// because a client component has to call it.

import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  aggregateCustomers,
  formatReference,
  normalizePhone,
  parseReference,
  type BookingPeriod,
  type ReservationDraft,
  type ReservationStatus,
  type ReservationView,
} from "@/lib/reservation"
import type { CustomerView } from "@/lib/reservation"

/** The columns a ReservationView needs — `id` is internal and stays server-side. */
const SELECT = {
  referenceNo: true,
  status: true,
  fullName: true,
  email: true,
  phone: true,
  channel: true,
  goal: true,
  location: true,
  bid: true,
  createdAt: true,
  canceledByUser: true,
  reopenStatus: true,
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
    phone: row.phone,
    channel: row.channel,
    goal: row.goal,
    location: row.location,
    bid: row.bid.toFixed(2),
    createdAt: row.createdAt.toISOString(),
    // A booker can reinstate only a cancellation they made themselves, and only
    // when there's a stored status to restore. Never for admin-canceled rows.
    reopenable:
      row.status === "canceled" && row.canceledByUser && row.reopenStatus !== null,
  }
}

/** Emails are stored and queried lowercased so the `email` index does the work. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Writes a reservation. Assumes the draft has already been validated — the
 * action in `app/reserve/actions.ts` is the only caller and does that first.
 */
export async function insertReservation(
  draft: ReservationDraft
): Promise<ReservationView> {
  const row = await prisma.studioReservation.create({
    data: {
      fullName: draft.fullName.trim(),
      email: normalizeEmail(draft.email),
      phone: normalizePhone(draft.phone),
      // The reserve action already checked this against the visible inventory.
      channel: draft.channel.trim(),
      goal: draft.goal.trim(),
      location: draft.location.trim(),
      // Prisma parses the string into the Decimal(12,2) column, so the amount
      // never passes through a float.
      bid: draft.bid.trim(),
    },
    select: SELECT,
  })

  return toView(row)
}

export async function cancelReservation(
  reference: string
): Promise<ReservationView | null> {
  const referenceNo = parseReference(reference)
  if (referenceNo === null) return null

  const allowed = ["pending", "confirmed"]
  const existing = await prisma.studioReservation.findUnique({
    where: { referenceNo },
    select: { status: true },
  })
  if (!existing || !allowed.includes(existing.status)) return null

  // Mark this as a booker-initiated cancellation and remember the pre-cancel
  // status so the check-reservation page can offer to reinstate it later.
  const row = await prisma.studioReservation.update({
    where: { referenceNo },
    data: {
      status: "canceled",
      canceledByUser: true,
      reopenStatus: existing.status,
    },
    select: SELECT,
  })
  return toView(row)
}

/**
 * Reopens a reservation the *booker* canceled (pending/confirmed → canceled on
 * the check-reservation page). Restores exactly the status it had before the
 * cancel, and clears the cancel bookkeeping. Returns null when the row is not
 * in the canceled status, wasn't canceled by the booker (e.g. the admin did),
 * or has no stored status to restore — admin-canceled rows have no user path
 * back.
 */
export async function reinstateReservation(
  reference: string
): Promise<ReservationView | null> {
  const referenceNo = parseReference(reference)
  if (referenceNo === null) return null

  const existing = await prisma.studioReservation.findUnique({
    where: { referenceNo },
    select: { status: true, canceledByUser: true, reopenStatus: true },
  })
  if (
    !existing ||
    existing.status !== "canceled" ||
    !existing.canceledByUser ||
    existing.reopenStatus === null
  ) {
    return null
  }

  const row = await prisma.studioReservation.update({
    where: { referenceNo },
    data: {
      status: existing.reopenStatus,
      canceledByUser: false,
      reopenStatus: null,
    },
    select: SELECT,
  })
  return toView(row)
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

/* ----------------------------------------------------------------- customers */

/**
 * Every customer, one row per booking email, for the /admin/customers table.
 * Fetches the reservations newest-first and lets aggregateCustomers() (the pure
 * roll-up in lib/reservation.ts) do the rest.
 */
export async function getCustomers(): Promise<CustomerView[]> {
  const rows = await prisma.studioReservation.findMany({
    select: {
      email: true,
      fullName: true,
      phone: true,
      bid: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })

  return aggregateCustomers(
    rows.map((row) => ({
      email: row.email,
      fullName: row.fullName,
      phone: row.phone,
      bid: Number(row.bid),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }))
  )
}

/* ----------------------------------------------------------------- analytics */

export type RevenuePoint = { period: string; revenue: number }

export type RecentBooking = {
  reference: string
  fullName: string
  channel: string
  bid: string
  createdAt: string
}

export type AnalyticsData = {
  monthRevenue: number
  monthBookings: number
  monthLabel: string
  accepted: number
  declined: number
  ratio: string
  topChannel: string | null
  topChannelCount: number
  trend: RevenuePoint[]
  recent: RecentBooking[]
}

/** "2026-09" — compared against the current month, bucketed in server-local time. */
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

/** "Sep 26" — compact enough to fit under a chart column. */
function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Everything the /admin/analytics page shows, in one place. Revenue counts
 * `confirmed` reservations only — a declined booking never paid — while the
 * channel mix and recent bookings count every reservation regardless of
 * status. All rolled up in JS: at studio scale the whole table is a few dozen
 * rows, so one lean scan beats several grouped Prisma queries.
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  const rows = await prisma.studioReservation.findMany({
    select: {
      referenceNo: true,
      status: true,
      fullName: true,
      channel: true,
      bid: true,
      createdAt: true,
    },
  })

  const now = new Date()
  const currentMonth = monthKey(now)

  // Seed the trailing six months so quiet months render as zero, not gaps.
  const trend = new Map<string, RevenuePoint>()
  for (let i = 5; i >= 0; i--) {
    const at = new Date(now.getFullYear(), now.getMonth() - i, 1)
    trend.set(monthKey(at), { period: monthLabel(at), revenue: 0 })
  }

  let accepted = 0
  let declined = 0
  let monthRevenue = 0
  let monthBookings = 0
  const channelCounts = new Map<string, number>()
  const recent: RecentBooking[] = []

  for (const row of rows) {
    const amount = Number(row.bid)
    switch (row.status) {
      case "confirmed": {
        accepted++
        const bucket = trend.get(monthKey(row.createdAt))
        if (bucket) {
          bucket.revenue += amount
          if (monthKey(row.createdAt) === currentMonth) {
            monthRevenue += amount
            monthBookings++
          }
        }
        break
      }
      case "declined":
        declined++
        break
    }
    channelCounts.set(row.channel, (channelCounts.get(row.channel) ?? 0) + 1)
    recent.push({
      reference: formatReference(row.referenceNo),
      fullName: row.fullName,
      channel: row.channel,
      bid: row.bid.toFixed(2),
      createdAt: row.createdAt.toISOString(),
    })
  }

  recent.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Reduced ratio — 1 rejection to every 4 accepts shows as "1 : 4".
  let ratio = "—"
  if (accepted > 0 || declined > 0) {
    const step = gcd(declined, accepted)
    ratio = `${declined / step} : ${accepted / step}`
  }

  let topChannel: string | null = null
  let topChannelCount = 0
  for (const [name, count] of channelCounts) {
    if (count > topChannelCount) {
      topChannel = name
      topChannelCount = count
    }
  }

  return {
    monthRevenue,
    monthBookings,
    monthLabel: now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    accepted,
    declined,
    ratio,
    topChannel,
    topChannelCount,
    trend: [...trend.values()],
    recent: recent.slice(0, 3),
  }
}

/* ------------------------------------------------------------------ overview */

export type OverviewSession = {
  reference: string
  channel: string
  fullName: string
  /** created ISO — reservations have no scheduled slot, so this stands in for the date. */
  bookedAt: string
  status: ReservationStatus
}

export type OverviewData = {
  occupiedChannels: number
  totalChannels: number
  revenueToday: number
  bookingsToday: number
  pending: number
  accepted: number
  declined: number
  sessions: OverviewSession[]
}

/** "2026-09-15" — a reservation "today" is bucketed in server-local time. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`
}

/**
 * Everything the /admin Overview page shows in one scan: today's revenue (confirmed
 * only) and active bookings, lifetime status counts, channel occupancy (distinct
 * channels with an open or confirmed reservation), and the upcoming list — pending
 * and confirmed reservations newest-first, declined dropped.
 */
export async function getOverview(): Promise<OverviewData> {
  const [rows, totalChannels] = await Promise.all([
    prisma.studioReservation.findMany({
      select: {
        referenceNo: true,
        status: true,
        channel: true,
        fullName: true,
        bid: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.channelInventory.count({ where: { hidden: false } }),
  ])

  const today = dayKey(new Date())
  let revenueToday = 0
  let bookingsToday = 0
  let pending = 0
  let accepted = 0
  let declined = 0
  const occupied = new Set<string>()
  const sessions: OverviewSession[] = []

  for (const row of rows) {
    const isToday = dayKey(row.createdAt) === today

    switch (row.status) {
      case "declined":
        declined++
        // A declined booking neither occupies a channel nor counts as active.
        continue
      case "canceled":
        // Same as declined: no longer an upcoming session, doesn't hold a channel.
        continue
      case "confirmed":
        accepted++
        if (isToday) revenueToday += Number(row.bid)
        break
      case "pending":
        pending++
        break
    }

    if (isToday) bookingsToday++
    occupied.add(row.channel)
    sessions.push({
      reference: formatReference(row.referenceNo),
      channel: row.channel,
      fullName: row.fullName,
      bookedAt: row.createdAt.toISOString(),
      status: row.status,
    })
  }

  return {
    occupiedChannels: occupied.size,
    totalChannels,
    revenueToday,
    bookingsToday,
    pending,
    accepted,
    declined,
    sessions,
  }
}

/* ------------------------------------------------------------------ bookings */

export const BOOKINGS_PER_PAGE = 5

export type BookingRow = {
  reference: string
  status: ReservationStatus
  fullName: string
  channel: string
  bid: string
  createdAt: string
}

export type BookingsParams = {
  status?: ReservationStatus
  channel?: string
  period?: BookingPeriod
  page: number
}

export type BookingsData = {
  rows: BookingRow[]
  total: number
  page: number
  pages: number
  counts: {
    total: number
    confirmed: number
    pending: number
    declined: number
    canceled: number
  }
  /** Distinct channels used by reservations, name-sorted — the channel filter's options. */
  channels: string[]
  /** confirmed ÷ decided, as a rounded percent string, or null when nothing is decided. */
  acceptanceRate: string | null
}

/** Where reservation filters point — the day a user picks "today" is local to the server. */
function periodStart(period: BookingPeriod): Date | null {
  const now = new Date()
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case "7d":
      return new Date(now.getTime() - 7 * 86_400_000)
    case "30d":
      return new Date(now.getTime() - 30 * 86_400_000)
    case "all":
      return null
  }
}

/**
 * The /admin/bookings page: status counts for the stat row, distinct channels
 * for the channel filter, and one page of reservations matching the filters.
 * Filters are applied in SQL (where), counts and pages are all reserved so a
 * filter that matches nothing renders an empty table, not a broken page — at
 * studio scale this is a handful of grouped queries, cheaper than loading rows.
 */
export async function getBookings(params: BookingsParams): Promise<BookingsData> {
  const where: Prisma.StudioReservationWhereInput = {}
  if (params.status) where.status = params.status
  if (params.channel) where.channel = params.channel
  const since = periodStart(params.period ?? "all")
  if (since) where.createdAt = { gte: since }

  // Total must land before the page can be clamped — an out-of-range ?page=
  // would otherwise skip past everything and render an empty page.
  const [byStatus, total, channels] = await Promise.all([
    prisma.studioReservation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.studioReservation.count({ where }),
    prisma.studioReservation.groupBy({ by: ["channel"] }),
  ])
  const pages = Math.max(1, Math.ceil(total / BOOKINGS_PER_PAGE))
  const page = Math.min(Math.max(params.page, 1), pages)

  const rows = await prisma.studioReservation.findMany({
    where,
    select: {
      referenceNo: true,
      status: true,
      fullName: true,
      channel: true,
      bid: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * BOOKINGS_PER_PAGE,
    take: BOOKINGS_PER_PAGE,
  })

  const counts = {
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
    canceled: 0,
  }
  for (const group of byStatus) {
    counts[group.status] = group._count._all
    counts.total += group._count._all
  }

  const decided = counts.confirmed + counts.declined + counts.canceled
  const acceptanceRate =
    decided === 0
      ? null
      : `${Math.round((counts.confirmed / decided) * 100)}%`

  return {
    rows: rows.map((row) => ({
      reference: formatReference(row.referenceNo),
      status: row.status,
      fullName: row.fullName,
      channel: row.channel,
      bid: row.bid.toFixed(2),
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    pages,
    counts,
    channels: channels.map((c) => c.channel).sort(),
    acceptanceRate,
  }
}
