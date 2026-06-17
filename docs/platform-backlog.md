# Platform Backlog

## Completed Recently
- Seeded demo Pieces liquidity pools and demo LP positions so `/marketplace` and `/liquidity` have an initial active inventory path once the migration is applied.
- Email template brand/rendering fixes for header logo, footer treatment, social link fallbacks, and admin digest metric layout.
- Demo-triggered email routing through `resendService`, including demo inbox capture and merchant sampling lifecycle sends.
- Hobby-safe cron consolidation around `/api/cron/daily`, with Daily Layer and PromoShare maintenance exposed as explicit serverless endpoints.
- Support ticket user flow: authenticated ticket list, email-safe ticket detail deep link, and backend ticket detail endpoint.
- Stripe subscription payment fulfillment now persists idempotent local `transactions` records with provider and external payment metadata.
- Legacy `emailService` now routes through `resendService` while preserving notification preferences and `email_logs`, so automated workflows and featured marketplace sends no longer use a fake delivery path.
- Manual KYC review now sends user-facing approval, rejection, and additional-info emails, and new submissions trigger an admin alert.
- Admin support queue and reply workflow are available in the admin dashboard, with status updates and user-facing response emails.
- Shared admin authorization now uses verified JWTs plus database-backed roles, and KYC, PromoShare, featured marketplace, and admin support routes enforce admin access through the common middleware.
- Frontend admin access now treats `master_admin` and moderator-style roles as admin-equivalent after role mapping.
- Stripe backend secrets are present in the production API environment and `/api/payments/providers` reports Stripe as enabled.

## 1. Email Template Brand Fixes
- Verify footer links and support links point to the correct live routes.
- Spot-check the updated email rendering in Gmail mobile/web and Apple Mail after the next deploy.

## 2. Preview Environment Parity
- Mirror backend production environment variables into Vercel Preview.
- Verify Preview can send Resend emails, resolve demo email routing, and access cron endpoints.
- Document required vs optional backend env vars.

## 3. Cron and Serverless Cleanup
- Monitor `/api/cron/daily` after deploy and confirm admin digest, email queue processing, PromoShare, and Daily Layer tasks continue to run on the once-daily Hobby cadence.
- Keep explicit manual cron endpoints documented for one-off maintenance runs.

## 4. Payments Completion
- Add production `STRIPE_PUBLISHABLE_KEY` and `STRIPE_PRICE_*` IDs so Stripe moves from enabled to checkout-ready.
- Verify Stripe webhook processing end to end and confirm idempotent retries.
- Decide whether non-subscription payments should credit `user_balances` or stay as plan/billing records only.
- Add clear failure logging and retry visibility.

## 5. Support System Hardening
- Verify ticket creation, ticket responses, and `/support/tickets/:id` deep links.
- Add assignee ownership and response history if support volume grows beyond single-admin handling.

## 6. Email System Cleanup
- Convert remaining generic compatibility emails into purpose-built branded templates where the content justifies it.
- Audit all user-facing email events to ensure they route through `resendService`.
- Confirm `email_events` logging is consistent across all sends.
- Expand admin digest metrics once event logging is stable.

## 7. KYC and User Notification Gaps
- Make user-facing verification status updates consistent across backend and UI.
- Confirm admin actions and user notifications stay in sync.

## 8. Frontend Persistence Gaps
- Finish persistence for saved items, reactions, collections, and similar local-only features.
- Remove fake-local UX where users expect durable state.
- Add loading, success, and failure states where persistence is introduced.

## 9. Auth and Permission Hardening
- Replace remaining placeholder user IDs and auth shortcuts.
- Review demo, signup, and authenticated API access for consistency.

## 10. Repo and Release Hygiene
- Split the current dirty worktree into logical commits.
- Separate email/infra work from unrelated frontend changes.
- Add a lightweight deployment checklist for backend env, Resend, cron, and support verification.

## 11. Product Surface and Discoverability
- Add first-class navigation entry points for `PromoShare`, `Marketplace`, and `KYC` instead of leaving them as mostly direct-link features.
- Define which roles should see which economy features:
  - participant: `Vault`, `PromoShare`, `Marketplace`
  - host: `Analytics`, `PromoShare`, `Marketplace` where relevant
  - brand/sponsor: `PromoShare Sponsorship`, `Analytics`
  - merchant: keep economy features hidden unless they actually apply
- Add dashboard CTAs and cross-links so users can move naturally between:
  - moment participation
  - memory collection / vault
  - PromoShare qualification
  - piece trading / liquidity
- Remove or hide routes from primary navigation when the experience is not ready enough for routine use.

## 12. PromoShare Surface Completion
- Keep `/promoshare` as the participant-facing entry point for recurring reward cycles, entries, and win history.
- Keep `/sponsor` and `/sponsor/analytics` as the sponsor operating surface.
- Add obvious discovery points into PromoShare from:
  - participant dashboard
  - vault / rewards surfaces
  - sponsor / brand workspace
- Clarify the product language so users understand the difference between:
  - PromoShare entries and wins
  - Vault memories and perks
  - tradable pieces and Gems
- Verify all PromoShare pages are using production-ready API payloads and not relying on placeholder assumptions.

## 13. Marketplace, Pieces, and Liquidity Completion
- Treat `/marketplace` as the canonical exchange surface for buying and selling pieces with Gems.
- Treat `/liquidity` as the advanced LP surface, not a general-user first stop.
- Apply `202604260001_seed_demo_liquidity_pools.sql` to production Supabase so active pools are present.
- Add admin-only pool creation for approved assets instead of relying on SQL seeds after launch.
- Add guardrails so only approved/verified assets can become tradeable pools.
- Add pool lifecycle controls: create, pause, close, and rebalance.
- Add a clear user journey:
  - why pieces exist
  - how they are earned or acquired
  - when KYC is required
  - when liquidity provision makes sense
- Add discoverability from relevant pages:
  - vault
  - rewards / participant dashboard
  - KYC page after approval
- Audit the backend endpoints backing the marketplace:
  - `/api/pieces/pools`
  - quote/trade endpoints
  - Gems balance
  - LP position endpoints
- Confirm the user actually has an understandable portfolio view and not just trade modals against anonymous pools.

## 14. Vault and Memory System Alignment
- Keep `/vault` as the canonical memory / perks / legacy surface.
- Make the distinction between Vault and Marketplace explicit in the UI:
  - Vault = collected proof, perks, legacy
  - Marketplace = trading pieces
- Add cross-links from Vault to:
  - related memories
  - PromoShare relevance
  - marketplace assets where applicable
- Verify the memory model is durable and not mixing collectible proof with speculative exchange objects in a confusing way.

## 15. Analytics Contract Cleanup
- Audit all analytics dashboards against the actual production schema and backend contracts.
- Remove direct frontend queries to Supabase relations when the contract is unstable or aggregate-only.
- Replace fragile client-side relation assumptions with backend endpoints where necessary.
- Specific known cleanup items:
  - `HostAnalyticsDashboard` currently degrades to empty state because `host_earnings_analytics` does not match the UI contract.
  - previous direct reliance on `moment_attendee_discovery` was removed from the dashboard path and should stay backend-driven if reintroduced.
- Add a single source of truth document for analytics payloads by role: host, brand, merchant, admin.

## 16. Route and Navigation Audit
- Review every signed-in route and classify it as:
  - production-ready
  - hidden but usable
  - partial / needs backend alignment
  - experimental / should be removed from normal flow
- Ensure the dashboard shell only promotes routes that satisfy:
  - valid production data source
  - understandable user purpose
  - stable role-based authorization
- Reconcile duplicated or inconsistent route concepts such as:
  - `/shop` vs `/marketplace`
  - dashboard tab redirects vs dedicated pages
  - public marketing pages vs signed-in operational surfaces

## 17. Economy Narrative and UX Coherence
- Define the canonical platform economy loop in one place and implement to it consistently:
  - Join moments
  - Earn memories / proof
  - Unlock perks and PromoShare eligibility
  - Optionally trade pieces / provide liquidity after KYC
- Remove product copy that makes the system sound like a generic coupon app or a generic pseudo-exchange.
- Ensure each surface explains itself through the workflow and UI structure rather than requiring insider knowledge.
- Reduce conceptual overlap between:
  - rewards
  - memories
  - points
  - Gems
  - pieces
  - PromoShare entries

## 18. Readiness Audit Before Wider Exposure
- Run a route-by-route production smoke test for:
  - `/promoshare`
  - `/sponsor`
  - `/sponsor/analytics`
  - `/vault`
  - `/marketplace`
  - `/liquidity`
  - `/kyc`
  - `/dashboard/analytics`
- Record for each route:
  - access path from normal navigation
  - role restrictions
  - live API dependencies
  - broken, empty, or fallback states
- Use that audit to decide what should be actively promoted now versus held behind direct links until completion.

### Current Readiness Snapshot
- `/vault`
  - Status: production-ready enough to keep promoted
  - Notes: real backend payload, coherent purpose, now cross-linked properly
- `/promoshare`
  - Status: production-ready enough to keep promoted
  - Notes: real participant-facing surface, but still depends on backend payload quality and featured placement data
- `/sponsor`
  - Status: usable but operationally sensitive
  - Notes: real sponsor flow, tied to Stripe and PromoShare sponsor endpoints; should stay exposed only to relevant users
- `/marketplace`
  - Status: partial but worth exposing with warnings
  - Notes: active pools and trading UI exist; initial demo pool inventory is now seeded by migration, but admin pool creation is still needed for ongoing operations
- `/liquidity`
  - Status: partial / advanced
  - Notes: keep accessible, but treat as advanced; LP endpoints are live and demo LP positions are seeded by migration, but admin-controlled pool lifecycle is still needed
- `/kyc`
  - Status: production-ready enough to keep exposed
  - Notes: real submission/status flow; should remain the canonical gate for trading readiness
- `/dashboard/analytics`
  - Status: mixed by role
  - Notes:
    - merchant: likely closest to production use
    - brand: likely usable but still needs contract verification
    - host/participant: partial; currently degrades to safe empty states where production relations do not match UI expectations
