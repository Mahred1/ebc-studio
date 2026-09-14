import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { CURRENCY } from "@/lib/reservation"
import { getAnalytics } from "@/lib/reservations"
import { RevenueChart } from "./revenue-chart"

export const metadata: Metadata = {
  title: "Analytics | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function money(amount: number): string {
  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${CURRENCY.symbol}${value} ${CURRENCY.code}`
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <section className="rounded-xl border bg-card px-5 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </section>
  )
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const stats = await getAnalytics()

  const hasRevenue = stats.trend.some((point) => point.revenue > 0)
  const channelDetail = stats.topChannel
    ? `${stats.topChannelCount} ${
        stats.topChannelCount === 1 ? "reservation" : "reservations"
      }`
    : "No bookings yet"

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-primary">Analytics</h1>
        <p className="text-muted-foreground">
          Live numbers from reservations — revenue counts confirmed bookings only.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Estimated monthly revenue"
          value={money(stats.monthRevenue)}
          detail={`${stats.monthLabel} · ${stats.monthBookings} confirmed`}
        />
        <StatCard
          label="Reject-to-accept ratio"
          value={stats.ratio}
          detail={`${stats.declined} rejected · ${stats.accepted} accepted`}
        />
        <StatCard
          label="Most booked channel"
          value={stats.topChannel ?? "—"}
          detail={channelDetail}
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Revenue trend</h2>
          <p className="text-sm text-muted-foreground">
            Confirmed revenue, last 6 months
          </p>
        </div>
        <div className="p-5">
          {hasRevenue ? (
            <RevenueChart data={stats.trend} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No revenue yet — the chart fills in once a booking is confirmed.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Recent bookings</h2>
          <p className="text-sm text-muted-foreground">Latest 3 reservations</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-sm font-semibold text-muted-foreground">
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Bid date</th>
              <th className="px-5 py-3">Channel</th>
              <th className="px-5 py-3">Client</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((booking) => (
              <tr key={booking.reference} className="border-b last:border-0">
                <td className="px-5 py-4 tabular-nums">
                  {money(Number(booking.bid))}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(booking.createdAt)}
                </td>
                <td className="px-5 py-4">{booking.channel}</td>
                <td className="px-5 py-4 font-medium">{booking.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.recent.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">
            No bookings yet — they appear here once someone reserves.
          </p>
        ) : null}
      </section>
    </div>
  )
}