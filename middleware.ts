import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public auth routes and streaming (stream route does its own auth check)
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/stream")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Protect dashboard pages
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API routes that require authentication
  if (pathname.startsWith("/api/conversations") || pathname.startsWith("/api/messages")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/conversations/:path*", "/api/messages/:path*", "/api/stream/:path*", "/api/auth/:path*"]
};
