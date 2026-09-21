"use client"

import { useState } from "react"

import CancelButton from "@/app/check-reservation/CancelButton"
import ReinstateButton from "@/app/check-reservation/ReinstateButton"
import type { ReservationView } from "@/lib/reservation"

/**
 * Owner of the cancel/reinstate state for one reservation. The buttons read
 * `status`/`reopenable` from server-rendered props, which only change after a
 * router.refresh() round trip — on a slow connection that never lands, so a
 * canceled reservation would keep showing "Cancel Reservation". This holds the
 * latest view in client state instead: the action returns the fresh
 * ReservationView, the buttons hand it back through onChanged, and the pair
 * swaps (Cancel → Reinstate) instantly. router.refresh() still runs after so
 * sibling views (badges, other cards) catch up in the background.
 */
export function ReservationActions({
  reservation,
  secure = false,
}: {
  reservation: ReservationView
  /** Email lookups hide the code and demand it before acting. */
  secure?: boolean
}) {
  const [view, setView] = useState(reservation)

  return (
    <>
      <CancelButton
        reference={view.reference}
        status={view.status}
        verifyReference={secure}
        onChanged={setView}
      />
      <ReinstateButton
        reference={view.reference}
        reopenable={view.reopenable}
        verifyReference={secure}
        onChanged={setView}
      />
    </>
  )
}