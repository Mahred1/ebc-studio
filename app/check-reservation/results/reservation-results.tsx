import Link from "next/link"
import { LoaderCircleIcon, SearchXIcon } from "lucide-react"

import { ReservationAccordion } from "./reservation-accordion"
import { ReservationDetails } from "@/components/reservation-details"
import { Button } from "@/components/ui/button"
import type { ReservationStatus } from "@/lib/reservation"
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
      <div className="animate-fade-up flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
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

  // Sections follow this fixed order, so a booker always reads pending first.
  const STATUS_ORDER: ReservationStatus[] = [
    "pending",
    "confirmed",
    "declined",
    "canceled",
  ]
  const grouped = new Map<
    ReservationStatus,
    (typeof reservations)[number][]
  >()
  for (const status of STATUS_ORDER) grouped.set(status, [])
  // Reservations arrive newest-first, so each section keeps that order.
  for (const reservation of reservations) grouped.get(reservation.status)?.push(reservation)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {reservations.length}{" "}
        {reservations.length === 1 ? "reservation" : "reservations"}, newest
        first.
      </p>
      {reservations.length === 1 ? (
        <ReservationDetails reservation={reservations[0]} secure />
      ) : (
        <ReservationAccordion
          secure
          sections={STATUS_ORDER.filter(
            (status) => (grouped.get(status)?.length ?? 0) > 0
          ).map((status) => ({ status, items: grouped.get(status)! }))}
        />
      )}
    </div>
  )
}
