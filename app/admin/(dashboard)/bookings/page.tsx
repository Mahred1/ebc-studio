import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "cn"

import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { formatReservationDate } from "@/components/reservation-details"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import {
  BOOKING_PERIODS,
  type BookingPeriod,
  type ReservationStatus,
} from "@/lib/reservation"
import { getBookings } from "@/lib/reservations"
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  ListChecks,
  Percent,
} from "lucide-react"
import { BookingActions } from "./booking-actions"
import { BookingFilters } from "./booking-filters"

export const metadata: Metadata = {
  title: "Bookings | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const STATUSES: ReadonlyArray<ReservationStatus> = [
  "pending",
  "confirmed",
  "declined",
  "canceled",
]
const PERIODS = Object.keys(BOOKING_PERIODS) as BookingPeriod[]

function parseStatus(value: unknown): ReservationStatus | "" {
  return typeof value === "string" && STATUSES.includes(value as ReservationStatus)
    ? (value as ReservationStatus)
    : ""
}

function parsePeriod(value: unknown): BookingPeriod {
  return typeof value === "string" && PERIODS.includes(value as BookingPeriod)
    ? (value as BookingPeriod)
    : "all"
}

/** Builds a bookings URL preserving the current filters, for pagination links. */
function bookingsHref(
  patch: { status?: ReservationStatus | ""; channel?: string; period?: BookingPeriod; page?: number },
  current: { status: ReservationStatus | ""; channel: string; period: BookingPeriod }
): string {
  const next = { status: current.status, channel: current.channel, period: current.period, page: 1, ...patch }
  const params = new URLSearchParams()
  if (next.status) params.set("status", next.status)
  if (next.channel) params.set("channel", next.channel)
  if (next.period && next.period !== "all") params.set("period", next.period)
  if (next.page > 1) params.set("page", String(next.page))
  const qs = params.toString()
  return `/admin/bookings${qs ? `?${qs}` : ""}`
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()

  const s = await searchParams
  const state = {
    status: parseStatus(s.status),
    channel: typeof s.channel === "string" ? s.channel : "",
    period: parsePeriod(s.period),
  }
  const page = Math.max(1, Number.parseInt(String(s.page ?? "1"), 10) || 1)

  const data = await getBookings({
    status: state.status || undefined,
    channel: state.channel || undefined,
    period: state.period,
    page,
  })

  const { counts } = data
  const canceledRejected = counts.declined + counts.canceled
  const decided = counts.confirmed + counts.declined + counts.canceled

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Bookings</h1>
        <p className="text-muted-foreground">
          Review, accept, reject — and cancel a confirmed booking.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={ListChecks}
          label="Total"
          value={String(counts.total)}
          detail="All reservations"
        />
        <StatCard
          icon={CircleCheck}
          tone="success"
          label="Confirmed"
          value={String(counts.confirmed)}
          detail="Accepted bookings"
        />
        <StatCard
          icon={Clock}
          tone="warning"
          label="Pending"
          value={String(counts.pending)}
          detail="Awaiting a decision"
        />
        <StatCard
          icon={CircleX}
          tone="danger"
          label="Canceled / rejected"
          value={String(canceledRejected)}
          detail={`${counts.declined} rejected · ${counts.canceled} canceled`}
        />
        <StatCard
          icon={Percent}
          label="Acceptance rate"
          value={data.acceptanceRate ?? "—"}
          detail={
            decided === 0
              ? "No decisions yet"
              : `${counts.confirmed} of ${decided} decided`
          }
        />
      </div>

      <div className="flex flex-col gap-4">
        <BookingFilters {...state} channels={data.channels} />

        <section className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Reservation
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Customer
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Channel
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.reference}
                  className={cn(
                    "border-b last:border-0",
                    row.status === "canceled" && "text-muted-foreground/70"
                  )}
                >
                  <td className="px-5 py-4">
                    <ReservationStatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-4 font-mono tracking-widest">
                    {row.reference}
                  </td>
                  <td className="px-5 py-4 font-medium">{row.fullName}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {row.channel}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatReservationDate(row.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <BookingActions reference={row.reference} status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.total === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              No reservations match these filters.
            </p>
          ) : null}
        </section>

        <nav className="flex items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total}{" "}
            {data.total === 1 ? "reservation" : "reservations"}
          </p>
          <div className="flex items-center gap-2">
            {data.page > 1 ? (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={bookingsHref({ page: data.page - 1 }, state)} />}
              >
                <ChevronLeft />
                Previous
              </Button>
            ) : null}
            {data.page < data.pages ? (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={bookingsHref({ page: data.page + 1 }, state)} />}
              >
                Next
                <ChevronRight />
              </Button>
            ) : null}
          </div>
        </nav>
      </div>
    </div>
  )
}