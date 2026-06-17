# Production Readiness Checklist

Use this checklist before promoting a release beyond controlled beta. Record the tested deployment URL, API URL, tester account, and result for each item.

## Release Hygiene

- [ ] Worktree is split into reviewable commits by area: frontend, backend/API, migrations, email, payments, admin.
- [ ] Deleted/replaced migrations are intentional and ordered correctly.
- [ ] `npm run build --workspace apps/web` passes.
- [ ] `npm run lint --workspace apps/web` passes with no new warnings in touched files.
- [ ] `npm test --workspace apps/web` passes.
- [ ] `npm run type-check --prefix backend` passes.
- [ ] Backend tests or backend smoke tests pass in the target environment.

## Environment

- [ ] Frontend `VITE_API_URL` points to the production API origin.
- [ ] Frontend Supabase publishable key is production-safe.
- [ ] Backend `SUPABASE_URL` and service role key are production values.
- [ ] `JWT_SECRET`/`SUPABASE_JWT_SECRET` are real production secrets.
- [ ] `FRONTEND_URL`, `PUBLIC_WEB_ORIGIN`, and CORS origins include `https://promorang.co` and `https://www.promorang.co`.
- [ ] `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, and optional `EMAIL_LOGO_URL` are configured.
- [ ] `CRON_SECRET` is configured.
- [ ] Stripe is checkout-ready: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and all required `STRIPE_PRICE_*` IDs are configured.
- [ ] Demo flags such as `USE_DEMO_CONTENT`, `USE_DEMO_DROPS`, and `USE_DEMO_WALLETS` are disabled unless intentionally launching a demo environment.
- [ ] `VITE_SHOW_EXPERIMENTAL_ECONOMY` is only enabled when marketplace/liquidity are intentionally promoted.

## Database

- [ ] Apply migrations to staging first.
- [ ] Verify migrations apply cleanly in order.
- [ ] Apply migrations to production.
- [ ] Confirm RLS policies for KYC, pieces, liquidity, support, and admin routes.
- [ ] Confirm seed/demo liquidity pools are acceptable for the target environment or replaced by admin-created pools.
- [ ] Confirm PostgREST schema reload after migrations.

## Smoke Tests

- [ ] Public homepage loads on desktop and mobile.
- [ ] Auth signup/login/logout works.
- [ ] New user reaches onboarding/post-login routing.
- [ ] Discover moments loads real data or a clear empty state.
- [ ] Moment detail loads, check-in path is guarded correctly, and proof requirements render.
- [ ] Vault loads for an authenticated user.
- [ ] PromoShare dashboard loads and explains empty/fallback states.
- [ ] Sponsor dashboard loads only for the right roles.
- [ ] Stripe checkout can be created in test mode or production mode as appropriate.
- [ ] KYC status and KYC submission work.
- [ ] Marketplace is smoke-tested if `VITE_SHOW_EXPERIMENTAL_ECONOMY=true`.
- [ ] Liquidity dashboard is smoke-tested if `VITE_SHOW_EXPERIMENTAL_ECONOMY=true`.
- [ ] Support ticket creation, ticket list, ticket detail, and admin response email work.
- [ ] Admin dashboard blocks non-admin users.
- [ ] Admin KYC review sends user-facing emails.
- [ ] Admin support reply sends user-facing emails.
- [ ] Cron daily endpoint rejects missing/invalid secrets and succeeds with the correct secret.
- [ ] Email templates render with the first-party logo in Gmail web, Gmail mobile, and Apple Mail.

## Launch Decision

- [ ] Partial or experimental routes are hidden from primary navigation.
- [ ] Known gaps are documented with owner and severity.
- [ ] Rollback deployment is identified.
- [ ] Production logs are monitored during the first release window.
