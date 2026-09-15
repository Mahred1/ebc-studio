import type { Metadata } from "next"

import { PENDING_BADGE_CLASS } from "@/components/reservation-status-badge"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { requireAdmin } from "@/lib/auth"
import { CURRENCY } from "@/lib/reservation"
import { getOverview } from "@/lib/reservations"
import {
  CalendarDays,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Clock,
  Radio,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admin | EBC Studio",
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

const STATUS_BADGE = {
  pending: "secondary",
  confirmed: "success",
  declined: "destructive",
  canceled: "outline",
} as const

export default async function AdminDashboardPage() {
  const admin = await requireAdmin()
  const overview = await getOverview()

  const occupancyPct =
    overview.totalChannels === 0
      ? "—"
      : `${Math.round(
          (overview.occupiedChannels / overview.totalChannels) * 100
        )}%`

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-primary">Overview</h1>
        <p className="text-muted-foreground">
          Signed in as {admin.username} — at a glance, right now.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Radio}
          label="Channel occupancy"
          value={`${overview.occupiedChannels} / ${overview.totalChannels}`}
          detail={`${occupancyPct} of channels booked`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Revenue today"
          value={money(overview.revenueToday)}
          detail="Confirmed bookings"
        />
        <StatCard
          icon={CalendarDays}
          label="Bookings today"
          value={String(overview.bookingsToday)}
          detail="Open + confirmed"
        />
        <StatCard
          icon={Clock}
          tone="warning"
          label="Pending review"
          value={String(overview.pending)}
          detail="Awaiting a decision"
        />
        <StatCard
          icon={CircleCheck}
          tone="success"
          label="Accepted"
          value={String(overview.accepted)}
          detail={`${overview.declined} declined`}
        />
        <StatCard
          icon={CircleX}
          tone="danger"
          label="Rejected"
          value={String(overview.declined)}
          detail="Declined bookings"
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Upcoming sessions</h2>
          <p className="text-sm text-muted-foreground">
            Open and confirmed reservations, newest first
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">
                Channel
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Date
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Customer
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {overview.sessions.map((session) => (
              <tr key={session.reference} className="border-b last:border-0">
                <td className="px-5 py-4 font-medium">{session.channel}</td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(session.bookedAt)}
                </td>
                <td className="px-5 py-4">{session.fullName}</td>
                <td className="px-5 py-4">
                  <Badge
                    variant={STATUS_BADGE[session.status]}
                    className={
                      session.status === "pending" ? PENDING_BADGE_CLASS : undefined
                    }
                  >
                    {session.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {overview.sessions.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">
            No upcoming sessions yet — they appear here once someone reserves.
          </p>
        ) : null}
      </section>
    </div>
  )
}