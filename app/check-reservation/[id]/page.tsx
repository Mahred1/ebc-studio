import type { Metadata } from "next"
import Link from "next/link"

import { ReservationStatus } from "./reservation-status"

export const metadata: Metadata = {
  title: "Reservation Status | EBC Studio",
  description: "The current status of your Ethiopian Television studio reservation.",
}

export default async function ReservationStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-black text-primary sm:text-4xl">
            Reservation Status
          </h1>
          <p className="text-lg font-light text-muted-foreground">
            Reference{" "}
            <span className="font-mono tracking-widest text-foreground">
              {decodeURIComponent(id).toUpperCase()}
            </span>
          </p>
        </header>

        <ReservationStatus reference={decodeURIComponent(id)} />

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
