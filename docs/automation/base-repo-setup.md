# Automation: Base Repo + Vercel Project Setup

## What inputs are needed

| Input | Source | Description |
|---|---|---|
| `GITHUB_TOKEN` | env / secrets | PAT with `repo` + `workflow` scopes (or a GitHub App installation token) |
| `GITHUB_ORG` | env / config | GitHub org name (e.g. `ledgerloop`) |
| `VERCEL_TOKEN` | env / secrets | Vercel API token |
| `VERCEL_TEAM_ID` | env / config | Vercel team ID (e.g. `team_xxxx`) |
| `repo_name` | caller | Name for the new repo (e.g. `ledgerloop-base`) |
| `vercel_project_name` | caller | Name for the Vercel project |

## What the automation does, step by step

1. **Create GitHub repo**
   ```
   POST https://api.github.com/orgs/{GITHUB_ORG}/repos
   Body: { name, private: false, auto_init: false }
   Authorization: token {GITHUB_TOKEN}
   ```
   Capture `clone_url` from response.

2. **Push local code to the new repo**
   ```
   git remote add origin {clone_url}
   git push -u origin main
   ```

3. **Create Vercel project linked to the GitHub repo**
   ```
   POST https://api.vercel.com/v9/projects
   Headers: Authorization: Bearer {VERCEL_TOKEN}
   Body: {
     name: {vercel_project_name},
     framework: "nextjs",
     gitRepository: {
       type: "github",
       repo: "{GITHUB_ORG}/{repo_name}"
     }
   }
   Query: teamId={VERCEL_TEAM_ID}
   ```

4. **Set required environment variables on the Vercel project**
   ```
   POST https://api.vercel.com/v10/projects/{projectId}/env
   Body for each var: {
     key: "ENCRYPTION_KEY",
     value: "...",
     type: "encrypted",
     target: ["production", "preview"]
   }
   ```
   Set: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`

5. **Trigger initial deployment** — Vercel auto-deploys on push; the push in step 2 will trigger it. Alternatively:
   ```
   POST https://api.vercel.com/v13/deployments
   Body: { name: {vercel_project_name}, gitSource: { ref: "main", repoId: ... } }
   ```

6. **Verify deployment** — poll `GET https://api.vercel.com/v13/deployments/{deploymentId}` until `state === "READY"`.

## What a future agent needs to replicate this

- The four env vars above (GITHUB_TOKEN, GITHUB_ORG, VERCEL_TOKEN, VERCEL_TEAM_ID)
- The `repo_name` and `vercel_project_name` for the specific user being provisioned
- Values for all five Next.js env vars (NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENCRYPTION_KEY)
- Access to the local `ledgerloop` directory (the base repo to push)

The Vercel integration with GitHub must already be authorized in the Vercel team settings. If it isn't, step 3 will return a 403 and the agent must prompt a human to authorize it in the Vercel dashboard.
