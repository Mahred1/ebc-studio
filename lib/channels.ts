// Read-side of the channel inventory (ChannelInventory table). Server-only:
// imports the Prisma client, and the reserve page (dropdown source) and the
// reserve action (membership check) both read the non-hidden set. Writes
// happen only in the inventory server actions under
// app/admin/(dashboard)/inventory/actions.ts. Channel *name rules* live in
// lib/channel-rules.ts so a client component can reuse them.

import { prisma } from "@/lib/prisma"

/** A channel as the reserve form dropdown needs it. */
export type ChannelOption = { value: string; label: string }

/**
 * The non-hidden channels the reserve dropdown offers, name-sorted. The
 * reserve page is force-dynamic, so a fresh list is read on every request —
 * hiding a channel shows up immediately, no cache to bust.
 */
export async function getVisibleChannelOptions(): Promise<ChannelOption[]> {
  const rows = await prisma.channelInventory.findMany({
    where: { hidden: false },
    orderBy: { name: "asc" },
    select: { name: true },
  })
  return rows.map((row) => ({ value: row.name, label: row.name }))
}

/** The set the reserve action accepts when re-checking a submitted channel. */
export async function getVisibleChannelNames(): Promise<string[]> {
  const rows = await prisma.channelInventory.findMany({
    where: { hidden: false },
    select: { name: true },
  })
  return rows.map((row) => row.name)
}