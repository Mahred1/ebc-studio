"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { validatePassword, validateUsername } from "@/lib/credentials"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"

const SETTINGS_PATH = "/admin/settings"
const RESERVE_PATH = "/reserve"

/** Postgres unique-violation, surfaced by Prisma. Checked structurally so this file needn't import Prisma's error classes. */
function isUsernameTaken(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

export type CreateAdminState = {
  error?: string
  /** Echoed back only on success — the one moment the password exists in readable form. */
  created?: { username: string; password: string }
}

/**
 * Any signed-in admin may add another. The password is hashed here and never
 * stored in readable form, so the returned copy is the only chance to hand it
 * over — the dialog keeps it on screen until it's explicitly dismissed.
 */
export async function createAdmin(
  formData: FormData
): Promise<CreateAdminState> {
  await requireAdmin()

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")

  const error = validateUsername(username) ?? validatePassword(password)
  if (error) return { error }

  try {
    await prisma.admin.create({
      data: { username, passwordHash: await hashPassword(password) },
    })
  } catch (cause) {
    if (isUsernameTaken(cause)) {
      return { error: `"${username}" is taken — pick another username.` }
    }
    console.error("admin create failed", cause)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath(SETTINGS_PATH)
  return { created: { username, password } }
}

/**
 * Deleting is the primary admin's alone. The UI hides the button from everyone
 * else, but a server action is a public endpoint — the check that matters is
 * this one, and it reads isPrimary from the database rather than the form.
 */
export async function deleteAdmin(formData: FormData): Promise<{ ok: boolean }> {
  const viewer = await requireAdmin()

  const id = Number(formData.get("id"))
  if (!viewer.isPrimary || !Number.isSafeInteger(id)) return { ok: false }

  // Refusing self-deletion keeps at least one account that can delete admins;
  // the primary flag is never reassigned, so losing it would be permanent.
  if (id === viewer.id) return { ok: false }

  // deleteMany, not delete: a row already removed in another tab is a no-op
  // here rather than an unhandled error.
  const { count } = await prisma.admin.deleteMany({ where: { id } })
  if (count > 0) revalidatePath(SETTINGS_PATH)
  return { ok: count > 0 }
}

/**
 * Flips the site-wide reservations pause. Any admin can do it; the reserve
 * page and the create action both re-read the flag from the database rather
 * than trusting this call, so the toggle takes effect on the next request.
 */
export async function setReservationsPaused(paused: boolean): Promise<{ ok: boolean }> {
  await requireAdmin()

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { reservationsPaused: paused },
    create: { reservationsPaused: paused },
  })

  revalidatePath(SETTINGS_PATH)
  // The reserve page renders on the flag; without this it would serve stale
  // output until some unrelated revalidation came along.
  revalidatePath(RESERVE_PATH)
  return { ok: true }
}
