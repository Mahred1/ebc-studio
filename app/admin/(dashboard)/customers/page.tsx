import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { getCustomers } from "@/lib/reservations"
import { CustomersTable } from "./customers-table"

export const metadata: Metadata = {
  title: "Customers | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  await requireAdmin()
  const customers = await getCustomers()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-primary">Customers</h1>
        <p className="text-muted-foreground">
          Everyone who&apos;s booked. Aggregated live from reservations —{" "}
          click any column header to sort.
        </p>
      </header>

      <CustomersTable customers={customers} />
    </div>
  )
}