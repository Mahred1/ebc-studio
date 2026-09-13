import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventory | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export default function AdminInventoryPage() {
  return <h1 className="text-2xl font-black text-primary">Inventory</h1>
}
