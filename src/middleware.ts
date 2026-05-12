import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_PAGES = ["/dashboard", "/income", "/expenses", "/settings"];

export default auth((req) => {
  if (req.auth) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Unauthenticated page routes → redirect to landing, not a 401
  if (PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Unauthenticated non-auth API routes → 401
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/income/:path*",
    "/expenses/:path*",
    "/settings/:path*",
    "/api/((?!auth/).*)",
  ],
};
