"use client"

import * as React from "react"
import { LoaderCircleIcon, PackagePlusIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CHANNEL_NAME_MAX } from "@/lib/channel-rules"
import { createChannel, updateChannel, type ChannelActionState } from "./actions"

/**
 * The shared add/edit form inside a <dialog>. The trigger lives in the
 * components that wrap it (AddChannelDialog / EditChannelDialog), which own
 * the ref and control when it opens.
 */
function ChannelFormDialog({
  title,
  description,
  submitLabel,
  name,
  dialogRef,
  action,
}: {
  title: string
  description: string
  submitLabel: string
  name: string
  dialogRef: React.RefObject<HTMLDialogElement | null>
  action: (formData: FormData) => Promise<ChannelActionState>
}) {
  const id = React.useId()
  const [value, setValue] = React.useState(name)
  const [state, setState] = React.useState<ChannelActionState>({})
  const [succeeded, setSucceeded] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  // The parent re-opens with the current name in hand; keep this input in sync
  // so a channel renamed elsewhere doesn't leave stale text behind.
  React.useEffect(() => setValue(name), [name])

  // Closes after a successful save. This runs as an effect — after React has
  // committed the re-render triggered by the action's revalidatePath() — so
  // the close can't be lost in the race between the action resolving and the
  // page refresh landing.
  React.useEffect(() => {
    if (!succeeded) return
    dialogRef.current?.close()
    setSucceeded(false)
  }, [succeeded, dialogRef])

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData)
      setState(result)
      if (result.error === undefined) setSucceeded(true)
    })
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        if (pending) e.preventDefault()
      }}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/50"
    >
      <form action={submit} className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </header>

        <FieldGroup>
          <Field data-invalid={!!state.error}>
            <FieldLabel htmlFor={`${id}-name`}>Channel name</FieldLabel>
            <Input
              id={`${id}-name`}
              name="name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={CHANNEL_NAME_MAX}
              required
              autoFocus
              placeholder="e.g. TV4"
            />
            {state.error ? (
              <FieldError role="alert">{state.error}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <LoaderCircleIcon className="animate-spin" />}
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  )
}

/** The header button — opens a dialog that adds a channel to the inventory. */
export function AddChannelDialog() {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button size="lg" onClick={() => dialogRef.current?.showModal()}>
        <PackagePlusIcon />
        Add channel
      </Button>
      <ChannelFormDialog
        title="Add a channel"
        description="It'll be offered on the reserve form as soon as it's saved."
        submitLabel="Add channel"
        name=""
        dialogRef={dialogRef}
        action={createChannel}
      />
    </>
  )
}

/** The per-row edit button — opens a dialog prefilled with the channel's name. */
export function EditChannelDialog({
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
        variant="outline"
        size="sm"
        aria-label={`Edit ${name}`}
        onClick={() => dialogRef.current?.showModal()}
      >
        <PencilIcon />
        Edit
      </Button>
      <ChannelFormDialog
        title="Edit channel"
        description="Past reservations keep the old name; the form will offer the new one."
        submitLabel="Save changes"
        name={name}
        dialogRef={dialogRef}
        action={(formData) => {
          formData.append("id", String(id))
          return updateChannel(formData)
        }}
      />
    </>
  )
}