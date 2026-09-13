import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | EBC Studio Admin",
  robots: { index: false, follow: false },
}

export default function AdminSettingsPage() {
  return <h1 className="text-2xl font-black text-primary">Settings</h1>
}
