"use client"

import { useState } from "react"
import { ChevronDownIcon, LockKeyholeIcon } from "lucide-react"
import { cn } from "cn"

import CancelButton from "../CancelButton"
import ReinstateButton from "../ReinstateButton"
import { CopyCodeButton } from "@/components/copy-code-button"
import {
  ReservationRows,
  formatReservationDate,
} from "@/components/reservation-details"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import {
  RESERVATION_STATUSES,
  maskReference,
  type ReservationStatus,
} from "@/lib/reservation"
import type { ReservationView } from "@/lib/reservation"

export type ReservationSection = {
  status: ReservationStatus
  items: ReservationView[]
}

/**
 * Accordion cards for the results list. A single `openRef` keeps the group
 * exclusive — opening one closes the rest — mirroring the shared-name behavior
 * of the native <details> it replaces. State drives the classes, so the grid
 * is always rendered and the collapse can actually transition (a closed native
 * <details> hides its content before any transition can play).
 */
export function ReservationAccordion({
  sections,
  secure = false,
}: {
  sections: ReservationSection[]
  /** Email lookups hide the code and demand it before acting. */
  secure?: boolean
}) {
  const [openRef, setOpenRef] = useState<string | null>(
    sections[0]?.items[0]?.reference ?? null
  )

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section key={section.status} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2">
            <ReservationStatusBadge status={section.status} />
            <span className="text-sm text-muted-foreground">
              {section.items.length}{" "}
              {section.items.length === 1 ? "reservation" : "reservations"}
            </span>
          </h2>

          {section.items.map((reservation) => {
            const open = openRef === reservation.reference
            const contentId = `reservation-content-${reservation.reference}`
            return (
              <div
                key={reservation.reference}
                className="w-full rounded-xl border bg-card shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl p-6 sm:p-8">
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-lg tracking-widest">
                      {secure
                        ? maskReference(reservation.reference)
                        : reservation.reference}
                    </p>
                    {!secure && (
                      <CopyCodeButton value={reservation.reference} />
                    )}
                  </div>
                  <button
                    type="button"
                    id={`reservation-toggle-${reservation.reference}`}
                    aria-expanded={open}
                    aria-controls={contentId}
                    onClick={() => setOpenRef(open ? null : reservation.reference)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="truncate text-sm text-muted-foreground">
                      {reservation.channel} ·{" "}
                      {formatReservationDate(reservation.createdAt)}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <ReservationStatusBadge status={reservation.status} />
                      <ChevronDownIcon
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--ease-out)]",
                          open && "rotate-180"
                        )}
                      />
                    </span>
                  </button>
                </div>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={`reservation-toggle-${reservation.reference}`}
                  inert={!open}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)]",
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="min-h-0 overflow-hidden px-6 pb-6 sm:px-8 sm:pb-8">
                    <p className="flex items-center gap-1.5 pt-6 text-xs text-amber-700 dark:text-amber-500">
                      <LockKeyholeIcon className="size-3 shrink-0" />
                      {secure
                        ? "Your reservation code is hidden here — you'll need it to cancel or reinstate."
                        : "Keep this code secret — anyone with it can view or change your reservation."}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {RESERVATION_STATUSES[reservation.status].detail}
                    </p>
                    <ReservationRows reservation={reservation} />
                    <CancelButton
                      reference={reservation.reference}
                      status={reservation.status}
                      verifyReference={secure}
                    />
                    <ReinstateButton
                      reference={reservation.reference}
                      reopenable={reservation.reopenable}
                      verifyReference={secure}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}