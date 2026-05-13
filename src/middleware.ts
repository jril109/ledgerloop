import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  return NextResponse.redirect(new URL('/', req.url), 307);
});

export const config = {
  matcher: [
    // Protect all page routes except the public landing page, API routes (which handle their own auth), demo, sign-in, Next.js internals, and favicon
    "/((?!$|api/|_next/static|_next/image|favicon\\.ico|sign-in|demo).*)",
  ],
};
