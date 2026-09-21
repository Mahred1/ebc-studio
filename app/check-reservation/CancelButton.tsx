"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ReservationView } from "@/lib/reservation"

import { cancelReservationAction } from "./actions"

export default function CancelButton({
  reference,
  status,
  verifyReference = false,
  onChanged,
}: {
  reference: string
  status: string
  verifyReference?: boolean
  /** Called with the fresh reservation once the cancel lands, so the UI can
   *  swap to the reinstate state without waiting on a router.refresh(). */
  onChanged?: (reservation: ReservationView) => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")

  if (status !== "pending" && status !== "confirmed") return null

  function submit() {
    setError(null)
    // Email lookups never show the reference, so canceling from one demands the
    // code itself — it's the ownership proof behind the cancel action.
    if (
      verifyReference &&
      code.trim().toUpperCase() !== reference.toUpperCase()
    ) {
      setError("That code doesn't match this reservation.")
      return
    }
    startTransition(async () => {
      try {
        const res = await cancelReservationAction(reference)
        if (res.ok) {
          toast.success("Reservation canceled.")
          // Update the local copy first so the correct buttons show the moment
          // the cancel lands; the refresh just brings unrelated views in sync.
          onChanged?.(res.reservation)
          router.refresh()
          return
        }
        toast.error(res.error ?? "Failed to cancel reservation.")
      } catch {
        toast.error("Failed to cancel reservation.")
      }
    })
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-5">
      {verifyReference && verifying ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Enter this reservation&apos;s code to confirm the cancellation.
          </p>
          <div className="flex gap-2">
            <Input
              id={`cancel-code-${reference}`}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit()
              }}
              placeholder="Reservation code"
              autoComplete="off"
              className="flex-1 font-mono uppercase tracking-widest"
            />
            <Button
              size="lg"
              variant="destructive"
              disabled={pending || !code.trim()}
              onClick={submit}
              className="border-2 border-destructive/70 bg-destructive/5 font-semibold hover:bg-destructive/10 sm:px-6"
            >
              {pending && <LoaderCircleIcon className="animate-spin" />}
              {pending ? "Canceling…" : "Confirm"}
            </Button>
          </div>
          <Button
            variant="link"
            size="xs"
            onClick={() => setVerifying(false)}
            className="self-start px-0"
          >
            Back
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          variant="destructive"
          disabled={pending}
          onClick={() => (verifyReference ? setVerifying(true) : submit())}
          className="w-full border-2 border-destructive/70 bg-destructive/5 font-semibold hover:bg-destructive/10 sm:px-6"
        >
          {pending && <LoaderCircleIcon className="animate-spin" />}
          {pending ? "Canceling…" : "Cancel Reservation"}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}