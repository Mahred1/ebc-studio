"use client"

import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteChannel } from "./actions"

/**
 * Client-side only for the confirm() — the delete itself is a plain form post
 * to a server action, which re-checks that the caller is signed in.
 */
export function DeleteChannelButton({
  id,
  name,
}: {
  id: number
  name: string
}) {
  return (
    <form
      action={deleteChannel}
      onSubmit={(event) => {
        const ok = confirm(
          `Delete "${name}"? It'll leave the reserve form and the inventory for good. ` +
            `Hide it instead if you might want it back.`
        )
        if (!ok) event.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        aria-label={`Delete ${name}`}
      >
        <Trash2Icon />
        Delete
      </Button>
    </form>
  )
}