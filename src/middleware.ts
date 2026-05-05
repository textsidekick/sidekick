import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public pages, API routes, and static files
  if (
    pathname === "/" || // Landing page
    pathname === "/login" ||
    pathname === "/choose" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/onboarding") || // Onboarding flow (signup)
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/sms-consent" ||
    pathname === "/sms-terms" ||
    pathname === "/contact" ||
    pathname === "/about" ||
    pathname.includes(".") // static files like .png, .ico, etc.
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie/token
  const authCookie = request.cookies.get("sidekick_auth");
  
  // If no auth, redirect to login
  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
