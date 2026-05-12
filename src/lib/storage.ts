export interface StorageBackend {
  readonly fileName: string;
  readFile(): Promise<Uint8Array<ArrayBuffer>>;
  writeFile(data: Uint8Array<ArrayBuffer>): Promise<void>;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export type DriveErrorCode =
  | "NOT_FOUND"
  | "REVOKED_ACCESS"
  | "NETWORK_ERROR"
  | "UNEXPECTED";

export class DriveError extends Error {
  constructor(
    public readonly code: DriveErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DriveError";
  }
}

// ─── GoogleDriveBackend ───────────────────────────────────────────────────────

interface DriveCredentials {
  accessToken: string;
  refreshToken: string;
  /** Seconds since epoch */
  tokenExpiry: number;
  clientId: string;
  clientSecret: string;
}

const FILE_NAME = "ledgerloop-data.enc";
const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export class GoogleDriveBackend implements StorageBackend {
  readonly fileName = FILE_NAME;

  private accessToken: string;
  private readonly refreshToken: string;
  private tokenExpiry: number;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(creds: DriveCredentials) {
    this.accessToken = creds.accessToken;
    this.refreshToken = creds.refreshToken;
    this.tokenExpiry = creds.tokenExpiry;
    this.clientId = creds.clientId;
    this.clientSecret = creds.clientSecret;
  }

  // ── Token management ────────────────────────────────────────────────────────

  private async ensureFreshToken(): Promise<void> {
    const nowSec = Date.now() / 1000;
    if (nowSec < this.tokenExpiry - 60) return;

    let res: Response;
    try {
      res = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });
    } catch {
      throw new DriveError(
        "NETWORK_ERROR",
        "Failed to reach Google token endpoint. Check your internet connection.",
      );
    }

    if (!res.ok) {
      throw new DriveError(
        "REVOKED_ACCESS",
        "Google Drive access was revoked. Please sign out and sign in again to reconnect.",
      );
    }

    const body = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = body.access_token;
    this.tokenExpiry = Math.floor(Date.now() / 1000) + body.expires_in;
  }

  // ── File search ─────────────────────────────────────────────────────────────

  private async findFileId(): Promise<string | null> {
    const query = encodeURIComponent(
      `name='${FILE_NAME}' and trashed=false`,
    );
    let res: Response;
    try {
      res = await fetch(
        `${DRIVE_FILES}?q=${query}&spaces=drive&fields=files(id)`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
    } catch {
      throw new DriveError(
        "NETWORK_ERROR",
        "Failed to reach Google Drive. Check your internet connection.",
      );
    }

    if (res.status === 401) {
      throw new DriveError(
        "REVOKED_ACCESS",
        "Google Drive access was revoked. Please sign out and sign in again to reconnect.",
      );
    }
    if (!res.ok) {
      throw new DriveError(
        "UNEXPECTED",
        `Google Drive search failed with status ${res.status}.`,
      );
    }

    const body = (await res.json()) as { files: Array<{ id: string }> };
    return body.files[0]?.id ?? null;
  }

  // ── readFile ─────────────────────────────────────────────────────────────────

  async readFile(): Promise<Uint8Array<ArrayBuffer>> {
    await this.ensureFreshToken();

    const fileId = await this.findFileId();
    if (fileId === null) {
      throw new DriveError("NOT_FOUND", "No data file found in Google Drive.");
    }

    let res: Response;
    try {
      res = await fetch(`${DRIVE_FILES}/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
    } catch {
      throw new DriveError(
        "NETWORK_ERROR",
        "Failed to download data file from Google Drive.",
      );
    }

    if (res.status === 401) {
      throw new DriveError(
        "REVOKED_ACCESS",
        "Google Drive access was revoked. Please sign out and sign in again to reconnect.",
      );
    }
    if (!res.ok) {
      throw new DriveError(
        "UNEXPECTED",
        `Google Drive download failed with status ${res.status}.`,
      );
    }

    return new Uint8Array(await res.arrayBuffer());
  }

  // ── writeFile ────────────────────────────────────────────────────────────────

  async writeFile(data: Uint8Array<ArrayBuffer>): Promise<void> {
    await this.ensureFreshToken();

    const fileId = await this.findFileId();

    if (fileId !== null) {
      await this.updateFile(fileId, data);
    } else {
      await this.createFile(data);
    }
  }

  private async updateFile(fileId: string, data: Uint8Array<ArrayBuffer>): Promise<void> {
    let res: Response;
    try {
      res = await fetch(
        `${DRIVE_UPLOAD}/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: data,
        },
      );
    } catch {
      throw new DriveError(
        "NETWORK_ERROR",
        "Failed to upload data file to Google Drive.",
      );
    }

    this.assertWriteOk(res);
  }

  private async createFile(data: Uint8Array): Promise<void> {
    const boundary = "ledgerloop_boundary";
    const metaPart =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: FILE_NAME, mimeType: "application/octet-stream" }) +
      `\r\n`;
    const mediaPart =
      `--${boundary}\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`;
    const closing = `\r\n--${boundary}--`;

    const enc = new TextEncoder();
    const metaBytes = enc.encode(metaPart);
    const mediaHeaderBytes = enc.encode(mediaPart);
    const closingBytes = enc.encode(closing);

    const body = new Uint8Array(
      metaBytes.length +
        mediaHeaderBytes.length +
        data.length +
        closingBytes.length,
    );
    let offset = 0;
    body.set(metaBytes, offset);
    offset += metaBytes.length;
    body.set(mediaHeaderBytes, offset);
    offset += mediaHeaderBytes.length;
    body.set(data, offset);
    offset += data.length;
    body.set(closingBytes, offset);

    let res: Response;
    try {
      res = await fetch(`${DRIVE_UPLOAD}?uploadType=multipart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      });
    } catch {
      throw new DriveError(
        "NETWORK_ERROR",
        "Failed to create data file in Google Drive.",
      );
    }

    this.assertWriteOk(res);
  }

  private assertWriteOk(res: Response): void {
    if (res.status === 401) {
      throw new DriveError(
        "REVOKED_ACCESS",
        "Google Drive access was revoked. Please sign out and sign in again to reconnect.",
      );
    }
    if (!res.ok) {
      throw new DriveError(
        "UNEXPECTED",
        `Google Drive write failed with status ${res.status}.`,
      );
    }
  }
}
