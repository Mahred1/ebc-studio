// Server-side half of admin auth: reads the session cookie, resolves it to a
// row in the Admin table, and gates pages. Imports Prisma and next/headers, so
// it is server-only — middleware uses lib/session.ts instead.

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import {
  LOGIN_PATH,
  REMEMBER_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
} from "@/lib/session"

export type Admin = { id: number; username: string }

/**
 * Where to send someone after login. Only paths inside /admin are honoured, so
 * a crafted `?next=` can't turn the login page into an open redirect.
 */
export function safeNext(next: string | undefined): string {
  return next === "/admin" || next?.startsWith("/admin/") ? next : "/admin"
}

export async function startSession(adminId: number, remember: boolean) {
  const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE
  const store = await cookies()

  store.set(SESSION_COOKIE, await signSession(adminId, maxAge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Without "remember me" the cookie is left as a session cookie — it goes
    // away when the browser closes. The signed expiry bounds it either way.
    ...(remember ? { maxAge } : {}),
  })
}

export async function endSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/**
 * The signed-in admin, or null. The row is re-read on every call rather than
 * trusted from the cookie, so deleting an account revokes access immediately.
 */
export async function getAdmin(): Promise<Admin | null> {
  const store = await cookies()
  const adminId = await verifySession(store.get(SESSION_COOKIE)?.value)
  if (adminId === null) return null

  return prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, username: true },
  })
}

/**
 * The gate for everything under /admin. Middleware already redirects
 * unauthenticated requests, but this is the check that actually guards the
 * data: middleware is a routing-layer convenience and has been bypassable
 * before (CVE-2025-29927), so the page itself has to ask too.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin()
  if (!admin) redirect(LOGIN_PATH)
  return admin
}
