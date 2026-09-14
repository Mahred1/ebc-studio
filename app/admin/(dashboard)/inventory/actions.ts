"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import {
  isChannelNameTaken,
  validateChannelName,
} from "@/lib/channel-rules"
import { prisma } from "@/lib/prisma"

const INVENTORY_PATH = "/admin/inventory"

export type ChannelActionState = { error?: string }

/**
 * Adds a channel to the inventory. Any signed-in admin may. `addedBy` records
 * the acting admin's username as a snapshot — the reserve dropdown is the
 * non-hidden set, so a new channel shows up there on the next request.
 */
export async function createChannel(
  formData: FormData
): Promise<ChannelActionState> {
  const viewer = await requireAdmin()

  const name = String(formData.get("name") ?? "").trim()
  const error = validateChannelName(name)
  if (error) return { error }

  try {
    await prisma.channelInventory.create({
      data: { name, addedBy: viewer.username },
    })
  } catch (cause) {
    if (isChannelNameTaken(cause)) {
      return { error: `"${name}" is already in the inventory.` }
    }
    console.error("channel create failed", cause)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath(INVENTORY_PATH)
  return {}
}

/** Renames a channel. Past reservations keep the old name; the dropdown shows the new one. */
export async function updateChannel(
  formData: FormData
): Promise<ChannelActionState> {
  await requireAdmin()

  const id = Number(formData.get("id"))
  const name = String(formData.get("name") ?? "").trim()
  if (!Number.isSafeInteger(id)) return { error: "Something went wrong." }

  const error = validateChannelName(name)
  if (error) return { error }

  try {
    // updateMany, not update: a row already changed in another tab is a no-op.
    await prisma.channelInventory.updateMany({
      where: { id },
      data: { name },
    })
  } catch (cause) {
    if (isChannelNameTaken(cause)) {
      return { error: `"${name}" is already in the inventory.` }
    }
    console.error("channel update failed", cause)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath(INVENTORY_PATH)
  return {}
}

/**
 * Hides or shows a channel on the reserve form. Hiding is the soft path — past
 * reservations referencing it keep rendering — as opposed to delete. The
 * button sends the current state and the action writes the opposite, mirroring
 * setReservationsPaused; the page re-reads the flag on the next request.
 */
export async function toggleChannelHidden(
  formData: FormData
): Promise<void> {
  await requireAdmin()

  const id = Number(formData.get("id"))
  const hidden = formData.get("hidden") === "true"
  if (!Number.isSafeInteger(id)) return

  await prisma.channelInventory.updateMany({
    where: { id },
    data: { hidden: !hidden },
  })
  revalidatePath(INVENTORY_PATH)
}

/**
 * Removes a channel entirely. Reservations already booked against it keep
 * their stored name, but the channel leaves the reserve dropdown (and the
 * admin list) for good. Deleting is the hard path — hiding is the reversible
 * alternative, which is what the UI nudges toward.
 */
export async function deleteChannel(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = Number(formData.get("id"))
  if (!Number.isSafeInteger(id)) return

  await prisma.channelInventory.deleteMany({ where: { id } })
  revalidatePath(INVENTORY_PATH)
}