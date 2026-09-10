import Link from "next/link"
import { ChevronDownIcon, LoaderCircleIcon, SearchXIcon } from "lucide-react"

import {
  ReservationDetails,
  ReservationRows,
  formatReservationDate,
} from "@/components/reservation-details"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { Button } from "@/components/ui/button"
import { channelLabel, RESERVATION_STATUSES } from "@/lib/reservation"
import { getReservationsByEmail } from "@/lib/reservations"

export function ReservationResultsFallback() {
  return (
    <div
      role="status"
      className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card p-8 text-sm text-muted-foreground shadow-sm"
    >
      <LoaderCircleIcon className="size-4 animate-spin" />
      Looking up your reservations…
    </div>
  )
}

/**
 * Queries on the server with the email used to book, so the results are in the
 * HTML the browser receives. The page wraps this in <Suspense> keyed by email,
 * so changing the email shows the fallback again instead of the stale list.
 */
export async function ReservationResults({ email }: { email: string }) {
  const reservations = await getReservationsByEmail(email)

  if (!reservations.length) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">No reservations found</h2>
          <p className="text-sm text-muted-foreground">
            {email
              ? "We couldn't find any reservation booked with this email."
              : "Add the email you booked with to see your reservations."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button render={<Link href="/check-reservation" />} variant="outline" size="lg">
            Try another email
          </Button>
          <Button render={<Link href="/reserve" />} size="lg">
            Reserve a spot
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {reservations.length}{" "}
        {reservations.length === 1 ? "reservation" : "reservations"}, newest
        first.
      </p>
      {reservations.length === 1 ? (
        <ReservationDetails reservation={reservations[0]} />
      ) : (
        // Native <details>. A shared `name` makes the group exclusive — opening
        // one closes the rest — with no JS, so it also works before hydration.
        reservations.map((reservation, index) => (
          <details
            key={reservation.reference}
            name="reservation"
            open={index === 0}
            className="group w-full rounded-xl border bg-card shadow-sm"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-6 sm:p-8 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-lg tracking-widest">
                  {reservation.reference}
                </p>
                <p className="text-sm text-muted-foreground">
                  {channelLabel(reservation.channel) ?? reservation.channel} ·{" "}
                  {formatReservationDate(reservation.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ReservationStatusBadge status={reservation.status} />
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <p className="text-sm text-muted-foreground">
                {RESERVATION_STATUSES[reservation.status].detail}
              </p>
              <ReservationRows reservation={reservation} />
            </div>
          </details>
        ))
      )}
    </div>
  )
}
