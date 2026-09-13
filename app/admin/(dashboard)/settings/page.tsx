import type { Metadata } from "next"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { AddAdminDialog } from "./add-admin-dialog"
import { DeleteAdminButton } from "./delete-admin-button"
import { ReservationsToggle } from "./reservations-toggle"

export const metadata: Metadata = {
  title: "Settings | EBC Studio Admin",
  robots: { index: false, follow: false },
}

// The admin list changes from this page only, and revalidatePath in actions.ts
// refreshes it after every write.
export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const viewer = await requireAdmin()
  const { reservationsPaused } = await getSiteSettings()
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, isPrimary: true, createdAt: true },
    orderBy: { id: "asc" },
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-primary">Settings</h1>
          <p className="text-muted-foreground">
            Who can sign in to the management suite.
          </p>
        </div>
        <AddAdminDialog />
      </header>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">Reservations</h2>
            <p className="text-sm text-muted-foreground">
              Pause new bookings on the reserve page. Existing reservations can
              still be looked up either way.
            </p>
          </div>
          <ReservationsToggle paused={reservationsPaused} />
        </div>
        {reservationsPaused ? (
          <p className="px-5 py-4 text-sm font-medium text-destructive">
            Reservations are paused — the reserve form is hidden and new
            submissions are rejected.
          </p>
        ) : (
          <p className="px-5 py-4 text-sm text-muted-foreground">
            Reservations are open. The reserve form is live on the public site.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Admins</h2>
          <p className="text-sm text-muted-foreground">
            {admins.length} {admins.length === 1 ? "account" : "accounts"} ·
            anyone here can add an admin, only the primary can remove one
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">
                Admin
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Added
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isViewer = admin.id === viewer.id

              return (
                <tr
                  key={admin.id}
                  className={cn(
                    "border-b last:border-0",
                    isViewer && "bg-secondary/40"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{admin.username}</span>
                      {isViewer && <Badge variant="secondary">You</Badge>}
                      {admin.isPrimary && <Badge>Primary</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {admin.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {/* The primary can't delete itself — that would leave no
                        account able to delete at all. */}
                    {viewer.isPrimary && !isViewer ? (
                      <DeleteAdminButton
                        id={admin.id}
                        username={admin.username}
                      />
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
