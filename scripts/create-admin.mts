// Creates or resets an admin account — the only way in, since /admin has no
// signup route.
//
//   node scripts/create-admin.mts <username> <password>
//
// Node 24 strips the types, so there is no build step. The password is passed on
// the command line and will land in your shell history; change it later by
// re-running this with the same username.

import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

const [username, password] = process.argv.slice(2)

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.mts <username> <password>")
  process.exit(1)
}

if (password.length < 12) {
  console.error("Pick a password of at least 12 characters.")
  process.exit(1)
}

// Imported after the env is loaded, so the Prisma client sees DATABASE_URL.
const { PrismaClient } = await import("@prisma/client")
const { PrismaPg } = await import("@prisma/adapter-pg")
const { hashPassword } = await import("../lib/password.ts")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const name = username.trim().toLowerCase()
const passwordHash = await hashPassword(password)

const admin = await prisma.admin.upsert({
  where: { username: name },
  update: { passwordHash },
  create: { username: name, passwordHash },
  select: { id: true, username: true, createdAt: true, updatedAt: true },
})

const created = admin.createdAt.getTime() === admin.updatedAt.getTime()
console.log(`${created ? "Created" : "Updated"} admin "${admin.username}" (id ${admin.id}).`)

await prisma.$disconnect()
