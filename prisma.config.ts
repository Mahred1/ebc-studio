import { defineConfig } from "prisma/config"
import { config as loadEnv } from "dotenv"

// Load .env (which the Prisma CLI no longer auto-loads) so DATABASE_URL is
// available to Migrate and Studio.
loadEnv()

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
