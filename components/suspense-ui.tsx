import { LoaderCircleIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Shared skeletons for the streaming fallbacks the pages render while a
 * section waits on its database read — the page chrome is already on screen,
 * and these hold the shape of what's coming so the swap doesn't jump. Pure
 * decoration, hidden from assistive tech; the action itself keeps its labels.
 */

function Bar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-full bg-muted", className)} aria-hidden />
  )
}

/** Mirrors StatCard's tile so the swap to real numbers doesn't shift layout. */
export function StatCardSkeleton() {
  return (
    <section className="rounded-xl border bg-card px-5 py-4" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <Bar className="h-3 w-24" />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted" />
      </div>
      <Bar className="mt-3 h-6 w-16" />
      <Bar className="mt-2 h-3 w-32" />
    </section>
  )
}

/** A grid of StatCard skeletons on the page's own column count. */
export function StatGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("stat-grid grid gap-4", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Mirrors a bordered data table, header strip and all. */
export function TableSkeleton({
  rows = 5,
  cells = 5,
}: {
  rows?: number
  cells?: number
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-hidden>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <Bar className="h-4 w-36" />
        <Bar className="h-4 w-48" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 border-b px-5 py-4 last:border-0"
        >
          {Array.from({ length: cells }, (_, j) => (
            <Bar
              key={j}
              className={cn(
                "h-4",
                j === 0 ? "w-32" : j === cells - 1 ? "ml-auto w-24" : "min-w-16 flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

/** A card without a table underneath — settings panels, chart blocks, counts. */
export function CardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-hidden>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <Bar className="h-4 w-32" />
        <Bar className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-3 p-5">
        {Array.from({ length: rows }, (_, i) => (
          <Bar key={i} className="h-3 w-full" />
        ))}
      </div>
    </section>
  )
}

/** Centered spinner for the public pages' data-bound areas. */
export function InlineLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-40 w-full items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <LoaderCircleIcon className="size-6 animate-spin" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}