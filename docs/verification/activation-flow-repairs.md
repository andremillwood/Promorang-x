# Promorang activation flow repairs

Local work against `2d40fb0ae436586442831ed7d8f28508b0bdb253` in `andremillwood/Promorang-x`. FlashCreate was not changed. No branch/PR publication, deployment, shared database migration, customer communication, payment, payout or redemption was performed.

## Repaired journeys

- Business outcome navigator → completed brief saved in the existing browser storage → merchant signup/login return (`resume=1`) → restored recommendation → campaign creation. Completion now puts `resume=1` in the URL so refreshing the recommendation preserves it. Existing session/local storage restoration remains in place. Abandoned anonymous briefs do not create CRM records; free-text notes are excluded from the new events and contact capture.
- Campaign save → owned detail through `get_campaign_workspace_detail`, independent of the selected organization or UI role → existing Activation Studio RPC. Detail waits for auth initialization and displays query errors separately from unavailable campaigns. The migration permits merchant/brand/agency/admin buyers to create owned drafts; organization insertion requires management membership. Management detail is scoped even for publicly readable live campaigns, and existing admin reads remain allowed. Draft reads respect ownership/membership; opening an activation requires ownership or organization management. A linked proposal retains the original owner and organization. Browser writes cannot change campaign ownership, organization, proposal linkage or live state.
- Paid PromoPush → atomic draft, channels and creative-task insertion with a stable request key → staff-issued quote in PromoPush Operations → explicit buyer approval → existing `secure_activation_gems` → canonical reserve → server launch. The buyer cannot submit prices, proposal IDs or funding state. There is no existing authoritative price mapping for the four paid push modes, so this repair deliberately uses reviewed staff quotes, not a newly invented automatic tariff. An unquoted paid draft remains unlaunchable.
- Staff quotes have a UUID, expiry and Gem total; only platform administrators can issue them. Approval sends only the campaign and observed quote IDs. The database locks the campaign, validates owner/proposal/quote and uses a deterministic reservation key. Launch validates the quote, proposal owner, funding goal and remaining reserve. A unique proposal link prevents one reserve backing multiple PromoPush campaigns. Organic distribution remains organic, but unfunded Gem rewards are rejected.
- Insufficient balance remains a failed funding attempt. Users can visit the existing wallet and return after a verified credit. Pending/failed/cancelled payment screens do not imply funding success. Quote changes/expiry, proposal changes and depleted reserves fail closed. Draft cancellation returns reserved Gems through the existing refund function and cannot be launched. Draft, approval, cancellation and launch retries are guarded in the database; approval and launch UI state refreshes from the server. Campaign reads include the canonical available reserve.
- Commercial route classification covers business, pricing, merchant/brand/community acquisition, campaign/proposal paths and corresponding auth intent. PromoPush creator/promoter/careers routes remain participant journeys. Navigator start/progress/completion/auth/continuation events use the existing growth collector, stable idempotency keys and bounded `step`/`navigator_event` properties. They use the collector’s existing `page_view` and `cta_clicked` event names, with `entityType=business_navigator`. Raw page query strings are no longer sent as page-view properties.
- Optional “Request help with this route” asks for an email and explicit contact consent. It reuses `/leads/capture`, stores only four selected categorical answers, and qualifies the explicit business contact request. It neither automatically emails nor enrolls the contact in general marketing. The server strips free-text fields even if a client tries to include them.

## Verification

Focused web tests: 24 tests pass across 4 files:

```sh
npm run test --workspace apps/web -- --run \
  src/lib/business-growth.test.ts \
  src/components/business/BusinessOutcomeNavigator.test.tsx \
  src/components/campaigns/PromoPushActivation.test.tsx \
  src/pages/CampaignDetail.activation.test.tsx
```

Focused API/payment/analytics tests: 24 tests pass across 6 suites; all mocked:

```sh
backend/node_modules/.bin/jest --config backend/jest.config.js --rootDir backend --runInBand \
  tests/unit/businessLeadConsent.test.js \
  tests/unit/businessGrowthContract.test.js \
  tests/unit/promoPushActivationApi.test.js \
  tests/unit/promoPushCommercialService.test.js \
  tests/unit/stripeWebhookBoundary.test.js \
  tests/gemsStripeFulfillment.test.js
```

SQL executable tests use PGlite 0.5.8 in `/tmp/promorang-tools`, installed outside the repository. They execute the actual new migration and existing secure/refund functions against isolated schema/auth/wallet fixtures. They cover roles, membership, owner mismatch, direct-write denial, atomic create/retry, changed create payload, quote/proposal tampering, expired/changed pricing, insufficient Gems, repeated funding/launch/cancellation and organic launch. The harness now also executes the actual CRM and growth-event table DDL, verifies business-lead and allowed activity constraints, exercises real `ON CONFLICT(idempotency_key)` deduplication, and uses the real PromoPush channel enum.

```sh
npm install --prefix /tmp/promorang-tools --ignore-scripts @electric-sql/pglite@0.5.8
PGLITE_MODULE=/tmp/promorang-tools/node_modules/@electric-sql/pglite/dist/index.js \
  node backend/tests/activation/repair-flows.cjs
```

### Disposable PostgreSQL follow-up

Docker PostgreSQL 17.11 (`postgres:17-alpine`, image digest `sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`) also passed the migration fixture suite. `postgres-races.cjs` opens two independent connections, holds the first transaction open and asserts that the second actually waits on a PostgreSQL lock before allowing the first to commit. It passes duplicate draft/channel creation, approval/debit/reservation, launch timestamp and cancellation/refund retries, plus cancellation-versus-launch and quote-replacement-versus-approval in both orderings. Losing operations fail closed and fixture balances remain consistent. No external credentials or production data were used; the disposable container was removed afterward.

Reproduce only against a fresh, isolated local container (no published port or persistent volume):

```sh
docker run --detach --rm --name promorang-activation-verification \
  --env POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
docker exec promorang-activation-verification pg_isready
docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' promorang-activation-verification
# Use the returned disposable container IP below; never a shared database URL.
ACTIVATION_LOCAL_POSTGRES_URL=postgresql://postgres@<container-ip>/postgres \
  node backend/tests/activation/repair-flows.cjs
docker stop promorang-activation-verification
```

This uses the same fixture schema/auth and substituted wallet-posting function as PGlite. It is real PostgreSQL multi-session evidence, **not** the deployed Supabase schema, full canonical ledger, PostgREST, signup or Stripe verification. Independent reserve-release-versus-launch paths and full-schema lock ordering remain staging checks.

The local Chromium test blocks all non-local requests except a mocked growth-event collector. It verifies merchant signup routing, brief restoration on refresh/direct return/Back/Forward, event deduplication and private-note exclusion:

```sh
VITE_API_URL=http://127.0.0.1:9 VITE_SUPABASE_URL=http://127.0.0.1:9 \
VITE_SUPABASE_PUBLISHABLE_KEY=local-test-only \
  npm run dev --workspace apps/web -- --host 127.0.0.1 --port 5174
PLAYWRIGHT_MODULE=/tmp/promorang-tools/node_modules/playwright \
CHROMIUM_PATH=/usr/lib/chromium/chromium node backend/tests/activation/browser.cjs
```

`npm run lint`: passes, 117 warnings, no errors. `npm run build`: passes; existing chunk-size warnings; dynamic SEO fetch unavailable, static SEO generation completes. `git diff --check`: passes.

### Verified baseline comparison

The earlier “pre-existing” claim has now been checked against an isolated `git archive` of unchanged commit `2d40fb0ae436586442831ed7d8f28508b0bdb253` at `/tmp/promorang-base-2d40fb0`. Root, web and backend dependency directories were symlinked to the same installed dependencies; shared package sources were verified unchanged. No base source was modified.

| Check | Unchanged base | Current tree | Evidence |
| --- | --- | --- | --- |
| `AftrHrsExperience.test.tsx` | 1 failed, 3 passed | 1 failed, 3 passed | Same missing `sceneMomentsWithAftrHrs` assertion in `CommunityDetail.tsx` |
| `promoCardBenefit.test.js` | 1 failed, 6 passed | 1 failed, 6 passed | Same expected `claimed`, received `expired`; fixture expired on 2026-10-01 |
| App TypeScript | 562 errors | 562 errors | Identical diagnostic-header multisets after normalizing repository prefixes and line/column positions; zero added or removed |

Both normalized TypeScript diagnostic sets have SHA-256 `297db698b3354e70b7a93535fae157d57b4ef94d6d9e2b5bc0623e3fecde8c8d`. The structured comparison is saved in `docs/verification/activation-baseline-comparison.json`.

Commands run in both directories:

```sh
node node_modules/typescript/bin/tsc -p apps/web/tsconfig.app.json --noEmit
npm run test --workspace apps/web -- --run src/pages/AftrHrsExperience.test.tsx
backend/node_modules/.bin/jest --config backend/jest.config.js --rootDir backend --runInBand tests/unit/promoCardBenefit.test.js
```

Raw comparison logs are `/tmp/promorang-{base,current}-{typecheck,aftrhrs,benefit}.log`. The initial broad web run had 61 passing suites and one failing suite; the backend run had 39 passing suites and one failing suite, stopping before its second Node test stage. The targeted base/current reruns verify the two reported failures; they are not a rerun of every broad test on the base. No production dashboards or net revenue were verified.

### Corrections made during dependency verification

The follow-up found gaps masked by the initial mocks/fixtures. These are corrected locally:

- The CRM only allowed five funnel keys. The migration now adds `business`; contact activity uses the existing allowed `note` type instead of inventing `contact_requested`.
- PromoPush channels use an enum. Atomic creation now explicitly casts the channel value to `public.promopush_channel_type`.
- The growth collector rejects arbitrary event names. Navigator events now use its accepted vocabulary, with typed categorical properties.
- The growth collector’s upsert could not infer the existing partial unique index. The migration replaces it with a normal unique index on `idempotency_key`, preserving multiple NULL keys and deduplicating non-NULL keys through the actual upsert clause.
- Adding broad JSON RPC returns to the incomplete global generated schema changed unrelated legacy inference. The generated schema is now unchanged; a small, typed `activation-rpc.ts` adapter isolates the new RPCs. The final TypeScript comparison is identical to the base.

## Migration dependencies and rollout

**Prepared, not applied:** `supabase/migrations/20261008055945_repair_activation_flows.sql`, created with the Supabase CLI using `SUPABASE_HOME=/tmp/promorang-supabase`. This is an incremental migration for the reconciled application schema, not a standalone bootstrap. The production migration history has not been queried.

The following existing objects must already exist with the schema supplied by these source migrations or an equivalent reconciled deployment:

| Source dependency | Required objects/behavior |
| --- | --- |
| `apps/web/supabase/migrations/20260127055018_c305ce01-a1af-459e-b7c8-535431d00933.sql` and subsequent role migrations | `user_roles(user_id, role)`, buyer/admin roles, Supabase auth identities |
| `apps/web/supabase/migrations/20260127061152_9f340625-e739-4301-94f1-8d3ca046907f.sql` and subsequent campaign migrations | Full web `campaigns` table, including `brand_id`, `is_active`, `reward_value`, RLS and grants; a minimal root fallback table is insufficient |
| `202605050002_promopush_core_system_layer.sql` | PromoPush campaigns/channels/creative tasks, channel and status enums; `moments` with `host_id`/`organizer_id`; UUID support |
| `202605050004_andre_super_admin_workspace.sql` | `organizations` and `organization_members` |
| `202607010002_canonical_economy.sql` | `economy_wallets`, `economy_transactions`, `post_economy_transaction(...)` and its wallet/debit/idempotency behavior |
| `202607110001_human_social_return.sql` | `proposals`, including planner, organization, target Moment and metadata fields |
| `202607120001_activation_operations.sql`, `202607120002_activation_commerce.sql`, `202607140001_activation_stakeholder_access.sql` | Proposal lifecycle, activation access passes, funding events and current `can_manage_activation(uuid)` authorization |
| `202607120003_gem_native_activation_economy.sql` | `funding_goal_gems`, canonical reserves/reservations, `secure_activation_gems(uuid,numeric,text)`, `refund_activation_gem_reservation(uuid,text)` |
| `202607220002_link_campaign_activation_studio.sql`, `202607220005_campaign_activation_lifecycle.sql` | Campaign proposal link, compiler metadata, existing `open_campaign_activation` grants, lifecycle guards and synchronization |
| `202607280006_brand_stakeholder_governance.sql` | Campaign organization ID, `organization_role_rank`, `can_manage_organization(uuid,text)` and organization policies |
| `20260914210500_reconcile_org_workspace_roles.sql` | Buyer-role reconciliation for organization members; relevant to onboarding authorization |
| `202609220001_promopush_commercial_convergence.sql` | PromoPush objective/package/fulfillment/pricing/proposal/funding fields and original launch boundary |
| `202608130001_lead_crm.sql` | CRM leads/activity tables, existing funnel constraint and allowed activity types |
| `202607140003_growth_operating_system.sql` | Growth event table, accepted event vocabulary and idempotency index |

Root migration names above are under `supabase/migrations/`. Preserve later compatible migrations and security hardening; do not replay this selected list blindly against production. Verify actual objects and recorded history on staging. The new migration also depends on the Supabase `anon`, `authenticated`, `service_role` roles, `auth.uid()`, and correct service-role-only grants for trusted API RPCs.

Payment continuation uses the existing wallet and Stripe webhook implementation. Its runtime prerequisite includes `202607280011_purchased_gems_and_merchant_gem_cards.sql` (`fulfill_purchased_gems`) and the existing verified webhook→wallet-credit path. The change introduces no new environment variables, but existing Supabase and Stripe configuration has not been verified in production. Staff with a protected platform-admin role must issue reviewed prices; no automatic package tariff was invented.

### Merge/deploy safety

**This is not safe for an uncoordinated production release.** A Git merge by itself has no runtime effect, but repository Vercel configuration does not disable deployment of the production branch, and the normal web ignore script allows builds. Actual project auto-deploy settings were not inspected. Treat a merge as potentially deploying until those settings are confirmed. Promorang merge/deploy permission is still absent; FlashCreate approval does not apply.

| Mixed version state | Impact |
| --- | --- |
| New web, old database | Campaign management detail calls a missing RPC and fails; new funding/cancellation RPCs are absent |
| New API, old database | PromoPush creation/quote RPCs are missing; business lead capture violates the old funnel constraint |
| New API, old web or cached old clients | Old PromoPush create requests lack the newly required idempotency key and are rejected |
| Migration with old API/web | Direct customer PromoPush writes are revoked; legacy paid launches without approved quote metadata fail; restrictive regular-campaign guards may reject legacy direct activation/ownership updates |
| New web with old API | New quote/launch endpoints are absent; paid continuation cannot complete |

Use a coordinated change window with affected submissions paused, or prepare an explicit backward-compatible staged release before approval. Apply the validated migration transactionally before enabling the new API/web paths; release both application components and address already-open/cached clients. Do not claim that “database first” alone gives zero downtime. Code rollback without a matching database compatibility plan is insufficient.

Before the migration, check duplicate non-NULL PromoPush proposal links, legacy reserves/quotes, current role membership and policies. The new unique proposal index will fail if duplicates exist. Rebuilding the growth idempotency index and changing constraints/grants require a staging lock-duration/transaction rehearsal. Pricing renewal is only for unfunded drafts without existing reserves; partially released/refunded legacy campaigns need operational review. Do not fulfill work from unfunded drafts.

## Minimum remaining staging/sandbox verification and blockers

1. **Actual schema rehearsal:** disposable clone/sandbox with the reconciled root and legacy-web schema, existing policies/triggers/grants and sanitized legacy rows. Apply the migration transactionally, run advisors, inspect the schema cache, then exercise the real PostgREST JSON responses and role grants. PGlite fixtures are not this full-stack check.
2. **Real multi-connection race tests:** separate database sessions for duplicate creation, quote renewal versus approval, concurrent funding, cancellation versus launch, reserve release/refund versus launch and retried failures. Assert one ledger debit/reserve/launch and atomic rollback. The PGlite run queues calls on one connection; the additional Docker PostgreSQL run proves lock contention for the documented pairs on separate sessions. Both substitute wallet posting, so the complete ledger and additional release/refund interleavings still require full-schema verification.
3. **Stripe test-mode chain:** authorized test-only keys/webhook signing secret plus sandbox users and wallet data. Verify pending/failed/cancelled checkout, duplicate/reordered webhook delivery, verified credit, approval, secured reserve and launch. Mocked webhook tests pass; an actual test-mode checkout/webhook chain has not run.
4. **Signed-in end-to-end browser:** real staging auth for a new merchant, second merchant, staff/manager membership, participant and existing brand/agency/admin roles; run signup/login interruption → restored brief → compiler → campaign save/detail → activation next step. Test refresh/direct URLs/Back/Forward, then paid quote/funding/launch and cancellation. Existing browser coverage is anonymous/auth interruption; signed-in detail is component plus SQL coverage.
5. **Operational release decision:** confirm staff pricing ownership, affected client versions, deployment triggers and a coordinated release/rollback plan. No automatic pricing catalog exists for the paid push modes. No production deploy or data operation is authorized.

The blockers are the lack of a verified disposable full-schema Supabase environment and test-mode payment/auth configuration, plus the unverified rollout compatibility plan. Nothing was blocked by an approval-review rejection. Repository-wide typecheck and two unrelated tests remain red exactly as on the base. All verification described here is source/local/fixture/mocked evidence, not live production evidence.

## Local preservation

Implementation, test harnesses and evidence are preserved on local branch `repair/promorang-activation-flows` in the commit titled `Repair Promorang activation flows and preserve verification evidence`. Resolve its exact ID with `git log -1 --format=%H repair/promorang-activation-flows`. Nothing was published, merged or deployed. The original base remains `2d40fb0ae436586442831ed7d8f28508b0bdb253`.

The concise [phased compatibility and rollback plan](activation-release-plan.md) identifies an independently extractable analytics subset, coordinated rollout gates, rollback limits and exact staging access. Implementation is paused pending staging and release decisions.
