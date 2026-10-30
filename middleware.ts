import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, public uploads, and auth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-skillpulse-build-phase",
  });

  const isAuthenticated = !!token;
  const isAdmin = token?.role === "ADMIN";
  const mustChangePassword = token?.mustChangePassword === true;

  // 1. Force password change condition
  if (isAuthenticated && mustChangePassword) {
    if (
      pathname !== "/auth/force-change-password" &&
      !pathname.startsWith("/api/auth") &&
      pathname !== "/auth/login"
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/force-change-password";
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect /admin routes (ADMIN role required)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      // Authenticated but not an admin -> redirect to student dashboard
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 3. Protect /dashboard and internal course classroom /learn routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/learn")) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/learn/:path*",
    "/auth/force-change-password",
  ],
};
