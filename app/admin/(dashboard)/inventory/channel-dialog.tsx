"use client"

import * as React from "react"
import { LoaderCircleIcon, PackagePlusIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

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
  successMessage,
}: {
  title: string
  description: string
  submitLabel: string
  name: string
  dialogRef: React.RefObject<HTMLDialogElement | null>
  action: (formData: FormData) => Promise<ChannelActionState>
  successMessage: string
}) {
  const id = React.useId()
  const [value, setValue] = React.useState(name)
  const [state, setState] = React.useState<ChannelActionState>({})
  const [succeeded, setSucceeded] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  // The parent re-opens with the current name in hand; keep this input in sync
  // so a channel renamed elsewhere doesn't leave stale text behind. Adjusted
  // during render, the React-documented replacement for the setState-in-effect
  // pattern — the state only needs to track the prop, not reset off an effect.
  const [prevName, setPrevName] = React.useState(name)
  if (prevName !== name) {
    setPrevName(name)
    setValue(name)
  }

  // Closes after a successful save. This runs as an effect — after React has
  // committed the re-render triggered by the action's revalidatePath() — so
  // the close can't be lost in the race between the action resolving and the
  // page refresh landing. The toast lands here too, once per resolved action.
  // The reset is deferred purely to keep the synchronous setState out of the
  // effect body.
  React.useEffect(() => {
    if (!succeeded) return
    toast.success(successMessage)
    dialogRef.current?.close()
    const reset = setTimeout(() => setSucceeded(false), 0)
    return () => clearTimeout(reset)
  }, [succeeded, dialogRef, successMessage])

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData)
      setState(result)
      if (result.error === undefined) setSucceeded(true)
      else if (result.error) toast.error(result.error)
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
          <h2 className="text-lg font-bold">{title}</h2>
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
        successMessage="Channel added — it's live on the reserve form."
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
        successMessage="Channel updated."
      />
    </>
  )
}