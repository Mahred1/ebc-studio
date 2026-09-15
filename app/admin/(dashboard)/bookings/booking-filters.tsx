"use client"

import { useRouter } from "next/navigation"
import { cn } from "cn"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BOOKING_PERIODS,
  type BookingPeriod,
  type ReservationStatus,
} from "@/lib/reservation"

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Rejected" },
  { value: "canceled", label: "Canceled" },
] as const

export type BookingFilterState = {
  status: ReservationStatus | ""
  channel: string
  period: BookingPeriod
}

/**
 * The toolbar above the booking list. Status is a row of pills on the left,
 * channel and time period are selects on the right. Every control navigates —
 * the page re-renders server-side with the new query — so a filter change is a
 * fresh request, never a client-side re-read. Changing any filter resets the
 * page (the URL is rebuilt without the `page` param).
 */
export function BookingFilters({
  status,
  channel,
  period,
  channels,
}: BookingFilterState & { channels: string[] }) {
  const router = useRouter()

  const go = (patch: Partial<BookingFilterState>) => {
    const next = { status, channel, period, ...patch }
    const params = new URLSearchParams()
    if (next.status) params.set("status", next.status)
    if (next.channel) params.set("channel", next.channel)
    if (next.period && next.period !== "all") params.set("period", next.period)
    const qs = params.toString()
    router.replace(`/admin/bookings${qs ? `?${qs}` : ""}`)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div
        role="group"
        aria-label="Filter by status"
        className="flex flex-wrap items-center gap-1.5"
      >
        {STATUS_FILTERS.map((option) => {
          const active = status === option.value
          return (
            <button
              key={option.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => go({ status: option.value as ReservationStatus | "" })}
              className={cn(
                "h-8 rounded-lg px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-secondary font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={channel}
          onValueChange={(value) => go({ channel: value as string })}
        >
          <SelectTrigger size="sm" aria-label="Filter by channel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="">All channels</SelectItem>
            {channels.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={period}
          onValueChange={(value) => go({ period: value as BookingPeriod })}
        >
          <SelectTrigger size="sm" aria-label="Filter by time period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(BOOKING_PERIODS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}