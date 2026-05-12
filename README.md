# LedgerLoop

A privacy-first personal finance tracker. User financial data never touches our servers in plaintext.

## Architecture

### Encryption Model

All user data is a single JSON file (the "data file") stored in the user's own Google Drive. The file is encrypted with AES-256-GCM before it leaves the browser/server boundary.

```
Write flow:
  1. Client sends plaintext JSON to POST /api/encrypt
  2. Server generates a random 12-byte IV
  3. Server encrypts with AES-256-GCM using ENCRYPTION_KEY from env
  4. Server computes HMAC-SHA256 over (IV + ciphertext)
  5. Returns base64(IV + ciphertext + HMAC) to client
  6. Client writes the opaque blob to Google Drive

Read flow:
  1. Client retrieves blob from Google Drive, sends to POST /api/decrypt
  2. Server verifies session (401 if absent)
  3. Decodes base64, splits IV + ciphertext + HMAC
  4. Verifies HMAC — 400 if tampered
  5. Decrypts and returns plaintext to client in the same request
  6. Plaintext is never persisted server-side
```

The encryption key lives in `ENCRYPTION_KEY` environment variable (AWS Secrets Manager in production). No plaintext user financial data is ever stored in our database, logs, or persistent server storage.

### Storage Backend Interface

The `StorageBackend` interface abstracts the data persistence layer:

```typescript
interface StorageBackend {
  read(userId: string): Promise<string>;        // returns encrypted blob
  write(userId: string, blob: string): Promise<void>;
}
```

V1 implements Google Drive storage. Each user stores their own encrypted data file in their own Drive — we never hold it. The file ID is stored in our database alongside the user's sub claim (no financial data).

### Deployment Model

Every user gets their own deployed instance:

1. **GitHub fork** — the base repo is forked into the user's GitHub account (or the LedgerLoop org for managed users)
2. **Vercel project** — a Vercel project is created from the fork, linked to the user's domain
3. **Environment variables** — `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, and Google OAuth credentials are injected into the Vercel project

This isolation means one user's compromised instance cannot affect another's data.

### Tier Gating

Free tier users see the 3 most recent months of data. Paid tiers have unrestricted history. Gating is enforced in the `getAccessibleMonths()` utility — the full data file is decrypted client-side; gating only controls which months are rendered.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS v4
- **Auth:** NextAuth.js v5 (Google OAuth)
- **Storage:** Google Drive (user-owned file)
- **Encryption:** AES-256-GCM + HMAC-SHA256 (Node.js crypto)

## Development

```bash
npm install
cp .env.example .env.local   # fill in secrets
npm run dev
```

### Required environment variables

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ENCRYPTION_KEY` | 64-char hex string (32 bytes) for AES-256 |

### Commands

```bash
npm run dev          # start dev server
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run format       # prettier --write
npm run build        # production build
```

## CI

Every pull request runs typecheck (`tsc --noEmit`) and lint (`next lint`) via GitHub Actions (`.github/workflows/ci.yml`).
