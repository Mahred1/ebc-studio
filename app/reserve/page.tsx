import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PauseCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getVisibleChannelOptions } from "@/lib/channels";
import { getSiteSettings } from "@/lib/site-settings";
import { ReservationForm } from "./reservation-form";

export const metadata: Metadata = {
  title: "Reserve a Spot | EBC Studio",
  description:
    "Reserve a recording spot with Ethiopian Broadcasting Corporation.",
};

// Renders the reservationsPaused flag and the live channel inventory — both can
// change at any time — so a stale static build of this page would serve the old
// pause state and the old channel list.
export const dynamic = "force-dynamic";

export default async function ReservePage() {
  const { reservationsPaused } = await getSiteSettings();
  const channels = await getVisibleChannelOptions();

  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <Link href="/">
            <Image
              src="/ebc-logo.png"
              alt="Ethiopian Broadcasting Corporation logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Welcome to Ethiopian Television
          </h1>
          <p className="text-lg text-muted-foreground">
            Reserve Your Spot Now!
          </p>
        </header>

        {reservationsPaused ? (
          <ReservationsPaused />
        ) : channels.length === 0 ? (
          <NoChannels />
        ) : (
          <ReservationForm channels={channels} />
        )}
      </div>
    </main>
  );
}

/** Every channel is hidden or was deleted — the form has nothing to offer. */
function NoChannels() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
      <PauseCircleIcon className="size-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-primary">
        No channels available
      </h2>
      <p className="text-sm text-muted-foreground">
        We&apos;re not accepting reservations right now. If you&apos;ve already
        booked, you can still check your spot.
      </p>
      <Button render={<Link href="/check-reservation" />} size="lg">
        Check an existing reservation
      </Button>
    </div>
  );
}

function ReservationsPaused() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
      <PauseCircleIcon className="size-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-primary">
        Reservations are paused
      </h2>
      <p className="text-sm text-muted-foreground">
        We&apos;re not taking new reservations right now. If you&apos;ve already
        booked, you can still check your spot.
      </p>
      <Button render={<Link href="/check-reservation" />} size="lg">
        Check an existing reservation
      </Button>
      <p className="text-xs text-muted-foreground">
        Use the reservation ID or email you booked with.
      </p>
    </div>
  );
}
