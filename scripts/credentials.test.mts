// The generator has to be unguessable and the validator has to reject what the
// database would reject anyway — both are worth a check.
//
//   node --test scripts/credentials.test.mts

import assert from "node:assert/strict"
import { test } from "node:test"

const {
  PASSWORD_MIN,
  USERNAME_PATTERN,
  generatePassword,
  generateUsername,
  validatePassword,
  validateUsername,
} = await import("../lib/credentials.ts")

test("generated credentials pass the validation they're generated for", () => {
  for (let i = 0; i < 200; i++) {
    const username = generateUsername()
    const password = generatePassword()

    assert.equal(validateUsername(username), undefined, username)
    assert.equal(validatePassword(password), undefined, password)
    assert.ok(USERNAME_PATTERN.test(username), username)
    assert.ok(password.length >= PASSWORD_MIN, password)
  }
})

test("generated credentials are random, not a fixed string", () => {
  const passwords = new Set(Array.from({ length: 100 }, generatePassword))
  const usernames = new Set(Array.from({ length: 100 }, generateUsername))

  assert.equal(passwords.size, 100, "passwords repeated")
  // 4 characters from a 32-character alphabet: a collision in 100 draws is
  // possible but should be rare, so allow one rather than demanding 100.
  assert.ok(usernames.size >= 99, `usernames repeated (${usernames.size}/100)`)
})

test("every character of the alphabet gets used, none outside it", () => {
  const seen = new Set(
    Array.from({ length: 500 }, generatePassword)
      .join("")
      .replace(/-/g, "")
  )

  // No I, O, 0 or 1 — they get misread when credentials are read aloud.
  for (const banned of ["I", "O", "0", "1"]) {
    assert.ok(!seen.has(banned), `ambiguous character ${banned} in output`)
  }
  assert.equal(seen.size, 32, `expected all 32 characters, saw ${seen.size}`)
})

test("validation rejects what the login lookup and the database would", () => {
  for (const bad of ["", "ab", "a".repeat(33), "Admin", "has space", "-lead", "trail-"]) {
    assert.ok(validateUsername(bad), `accepted username ${JSON.stringify(bad)}`)
  }
  for (const ok of ["abc", "staff-7k2m", "a.b_c-1", "a".repeat(32)]) {
    assert.equal(validateUsername(ok), undefined, ok)
  }

  assert.ok(validatePassword(""))
  assert.ok(validatePassword("a".repeat(PASSWORD_MIN - 1)))
  assert.ok(validatePassword("a".repeat(129)), "unbounded password reaches scrypt")
  assert.equal(validatePassword("a".repeat(PASSWORD_MIN)), undefined)
})
