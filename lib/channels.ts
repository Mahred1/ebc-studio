// Read-side of the channel inventory (ChannelInventory table). Server-only:
// imports the Prisma client, and the reserve page (dropdown source) and the
// reserve action (membership check) both read the non-hidden set. Writes
// happen only in the inventory server actions under
// app/admin/(dashboard)/inventory/actions.ts. Channel *name rules* live in
// lib/channel-rules.ts so a client component can reuse them.

import { cache } from "react"

import { prisma } from "@/lib/prisma"

/** A channel as the reserve form dropdown needs it. */
export type ChannelOption = { value: string; label: string }

/**
 * The non-hidden channels the reserve dropdown offers, name-sorted. Called
 * straight from the reserve page, which is force-dynamic, so a fresh list is
 * read on every request — hiding a channel shows up immediately, no cache to
 * bust. React cache() only joins repeat calls within the one render.
 */
export const getVisibleChannelOptions: () => Promise<ChannelOption[]> = cache(async () => {
  const rows = await prisma.channelInventory.findMany({
    where: { hidden: false },
    orderBy: { name: "asc" },
    select: { name: true },
  })
  return rows.map((row) => ({ value: row.name, label: row.name }))
})

/** The set the reserve action accepts when re-checking a submitted channel. */
export const getVisibleChannelNames: () => Promise<string[]> = cache(async () => {
  const rows = await prisma.channelInventory.findMany({
    where: { hidden: false },
    select: { name: true },
  })
  return rows.map((row) => row.name)
})