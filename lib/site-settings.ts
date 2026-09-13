// Read-side of the site-wide flags the admin toggles under /admin/settings.
// Server-only: imports the Prisma client, and reserve rendering + the reserve
// action both need the value. The only writer is the settings server action.

import { prisma } from "@/lib/prisma"

export type SiteSettings = { reservationsPaused: boolean }

/**
 * Flags for the public site. The singleton row is seeded by the migration, so
 * `row` is null mostly on a partially-migrated database — treat missing as
 * "not paused" rather than surfacing an errored page.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  return { reservationsPaused: row?.reservationsPaused ?? false }
}