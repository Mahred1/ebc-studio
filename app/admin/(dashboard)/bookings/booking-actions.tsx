"use client"

import { useTransition } from "react"
import { RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

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

/** The copy each action answers with, keyed the same way the buttons branch. */
const MESSAGES: Record<
  "accept" | "reject" | "cancel" | "reinstate" | "archive" | "unarchive",
  { done: string; noop: string }
> = {
  accept: { done: "Reservation accepted — the booker has been emailed.", noop: "Nothing to accept — the reservation already changed." },
  reject: { done: "Reservation rejected — the booker has been emailed.", noop: "Nothing to reject — the reservation already changed." },
  cancel: { done: "Reservation canceled — the booker has been emailed.", noop: "Nothing to cancel — the reservation already changed." },
  reinstate: { done: "Reservation reinstated.", noop: "Nothing to reinstate — the reservation already changed." },
  archive: { done: "Reservation archived.", noop: "Nothing to archive — it already is." },
  unarchive: { done: "Reservation restored to the list.", noop: "Nothing to restore — it already is." },
}

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

  const run =
    (action: (reference: string) => Promise<{ ok: boolean }>, label: keyof typeof MESSAGES) =>
    () =>
      startTransition(async () => {
        try {
          const { ok } = await action(reference)
          toast[ok ? "success" : "info"](ok ? MESSAGES[label].done : MESSAGES[label].noop)
        } catch {
          toast.error("That didn't go through. Please try again.")
        }
      })

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" ? (
        <>
          <Button
            size="sm"
            variant="success"
            disabled={pending}
            onClick={run(acceptBooking, "accept")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={run(rejectBooking, "reject")}
          >
            Reject
          </Button>
        </>
      ) : status === "confirmed" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(cancelBooking, "cancel")}
        >
          Cancel
        </Button>
      ) : status === "canceled" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={run(reinstateBooking, "reinstate")}
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
          onClick={run(archived ? unarchiveBooking : archiveBooking, archived ? "unarchive" : "archive")}
        >
          {archived ? "Unarchive" : "Archive"}
        </Button>
      )}
    </div>
  )
}