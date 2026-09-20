import { Suspense } from "react"
import type { Metadata } from "next"

import { TableSkeleton } from "@/components/suspense-ui"
import { requireAdmin } from "@/lib/auth"
import { getCustomers } from "@/lib/reservations"
import { CustomersTable } from "./customers-table"

export const metadata: Metadata = {
  title: "Customers | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

/** Heading renders immediately; the table streams in after getCustomers. */
export default async function AdminCustomersPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Customers</h1>
        <p className="text-muted-foreground">
          Everyone who&apos;s booked. Aggregated live from reservations —{" "}
          click any column header to sort.
        </p>
      </header>

      <Suspense fallback={<TableSkeleton rows={6} cells={4} />}>
        <CustomersSection />
      </Suspense>
    </div>
  )
}

async function CustomersSection() {
  const customers = await getCustomers()
  return <CustomersTable customers={customers} />
}