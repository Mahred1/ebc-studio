"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, LoaderCircleIcon } from "lucide-react"

import { ReservationDetails } from "@/components/reservation-details"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CURRENCY,
  EMPTY_RESERVATION,
  GOAL_MAX,
  PHONE_PREFIX,
  RESERVATION_FIELDS,
  formatPhoneInput,
  reservationHref,
  validateField,
  validateReservation,
  type ReservationDraft,
  type ReservationErrors,
  type ReservationView,
} from "@/lib/reservation"
import type { ChannelOption } from "@/lib/channels"
import { createReservation } from "@/app/reserve/actions"

type Touched = Partial<Record<keyof ReservationDraft, boolean>>

export function ReservationForm({ channels }: { channels: ChannelOption[] }) {
  const id = React.useId()
  const [draft, setDraft] = React.useState<ReservationDraft>(EMPTY_RESERVATION)
  const [errors, setErrors] = React.useState<ReservationErrors>({})
  const [touched, setTouched] = React.useState<Touched>({})
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitted, setSubmitted] = React.useState<ReservationView | null>(null)

  const fieldRefs = React.useRef<
    Partial<Record<keyof ReservationDraft, HTMLElement | null>>
  >({})

  // The latest draft, read by blur validation. The Select's close event — which
  // is this form's blur for the channel field — fires in the same event batch
  // as the selection, so `handleBlur` would otherwise validate the *old* draft
  // (channel still "") and wrongly flag it. setField mirrors synchronously so
  // the blur always sees the value just picked; the effect keeps it in sync
  // with any direct setDraft (the reset).
  const draftRef = React.useRef(draft)
  React.useEffect(() => {
    draftRef.current = draft
  }, [draft])

  // Re-validate as the user types, but only once they've left the field — so the
  // first keystroke in an empty field doesn't immediately read as an error.
  function setField<K extends keyof ReservationDraft>(
    field: K,
    value: ReservationDraft[K]
  ) {
    draftRef.current = { ...draftRef.current, [field]: value }
    setDraft((prev) => {
      const next = { ...prev, [field]: value }
      if (touched[field]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: validateField(field, next),
        }))
      }
      return next
    })
  }

  function handleBlur(field: keyof ReservationDraft) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, draftRef.current),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateReservation(draft)
    setErrors(nextErrors)
    setFormError(undefined)
    setTouched(Object.fromEntries(RESERVATION_FIELDS.map((f) => [f, true])))

    const firstInvalid = RESERVATION_FIELDS.find((f) => nextErrors[f])
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }

    setPending(true)
    try {
      const result = await createReservation(draft)

      if (result.ok) {
        setSubmitted(result.reservation)
        return
      }

      // The server re-validates before writing, so it can reject a draft this
      // form thought was clean. Show whatever it sends back.
      setErrors(result.errors)
      setFormError(result.message)

      const firstRejected = RESERVATION_FIELDS.find((f) => result.errors[f])
      if (firstRejected) fieldRefs.current[firstRejected]?.focus()
    } catch {
      // The action never made it there and back (offline, server down).
      setFormError("Something went wrong. Check your connection and try again.")
    } finally {
      setPending(false)
    }
  }

  function reset() {
    setSubmitted(null)
    setDraft(EMPTY_RESERVATION)
    setErrors({})
    setTouched({})
    setFormError(undefined)
  }

  if (submitted) {
    return <Confirmation reservation={submitted} onReset={reset} />
  }

  const goalLength = draft.goal.trim().length

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor={`${id}-fullName`}>Full name</FieldLabel>
          <Input
            id={`${id}-fullName`}
            ref={(el) => {
              fieldRefs.current.fullName = el
            }}
            name="fullName"
            autoComplete="name"
            placeholder="Abebe Bekele"
            value={draft.fullName}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? `${id}-fullName-error` : undefined}
            onChange={(e) => setField("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
          />
          <FieldError id={`${id}-fullName-error`}>{errors.fullName}</FieldError>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            ref={(el) => {
              fieldRefs.current.email = el
            }}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={draft.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
          />
          <FieldDescription>
            We&apos;ll send your reservation reference here.
          </FieldDescription>
          <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor={`${id}-phone`}>Phone number</FieldLabel>
          {/* +251 is fixed: the input holds only the 9 local digits, grouped
              "9XX XXX XXX" as they're typed. */}
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>{PHONE_PREFIX}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`${id}-phone`}
              ref={(el) => {
                fieldRefs.current.phone = el
              }}
              name="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9XX XXX XXX"
              value={draft.phone}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
              onChange={(e) => setField("phone", formatPhoneInput(e.target.value))}
              onBlur={() => handleBlur("phone")}
            />
          </InputGroup>
          <FieldDescription>
            We&apos;ll use this to reach you about your reservation.
          </FieldDescription>
          <FieldError id={`${id}-phone-error`}>{errors.phone}</FieldError>
        </Field>

        <Field data-invalid={!!errors.channel}>
          <FieldLabel htmlFor={`${id}-channel`}>Channel</FieldLabel>
          {/* items are the inventory channels the page fetched; membership is
              re-checked server-side because this snapshot can go stale. */}
          <Select
            items={channels}
            name="channel"
            value={draft.channel || null}
            onValueChange={(value) => setField("channel", value ?? "")}
            onOpenChange={(open) => {
              if (!open) handleBlur("channel")
            }}
          >
            <SelectTrigger
              id={`${id}-channel`}
              ref={(el) => {
                fieldRefs.current.channel = el
              }}
              className="w-full"
              aria-invalid={!!errors.channel}
              aria-describedby={errors.channel ? `${id}-channel-error` : undefined}
            >
              <SelectValue placeholder="Select a channel" />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id={`${id}-channel-error`}>{errors.channel}</FieldError>
        </Field>

        <Field data-invalid={!!errors.goal}>
          <FieldLabel htmlFor={`${id}-goal`}>Goal of the recording</FieldLabel>
          <Textarea
            id={`${id}-goal`}
            ref={(el) => {
              fieldRefs.current.goal = el
            }}
            name="goal"
            rows={4}
            maxLength={GOAL_MAX}
            placeholder="What are you recording, and what should it achieve?"
            value={draft.goal}
            aria-invalid={!!errors.goal}
            aria-describedby={errors.goal ? `${id}-goal-error` : undefined}
            onChange={(e) => setField("goal", e.target.value)}
            onBlur={() => handleBlur("goal")}
          />
          <FieldDescription>
            {goalLength}/{GOAL_MAX} characters
          </FieldDescription>
          <FieldError id={`${id}-goal-error`}>{errors.goal}</FieldError>
        </Field>

        <Field data-invalid={!!errors.location}>
          <FieldLabel htmlFor={`${id}-location`}>Location</FieldLabel>
          <Input
            id={`${id}-location`}
            ref={(el) => {
              fieldRefs.current.location = el
            }}
            name="location"
            placeholder="Studio 3, EBC Headquarters, Addis Ababa"
            value={draft.location}
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? `${id}-location-error` : undefined}
            onChange={(e) => setField("location", e.target.value)}
            onBlur={() => handleBlur("location")}
          />
          <FieldError id={`${id}-location-error`}>{errors.location}</FieldError>
        </Field>

        <Field data-invalid={!!errors.bid}>
          <FieldLabel htmlFor={`${id}-bid`}>Your bid</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>{CURRENCY.symbol}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`${id}-bid`}
              ref={(el) => {
                fieldRefs.current.bid = el
              }}
              name="bid"
              inputMode="decimal"
              placeholder="0.00"
              value={draft.bid}
              aria-invalid={!!errors.bid}
              aria-describedby={errors.bid ? `${id}-bid-error` : undefined}
              onChange={(e) => setField("bid", e.target.value)}
              onBlur={() => handleBlur("bid")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>{CURRENCY.code}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            The total amount you plan to spend on this spot.
          </FieldDescription>
          <FieldError id={`${id}-bid-error`}>{errors.bid}</FieldError>
        </Field>

        {formError ? (
          <p
            role="alert"
            className="animate-fade-in rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <LoaderCircleIcon className="animate-spin" />}
          {pending ? "Reserving…" : "Reserve Spot"}
        </Button>
      </FieldGroup>
    </form>
  )
}

function Confirmation({
  reservation,
  onReset,
}: {
  reservation: ReservationView
  onReset: () => void
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <CircleCheckIcon className="size-8 text-primary" />
        <h2 className="text-xl font-semibold">Spot reserved</h2>
        <p className="text-sm text-muted-foreground">
          Keep your reference — you&apos;ll need it to check the reservation.
        </p>
      </div>

      <ReservationDetails reservation={reservation} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          render={<Link href={reservationHref(reservation.reference)} />}
          size="lg"
          className="sm:flex-1"
        >
          Check status
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="sm:flex-1"
        >
          Reserve another spot
        </Button>
      </div>
    </div>
  )
}
