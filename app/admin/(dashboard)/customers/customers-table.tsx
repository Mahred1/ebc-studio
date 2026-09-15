"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "cn"

import { PENDING_BADGE_CLASS } from "@/components/reservation-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CURRENCY,
  formatPhone,
  type CustomerStatus,
  type CustomerView,
} from "@/lib/reservation"

// Color-coded: amber = needs review, green = has a live booking, gray = idle.
// Pending shares the reservation badge's amber so "needs review" reads the
// same across the whole admin.
const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending review",
    className: PENDING_BADGE_CLASS,
  },
  active: {
    label: "Active booking",
    className: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  inactive: {
    label: "Nothing current",
    className: "border-transparent bg-secondary text-muted-foreground",
  },
}

const STATUS_RANK: Record<CustomerStatus, number> = {
  pending: 0,
  active: 1,
  inactive: 2,
}

type SortKey = "name" | "count" | "value" | "status" | "last"
type SortDir = "asc" | "desc"
type Sort = { key: SortKey; dir: SortDir }

const COLUMNS: { key: SortKey; label: string; className?: string; align?: "right" }[] = [
  { key: "name", label: "Customer" },
  { key: "count", label: "Reservations", align: "right" },
  { key: "value", label: "Lifetime value", align: "right" },
  { key: "status", label: "Status" },
  { key: "last", label: "Last reserved" },
]

/** Compares two customers for a sort key; used on plain rows so sorting is stable and in-memory. */
function compare(a: CustomerView, b: CustomerView, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name)
    case "count":
      return a.reservationCount - b.reservationCount
    case "value":
      // Both totalBid strings are "digits.digits"; Number() is fine for comparing.
      return Number(a.totalBid) - Number(b.totalBid)
    case "status":
      return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    case "last":
      // ISO strings sort lexically.
      return a.lastReservedAt.localeCompare(b.lastReservedAt)
  }
}

function formatValue(totalBid: string): string {
  const n = Number(totalBid)
  const amount = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${CURRENCY.symbol}${amount} ${CURRENCY.code}`
}

function formatLast(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Rows per page, matching the bookings list. */
const PER_PAGE = 5

export function CustomersTable({ customers }: { customers: CustomerView[] }) {
  const [sort, setSort] = React.useState<Sort>({ key: "value", dir: "desc" })
  const [page, setPage] = React.useState(1)

  const sorted = React.useMemo(() => {
    const rows = [...customers].sort((a, b) => {
      const result = compare(a, b, sort.key)
      return sort.dir === "asc" ? result : -result
    })
    return rows
  }, [customers, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const current = Math.min(page, pages)
  const pageRows = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  function toggle(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    )
    // A re-sorted list starts a new first page.
    setPage(1)
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <h2 className="text-sm font-semibold">Customers</h2>
        <p className="text-sm text-muted-foreground">
          {customers.length} {customers.length === 1 ? "customer" : "customers"}
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          {/* Matches the card's section title (text-sm font-semibold) rather than
              the tiny uppercase label used on the no-sort admin tables. */}
          <tr className="border-b text-left text-sm font-semibold text-muted-foreground">
            {COLUMNS.map((column) => {
              const active = sort.key === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(column.align === "right" && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => toggle(column.key)}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-5 py-3 transition-colors hover:text-foreground",
                      column.align === "right" && "flex-row-reverse",
                      active && "text-foreground"
                    )}
                  >
                    {column.label}
                    {active ? (
                      sort.dir === "asc" ? (
                        <ArrowUpIcon className="size-4" />
                      ) : (
                        <ArrowDownIcon className="size-4" />
                      )
                    ) : (
                      <ArrowUpDownIcon className="size-4 opacity-50" />
                    )}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((customer) => {
            const status = CUSTOMER_STATUS[customer.status]
            return (
              <tr key={customer.email} className="border-b last:border-0">
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-muted-foreground">{customer.email}</span>
                    <span className="text-muted-foreground">
                      {customer.phone ? formatPhone(customer.phone) : "No phone"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right tabular-nums">
                  {customer.reservationCount}
                </td>
                <td className="px-5 py-4 text-right tabular-nums">
                  {formatValue(customer.totalBid)}
                </td>
                <td className="px-5 py-4">
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatLast(customer.lastReservedAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {sorted.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">
          No reservations yet — customers appear here as soon as someone books.
        </p>
      ) : null}

      {sorted.length > 0 ? (
        <nav className="flex items-center justify-between gap-2 border-t px-5 py-3 text-sm">
          <p className="text-muted-foreground">
            Page {current} of {pages} · {sorted.length}{" "}
            {sorted.length === 1 ? "customer" : "customers"}
          </p>
          <div className="flex items-center gap-2">
            {current > 1 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft />
                Previous
              </Button>
            ) : null}
            {current < pages ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(current + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </section>
  )
}