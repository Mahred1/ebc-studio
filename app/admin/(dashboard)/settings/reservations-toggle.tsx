"use client"

import { useTransition } from "react"
import { LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "cn"
import { setReservationsPaused } from "./actions"

/**
 * The switch in the Settings "Reservations" panel. A plain button with
 * role="switch" — no switch component in the ui kit, and this is two
 * elements of Tailwind. Fires the server action on toggle; the page re-reads
 * the flag from the database, so the label next to it stays accurate, and the
 * toast confirms which way it went.
 */
export function ReservationsToggle({ paused }: { paused: boolean }) {
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      try {
        const { ok } = await setReservationsPaused(!paused)
        toast[ok ? "success" : "error"](
          ok
            ? !paused
              ? "Reservations are paused — the form now shows the pause notice."
              : "Reservations are open again."
            : "That didn't go through. Please try again."
        )
      } catch {
        toast.error("That didn't go through. Please try again.")
      }
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={paused}
      aria-label="Pause new reservations"
      disabled={pending}
      onClick={toggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-[var(--ease-out)]",
        paused ? "bg-destructive" : "bg-secondary",
        pending && "opacity-60"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow transition-transform duration-150 ease-[var(--ease-out)]",
          paused ? "translate-x-5" : "translate-x-0"
        )}
      />
      {pending && (
        <LoaderCircleIcon
          className="absolute inset-0 m-auto size-3.5 animate-spin text-foreground"
          aria-hidden
        />
      )}
    </button>
  )
}