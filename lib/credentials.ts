// Credential generation + validation for admin accounts.
//
// Shared by the client (the "generate" buttons in the add-admin dialog) and by
// the server action that writes the row — the client pass is convenience, the
// server pass is the one that counts. Uses the global Web Crypto rather than
// node:crypto so the same module runs in both places.

/** 32 unambiguous characters — no I, O, 0 or 1, because credentials get read aloud. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export const USERNAME_MIN = 3
export const USERNAME_MAX = 32
export const PASSWORD_MIN = 12
/** scrypt is deliberately slow; an unbounded password is a free way to tie up the server. */
export const PASSWORD_MAX = 128

/** Lowercase, starts and ends alphanumeric, dots/dashes/underscores in between. */
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/

/**
 * `count` characters drawn from ALPHABET. Its length (32) divides 256 exactly,
 * so the modulo is unbiased — every character stays equally likely.
 */
function randomChars(count: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(count))
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("")
}

/** e.g. "staff-7k2m". A collision is caught by the unique index, not guessed at here. */
export function generateUsername(): string {
  return `staff-${randomChars(4).toLowerCase()}`
}

/** 16 characters (~80 bits), grouped so it can be read out or typed by hand. */
export function generatePassword(): string {
  return Array.from({ length: 4 }, () => randomChars(4)).join("-")
}

/** The error to show for a username, or undefined if it's fine. Expects it already trimmed + lowercased. */
export function validateUsername(username: string): string | undefined {
  if (!username) return "Username is required."
  if (username.length < USERNAME_MIN)
    return `Use at least ${USERNAME_MIN} characters.`
  if (username.length > USERNAME_MAX)
    return `Keep it under ${USERNAME_MAX} characters.`
  if (!USERNAME_PATTERN.test(username))
    return "Use lowercase letters, numbers, dots, dashes and underscores."
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required."
  if (password.length < PASSWORD_MIN)
    return `Use at least ${PASSWORD_MIN} characters.`
  if (password.length > PASSWORD_MAX)
    return `Keep it under ${PASSWORD_MAX} characters.`
  return undefined
}
