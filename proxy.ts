// Redirects anonymous requests for /admin/* to the login page, carrying the
// path they wanted so login can send them back.
//
// This is the routing-layer gate — a fast signature check with no database hit.
// It is NOT the security boundary: pages under /admin call requireAdmin()
// (lib/auth.ts), which re-reads the account. Both, on purpose.
//
// Named proxy.ts because Next 16 deprecated the middleware.ts convention.

import { NextResponse, type NextRequest } from "next/server"

import { LOGIN_PATH, SESSION_COOKIE, verifySession } from "@/lib/session"

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // The login page is under /admin too — gating it would be a redirect loop.
  if (pathname === LOGIN_PATH) return NextResponse.next()

  const adminId = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  if (adminId !== null) return NextResponse.next()

  const login = new URL(LOGIN_PATH, request.url)
  login.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(login)
}
