import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import {
  CURRENCY,
  RESERVATION_STATUSES,
  formatPhone,
  type ReservationView,
} from "@/lib/reservation"

export function formatReservationDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** The full field list. Shared by the single-reservation card and the results accordion. */
export function ReservationRows({
  reservation,
}: {
  reservation: ReservationView
}) {
  const rows = [
    ["Name", reservation.fullName],
    ["Email", reservation.email],
    ["Phone", reservation.phone ? formatPhone(reservation.phone) : "—"],
    ["Channel", reservation.channel],
    ["Location", reservation.location],
    ["Bid", `${CURRENCY.symbol}${reservation.bid} ${CURRENCY.code}`],
    ["Submitted", formatReservationDate(reservation.createdAt)],
  ]

  return (
    <dl className="mt-6 flex flex-col gap-2 border-t pt-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right">{value}</dd>
        </div>
      ))}
      <div className="flex flex-col gap-1 pt-2">
        <dt className="text-muted-foreground">Goal</dt>
        <dd>{reservation.goal}</dd>
      </div>
    </dl>
  )
}

export function ReservationDetails({
  reservation,
}: {
  reservation: ReservationView
}) {
  const status = RESERVATION_STATUSES[reservation.status]

  return (
    <div className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-lg tracking-widest">{reservation.reference}</p>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{status.detail}</p>

      <ReservationRows reservation={reservation} />
    </div>
  )
}
