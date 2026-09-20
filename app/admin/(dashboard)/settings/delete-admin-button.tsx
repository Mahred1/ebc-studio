"use client"

import { useTransition } from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { deleteAdmin } from "./actions"

/**
 * Client-side only for the confirm() — the delete waits for the action's
 * answer so the toast reflects whether it actually removed someone.
 */
export function DeleteAdminButton({
  id,
  username,
}: {
  id: number
  username: string
}) {
  const [pending, startTransition] = useTransition()

  function deleteIt() {
    const formData = new FormData()
    formData.set("id", String(id))
    startTransition(async () => {
      try {
        const { ok } = await deleteAdmin(formData)
        if (ok) toast.success(`Deleted ${username}.`)
        else toast.info(`${username} was already removed.`)
      } catch {
        toast.error("That didn't go through. Please try again.")
      }
    })
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      aria-label={`Delete ${username}`}
      onClick={() => {
        const ok = confirm(
          `Delete "${username}"? They lose access on their next request and the account can't be restored.`
        )
        if (!ok) return
        deleteIt()
      }}
    >
      <Trash2Icon />
      {pending ? "Deleting…" : "Delete"}
    </Button>
  )
}