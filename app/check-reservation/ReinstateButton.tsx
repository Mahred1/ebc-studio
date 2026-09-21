"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ReservationView } from "@/lib/reservation"

import { reinstateReservationAction } from "./actions"

export default function ReinstateButton({
  reference,
  reopenable,
  verifyReference = false,
  onChanged,
}: {
  reference: string
  reopenable: boolean
  verifyReference?: boolean
  /** Called with the fresh reservation once the reinstate lands, so the UI can
   *  swap to the cancel state without waiting on a router.refresh(). */
  onChanged?: (reservation: ReservationView) => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState("")

  // Only a cancellation the booker made themselves can be reopened — the server
  // computes `reopenable` and admin-canceled rows never reach the button.
  if (!reopenable) return null

  function submit() {
    setError(null)
    // Email lookups never show the reference, so reinstating from one demands
    // the code itself — it's the ownership proof behind the reinstate action.
    if (
      verifyReference &&
      code.trim().toUpperCase() !== reference.toUpperCase()
    ) {
      setError("That code doesn't match this reservation.")
      return
    }
    startTransition(async () => {
      try {
        const res = await reinstateReservationAction(reference)
        if (res.ok) {
          toast.success("Reservation reinstated.")
          onChanged?.(res.reservation)
          router.refresh()
          return
        }
        toast.error(res.error ?? "Failed to reinstate reservation.")
      } catch {
        toast.error("Failed to reinstate reservation.")
      }
    })
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-5">
      {verifyReference && verifying ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Enter this reservation&apos;s code to reinstate it.
          </p>
          <div className="flex gap-2">
            <Input
              id={`reinstate-code-${reference}`}
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
              variant="outline"
              disabled={pending || !code.trim()}
              onClick={submit}
              className="border-2 bg-muted/40 font-semibold hover:bg-muted/60 sm:px-6"
            >
              {pending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <RotateCcwIcon />
              )}
              {pending ? "Reinstating…" : "Confirm"}
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
          variant="outline"
          disabled={pending}
          onClick={() => (verifyReference ? setVerifying(true) : submit())}
          className="w-full border-2 bg-muted/40 font-semibold hover:bg-muted/60 sm:px-6"
        >
          {pending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <RotateCcwIcon />
          )}
          {pending ? "Reinstating…" : "Reinstate Reservation"}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}