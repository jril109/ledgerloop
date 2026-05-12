import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { decrypt } from "@/lib/crypto";
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

  const body = (await req.json()) as { ciphertext?: unknown };
  if (typeof body.ciphertext !== "string") {
    return NextResponse.json(
      { error: "ciphertext must be a string" },
      { status: 400 }
    );
  }

  let plaintext: string;
  try {
    plaintext = decrypt(body.ciphertext);
  } catch (err) {
    if (err instanceof Error && err.message === "HMAC_FAILURE") {
      return NextResponse.json(
        { error: "Tampered or corrupted ciphertext" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Decryption failed" },
      { status: 400 }
    );
  }

  const bytesProcessed = Buffer.byteLength(plaintext, "utf8");

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      op: "decrypt",
      userIdHash,
      bytesProcessed,
      remaining,
    })
  );

  return NextResponse.json({ plaintext });
}
