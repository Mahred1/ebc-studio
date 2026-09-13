// The admin session cookie: a signed token, not a database row.
//
// Payload is `${adminId}.${expiresAt}` plus an HMAC-SHA256 over it, so
// middleware can authorize a request without a database round trip and there is
// no session table to prune. The trade-off is that a token stays valid until it
// expires — it can't be revoked early. For a handful of staff accounts that's
// the right trade; if it stops being one, this is the file to replace with a
// Session table.
//
// Deliberately Web Crypto (not node:crypto) and dependency-free: this module is
// imported by middleware, which runs on the Edge runtime.

export const SESSION_COOKIE = "admin_session"

/** Lives here, not in lib/auth.ts, so middleware can import it without Prisma. */
export const LOGIN_PATH = "/admin/login"

/** Without "remember me" — a working day, and the cookie also dies with the browser. */
export const SESSION_MAX_AGE = 60 * 60 * 8

/** With "remember me" — the cookie is persisted and the signature is good this long. */
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30

function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set — the admin session cookie can't be signed."
    )
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

const fromBase64Url = (value: string) =>
  Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0)
  )

export async function signSession(
  adminId: number,
  maxAgeSeconds: number
): Promise<string> {
  const payload = `${adminId}.${Math.floor(Date.now() / 1000) + maxAgeSeconds}`
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(payload)
  )
  return `${payload}.${toBase64Url(signature)}`
}

/**
 * The admin id carried by a valid, unexpired token — null for anything else.
 * Signature is checked before the expiry is read, so the expiry can't be edited.
 */
export async function verifySession(
  token: string | undefined
): Promise<number | null> {
  if (!token) return null

  const [id, expiresAt, signature] = token.split(".")
  if (!id || !expiresAt || !signature) return null

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(signature),
      new TextEncoder().encode(`${id}.${expiresAt}`)
    )
    if (!valid) return null
  } catch {
    // Malformed base64 in a hand-edited cookie.
    return null
  }

  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return null

  const adminId = Number(id)
  return Number.isSafeInteger(adminId) && adminId > 0 ? adminId : null
}
