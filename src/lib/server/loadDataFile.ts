import "server-only";
import { createHash } from "crypto";
import { auth } from "@/auth";
import { GoogleDriveBackend, DriveError } from "@/lib/storage";
import { decrypt } from "@/lib/crypto";
import { parseDataFile, SchemaError, type DataFile } from "@/lib/schema";

export type LoadResult =
  | { status: "ok"; data: DataFile }
  | { status: "empty" }
  | { status: "revoked" }
  | { status: "error"; message: string };

function logEvent(event: Record<string, string | number>): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...event }));
}

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export async function loadDataFile(): Promise<LoadResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "revoked" };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    logEvent({ op: "loadDataFile", code: "MISSING_GOOGLE_CREDS" });
    return {
      status: "error",
      message: "Server misconfiguration. Please contact support.",
    };
  }

  const userIdHash = hashUserId(session.user.id);

  const backend = new GoogleDriveBackend({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    tokenExpiry: session.tokenExpiry,
    clientId,
    clientSecret,
  });

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = await backend.readFile();
  } catch (err) {
    if (err instanceof DriveError) {
      logEvent({ op: "loadDataFile", code: err.code, userIdHash });
      if (err.code === "NOT_FOUND") return { status: "empty" };
      if (err.code === "REVOKED_ACCESS") return { status: "revoked" };
      return {
        status: "error",
        message: "Could not load your data from Google Drive. Try again.",
      };
    }
    logEvent({ op: "loadDataFile", code: "UNEXPECTED", userIdHash });
    return {
      status: "error",
      message: "Could not load your data from Google Drive. Try again.",
    };
  }

  const ciphertext = Buffer.from(bytes).toString("utf8");

  let plaintext: string;
  try {
    plaintext = decrypt(ciphertext);
  } catch {
    logEvent({ op: "loadDataFile", code: "HMAC_FAILURE", userIdHash });
    return {
      status: "error",
      message: "Data file is corrupted. Contact support.",
    };
  }

  try {
    const data = parseDataFile(plaintext);
    logEvent({ op: "loadDataFile", code: "OK", userIdHash });
    return { status: "ok", data };
  } catch (err) {
    const code = err instanceof SchemaError ? err.code : "PARSE_ERROR";
    logEvent({ op: "loadDataFile", code, userIdHash });
    return {
      status: "error",
      message: "Data file is corrupted. Contact support.",
    };
  }
}
