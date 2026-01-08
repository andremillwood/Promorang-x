---
description: how to manually deploy to Vercel (frontend and backend)
---

# Manual Vercel Deployment

// turbo-all

## Project Mappings

| Directory | Vercel Project | Production URL |
|-----------|---------------|----------------|
| `/backend` | promorang-api | https://api.promorang.co |
| `/apps/web` | promorang-alt | https://www.promorang.co |

## Backend Deployment (promorang-api)
1. Navigate to the backend directory:
   ```bash
   cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/backend
   ```

2. Deploy to production:
   ```bash
   npx vercel --prod --yes
   ```

## Frontend Deployment (promorang-alt)
1. Navigate to the web app directory:
   ```bash
   cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/apps/web
   ```

2. Deploy to production:
   ```bash
   npx vercel --prod --yes
   ```

## Verify Deployments
- Backend health: https://api.promorang.co/api/health
- Frontend: https://www.promorang.co

## Quick Reference Commands
```bash
# Deploy backend only
cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/backend && npx vercel --prod --yes

# Deploy frontend only  
cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/apps/web && npx vercel --prod --yes

# Deploy both (run in sequence)
cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/backend && npx vercel --prod --yes && \
cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/apps/web && npx vercel --prod --yes
```

## Notes
- The Vercel CLI uses the `.vercel/project.json` config in each directory
- Backend project: **promorang-api** → api.promorang.co
- Frontend project: **promorang-alt** → www.promorang.co
- Both projects auto-deploy on push to main, but manual deploy is faster
- If token expires, run `npx vercel login` to re-authenticate
