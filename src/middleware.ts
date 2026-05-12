import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  return NextResponse.redirect(new URL('/', req.url), 307);
});

export const config = {
  matcher: [
    // Protect all routes except the public landing page, auth endpoints, sign-in, Next.js internals, and favicon
    "/((?!$|api/auth|_next/static|_next/image|favicon\\.ico|sign-in).*)",
  ],
};
