"use client"

import { useTransition } from "react"
import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ReservationStatus } from "@/lib/reservation"
import {
  acceptBooking,
  archiveBooking,
  cancelBooking,
  rejectBooking,
  reinstateBooking,
  unarchiveBooking,
} from "./actions"

/**
 * The per-row action buttons. Which actions appear follows the lifecycle —
 * pending rows can be accepted or rejected, confirmed rows canceled, canceled
 * rows reinstated — nothing actionable on a declined row. Decided rows
 * (confirmed, declined, canceled) also carry an Archive/Unarchive toggle;
 * pending rows can't be archived yet. A change disables the row's buttons while
 * it's in flight, then the server revalidates and re-renders the list.
 */
export function BookingActions({
  reference,
  status,
  archived,
}: {
  reference: string
  status: ReservationStatus
  archived: boolean
}) {
  const [pending, startTransition] = useTransition()
  const run = (action: (reference: string) => Promise<void>) => () =>
    startTransition(async () => {
      await action(reference)
    })

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" ? (
        <>
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
        </>
      ) : status === "confirmed" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(cancelBooking)}
        >
          Cancel
        </Button>
      ) : status === "canceled" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(reinstateBooking)}
        >
          <RotateCcwIcon />
          Reinstate
        </Button>
      ) : null}
      {status !== "pending" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(archived ? unarchiveBooking : archiveBooking)}
        >
          {archived ? "Unarchive" : "Archive"}
        </Button>
      )}
    </div>
  )
}