import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getVisibleChannelOptions } from "@/lib/channels"

export default async function Home() {
  const channels = await getVisibleChannelOptions()

  return (
    <div className="flex flex-1 flex-col bg-background font-sans text-foreground">
      {/* ─── Hero ─── */}
      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
        <Image
          src="/ebc-logo.png"
          alt="Ethiopian Broadcasting Corporation logo"
          width={80}
          height={80}
          priority
          className="mb-6 rounded-full"
        />

        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Ethiopian Broadcasting
          <br />
          <span className="text-primary">Studio Reservations</span>
        </h1>

        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Book a recording session at EBC studios. Select your channel, pick a
          time, and confirm — it takes less than a minute.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/reserve" />} size="lg">
            Reserve a Spot
          </Button>
          <Button
            render={<Link href="/check-reservation" />}
            variant="outline"
            size="lg"
          >
            Check Reservation
          </Button>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* ─── Why EBC Studio ─── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24">
        <h2 className="text-center font-serif text-3xl font-bold sm:text-4xl">
          Why EBC Studio
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
          Everything you need for a flawless production, all in one place.
        </p>

        <dl className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {[
            {
              title: "Great Customer Service",
              desc: "A dedicated team is on hand before, during, and after your session — from booking to broadcast.",
            },
            {
              title: "Professional Studios",
              desc: "Purpose-built recording spaces with broadcast-grade acoustics, controlled lighting, and room to work.",
            },
            {
              title: "High-Quality Equipment",
              desc: "Broadcast cameras, professional audio, and reliable recording gear operated by skilled crews.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col text-center">
              <h3 className="font-serif text-xl font-bold">{item.title}</h3>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* ─── How it works ─── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24">
        <h2 className="text-center font-serif text-3xl font-bold sm:text-4xl">
          How It Works
        </h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {[
            {
              num: "01",
              title: "Choose a channel",
              desc: "Pick from the list of available television channels currently accepting reservations.",
            },
            {
              num: "02",
              title: "Enter your details",
              desc: "Provide your name, email, and phone number so we can confirm your booking.",
            },
            {
              num: "03",
              title: "Get confirmed",
              desc: "Receive a reservation ID instantly. Use it anytime to check your booking status.",
            },
          ].map((step) => (
            <li key={step.num} className="flex flex-col text-center">
              <span className="font-mono text-sm font-semibold text-primary">
                {step.num}
              </span>
              <h3 className="mt-2 font-serif text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* ─── Channels ─── */}
      {channels.length > 0 && (
        <>
          <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24">
            <h2 className="text-center font-serif text-3xl font-bold sm:text-4xl">
              Available Channels
            </h2>
            <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
              These channels are currently open for studio reservations.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {channels.map((ch) => (
                <span
                  key={ch.value}
                  className="rounded-full border border-border px-5 py-2 text-sm font-medium"
                >
                  {ch.label}
                </span>
              ))}
            </div>
          </section>

          {/* ─── Divider ─── */}
          <div className="mx-auto w-full max-w-5xl border-t border-border" />
        </>
      )}

      {/* ─── CTA ─── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 text-center sm:py-24">
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">
          Ready to book?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Secure your studio session in just a few clicks.
        </p>
        <Button render={<Link href="/reserve" />} size="lg" className="mt-8">
          Reserve a Spot
        </Button>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Ethiopian Broadcasting Corporation.
          All rights reserved.
        </p>
      </footer>
    </div>
  )
}
