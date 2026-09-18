"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  lookupKind,
  reservationHref,
  reservationsByEmailHref,
  validateLookup,
} from "@/lib/reservation"

export function CheckReservationForm() {
  const id = React.useId()
  const router = useRouter()

  const [query, setQuery] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()
  const [touched, setTouched] = React.useState(false)
  // The destination page queries the database while it renders, so navigation
  // takes as long as that query. A transition keeps the button in its pending
  // state for exactly that long, and resets it on its own when the route lands.
  const [pending, startTransition] = React.useTransition()

  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const message = validateLookup(query)
    setTouched(true)
    setError(message)
    if (message) {
      inputRef.current?.focus()
      return
    }

    // Whether the reservation exists is decided by the destination page, which
    // reads the database. This form only picks which page to send you to.
    const href =
      lookupKind(query) === "email"
        ? reservationsByEmailHref(query)
        : reservationHref(query)

    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`${id}-query`}>Reservation ID or email</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={`${id}-query`}
            ref={inputRef}
            name="query"
            placeholder="RES-10001"
            value={query}
            autoComplete="off"
            className="h-9 sm:flex-1"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-query-error` : undefined}
            onChange={(e) => {
              setQuery(e.target.value)
              if (touched) setError(validateLookup(e.target.value))
            }}
            onBlur={() => {
              setTouched(true)
              setError(validateLookup(query))
            }}
          />
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="sm:w-auto sm:px-6"
          >
            {pending && <LoaderCircleIcon className="animate-spin" />}
            {pending ? "Checking…" : "Check status"}
          </Button>
        </div>
        <FieldDescription>
          A reference shows that one reservation. You can also use an email.
        </FieldDescription>
        <FieldError id={`${id}-query-error`}>{error}</FieldError>
      </Field>
    </form>
  )
}
