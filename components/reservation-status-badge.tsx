import { Badge } from "@/components/ui/badge"
import { RESERVATION_STATUSES, type ReservationStatus } from "@/lib/reservation"

/** Light-orange tint for any "pending / needs review" badge — the single source
 * the reservation badge and the customer table both use, so the color can't
 * drift between pages. The label always accompanies it, never amber alone. */
export const PENDING_BADGE_CLASS =
  "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400"

const STATUS_VARIANT: Record<
  ReservationStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "secondary",
  confirmed: "success",
  declined: "destructive",
  canceled: "outline",
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className={status === "pending" ? PENDING_BADGE_CLASS : undefined}
    >
      {RESERVATION_STATUSES[status].label}
    </Badge>
  )
}
