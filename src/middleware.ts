import { NextResponse, type NextRequest } from "next/server";

import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";

/**
 * Middleware — protects /dashboard and all (app) routes + gated API routes.
 * Uses Better Auth session cookie via a lightweight check.
 *
 * Public routes: /, /login, /api/auth/*, /api/health
 */
const publicRoutes = new Set(["/", "/login"]);
const publicApiPrefixes = ["/api/auth", "/api/health", "/api/setup-db"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.has(pathname)) return true;
  for (const prefix of publicApiPrefixes) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // In dev without auth configured, allow all routes (baseline mode).
  if (isDevelopmentRuntime() && !isAuthConfigured()) {
    return NextResponse.next();
  }

  // If auth is not configured at all, allow all (app handles gracefully).
  if (!isAuthConfigured()) {
    return NextResponse.next();
  }

  // Check Better Auth session cookie.
  // Better Auth stores the session in a cookie named `better-auth.session_token` (prod)
  // or `better-auth.session_token` with cookie prefix.
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie?.value) {
    // Redirect browser routes to login, 401 for API routes.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callback", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"
  ]
};
