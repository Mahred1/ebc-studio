"use client"

import * as React from "react"
import { Suspense, use, useState } from "react"
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
 * Fetches a single reservation. The promise is created once per mount (the page
 * re-mounts us when the reference changes) and read with `use()`, so rendering
 * suspends into the parent <Suspense> until it resolves — no effect, no
 * setState-in-effect.
 */
function ReservationStatusContent({ reference }: { reference: string }) {
  const [promise] = useState(() => getReservation(reference))
  const reservation = use(promise)

  if (!reservation) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">No reservation found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a reservation with this reference.
          </p>
        </div>
        <Button render={<Link href="/reserve" />} variant="outline" size="lg">
          Reserve a spot
        </Button>
      </div>
    )
  }

  return <ReservationDetails reservation={reservation} />
}

export function ReservationStatus({ reference }: { reference: string }) {
  return (
    <Suspense fallback={<ReservationStatusFallback />}>
      <ReservationStatusContent reference={reference} />
    </Suspense>
  )
}
