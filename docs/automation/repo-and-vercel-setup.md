# Automation: Base Repo + Vercel Project Setup

## Inputs Required

| Input | Source | Notes |
|---|---|---|
| `GITHUB_ORG` | credentials.env | GitHub org or username (e.g. `jril109`) |
| `GITHUB_TOKEN` | credentials.env | Personal Access Token with `repo` scope. **Must also have `workflow` scope** to push GitHub Actions workflows. |
| `VERCEL_TOKEN` | credentials.env | Vercel personal access token |
| `VERCEL_TEAM_ID` | credentials.env | Vercel team ID, or empty for personal accounts |
| `repo_name` | caller | e.g. `ledgerloop` |

## Steps

### 1. Create GitHub Repository

```
POST https://api.github.com/user/repos
Authorization: token {GITHUB_TOKEN}

{
  "name": "{repo_name}",
  "private": false,
  "auto_init": false,
  "description": "LedgerLoop — privacy-first personal finance tracker"
}
```

Or under an org:
```
POST https://api.github.com/orgs/{GITHUB_ORG}/repos
```

### 2. Initialize Next.js App

```bash
npx create-next-app@latest {repo_name} \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Then update `tsconfig.json`:
- Ensure `"strict": true` is set (create-next-app does this by default).

### 3. Configure ESLint + Prettier

Install:
```bash
npm install -D eslint-config-prettier prettier
```

Add `eslint-config-prettier` to the ESLint extends list to disable formatting rules that conflict with Prettier.

Create `.prettierrc`:
```json
{ "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "es5" }
```

Add `npm run format` and `npm run format:check` scripts to `package.json`.

### 4. Add License File

Copy the Elastic License 2.0 text into `LICENSE`. This is a source-available license that permits personal use and self-hosting but prohibits selling the software as a managed/hosted service.

### 5. Commit and Push

```bash
git init
git remote add origin https://{GITHUB_ORG}:{GITHUB_TOKEN}@github.com/{GITHUB_ORG}/{repo_name}.git
git add -A
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

**Note:** To push `/.github/workflows/` files, the token MUST have the `workflow` scope in addition to `repo`. Without it, GitHub rejects the push with "refusing to allow a Personal Access Token to create or update workflow without `workflow` scope".

### 6. Create Vercel Project

```
POST https://api.vercel.com/v10/projects
Authorization: Bearer {VERCEL_TOKEN}

{
  "name": "{repo_name}",
  "framework": "nextjs",
  "gitRepository": {
    "type": "github",
    "repo": "{GITHUB_ORG}/{repo_name}"
  }
}
```

This automatically links the Vercel project to the GitHub repo and enables auto-deploy on every push to `main`.

### 7. Add CI Workflow (Requires `workflow` scope)

File: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  check:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
```

Push this file only after the token has `workflow` scope. Alternatively, add the file via the GitHub web UI (Settings → Actions → New workflow).

## What a Future Agent Needs

1. GitHub PAT with both `repo` AND `workflow` scopes
2. Vercel token with project creation permissions
3. The `repo_name` for the new instance
4. Run steps 1–7 above in order
5. Set required env vars in the Vercel project (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`) via `POST /v10/projects/{id}/env`
