import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { ReservationResults, ReservationResultsFallback } from "./reservation-results"

export const metadata: Metadata = {
  title: "Your Reservations | EBC Studio",
  description: "Every Ethiopian Television studio reservation booked with your email.",
}

// A static segment, so this wins over `[id]` — "results" is never read as a
// reservation reference.
export default async function ReservationResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-black text-primary sm:text-4xl">
            Your Reservations
          </h1>
          {email ? (
            <p className="text-lg font-light text-muted-foreground">
              Booked with <span className="text-foreground">{email}</span>
            </p>
          ) : null}
        </header>

        {/* Keyed by email so a changed email re-suspends instead of showing
            the previous email's results while the new query runs. */}
        <Suspense key={email ?? ""} fallback={<ReservationResultsFallback />}>
          <ReservationResults email={email ?? ""} />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/check-reservation"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Check another reservation
          </Link>
        </p>
      </div>
    </main>
  )
}
