import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import FaqAccordion from "./components/FaqAccordion"
import { Reveal } from "./components/Reveal"
import { getVisibleChannelOptions } from "@/lib/channels"

// Reads the live channel inventory, which changes anytime a channel is
// added, renamed, or hidden in the admin — a stale static build would serve
// the old list.
export const dynamic = "force-dynamic"

export default async function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background font-sans text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/ebc-logo.png"
                alt=""
                width={32}
                height={32}
                className="rounded-full shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-shadow duration-200"
              />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight leading-none">EBC Studio</span>
          </Link>

          <div className="hidden items-center gap-8 text-[15px] font-medium sm:flex">
            {[
              { label: "Why EBC", href: "#why-ebc" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Channels", href: "#channels" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-stone-500 hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 hover:after:scale-x-100 after:bg-primary after:transition-transform after:duration-200 after:ease-out"
              >
                {item.label}
              </Link>
            ))}
            <Button render={<Link href="/reserve" />} className="ml-2 rounded-full px-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-shadow duration-200 ease-out">Reserve</Button>
          </div>

          <Button render={<Link href="/reserve" />} className="rounded-full sm:hidden shadow-lg shadow-primary/20">Reserve</Button>
        </nav>
      </header>

      {/* Hero — editorial light with logo background */}
      <section id="top" className="relative overflow-hidden bg-stone-50 text-foreground">
        <Image src="/ebc-logo.png" alt="" width={140} height={140} priority className="absolute top-[12%] left-[5%] -rotate-12 opacity-[0.12] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={90} height={90} priority className="absolute top-[18%] right-[8%] rotate-12 opacity-[0.10] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={160} height={160} priority className="absolute bottom-[8%] left-[10%] rotate-6 opacity-[0.14] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={70} height={70} priority className="absolute bottom-[12%] right-[12%] -rotate-6 opacity-[0.11] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={110} height={110} priority className="absolute top-[45%] left-[3%] rotate-45 opacity-[0.09] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={50} height={50} priority className="absolute top-[55%] right-[3%] -rotate-45 opacity-[0.08] pointer-events-none select-none" />
        <Image src="/ebc-logo.png" alt="" width={130} height={130} priority className="absolute top-[22%] left-[50%] -rotate-6 opacity-[0.10] pointer-events-none select-none" />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-44 text-center">
          <div className="mx-auto mb-8 inline-block rounded-full overflow-hidden ring-1 ring-primary/30 p-1 animate-fade-up">
            <Image
              src="/ebc-logo.png"
              alt="EBC Studio"
              width={120}
              height={120}
              priority
              className="rounded-full"
            />
          </div>

          <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.5rem] animate-fade-up" style={{ animationDelay: "60ms" }}>
            <span className="block text-foreground">Broadcast.</span>
            <span className="block text-primary">Record. Resonance.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 animate-fade-up" style={{ animationDelay: "120ms" }}>
            Book a recording session at EBC studios in under a minute. Professional acoustics, broadcast-grade equipment, and a team that knows the craft.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row justify-center animate-fade-up" style={{ animationDelay: "180ms" }}>
            <Button render={<Link href="/reserve" />} size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-[transform,box-shadow] duration-200 ease-out bg-primary border-0 text-white font-semibold tracking-tight">
              Reserve a Spot
            </Button>
            <Button
              render={<Link href="/check-reservation" />}
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-lg border-border text-foreground hover:bg-muted hover:border-muted-foreground active:scale-[0.98] transition-colors duration-200 font-medium"
            >
              Check Reservation
            </Button>
          </div>

          {/* Credibility bar removed */}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl border-t border-border" />

      {/* Why EBC */}
      <section id="why-ebc" className="mx-auto w-full max-w-6xl scroll-mt-16 px-6 lg:px-10 py-24 sm:py-32 bg-stone-50">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <Reveal className="lg:col-span-4 lg:sticky lg:top-28">
            <h2 className="font-serif text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
              Why <span className="text-primary">EBC</span>
            </h2>
            <p className="mt-6 text-lg text-stone-500 leading-relaxed">A producer-first space: everything from sound treatment to crew support, designed around what actually makes great content.</p>
            <div className="mt-8 h-1 w-16 bg-primary rounded-full" />
          </Reveal>

          <div className="lg:col-span-8 flex flex-col gap-6">
            {[
              { num: "01", title: "Dedicated Crew", desc: "A team is on hand before, during, and after — from booking to broadcast. No empty rooms, no solo struggles.", align: "left" as const },
              { num: "02", title: "Broadcast Studios", desc: "Purpose-built spaces with treated acoustics, controlled lighting, and room to work — built for the screen, not the showroom.", align: "right" as const },
              { num: "03", title: "Pro Equipment", desc: "Broadcast cameras, professional audio, and reliable recording gear — maintained by people who use it every day.", align: "left" as const },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className={`group relative rounded-2xl border border-border/50 bg-stone-100/70 p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.05] hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-300 ease-out ${item.align === "right" ? "lg:ml-auto lg:max-w-[85%]" : ""}`}>
                  <div className="absolute top-4 right-5 font-mono text-5xl font-bold text-stone-500/10 select-none group-hover:text-primary/10 transition-colors">{item.num}</div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight">{item.title}</h3>
                  <dd className="mt-3 text-sm leading-relaxed text-stone-500">{item.desc}</dd>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl border-t border-border" />

      {/* How It Works — numbered timeline with connecting line */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-16 px-6 lg:px-10 py-24 sm:py-32 bg-white">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-5xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-xl text-stone-500">Three steps. No bureaucracy. Just confirmation.</p>
        </div>

        <ol className="relative grid gap-10 sm:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div className="hidden sm:block absolute top-[2rem] left-[16.666%] right-[16.666%] h-px bg-primary/30" />

          {[
            { num: "01", title: "Choose a Channel", desc: "Browse available television channels open for reservations. Each listed with live status.", icon: "▶" },
            { num: "02", title: "Enter Your Details", desc: "Name, email, and phone — just enough to confirm. No unnecessary forms.", icon: "✎" },
            { num: "03", title: "Get Confirmed", desc: "An instant reservation ID. Check status anytime with it.", icon: "✓" },
          ].map((step, i) => (
            <li key={step.num} className="relative">
              <Reveal delay={i * 60} className="flex flex-col text-left sm:text-center">
                <div className="mx-auto sm:mx-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-xl shadow-xl shadow-primary/25 ring-4 ring-background z-10 mb-6 font-serif font-bold">
                  {step.num}
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500 max-w-xs mx-auto sm:mx-0">{step.desc}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl border-t border-border" />

      {/* Channels — visual cards instead of table; the inventory read is the
          page's only live query, so it streams in behind the rest. */}
      <Suspense fallback={null}>
        <ChannelsSection />
      </Suspense>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-16 px-6 lg:px-10 py-24 sm:py-32 bg-white">
        <Reveal>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-center">Frequently Asked</h2>
          <p className="mt-3 text-center text-stone-500">Quick answers — if you need more, reserve and ask directly.</p>

          <FaqAccordion />
        </Reveal>
      </section>

      {/* CTA — editorial closing */}
      <section className="mx-auto w-full max-w-6xl px-6 lg:px-10 py-28 sm:py-36 text-center bg-stone-50">
        <Reveal>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          Ready to <span className="text-primary">record?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg text-stone-500 leading-relaxed">Secure your session in under a minute. Confirmation arrives instantly.</p>
        <Button render={<Link href="/reserve" />} size="lg" className="mt-8 rounded-full px-10 py-6 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-[0.98] transition-[transform,box-shadow] duration-200 ease-out font-semibold tracking-tight bg-primary border-0 text-white">Reserve a Spot</Button>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background px-6 py-8 text-center text-sm text-stone-500">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/ebc-logo.png" alt="" width={24} height={24} className="rounded-full" />
            <span className="font-serif font-bold text-foreground">EBC Studio</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Ethiopian Broadcasting Corporation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

/** The channel list and its trailing divider — hidden when nothing is live. */
async function ChannelsSection() {
  const channels = await getVisibleChannelOptions()

  if (channels.length === 0) return null

  return (
    <>
      <section id="channels" className="mx-auto w-full max-w-6xl scroll-mt-16 px-6 lg:px-10 py-24 sm:py-32 bg-stone-50">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">Available Channels</h2>
            <p className="mt-3 text-stone-500 text-lg">Open for reservations today. Pick the one you are producing for.</p>
          </div>
        </div>

        <div className="border-t border-b border-border rounded-2xl overflow-hidden bg-stone-100/80">
          {channels.map((ch, i) => (
            <Reveal
              key={ch.value}
              delay={Math.min(i * 40, 200)}
              className={i === 0 ? "" : "border-t border-border/60"}
            >
              <Link href="/reserve" className="group flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-stone-500 w-6">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-serif text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{ch.label}</h3>
                </div>
                <span className="text-primary text-base font-bold opacity-100 group-hover:translate-x-1 transition-transform duration-200 ease-out" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl border-t border-stone-200/60" />
    </>
  )
}
