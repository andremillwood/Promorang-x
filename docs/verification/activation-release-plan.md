# Activation repairs: compatibility and rollback decision

Scope: local repair branch only. No publication, merge, deployment or shared database changes are authorized. See [verification evidence](activation-flow-repairs.md) and [baseline comparison](activation-baseline-comparison.json).

## Independent safe subset

Commercial route classification and omission of raw query-string properties in `GrowthTracker.tsx` can ship independently of the migration/API changes, using the existing event vocabulary. Extract the `acquisitionJourney` helper and its route tests with that change; do not cherry-pick the complete repair commit to obtain this subset. Navigator instrumentation alone also uses accepted events, but its edits are interleaved with contact capture and continuation changes, so it needs an explicit small extraction/review. Neither subset is published or independently release-tested here. Existing collector deduplication remains a separate database issue until the index repair ships.

The merchant management RPC, paid PromoPush journey and business contact capture are **not independently deployable as currently packaged**. The migration combines access guards, trusted RPCs, revoked client writes, a CRM constraint and the analytics index. Do not partially apply it or run an old client/API against it without the rehearsal below.

## Phases and gates

1. **Preserve and decide.** Keep the local commit as the review artifact. Confirm the release owner, staff pricing owner, deployment triggers for both API and web, cache/service-worker behavior, and whether to use a submission pause. Recommended minimal release: a coordinated maintenance window for affected campaign/PromoPush/contact submissions. A rolling zero-downtime release would require additional compatibility implementation and separate review; it is not part of this repair.
2. **Rehearse on disposable staging.** Reconcile recorded migration history and actual schema from both root and legacy web migrations. Check duplicate proposal links, legacy drafts/reserves, membership, policies/grants and index/constraint lock duration. Apply the whole migration transactionally. Exercise real PostgREST/auth, multi-session operations with the real ledger, Stripe test checkout/webhooks, browser navigation and stale-client rejection. Record baseline DB object definitions, backup/restore point and exact deployed web/API versions before migration.
3. **Coordinate deployment, only after separate authorization.** Pause affected entrypoints and in-flight submissions at a server-controlled boundary; disabling only a button is insufficient. Drain/reconcile pending operations, take the approved recovery point, apply the rehearsed migration, deploy matching API and web, reload/check schema cache and role grants, then run isolated smoke checks. Ensure old open tabs/cached bundles are reloaded or explicitly blocked before resuming submissions. All production actions require a new approval.
4. **Observe before reopening fully.** Verify owned management detail, staff quote, verified wallet credit, one reserve and one launch from server records. Confirm consent-only leads and bounded growth events. Check errors from stale clients, quote expiry and retries. Do not use payment-success aggregates as net-revenue evidence.

## Rollback

- **Before the DB commit:** on failure, roll back the migration transaction; keep submissions paused and retain prior application versions.
- **After migration, before new writes:** keep submissions paused. Prefer fixing forward. If reverting, restore the rehearsed prior function definitions, policies, grants, trigger/index/constraint definitions and matched API/web together; verify schema cache and client versions before reopening. No executable down migration is supplied because deployed definitions/history are not yet verified. Do not blindly restore direct-write permissions or remove funding guards while clients can submit.
- **After quotes/funding/launches or lead writes:** do not run a destructive down migration or restore a snapshot over legitimate transactions. Pause affected flows, inventory ledger/reservations/launches and business leads, preserve request/quote identifiers, and reconcile with the release owner. Keep the repaired safety boundaries while preparing a reviewed forward-compatible fix. Never replay charges or manually mark funding successful. Returning to old software now requires a data-aware compatibility decision, not merely a code revert.

## Exact staging access needed

- An explicitly identified **disposable non-production Supabase project** (project ref/URL and confirmation that fixtures are synthetic or sanitized), plus permission to apply this migration there and reset it. A local fixture DB is available but does not establish the deployed schema.
- Securely injected staging database owner/migration connection for schema/history inspection and rehearsal; at least two normal database connections for race tests; Supabase API URL, publishable/anon key and backend-only service-role credential for PostgREST/API tests. Do not put secrets in Git, reports or chat. Include the reconciled schema/migration history, roles, grants, policies, triggers and extensions; no production rows required.
- Test identities for merchant A and B, an organization staff member and manager, participant, brand, agency and protected platform admin; a way to complete test signup/login without contacting real people. Seeded owned Moments, campaigns and test Gem wallets. Compiler dependencies available on staging (or an explicitly declared mock, with the real path remaining unverified).
- Verified **Stripe test/sandbox** secret and publishable keys, a test-only webhook signing secret/delivery endpoint, matching wallet package/price configuration, and permission for synthetic test checkouts/webhook retries. Confirm no live keys or customer IDs are involved.
- Staging API/web endpoints and permission to run browser checks; owner confirmation of actual hosting auto-deploy triggers, stale-client strategy, rollback/recovery procedure and staff quote operation. This grants no production release permission.

## Local PostgreSQL follow-up

Docker PostgreSQL 17.11 was available without paid resources, external credentials or production data. The fixture suite and separate-session lock-contention checks passed; see the main report. This improves local concurrency evidence only. Full schema/auth/ledger and Stripe test-mode checks above remain the release gate. Pause further implementation pending those access and release decisions.
