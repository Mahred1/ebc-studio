// Checks the two things that would silently let the wrong person in.
//
//   node --test scripts/auth.test.mts
//
// No test framework and no database: node:test is stdlib, and both modules
// under test are pure.

import assert from "node:assert/strict"
import { test } from "node:test"

process.env.AUTH_SECRET = "test-secret-not-used-anywhere-real"

const { hashPassword, verifyPassword } = await import("../lib/password.ts")
const { signSession, verifySession } = await import("../lib/session.ts")

test("a password verifies against its own digest and nothing else", async () => {
  const digest = await hashPassword("correct horse battery staple")

  assert.ok(!digest.includes("correct"), "digest must not contain the password")
  assert.equal(await verifyPassword("correct horse battery staple", digest), true)
  assert.equal(await verifyPassword("Correct horse battery staple", digest), false)
  assert.equal(await verifyPassword("", digest), false)

  // Same password, different salt — so a digest can't be recognised by sight.
  assert.notEqual(await hashPassword("correct horse battery staple"), digest)
})

test("a malformed digest is a failed login, not a crash", async () => {
  for (const digest of ["", ":", "not-a-digest", "abc:def", "abc:zz"]) {
    assert.equal(await verifyPassword("anything", digest), false, digest)
  }
})

test("only a session this server signed, and hasn't expired, resolves", async () => {
  const token = await signSession(42, 60)
  assert.equal(await verifySession(token), 42)

  const [id, expiresAt, signature] = token.split(".")

  // Promoting yourself to another admin, or extending your own expiry, breaks
  // the signature — that's the whole point of signing the id and expiry.
  assert.equal(await verifySession(`1.${expiresAt}.${signature}`), null)
  assert.equal(await verifySession(`${id}.${Number(expiresAt) + 86400}.${signature}`), null)

  assert.equal(await verifySession(await signSession(42, -1)), null, "expired")
  assert.equal(await verifySession(undefined), null)
  assert.equal(await verifySession("garbage"), null)
  assert.equal(await verifySession(`${id}.${expiresAt}.`), null)
})
