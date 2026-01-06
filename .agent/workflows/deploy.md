---
description: how to manually deploy to Vercel (frontend and backend)
---

# Manual Vercel Deployment

// turbo-all

## Backend Deployment
1. Navigate to the backend directory:
   ```bash
   cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x/backend
   ```

2. Deploy to production:
   ```bash
   npx vercel --prod --yes
   ```

## Frontend Deployment  
1. Navigate to the project root:
   ```bash
   cd /Users/bumblebeecreative/Documents/GitHub/Promorang-x
   ```

2. Deploy to production:
   ```bash
   npx vercel --prod --yes
   ```

## Verify Deployments
- Backend health: https://api.promorang.co/api/health
- Frontend: https://www.promorang.co

## Notes
- The Vercel CLI uses the `.vercel/project.json` config in each directory
- Backend project: promorang-api (api.promorang.co)
- Frontend project: promorang-alt (www.promorang.co)
- Both projects auto-deploy on push to main, but manual deploy is faster
