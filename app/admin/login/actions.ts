"use server"

import { redirect } from "next/navigation"

import { endSession, safeNext, startSession } from "@/lib/auth"
import { verifyPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { LOGIN_PATH } from "@/lib/session"

export type LoginState = { error?: string }

// A well-formed digest that no password matches. When the username is unknown
// we verify against this anyway, so a bad username costs the same time as a bad
// password and the response can't be used to enumerate accounts.
const NO_SUCH_ADMIN = `${"0".repeat(32)}:${"0".repeat(128)}`

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  // An unchecked checkbox isn't submitted at all, so presence is the answer.
  const remember = formData.get("remember") !== null

  if (!username || !password) {
    return { error: "Enter your username and password." }
  }

  let admin
  try {
    admin = await prisma.admin.findUnique({ where: { username } })
  } catch (error) {
    console.error("admin login lookup failed", error)
    return { error: "Something went wrong. Please try again." }
  }

  const correct = await verifyPassword(password, admin?.passwordHash ?? NO_SUCH_ADMIN)

  // One message for both cases — which half was wrong is not the visitor's business.
  if (!admin || !correct) {
    return { error: "Incorrect username or password." }
  }

  await startSession(admin.id, remember)

  // Outside the try/catch above on purpose: redirect() works by throwing.
  redirect(safeNext(String(formData.get("next") ?? "")))
}

export async function logout() {
  await endSession()
  redirect(LOGIN_PATH)
}
