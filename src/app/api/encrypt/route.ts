import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { encrypt } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { createHash } from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userIdHash = createHash("sha256")
    .update(userId)
    .digest("hex")
    .slice(0, 16);

  const { allowed, remaining } = await checkRateLimit(userId);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = (await req.json()) as { plaintext?: unknown };
  if (typeof body.plaintext !== "string") {
    return NextResponse.json(
      { error: "plaintext must be a string" },
      { status: 400 }
    );
  }

  const ciphertext = encrypt(body.plaintext);
  const bytesProcessed = Buffer.byteLength(body.plaintext, "utf8");

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      op: "encrypt",
      userIdHash,
      bytesProcessed,
      remaining,
    })
  );

  return NextResponse.json({ ciphertext });
}
