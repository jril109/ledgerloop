# Automation: Base Repository + Vercel Project Setup

## Required Inputs

| Input | Source | Description |
|---|---|---|
| `GITHUB_TOKEN` | env / secrets | PAT with `repo` + `workflow` scopes |
| `GITHUB_ORG` | env / config | GitHub org or username (e.g. `jril109`) |
| `VERCEL_TOKEN` | env / secrets | Vercel API token |
| `VERCEL_TEAM_ID` | env / config | Vercel team ID — omit for personal accounts |
| `GOOGLE_CLIENT_ID` | env / secrets | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | env / secrets | Google OAuth client secret |
| `APP_DIR` | env / config | Local path to initialize the Next.js app |

## Step-by-Step

### 1. Create GitHub Repository

```bash
curl -X POST https://api.github.com/orgs/{GITHUB_ORG}/repos \
  -H "Authorization: Bearer {GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ledgerloop",
    "description": "LedgerLoop — encrypted personal finance tracker stored in your Google Drive",
    "private": false,
    "auto_init": false,
    "license_template": "mit"
  }'
```

Capture `clone_url` and `html_url` from the response.

### 2. Initialize Next.js App Locally

```bash
cd {APP_DIR}
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*" --use-npm
```

Verify `tsconfig.json` contains `"strict": true`.

### 3. Configure ESLint + Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

Create `.prettierrc`:
```json
{ "semi": true, "singleQuote": true, "trailingComma": "es5" }
```

Update `eslint.config.mjs` to import and spread `prettier` from `eslint-config-prettier`.

### 4. Create GitHub Actions CI

Write `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
```

### 5. Write README.md

Single-page architecture document covering:
- What LedgerLoop is: encrypted finance tracker, user data in their own Google Drive
- Encryption model: AES-256-GCM + HMAC-SHA256; key from env; plaintext never persisted
- Storage backend interface: pluggable `StorageBackend`; V1 = Google Drive
- Deployment model: per-user fork + Vercel project; Phase 0 manual, Phase 2 via `/api/provision`
- Tech stack: Next.js 14+ App Router, TypeScript strict, Tailwind v4, NextAuth.js v5

### 6. Create `.env.local` (do NOT commit)

```
GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET={GOOGLE_CLIENT_SECRET}
NEXTAUTH_SECRET={generate with: openssl rand -base64 32}
NEXTAUTH_URL=http://localhost:3000
```

Confirm `.env*` is in `.gitignore` and `.env.local` is not staged.

### 7. Push to GitHub

```bash
git init
git add .
git commit -m "Initial LedgerLoop base app"
git remote add origin https://github.com/{GITHUB_ORG}/ledgerloop.git
git push -u origin main
```

### 8. Create Vercel Project

```bash
curl -X POST https://api.vercel.com/v9/projects \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ledgerloop",
    "framework": "nextjs",
    "gitRepository": {
      "type": "github",
      "repo": "{GITHUB_ORG}/ledgerloop"
    }
  }'
```

Omit `teamId` query param for personal Vercel accounts.

### 9. Set Vercel Environment Variables

```bash
# GOOGLE_CLIENT_ID
curl -X POST https://api.vercel.com/v10/projects/ledgerloop/env \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"key":"GOOGLE_CLIENT_ID","value":"{GOOGLE_CLIENT_ID}","type":"plain","target":["production","preview"]}'

# NEXTAUTH_URL
curl -X POST https://api.vercel.com/v10/projects/ledgerloop/env \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXTAUTH_URL","value":"https://{VERCEL_PROJECT_DOMAIN}","type":"plain","target":["production"]}'

# NEXTAUTH_SECRET (generate fresh)
curl -X POST https://api.vercel.com/v10/projects/ledgerloop/env \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXTAUTH_SECRET","value":"{secret}","type":"encrypted","target":["production","preview"]}'
```

### 10. Verify Deployment

Vercel auto-deploys on the first push. Confirm:
- `GET https://api.vercel.com/v13/deployments?projectId={id}` shows `state: "READY"`
- The live URL returns HTTP 200

## What a Future Agent Needs

To replicate this without human help, the agent requires:

1. **Credentials**: `GITHUB_TOKEN` (repo+workflow scope), `VERCEL_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
2. **Config**: `GITHUB_ORG`, `VERCEL_TEAM_ID` (if team account), desired `repo_name` and `vercel_project_name`
3. **Generated secrets**: Fresh `NEXTAUTH_SECRET` and `ENCRYPTION_KEY` (32-byte hex)
4. **Local access**: Write access to `APP_DIR` to initialize the Next.js project

The Vercel ↔ GitHub integration must be pre-authorized in Vercel account settings. If not, step 8 returns 403 and a human must authorize the connection in the Vercel dashboard before the agent can retry.

The GitHub token must have the `workflow` scope to push `.github/workflows/ci.yml`. Without it, the push will succeed but the workflow file will be silently rejected.
