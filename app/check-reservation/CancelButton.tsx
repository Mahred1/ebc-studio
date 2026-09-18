"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cancelReservationAction } from "./actions"

export default function CancelButton({
  reference,
  status,
}: {
  reference: string
  status: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (status !== "pending" && status !== "confirmed") return null

  function handle() {
    setError(null)
    startTransition(async () => {
      const res = await cancelReservationAction(reference)
      if (res.ok) {
        router.refresh()
        return
      }
      setError(res.error ?? "Failed to cancel reservation.")
    })
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-5">
      <Button
        size="lg"
        variant="destructive"
        disabled={pending}
        onClick={handle}
        className="w-full border-2 border-destructive/70 bg-destructive/5 font-semibold hover:bg-destructive/10 sm:px-6"
      >
        {pending && <LoaderCircleIcon className="animate-spin" />}
        {pending ? "Canceling…" : "Cancel Reservation"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}