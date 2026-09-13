"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login, type LoginState } from "./actions"

export function AdminLoginForm({ next }: { next: string }) {
  const id = React.useId()
  const [state, formAction, pending] = React.useActionState<LoginState, FormData>(
    login,
    {}
  )

  return (
    <form
      action={formAction}
      className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" name="next" value={next} />

      <FieldGroup>
        <Field data-invalid={!!state.error}>
          <FieldLabel htmlFor={`${id}-username`}>Username</FieldLabel>
          <Input
            id={`${id}-username`}
            name="username"
            autoComplete="username"
            autoFocus
            required
            aria-invalid={!!state.error}
          />
        </Field>

        <Field data-invalid={!!state.error}>
          <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
          <Input
            id={`${id}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.error}
            aria-describedby={state.error ? `${id}-error` : undefined}
          />
        </Field>

        <Field orientation="horizontal" className="items-center gap-2">
          {/* Native checkbox: form semantics and keyboard support for free, and
              `accent-color` is all the styling it needs. */}
          <input
            id={`${id}-remember`}
            name="remember"
            type="checkbox"
            className="size-4 shrink-0 accent-primary"
          />
          <FieldLabel htmlFor={`${id}-remember`} className="font-normal">
            Keep me signed in for 30 days
          </FieldLabel>
        </Field>

        {state.error ? (
          <FieldError id={`${id}-error`} role="alert">
            {state.error}
          </FieldError>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <LoaderCircleIcon className="animate-spin" />}
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  )
}
