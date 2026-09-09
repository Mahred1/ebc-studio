"use client"

import * as React from "react"
import { Suspense, use, useState } from "react"
import Link from "next/link"
import { LoaderCircleIcon, SearchXIcon } from "lucide-react"

import { ReservationDetails } from "@/components/reservation-details"
import { Button } from "@/components/ui/button"
import { getReservationsByEmail } from "@/lib/reservation-store"

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
 * Fetches with the email used to book. The promise is created once per mount —
 * the page mounts us under a `key` set to the email, so changing the email
 * re-creates it — and read with `use()`, suspending into the parent
 * <Suspense> until it resolves. No effect, no setState-in-effect.
 */
function ReservationResultsContent({ email }: { email: string }) {
  const [promise] = useState(() => getReservationsByEmail(email))
  const reservations = use(promise)

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
        <Button render={<Link href="/reserve" />} variant="outline" size="lg">
          Reserve a spot
        </Button>
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
      {reservations.map((reservation) => (
        <ReservationDetails
          key={reservation.reference}
          reservation={reservation}
        />
      ))}
    </div>
  )
}

export function ReservationResults({ email }: { email: string }) {
  return (
    <Suspense fallback={<ReservationResultsFallback />}>
      {/* Remount per email so a changed email fetches a new promise. */}
      <ReservationResultsContent key={email} email={email} />
    </Suspense>
  )
}
