import type { Metadata } from "next"

import { ReservationForm } from "./reservation-form"

export const metadata: Metadata = {
  title: "Reserve a Spot | EBC Studio",
  description: "Reserve a recording spot with Ethiopian Broadcasting Corporation.",
}

export default function ReservePage() {
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

        <ReservationForm />
      </div>
    </main>
  )
}
