"use client"

import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteAdmin } from "./actions"

/**
 * Client-side only for the confirm() — the delete itself is a plain form post
 * to a server action, which re-checks that the caller is the primary admin.
 */
export function DeleteAdminButton({
  id,
  username,
}: {
  id: number
  username: string
}) {
  return (
    <form
      action={deleteAdmin}
      onSubmit={(event) => {
        const ok = confirm(
          `Delete "${username}"? They lose access on their next request and the account can't be restored.`
        )
        if (!ok) event.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete ${username}`}
      >
        <Trash2Icon />
        Delete
      </Button>
    </form>
  )
}
