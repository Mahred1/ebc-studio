"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import {
  CURRENCY,
  formatPhone,
  type CustomerStatus,
  type CustomerView,
} from "@/lib/reservation"

const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  pending: { label: "Pending review", variant: "default" },
  active: { label: "Active booking", variant: "secondary" },
  inactive: { label: "Nothing current", variant: "outline" },
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

export function CustomersTable({ customers }: { customers: CustomerView[] }) {
  const [sort, setSort] = React.useState<Sort>({ key: "value", dir: "desc" })

  const sorted = React.useMemo(() => {
    const rows = [...customers].sort((a, b) => {
      const result = compare(a, b, sort.key)
      return sort.dir === "asc" ? result : -result
    })
    return rows
  }, [customers, sort])

  function toggle(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    )
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
          <tr className="border-b text-left text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
            {COLUMNS.map((column) => {
              const active = sort.key === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-5 py-3 font-semibold", column.align === "right" && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => toggle(column.key)}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                      column.align === "right" && "flex-row-reverse",
                      active && "text-foreground"
                    )}
                  >
                    {column.label}
                    {active ? (
                      sort.dir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDownIcon className="size-3.5 opacity-50" />
                    )}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((customer) => {
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
                  <Badge variant={status.variant}>{status.label}</Badge>
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
    </section>
  )
}