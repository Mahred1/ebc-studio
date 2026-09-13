import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { logout } from "@/app/admin/login/actions"
import { AdminNav } from "./admin-nav"

/**
 * Wraps every signed-in admin route — anything added under this group is
 * protected by the requireAdmin() call below, not just by middleware.
 * /admin/login sits outside the group, so it stays reachable.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-card md:sticky md:top-0 md:h-dvh">
        <Link
          href="/admin"
          className="flex items-center gap-3 border-b px-7 py-6 transition-opacity hover:opacity-80"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-sm font-black text-background">
            EBC
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-black leading-tight">
              EBC Studio
            </span>
            <span className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Management Suite
            </span>
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-4 py-7">
          <AdminNav />
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-5 py-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {admin.username}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-10">{children}</main>
    </div>
  )
}
