import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept any legacy /studio routes and permanently redirect to /feed
  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    const feedUrl = new URL("/feed", request.url);
    return NextResponse.redirect(feedUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio", "/studio/:path*"],
};

