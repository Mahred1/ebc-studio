"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  LayoutGrid,
  Package,
  Users,
} from "lucide-react"
import { cn } from "cn"

const links = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6">
      <span className="px-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Menu
      </span>

      <ul className="flex flex-col gap-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  active
                    ? "bg-secondary font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "size-[1.125rem] shrink-0 transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
