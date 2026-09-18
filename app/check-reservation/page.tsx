import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CheckReservationForm } from "./check-reservation-form";

export const metadata: Metadata = {
  title: "Check Reservation | EBC Studio",
  description:
    "Check the status of your Ethiopian Television studio reservation.",
};

export default function CheckReservationPage() {
  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <Link href="/">
            {" "}
            <Image
              src="/ebc-logo.png"
              alt="Ethiopian Broadcasting Corporation logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </Link>

          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Check Your Reservation
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your reservation ID or email to see its status.
          </p>
        </header>

        <CheckReservationForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have a reservation yet?{" "}
          <Link
            href="/reserve"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Reserve a spot
          </Link>
        </p>
      </div>
    </main>
  );
}
