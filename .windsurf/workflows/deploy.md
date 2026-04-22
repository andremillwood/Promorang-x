---
description: Deploy Promorang to Vercel
---

# Deploy Promorang to Vercel

This project uses a **split deployment** architecture:

- **Frontend** (`apps/web`) → `promorang-alt` project → https://promorang.co
- **Backend** (`backend`) → `promorang-api` project → https://promorang-api.vercel.app

## Prerequisites

- Vercel CLI installed globally or use `npx vercel`
- Access to `andre-millwoods-projects` Vercel team
- Projects `promorang-alt` and `promorang-api` already exist in Vercel

## Deploy Frontend

```bash
cd apps/web

# Link to existing project (one-time setup)
npx vercel link --project promorang-alt --yes

# Deploy to production
npx vercel --prod --yes
```

**Output:** https://promorang.co

## Deploy Backend

```bash
cd backend

# Link to existing project (one-time setup)
npx vercel link --project promorang-api --yes

# Deploy to production
npx vercel --prod --yes
```

**Output:** https://promorang-api.vercel.app

## Quick Deploy Both

```bash
# Frontend
cd apps/web && npx vercel --prod --yes

# Backend
cd ../../backend && npx vercel --prod --yes
```

## Project Structure

```
Promorang-x/
├── apps/web/          # React + Vite frontend
│   ├── vercel.json    # SPA routing config
│   └── .vercel/       # Linked project (gitignored)
├── backend/           # Express API
│   ├── vercel.json    # Serverless function config
│   └── .vercel/       # Linked project (gitignored)
└── .windsurf/workflows/deploy.md  # This file
```

## Environment Variables

Managed in Vercel Dashboard:
- **promorang-alt**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.
- **promorang-api**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY`, etc.

## Troubleshooting

- **Build fails**: Check `vercel.json` config matches framework
- **CORS errors**: Ensure backend allows `promorang.co` origin
- **API 404s**: Backend routes should use `/api/*` pattern in `vercel.json`
