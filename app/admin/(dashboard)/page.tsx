import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Admin | EBC Studio",
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Signed in as {admin.username}.</p>
      </header>

      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nothing here yet — reservation management lands on this page next.
      </div>
    </div>
  )
}
