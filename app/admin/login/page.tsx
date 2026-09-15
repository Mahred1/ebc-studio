import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getAdmin, safeNext } from "@/lib/auth"
import { AdminLoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Admin Sign In | EBC Studio",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const destination = safeNext(next)

  // Already signed in — no reason to show the form again.
  if (await getAdmin()) redirect(destination)

  return (
    <main className="flex min-h-dvh w-full justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">
            Admin Sign In
          </h1>
          <p className="text-lg text-muted-foreground">
            Staff access to EBC Studio reservations.
          </p>
        </header>

        <AdminLoginForm next={destination} />
      </div>
    </main>
  )
}
