/**
 * A KPI stat tile for the admin dashboard — label, headline value, detail line.
 * Shared by Overview, Bookings, and Analytics so the cards stay identical across
 * the admin. The value is semibold (not black): at 24px a black number reads as
 * a headline, not a figure — the label carries the microcap uppercase look the
 * tables already use, so the whole suite reads as one system.
 */
export function StatCard({
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
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </section>
  )
}