import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public pages, API routes, and static files
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/choose" ||
    pathname === "/hotel" ||
    pathname.startsWith("/hotel/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/sms-consent" ||
    pathname === "/sms-terms" ||
    pathname === "/contact" ||
    pathname === "/about" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Require the httpOnly session cookie (not the client-settable sidekick_auth)
  const sessionCookie = request.cookies.get("sidekick_session");

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Note: Full session validation (expiry, DB check) happens in getCompanyId()
  // at the API layer. Middleware just ensures the cookie exists to prevent
  // rendering dashboard pages without any session at all.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
