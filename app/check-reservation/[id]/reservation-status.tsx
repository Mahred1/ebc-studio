import Link from "next/link"
import { LoaderCircleIcon, SearchXIcon } from "lucide-react"

import { ReservationDetails } from "@/components/reservation-details"
import { Button } from "@/components/ui/button"
import { getReservation } from "@/lib/reservations"

export function ReservationStatusFallback() {
  return (
    <div
      role="status"
      className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card p-8 text-sm text-muted-foreground shadow-sm"
    >
      <LoaderCircleIcon className="size-4 animate-spin" />
      Looking up your reservation…
    </div>
  )
}

/**
 * Looks the reservation up on the server, so the result is in the HTML the
 * browser receives — no client round trip after hydration, and the page works
 * with JavaScript disabled. The page wraps this in <Suspense>, so the shell
 * streams immediately and this swaps in when the query lands.
 */
export async function ReservationStatus({ reference }: { reference: string }) {
  const reservation = await getReservation(reference)

  if (!reservation) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">No reservation found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a reservation with this reference. Check the
            reference and try again.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button render={<Link href="/check-reservation" />} variant="outline" size="lg">
            Try another reference
          </Button>
          <Button render={<Link href="/reserve" />} size="lg">
            Reserve a spot
          </Button>
        </div>
      </div>
    )
  }

  return <ReservationDetails reservation={reservation} />
}
