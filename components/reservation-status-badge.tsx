import { Badge } from "@/components/ui/badge"
import { RESERVATION_STATUSES, type ReservationStatus } from "@/lib/reservation"

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
    <Badge variant={STATUS_VARIANT[status]}>{RESERVATION_STATUSES[status].label}</Badge>
  )
}
