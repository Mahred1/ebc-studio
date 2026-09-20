"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { deleteChannel } from "./actions"

/**
 * The trigger opens an in-app confirmation dialog (same <dialog> treatment as
 * the add/edit dialogs) instead of the native browser alert; the delete waits
 * for the action's answer so the row and the dialog close in step with it. The
 * server re-checks the caller is signed in.
 */
export function DeleteChannelButton({
  id,
  name,
}: {
  id: number
  name: string
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = React.useTransition()

  function deleteIt() {
    const formData = new FormData()
    formData.set("id", String(id))
    startTransition(async () => {
      try {
        const { ok } = await deleteChannel(formData)
        if (ok) toast.success(`Deleted ${name}.`)
        else toast.info(`Nothing to delete — ${name} was already removed.`)
        dialogRef.current?.close()
      } catch {
        toast.error("That didn't go through. Please try again.")
        dialogRef.current?.close()
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        aria-label={`Delete ${name}`}
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2Icon />
        Delete
      </Button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/50"
      >
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-6 p-6"
        >
          <input type="hidden" name="id" value={id} />
          <header className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold">Delete channel</h2>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-medium text-foreground">{name}</span>?
              It&apos;ll leave the reserve form and the inventory for good. Hide it
              instead if you might want it back.
            </p>
          </header>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={pending}
              onClick={deleteIt}
            >
              <Trash2Icon />
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}