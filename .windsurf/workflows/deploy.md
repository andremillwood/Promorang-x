---
description: Deploy Promorang to Vercel
---

# Deploy Promorang to Vercel

`main` is the only production source. See [docs/release-source-of-truth.md](../../docs/release-source-of-truth.md).

This project uses a **split deployment** architecture:

- **Frontend** (repo root → `apps/web`) → `promorang-alt` → https://promorang.co
- **Backend** (`backend`) → `api` → https://api.promorang.co

## Prerequisites

- Vercel CLI installed globally or use `npx vercel`
- Access to `andre-millwoods-projects` Vercel team
- Projects `promorang-alt` and `api` already exist in Vercel
- The SHA being promoted is on `main`

## Deploy Frontend

Prefer a Git merge to `main`. Manual fallback:

```bash
npx vercel --prod --yes
```

**Output:** https://promorang.co

## Deploy Backend

Prefer a Git merge to `main` after the `api` project Root Directory is `backend`. Manual fallback:

```bash
cd backend
npx vercel --prod --yes
```

**Output:** https://api.promorang.co

## Environment Variables

Managed in Vercel Dashboard:

- **promorang-alt**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, etc.
- **api**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, etc.

## Troubleshooting

- **API Git production fails with missing `vite`**: the `api` project Root Directory is the repo root. Set it to `backend`.
- **CORS errors**: ensure backend allows `promorang.co` and `www.promorang.co`.
- **API 404s**: backend routes should use `/api/*` in `backend/vercel.json`.
- **Web and API on different SHAs**: do not CLI-promote a feature branch. Redeploy both from `main`.
