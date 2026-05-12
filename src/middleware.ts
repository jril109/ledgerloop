import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
});

export const config = {
  matcher: [
    // Protect all routes except auth endpoints, sign-in page, Next.js internals, and favicon
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sign-in).*)",
  ],
};
