# Automation: Base Repo + Vercel Project Setup

## What inputs are needed

| Input | Source | Description |
|---|---|---|
| `GITHUB_TOKEN` | env / secrets | PAT with `repo` scope (add `workflow` scope to also push CI workflow files) |
| `GITHUB_ORG` | env / config | GitHub account/org name (e.g. `jril109`) |
| `VERCEL_TOKEN` | env / secrets | Vercel API token |
| `VERCEL_TEAM_ID` | env / config | Vercel team ID — **omit if personal account** |
| `repo_name` | caller | Name for the new repo (e.g. `ledgerloop`) |
| `vercel_project_name` | caller | Name for the Vercel project |

## What the automation does, step by step

### 1. Create GitHub repo (personal account)

```
POST https://api.github.com/user/repos
Authorization: token {GITHUB_TOKEN}
Content-Type: application/json
Body: {
  "name": "{repo_name}",
  "description": "LedgerLoop - privacy-first personal finance tracker",
  "private": false,
  "auto_init": false
}
```

> **Note:** For an org-owned repo use `POST /orgs/{org}/repos` instead.

Capture `html_url` and `clone_url` from the response. Also note `id` (repoId) — needed for Vercel linking.

### 2. Push local scaffold to the new repo

```bash
cd {APP_DIR}
git remote add origin "https://{GITHUB_ORG}:{GITHUB_TOKEN}@github.com/{GITHUB_ORG}/{repo_name}.git"
git push -u origin main
```

> **Limitation:** Pushing `.github/workflows/*.yml` files requires the PAT to include the `workflow` scope.
> Without it, remove the workflow files from the commit (`git rm --cached .github/workflows/*.yml`),
> push, then add them back via a token with workflow scope or the GitHub UI.

### 3. Create Vercel project linked to the GitHub repo

```
POST https://api.vercel.com/v10/projects
Authorization: Bearer {VERCEL_TOKEN}
Content-Type: application/json
Body: {
  "name": "{vercel_project_name}",
  "framework": "nextjs",
  "gitRepository": {
    "type": "github",
    "repo": "{GITHUB_ORG}/{repo_name}"
  }
}
```

> **Personal account:** No `teamId` query param needed.
> **Team account:** Add `?teamId={VERCEL_TEAM_ID}` to the URL.

Capture `id` (projectId) and `link.gitCredentialId` from the response.

### 4. Set required environment variables on the Vercel project

```
POST https://api.vercel.com/v10/projects/{projectId}/env
Authorization: Bearer {VERCEL_TOKEN}
Content-Type: application/json
Body: {
  "key": "NEXTAUTH_URL",
  "value": "https://{vercel_project_name}.vercel.app",
  "type": "encrypted",
  "target": ["production", "preview"]
}
```

Repeat for: `NEXTAUTH_SECRET` (random 32-byte hex), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY` (64-char hex).

### 5. Trigger initial deployment

```
POST https://api.vercel.com/v13/deployments
Authorization: Bearer {VERCEL_TOKEN}
Content-Type: application/json
Body: {
  "name": "{vercel_project_name}",
  "project": "{projectId}",
  "target": "production",
  "gitSource": {
    "type": "github",
    "repoId": "{github_repo_id}",
    "ref": "main"
  }
}
```

Capture `id` (deploymentId) and `url` (preview URL) from the response.

### 6. Poll for deployment completion

```
GET https://api.vercel.com/v13/deployments/{deploymentId}
Authorization: Bearer {VERCEL_TOKEN}
```

Poll until `readyState === "READY"` or `readyState === "ERROR"`. The production alias will be `{vercel_project_name}-{team_slug}.vercel.app`.

## What a future agent needs to replicate this without human help

1. PAT with `repo` scope (add `workflow` for CI files). Generate via GitHub Settings > Developer Settings > Personal access tokens.
2. Vercel API token. Generate via Vercel dashboard > Settings > Tokens.
3. For personal accounts: no team ID is required. The Vercel project will be owned by the authenticated user's default team.
4. The local scaffold directory must already exist with code committed on `main`.
5. The Vercel–GitHub OAuth integration must already be authorized in the Vercel dashboard (happens automatically on first project link if the account is connected).

## Actual values from the LED-2 run (2026-05-12)

| Item | Value |
|---|---|
| GitHub repo | `https://github.com/jril109/ledgerloop` |
| GitHub repo ID | `1236172149` |
| Vercel project ID | `prj_q6fJJohe9PWgbICHfBhgExk8HWgP` |
| Vercel deployment URL | `ledgerloop-jourdens-projects.vercel.app` |
| CI workflow | Pushed separately once token has `workflow` scope |
