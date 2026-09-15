"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteChannel } from "./actions"

/**
 * The trigger opens an in-app confirmation dialog (same <dialog> treatment as
 * the add/edit dialogs) instead of the native browser alert — the action is
 * still a plain form post to a server action, which re-checks the caller is
 * signed in.
 */
export function DeleteChannelButton({
  id,
  name,
}: {
  id: number
  name: string
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

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
          action={deleteChannel}
          // Close as soon as the delete is submitted — the row coming out of
          // the table on the next request means this button (and its dialog)
          // unmounts with it.
          onSubmit={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-col gap-6 p-6">
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
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="lg">
                <Trash2Icon />
                Delete
              </Button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  )
}