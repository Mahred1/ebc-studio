"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import type { ReservationStatus } from "@/lib/reservation"
import { acceptBooking, cancelBooking, rejectBooking } from "./actions"

/**
 * The per-row action buttons. Which actions appear follows the lifecycle —
 * pending rows can be accepted or rejected, confirmed rows canceled; nothing
 * actionable on a declined or canceled row. A change disables the row's buttons
 * while it's in flight, then the server revalidates and re-renders the list.
 */
export function BookingActions({
  reference,
  status,
}: {
  reference: string
  status: ReservationStatus
}) {
  const [pending, startTransition] = useTransition()
  const run = (action: (reference: string) => Promise<void>) => () =>
    startTransition(async () => {
      await action(reference)
    })

  if (status === "pending") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="success"
          disabled={pending}
          onClick={run(acceptBooking)}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={run(rejectBooking)}
        >
          Reject
        </Button>
      </div>
    )
  }

  if (status === "confirmed") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(cancelBooking)}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return <span className="flex justify-end text-muted-foreground">—</span>
}