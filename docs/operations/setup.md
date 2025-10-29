# Environment Setup Guide

_Last updated: 2025-10-29_

## Prerequisites
- Node.js v18+
- npm v9+
- Supabase CLI (https://supabase.com/docs/guides/cli)
- Vercel CLI (optional for local emulation)

## Repository Checkout
```bash
git clone https://github.com/Promorang-x
cd Promorang-x
npm install          # root dependencies if any
```

## Environment Variables
Create the following files:

### `/backend/.env`
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_ANON_KEY=
SUPABASE_CONTENT_BUCKET=content-media
CONTENT_UPLOAD_PREFIX=creator-assets
JWT_SECRET=
STRIPE_SECRET_KEY=
FRONTEND_URL=http://localhost:5173
```

### `/frontend/.env`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

### Root `.env.local` (optional shared values)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Database Setup (Local Dev)
1. Log into Supabase dashboard.
2. Create staging project (if not already available).
3. Run migrations:
   ```bash
   supabase db reset
   ```
4. Seed data (optional): use SQL scripts in `supabase/seeds` (TODO if missing).
5. Confirm `content_share_positions` table exists (new holdings table). If not, apply migration `202510290101_content_share_positions.sql` manually:
   ```bash
   supabase db push
   supabase db remote commit   # optional savepoint
   ```
   - Quick check: `supabase db query "select count(*) from content_share_positions;"`.

### Supabase Storage (Required for Create Flow)
1. Ensure bucket exists (replace name if overriding `SUPABASE_CONTENT_BUCKET`):
   ```bash
   supabase storage buckets create content-media --public
   ```
2. In Supabase dashboard → Storage → Policies, confirm service role can insert/read objects.
3. Record bucket name + prefix in backend `.env`. Keep prefix simple (letters, dashes).
4. Optional: configure lifecycle rules if you need to purge stale assets.

## Running Services Locally
### Backend
```bash
cd backend
npm install
node api/index.js
```
- Default port: `3001`
- Verify: `curl http://localhost:3001/api/health`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Default port: `5173` (auto-increments if busy)
- Access: `http://localhost:5173`

## Testing Commands
- Backend unit tests: `cd backend && npm test`
- Frontend lint: `cd frontend && npm run lint`
- Frontend tests: `cd frontend && npm run test`

## Useful Scripts
- `npm run format` (if configured) for Prettier.
- `supabase gen types typescript ...` to refresh DB types (document once set up).
- (Planned) `node scripts/smoke-tests/content-create.js` to automate Create flow smoke.

## Create Flow Smoke Test (Manual)
1. Start backend + frontend (see above).
2. Upload sample image:
   ```bash
   curl -X POST http://localhost:3001/api/content/upload-image \
     -H 'Content-Type: application/json' \
     -d '{"fileName":"demo.jpg","fileType":"image/jpeg","fileData":"<base64 1x1 pixel>"}'
   ```
   - Expect `201` JSON with `imageUrl`. If `fallback: true`, check storage credentials.
3. Create content (replace `MEDIA_URL`):
   ```bash
   curl -X POST http://localhost:3001/api/content \
     -H 'Content-Type: application/json' \
     -d '{"platform":"instagram","title":"Smoke Test","platform_url":"https://instagram.com/demo","media_url":"MEDIA_URL","total_shares":100,"share_price":0.1}'
   ```
4. Update content:
   ```bash
   curl -X PUT http://localhost:3001/api/content/<id> \
     -H 'Content-Type: application/json' \
     -d '{"title":"Smoke Test Updated"}'
   ```
5. Delete content:
   ```bash
   curl -X DELETE http://localhost:3001/api/content/<id>
   ```
6. Run UI Create form and confirm preview + success notification.
7. (Optional) Inspect share mint:
   ```bash
   supabase db query "select content_id, holder_id, shares_owned from content_share_positions order by created_at desc limit 5;"
   ```
   - Expect entry for the creator's UUID; mock environments without real auth will skip mint.

## Troubleshooting
| Issue | Resolution |
|-------|------------|
| Port already in use (3001/5173) | `lsof -ti:<port> | xargs kill -9` |
| Supabase auth failures | Confirm keys and RLS policies |
| Upload returns fallback image | Verify bucket exists and service key has storage privileges |
| Vercel `recursive invocation` error | Use `node api/index.js` locally until CLI update |

## References
- `docs/architecture.md`
- `docs/operations/runbooks.md`
- `docs/backend/services.md`
