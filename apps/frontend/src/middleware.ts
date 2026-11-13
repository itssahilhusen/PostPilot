import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // If redirected to / with an auth error, forward to /login so the user sees the error
  if (pathname === "/" && searchParams.has("error")) {
    const loginUrl = new URL(`/login?${searchParams.toString()}`, request.url);
    return NextResponse.redirect(loginUrl, 307);
  }

  // Intercept any legacy /studio routes and permanently redirect to /feed
  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    const feedUrl = new URL("/feed", request.url);
    return NextResponse.redirect(feedUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/studio", "/studio/:path*"],
};

