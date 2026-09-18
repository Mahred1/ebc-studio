"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reinstateReservationAction } from "./actions"

export default function ReinstateButton({
  reference,
  reopenable,
}: {
  reference: string
  reopenable: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Only a cancellation the booker made themselves can be reopened — the server
  // computes `reopenable` and admin-canceled rows never reach the button.
  if (!reopenable) return null

  function handle() {
    setError(null)
    startTransition(async () => {
      const res = await reinstateReservationAction(reference)
      if (res.ok) {
        router.refresh()
        return
      }
      setError(res.error ?? "Failed to reinstate reservation.")
    })
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-5">
      <Button
        size="lg"
        variant="outline"
        disabled={pending}
        onClick={handle}
        className="w-full border-2 bg-muted/40 font-semibold hover:bg-muted/60 sm:px-6"
      >
        {pending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <RotateCcwIcon />
        )}
        {pending ? "Reinstating…" : "Reinstate Reservation"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}