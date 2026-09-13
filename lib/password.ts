// Password hashing for admin accounts.
//
// scrypt from node:crypto — memory-hard, in the standard library, no native
// build step. Runs on the server only (the login action and the create-admin
// server action); never import this from a client component or from middleware,
// which has no node:crypto.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keyLength: number
) => Promise<Buffer>

const KEY_LENGTH = 64

/** Returns "saltHex:keyHex". The salt is per-password, so equal passwords hash differently. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const key = await scryptAsync(password, salt, KEY_LENGTH)
  return `${salt}:${key.toString("hex")}`
}

/**
 * Constant-time check of a password against a stored digest. Returns false for a
 * malformed digest rather than throwing — a corrupt row must read as "wrong
 * password", never as an unhandled error on the login path.
 */
export async function verifyPassword(
  password: string,
  digest: string
): Promise<boolean> {
  const [salt, keyHex] = digest.split(":")
  if (!salt || !keyHex) return false

  const expected = Buffer.from(keyHex, "hex")
  if (expected.length !== KEY_LENGTH) return false

  const actual = await scryptAsync(password, salt, KEY_LENGTH)
  return timingSafeEqual(expected, actual)
}
