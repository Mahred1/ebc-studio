import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bookings | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export default function AdminBookingsPage() {
  return <h1 className="text-2xl font-black text-primary">Bookings</h1>
}
