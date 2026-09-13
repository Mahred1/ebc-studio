import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export default function AdminAnalyticsPage() {
  return <h1 className="text-2xl font-black text-primary">Analytics</h1>
}
