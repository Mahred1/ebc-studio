"use client"

import * as React from "react"
import {
  CheckIcon,
  CopyIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  UserPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
  generatePassword,
  generateUsername,
} from "@/lib/credentials"
import { createAdmin, type CreateAdminState } from "./actions"

function CopyButton({
  value,
  label,
  variant = "outline",
}: {
  value: string
  label: string
  variant?: "outline" | "secondary"
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      aria-label={`Copy ${label}`}
      // navigator.clipboard needs a secure context. If it isn't there the
      // button does nothing visible and the read-only field below is still
      // selectable, so the credentials are never actually stuck on screen.
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          () => {}
        )
      }
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 font-mono text-sm"
        />
        <CopyButton value={value} label={label.toLowerCase()} />
      </div>
    </div>
  )
}

export function AddAdminDialog() {
  const id = React.useId()
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [state, setState] = React.useState<CreateAdminState>({})
  const [pending, startTransition] = React.useTransition()

  const created = state.created

  function open() {
    setUsername("")
    setPassword("")
    setState({})
    dialogRef.current?.showModal()
  }

  function submit(formData: FormData) {
    startTransition(async () => setState(await createAdmin(formData)))
  }

  return (
    <>
      <Button size="lg" onClick={open}>
        <UserPlusIcon />
        Add admin
      </Button>

      <dialog
        ref={dialogRef}
        // Esc is refused while the credentials are up: the password only exists
        // in this dialog — the database has the scrypt digest and nothing else —
        // so leaving the screen has to be a deliberate click.
        onCancel={(event) => {
          if (created) event.preventDefault()
        }}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/50"
      >
        {created ? (
          <div className="flex flex-col gap-6 p-6">
            <header className="flex flex-col gap-1.5">
              <h2 className="text-lg font-black">Admin created</h2>
              <p className="text-sm text-muted-foreground">
                Hand these over now. The password is stored hashed, so this is
                the last time it can be read.
              </p>
            </header>

            <div className="flex flex-col gap-4 rounded-lg border bg-secondary/40 p-4">
              <CredentialRow label="Username" value={created.username} />
              <CredentialRow label="Password" value={created.password} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <CopyButton
                variant="secondary"
                label="both credentials"
                value={`Username: ${created.username}\nPassword: ${created.password}`}
              />
              <Button size="lg" onClick={() => dialogRef.current?.close()}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form action={submit} className="flex flex-col gap-6 p-6">
            <header className="flex flex-col gap-1.5">
              <h2 className="text-lg font-black">Add an admin</h2>
              <p className="text-sm text-muted-foreground">
                Pick their credentials, or generate a pair to read out.
              </p>
            </header>

            <FieldGroup>
              <Field data-invalid={!!state.error}>
                <FieldLabel htmlFor={`${id}-username`}>Username</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={`${id}-username`}
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    minLength={USERNAME_MIN}
                    maxLength={USERNAME_MAX}
                    required
                    autoFocus
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => setUsername(generateUsername())}
                    >
                      <RefreshCwIcon />
                      Generate
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field data-invalid={!!state.error}>
                <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={`${id}-password`}
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    minLength={PASSWORD_MIN}
                    maxLength={PASSWORD_MAX}
                    required
                    className="font-mono"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => setPassword(generatePassword())}
                    >
                      <RefreshCwIcon />
                      Generate
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  At least {PASSWORD_MIN} characters. Shown in the clear because
                  you have to pass it on.
                </FieldDescription>
              </Field>

              {state.error ? (
                <FieldError role="alert">{state.error}</FieldError>
              ) : null}
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
                {pending ? "Creating…" : "Create admin"}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
