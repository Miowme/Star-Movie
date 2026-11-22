import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("__session")?.value;
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/movies") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/admin");

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/movies", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/movies/:path*",
    "/collections/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
