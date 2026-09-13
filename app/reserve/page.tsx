import type { Metadata } from "next"
import Link from "next/link"
import { PauseCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getSiteSettings } from "@/lib/site-settings"
import { ReservationForm } from "./reservation-form"

export const metadata: Metadata = {
  title: "Reserve a Spot | EBC Studio",
  description: "Reserve a recording spot with Ethiopian Broadcasting Corporation.",
}

// Renders the reservationsPaused flag, which settings can flip at any time —
// a stale static build of this page would let the pause go unseen.
export const dynamic = "force-dynamic"

export default async function ReservePage() {
  const { reservationsPaused } = await getSiteSettings()

  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-black text-primary sm:text-4xl">
            Welcome to Ethiopian Television
          </h1>
          <p className="text-lg font-light text-muted-foreground">
            Reserve Your Spot Now!
          </p>
        </header>

        {reservationsPaused ? <ReservationsPaused /> : <ReservationForm />}
      </div>
    </main>
  )
}

function ReservationsPaused() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
      <PauseCircleIcon className="size-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-primary">
        Reservations are paused
      </h2>
      <p className="text-sm text-muted-foreground">
        We&apos;re not taking new reservations right now. If you&apos;ve
        already booked, you can still check your spot.
      </p>
      <Button render={<Link href="/check-reservation" />} size="lg">
        Check an existing reservation
      </Button>
      <p className="text-xs text-muted-foreground">
        Use the reservation ID or email you booked with.
      </p>
    </div>
  )
}
