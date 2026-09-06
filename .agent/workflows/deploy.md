---
description: how to manually deploy to Vercel (frontend and backend)
---

# Manual Vercel Deployment

`main` is the only production source. Read [docs/release-source-of-truth.md](../../docs/release-source-of-truth.md) before promoting anything.

## Project Mappings

| Directory | Vercel Project | Production URL |
|-----------|---------------|----------------|
| repo root (`apps/web` via root `vercel.json`) | `promorang-alt` | https://promorang.co |
| `/backend` | `api` | https://api.promorang.co |

Do not deploy a feature branch or a dirty worktree with `--prod`. Merge to `main` and let Git produce the production deployment.

## Backend Deployment (`api`)

Only if Git production is blocked and the SHA is already on `main`:

```bash
cd backend
npx vercel --prod --yes
```

The `api` project Root Directory must be `backend`. If it is the repo root, the build runs the Vite web app and fails.

## Frontend Deployment (`promorang-alt`)

Only if Git production is blocked and the SHA is already on `main`:

```bash
npx vercel --prod --yes
```

## Verify Deployments

- Backend health: https://api.promorang.co/api/health
- Frontend: https://www.promorang.co
- Both production deployments must report the same `main` commit SHA
