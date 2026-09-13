import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export default function AdminCustomersPage() {
  return <h1 className="text-2xl font-black text-primary">Customers</h1>
}
