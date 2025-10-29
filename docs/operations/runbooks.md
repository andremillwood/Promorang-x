# Operations Runbooks

_Last updated: 2025-10-29_

## 1. Local Development
1. Ensure Supabase `.env` variables populated (see `docs/operations/setup.md`).
2. Start backend:
   ```bash
   cd backend
   node api/index.js
   ```
   - Expected log: `🚀 Promorang API server running on port 3001`.
3. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   - Default port `5173` (falls back to `5174+` if busy).
4. Verify health:
   - Backend: `http://localhost:3001/api/health`
   - Frontend: `http://localhost:5173/growth-hub`

## 2. Supabase Migration Workflow
1. Pull latest migrations: `git pull origin main`.
2. Create new migration: `supabase migration new <description>`.
3. Edit SQL under `supabase/migrations/<timestamp>_<description>.sql`.
4. Test locally: `supabase db reset` (caution: wipes local data).
5. Commit migration file and update docs if schema changes.
6. Deploy to staging: `supabase db push --env staging` (requires configured project).
7. Update `docs/database-schema.sql` if structure changed.

## 3. Deployment (Staging → Production)
1. Merge feature branch into `develop` (auto deploys to Vercel preview + staging Supabase).
2. Smoke test staging Growth Hub flows.
3. Update release notes in `docs/releases/<YYYY-MM-DD>.md`.
4. Promote to production:
   ```bash
   vercel deploy --prod
   supabase db push --env prod
   ```
5. Confirm health:
- `https://api.promorang.com/api/health`
- Frontend main site `https://app.promorang.com`
6. Monitor logs/dashboards for 30 minutes.

### Create Flow Deployment Checklist
- [ ] Supabase storage bucket (`SUPABASE_CONTENT_BUCKET`) exists in target environment.
- [ ] Service role has storage insert/read permissions.
- [ ] `POST /api/content/upload-image` returns 201 with non-fallback URL.
- [ ] `POST /api/content` + `PUT` + `DELETE` executed via smoke script or manual curl.
- [ ] Frontend Create form wired to production API and tested end-to-end.
- [ ] `content_share_positions` migration applied; verify initial mint (`select count(*) from content_share_positions where content_id = '<new id>';`).

## 4. Incident Response
- **Severity Levels**
  - SEV-1: Outage, financial loss → page on-call immediately.
  - SEV-2: Degraded feature, workaround exists → respond within 1 hour.
- **Steps**
  1. Acknowledge alert (PagerDuty channel TBD).
  2. Form incident slack channel `#inc-<date>-<summary>`.
  3. Triage using logs (Vercel, Supabase), identify blast radius.
  4. Rollback (see below) if needed.
  5. Postmortem within 48 hours (template in `docs/operations/postmortem-template.md`).

## 5. Rollback Procedures
- **Backend**: `vercel rollback <deployment_url>` or redeploy previous commit.
- **Supabase**: Use `supabase db remote commit` points; apply `down` migration if safe.
- **Frontend**: `vercel rollback` or redeploy previous static build.

## 6. Monitoring & Alerts
- **Application Metrics**: Vercel Analytics (latency, errors).
- **Database**: Supabase dashboard (connections, slow queries).
- **Business KPIs**: TODO integration with Metabase/Data Studio.
- Configure alerts for:
  - API error rate >2% over 5 min.
  - Supabase connections >80% utilization.
  - Stripe webhook failures.
- **Create Flow Specific**
  - Upload endpoint latency P95 < 1.5s.
  - Upload failure rate < 2% (alert if fallback responses spike).
  - Storage bucket nearing quota → Supabase alert.

## 7. Webhook Handling (Planned)
- Stripe events to be handled by `/api/webhooks/stripe`.
- Validate signature using `STRIPE_WEBHOOK_SECRET`.
- Retry logic with exponential backoff.
- Document event-specific actions in this file once implemented.

## 8. Checklist Before Launching New Growth Hub Feature
- [ ] Migrations merged and applied to staging.
- [ ] Unit/integration tests passing.
- [ ] API docs updated (`docs/API_DOCS.md`).
- [ ] Frontend copy reviewed.
- [ ] Analytics events instrumented.
- [ ] Rollback plan documented.
