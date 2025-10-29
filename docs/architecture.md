# Promorang Architecture Overview

_Last updated: 2025-10-29_

## System Goals
- Deliver Growth Hub experiences (staking, funding, shield, creator rewards, ledger) with low-latency APIs.
- Provide transparent, auditable transactions for creators and supporters.
- Support rapid iteration while remaining production-ready.

## High-Level Diagram (Textual)
```
React/Vite Frontend (SPA)
  └── growthHubService.ts → HTTP requests
        └── Express API (Vercel serverless)
              └── growthService.js → Supabase client
                    └── Supabase Postgres (tables, RPC, storage)
              └── Third-party integrations (Stripe, Auth providers)
```

## Frontend (React + Vite)
- **Framework:** React 18, React Router 7, Vite build tool.
- **State/Data:** Hooks + context; Growth Hub API consumed via `/frontend/src/react-app/services/growthHubService.ts`.
- **Auth:** Supabase Auth Helpers (session syncing, provider login).
- **Styling:** Tailwind-like utility classes (check component-level styles).
- **Testing:** Vitest + React Testing Library (see `frontend/src/tests`).

## Backend (Express on Vercel)
- **Runtime:** Node 18+ serverless functions hosted with Vercel.
- **Entry point:** `backend/api/index.js` (Express app, middleware, route mounts).
- **Routing:** Feature routers under `backend/api/*` (e.g., `growth.js`).
- **Services:** Business logic in `backend/services/*` (e.g., `growthService.js`).
- **Auth:** JWT verification middleware, secret from `JWT_SECRET` env var.
- **Validation:** `zod` schemas for payload validation.
- **Logging:** Console/error logs; will transition to structured logging pre-production.

## Data Layer (Supabase Postgres)
- **Tables:** Staking channels, funding projects, shield policies & subscriptions, creator rewards, ledger entries.
- **Migrations:** Stored in `/supabase/migrations`; apply via Supabase CLI.
- **Indexes:** Performance-focused indexes defined in `202510280003_growth_hub_indexes.sql`.
- **Policies:** RLS policies enforced via Supabase dashboard (document in runbooks).

## Integrations
- **Supabase Auth:** Email/password, OAuth, demo accounts.
- **Stripe:** Payment processing for funding and shield premiums.
- **Webhook Handling:** TODO — planned to capture Stripe events (see `docs/operations/runbooks.md`).

## Environment Overview
| Environment | Branch | Hosting | Notes |
|-------------|--------|---------|-------|
| Local       | feature/* | Localhost via `npm run dev` (frontend) + `node api/index.js` (backend) | Uses `.env.local`.
| Staging     | develop | Vercel Preview + Supabase staging project | Feature flags, QA testing. |
| Production  | main    | Vercel Production + Supabase production project | 24/7 monitoring, incident runbook required. |

## Upcoming Architectural Enhancements
1. Replace manual Node server run with `vercel dev` once CLI issues resolved (document procedure).
2. Add Supabase Functions for heavy computation (creator reward calculations).
3. Introduce Redis (or Supabase caching) for hot leaderboard queries.

## Create Pipeline (Content & Drops)

### Production Contract (target)
- **Route:** `POST /api/content` creates a primary-market content share. Accepts title, description, platform metadata, initial share issuance, optional media manifest. Server validates creator ownership, pricing bands, and available edition counts.
- **Route:** `POST /api/drops` publishes a drop opportunity. Payload includes tasks, reward logic, eligibility gating, proof requirements, and scheduling. Server enforces advertiser/creator permissions and RLS policies.
- **Media uploads:** Frontend requests signed upload URLs (`POST /api/uploads/sign`) for thumbnails or attachments. Client uploads directly to Supabase Storage (or S3) before submitting the create payload; API stores resulting public URLs.
- **Responses:** 201 on success with normalized entity representation (IDs, share counts, derived metrics) so client state stays consistent with database.

### Data Model Additions
- `content_items` (if not already present) extended with: `media_assets JSONB`, `initial_shares`, `price_band_min/max`, `visibility`, `creator_id` FK.
- `content_share_issuance` table logging mint events (`content_id`, `total_shares`, `issued_at`, `issued_by`).
- `drop_tasks` + `drop_requirements` child tables for complex drop flows.
- Supabase Storage bucket `content-media` with RLS restricting writes to authenticated creators.

### Workflow
1. **Client preflight:** Validate form locally, request signed storage URL, upload media (receiving CDN URL).
2. **API submission:** `POST /api/content` with sanitized payload and uploaded media references. JWT identifies user.
3. **Service layer:** Transactionally insert content row, share issuance record, and initial ledger entry for minted shares. Trigger background job (Supabase function) to push to search index and update feeds.
4. **Audit & notifications:** Ledger records in `growth_ledger`, notification event queued for followers, analytics counter incremented for dashboards.

### Outstanding Work
- Build Express routes + service logic (`backend/api/content.js` and corresponding service).
- Create Supabase migrations for new/updated tables, indexes, and RLS policies.
- Implement signed upload endpoint and integrate with storage SDK.
- Port client form submission to hit real endpoints (replace mock fallbacks) and add retry/error messaging.
- Write backend tests covering payload validation, storage failures, and ledger consistency.
- Add monitoring (structured logs + metrics) for create traffic.

Until the above is complete, the Create UI remains mock-only; do not treat it as production ready.

## Related Documents
- `docs/growth-hub-overview.md` — domain & value proposition details.
- `docs/frontend/architecture.md` — client-side patterns.
- `docs/backend/services.md` — backend service contracts and error handling.
- `docs/operations/runbooks.md` — deployment, monitoring, incident response.

## Create Pipeline Hand-off Notes

### Immediate Next Steps (Senior Dev Ownership)
- ✅ Supabase storage bucket `content-media` created in dev project; replicate in staging/prod and verify service-role permissions.
- Wire production and staging env files with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_CONTENT_BUCKET`, and optional `CONTENT_UPLOAD_PREFIX`.
- Smoke test new endpoints locally: `/api/content/upload-image`, `/api/content` (create/update/delete), `/api/content/buy-shares`.
- Apply new `content_share_positions` migration and backfill any missing holdings for legacy content (see Supabase migration `202510290101_content_share_positions.sql`).
- Backfill missing integration tests covering create/upload flows once backend test harness is ready.

### Junior Developer Directive Checklist
1. **Environment Prep**
   - Verify `.env` contains Supabase creds and bucket vars (ask senior if unsure).
   - Run backend with `npm run dev:backend` and ensure the storage bucket exists (`supabase storage ls`).
2. **Endpoint Validation**
   - Hit `POST /api/content/upload-image` with a small base64 payload; confirm JSON response includes `imageUrl`.
   - Use `POST /api/content` with minimal payload (platform/title/url) and confirm record shows up via `GET /api/content`.
   - Exercise `PUT` and `DELETE` routes; confirm both legacy (`content_pieces`) and modern (`content_items`) tables update if your DB has both.
   - If your Supabase project lacks `content_pieces`, expect share purchase endpoint to return a fallback response—log it and flag senior dev for migration follow-up.
   - Verify initial mint by checking `content_share_positions` for the creator’s UUID (skips in mock envs without real users).
3. **Frontend Hook-up**
   - Update `frontend/src/react-app/pages/Create.tsx` to depend on the real API responses (remove mock notifications after verifying fallbacks).
   - Ensure error toasts surface meaningful messages when backend returns `fallback: true`.
4. **Testing & QA**
   - Add/extend backend tests that mock Supabase storage failure to confirm graceful fallback.
   - Add frontend integration test covering image upload -> create flow (Vitest + msw).
5. **Documentation**
   - Log any infra quirks or credential changes in `docs/operations/runbooks.md`.
   - Update `docs/frontend/architecture.md` with Create flow diagram once UI work stabilizes.

> Junior devs: ping senior ownership group if Supabase table mismatch errors appear (`42P01`). The sync logic handles absence gracefully, but migrations may be out of date.

### Coordination Notes
- When migrations introduce new columns for share accounting, update both `content_items` and legacy `content_pieces` structs simultaneously to keep response parity.
- Before production deploy, set up monitoring for upload endpoint latency and storage quotas; see `docs/operations/runbooks.md` TODO section for Grafana wiring.
- Legacy `content_pieces` table is missing in current Supabase project; `/api/content/buy-shares` currently short-circuits. Decide whether to backfill the legacy table or port share accounting to `content_items` before release.
- Initial share mint now targets `content_share_positions` (UUID holdings). Without real creator UUIDs the insert is skipped; ensure auth wiring provides valid user IDs in staging/prod.
