"use server";

import { createHash } from "crypto";
import { auth } from "@/auth";
import { GoogleDriveBackend, DriveError } from "@/lib/storage";
import { encrypt } from "@/lib/crypto";
import { parseDataFile, type DataFile } from "@/lib/schema";

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "invalid" | "revoked" | "network" };

function logEvent(event: Record<string, string | number>): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...event }));
}

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export async function saveDataFile(data: DataFile): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, reason: "unauthenticated" };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    logEvent({ op: "saveDataFile", code: "MISSING_GOOGLE_CREDS" });
    return { ok: false, reason: "network" };
  }

  const userIdHash = hashUserId(session.user.id);

  let serialized: string;
  try {
    serialized = JSON.stringify(data);
    parseDataFile(serialized);
  } catch {
    logEvent({ op: "saveDataFile", code: "INVALID_INPUT", userIdHash });
    return { ok: false, reason: "invalid" };
  }

  const ciphertext = encrypt(serialized);
  const sourceBuffer = Buffer.from(ciphertext, "utf8");
  const bytes = new Uint8Array(sourceBuffer.byteLength);
  bytes.set(sourceBuffer);

  const backend = new GoogleDriveBackend({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    tokenExpiry: session.tokenExpiry,
    clientId,
    clientSecret,
  });

  try {
    await backend.writeFile(bytes);
    logEvent({
      op: "saveDataFile",
      code: "OK",
      userIdHash,
      bytes: bytes.byteLength,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof DriveError) {
      logEvent({
        op: "saveDataFile",
        code: err.code,
        userIdHash,
        bytes: bytes.byteLength,
      });
      if (err.code === "REVOKED_ACCESS") {
        return { ok: false, reason: "revoked" };
      }
      return { ok: false, reason: "network" };
    }
    logEvent({ op: "saveDataFile", code: "UNEXPECTED", userIdHash });
    return { ok: false, reason: "network" };
  }
}
