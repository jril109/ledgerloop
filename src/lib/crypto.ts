import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "crypto";

let cachedKeys: { aesKey: Buffer; hmacKey: Buffer } | null = null;

function getKeys(): { aesKey: Buffer; hmacKey: Buffer } {
  if (cachedKeys) return cachedKeys;

  const keyHex = process.env.ENCRYPTION_KEY ?? "";
  if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string");
  }

  const masterKeyBuf = Buffer.from(keyHex, "hex");
  cachedKeys = {
    aesKey: Buffer.from(
      hkdfSync("sha256", masterKeyBuf, "", "ledgerloop-aes", 32)
    ),
    hmacKey: Buffer.from(
      hkdfSync("sha256", masterKeyBuf, "", "ledgerloop-hmac", 32)
    ),
  };
  return cachedKeys;
}

const IV_LEN = 12;
const TAG_LEN = 16;
const HMAC_LEN = 32;
const MIN_LEN = IV_LEN + TAG_LEN + HMAC_LEN; // 60

export function encrypt(plaintext: string): string {
  const { aesKey, hmacKey } = getKeys();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", aesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const body = Buffer.concat([iv, encrypted, authTag]);
  const hmac = createHmac("sha256", hmacKey).update(body).digest();

  return Buffer.concat([body, hmac]).toString("base64");
}

export function decrypt(ciphertext: string): string {
  const { aesKey, hmacKey } = getKeys();
  const blob = Buffer.from(ciphertext, "base64");

  if (blob.length < MIN_LEN) {
    throw new Error("HMAC_FAILURE");
  }

  const hmac = blob.subarray(blob.length - HMAC_LEN);
  const body = blob.subarray(0, blob.length - HMAC_LEN);

  const expectedHmac = createHmac("sha256", hmacKey).update(body).digest();
  if (!timingSafeEqual(hmac, expectedHmac)) {
    throw new Error("HMAC_FAILURE");
  }

  const iv = body.subarray(0, IV_LEN);
  const authTag = body.subarray(body.length - TAG_LEN);
  const encrypted = body.subarray(IV_LEN, body.length - TAG_LEN);

  const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}
