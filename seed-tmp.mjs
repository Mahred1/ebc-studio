import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

const { PrismaClient } = await import("@prisma/client")
const { PrismaPg } = await import("@prisma/adapter-pg")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const rows = await prisma.studioReservation.findMany({
  select: { id: true, referenceNo: true, fullName: true, email: true, createdAt: true },
  orderBy: { id: "asc" },
})
console.log(JSON.stringify(rows, null, 2))

await prisma.$disconnect()
