import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getVisibleChannelOptions } from "@/lib/channels"

export default async function Home() {
  const channels = await getVisibleChannelOptions()

  return (
    <div className="flex flex-1 flex-col bg-background font-sans text-foreground">
      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="#" className="flex items-center gap-2">
            <Image
              src="/ebc-logo.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="font-serif text-sm font-bold">EBC Studio</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Link
              href="#why"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Why EBC
            </Link>
            <Link
              href="#how"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            {channels.length > 0 && (
              <Link
                href="#channels"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Channels
              </Link>
            )}
            <Button render={<Link href="/reserve" />}>Reserve</Button>
          </div>

          <Button
            render={<Link href="/reserve" />}
            className="sm:hidden"
          >
            Reserve
          </Button>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <section id="top" className="flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
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
      <section id="why" className="mx-auto w-full max-w-5xl scroll-mt-16 px-6 py-20 sm:py-24">
        <h2 className="text-center font-serif text-3xl font-bold sm:text-4xl">
          Why EBC Studio
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
          Everything you need for a flawless production, all in one place.
        </p>

        <dl className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {[
            {
              symbol: "✉",
              title: "Great Customer Service",
              desc: "A dedicated team is on hand before, during, and after your session — from booking to broadcast.",
            },
            {
              symbol: "▣",
              title: "Professional Studios",
              desc: "Purpose-built recording spaces with broadcast-grade acoustics, controlled lighting, and room to work.",
            },
            {
              symbol: "⚙",
              title: "High-Quality Equipment",
              desc: "Broadcast cameras, professional audio, and reliable recording gear operated by skilled crews.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col text-center">
              <span className="text-3xl leading-none" aria-hidden="true">
                {item.symbol}
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold">{item.title}</h3>
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
      <section id="how" className="mx-auto w-full max-w-5xl scroll-mt-16 px-6 py-20 sm:py-24">
        <h2 className="text-center font-serif text-3xl font-bold sm:text-4xl">
          How It Works
        </h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {[
            {
              num: "01",
              symbol: "▶",
              title: "Choose a channel",
              desc: "Pick from the list of available television channels currently accepting reservations.",
            },
            {
              num: "02",
              symbol: "✎",
              title: "Enter your details",
              desc: "Provide your name, email, and phone number so we can confirm your booking.",
            },
            {
              num: "03",
              symbol: "✓",
              title: "Get confirmed",
              desc: "Receive a reservation ID instantly. Use it anytime to check your booking status.",
            },
          ].map((step) => (
            <li key={step.num} className="flex flex-col text-center">
              <span
                className="text-3xl leading-none text-primary"
                aria-hidden="true"
              >
                {step.symbol}
              </span>
              <span className="mt-3 font-mono text-sm font-semibold text-primary">
                {step.num}
              </span>
              <h3 className="mt-1 font-serif text-xl font-bold">{step.title}</h3>
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
          <section id="channels" className="mx-auto w-full max-w-5xl scroll-mt-16 px-6 py-20 sm:py-24">
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
