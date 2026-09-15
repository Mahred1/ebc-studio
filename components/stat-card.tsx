import type { ComponentType } from "react"
import { cn } from "cn"

/**
 * A KPI stat tile for the admin dashboard — label, headline value, detail line,
 * and a distinctive icon so each card is identifiable at a glance. Shared by
 * Overview, Bookings, and Analytics so the cards stay identical across the
 * admin. The value is semibold (not black): at 24px a black number reads as a
 * headline, not a figure. Only status cards take a tint (success/danger) — the
 * color is never the sole carrier, the icon and label always come with it.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  tone?: "neutral" | "success" | "danger"
}) {
  return (
    <section className="rounded-xl border bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone === "neutral" && "bg-muted text-muted-foreground",
            tone === "success" && "bg-success/10 text-success",
            tone === "danger" && "bg-destructive/10 text-destructive"
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </section>
  )
}