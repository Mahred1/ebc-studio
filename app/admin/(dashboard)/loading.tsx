import { LoaderCircleIcon } from "lucide-react"

/**
 * Shown in place of the page content the moment a nav link inside the suite is
 * clicked. The admin pages each read from the database, so without this
 * boundary the router would hold the previous page on screen until that data
 * arrived — the suite looked frozen. The spinner signals the fetch instead.
 */
export default function AdminDashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="flex min-h-[50vh] w-full items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <LoaderCircleIcon className="size-6 animate-spin" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}