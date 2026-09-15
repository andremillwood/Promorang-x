# Promorang Delivery Evidence

**Status:** Active verification ledger  
**Effective date:** 2026-09-12

This ledger is the evidence companion to `DEVELOPMENT_PLAN.md`. A feature existing somewhere in the repository is not evidence that an end-to-end process is complete.

| Gate | Criterion | Status | Evidence | Remaining risk |
|---|---|---|---|---|
| Phase 0 | Every major object has one approved definition | Passed | `PRODUCT_ECOSYSTEM_DEFINITION.md` sections 3 and 6 | Future drift; controlled by governance check |
| Phase 0 | Conflicting sources are classified | Passed | `LEGACY_CONFLICT_REGISTER.md` | File-level updates continue as affected phases migrate |
| Phase 0 | Every domain has accountable authority | Passed | `DOMAIN_OWNERSHIP.md` | Named people still need assignment before multi-person operations |
| Phase 0 | Meaning changes require a dated decision | Passed | `PRODUCT_DECISION_LOG.md` and `docs/product/README.md` | Human approval evidence must accompany future changes |
| Phase 0 | Repository entrypoint directs contributors to authority | Passed | Root `README.md` | Legacy nested instructions remain subordinate |
| Phase 0 | Governance can be checked automatically | Passed | `scripts/check-product-governance.mjs`; run with `npm run qa:product-governance` | Semantic review remains human-owned |
| Phase 1 | Shared canonical lifecycle and value contracts | Passed | `packages/shared/src/activation.ts` and `activation.test.ts` | Database and APIs still use legacy states |
| Phase 1 | Activation/proposal record and lifecycle mapping | Passed | `CANONICAL_DOMAIN_MAPPING.md`; executable legacy state map | Row-level dry run and migration are not yet implemented |
| Phase 1 | Value-bearing record-family inventory | Passed | `VALUE_RECORD_INVENTORY.md` | Field-level mapping and source-of-truth decisions remain |
| Phase 1 | Non-destructive production migration preflight | Ready, not executed | `supabase/migrations/202609120001_activation_canonical_preflight.sql` | Must be applied and its environment-specific counts reviewed before cutover |
| Phase 1 | Canonical database state, snapshots and transition contract | Implemented; clean-chain replay passed locally | `supabase/migrations/20260912234510_canonical_activation_contract.sql`; all 169 application migrations replayed on a fresh local database on 2026-09-14 | Hosted execution remains prohibited until security remediation and staged authorization checks pass |
| Phase 1 | Shared/database vocabulary drift check | Passed | `scripts/check-canonical-contract.mjs`; run with `npm run qa:canonical-contract` | Static validation does not replace a database test |
| Phase 2 | Financial category separation contract | Passed at shared-rule level | `packages/shared/src/activation-finance.ts` and tests | Database and provider integration remain |
| Phase 2 | Obligation/event/reconciliation database foundation | Implemented; clean-chain replay passed locally | `supabase/migrations/20260912235026_activation_financial_ledger.sql`; included in the 169-migration local replay | Requires provider webhook integration, reconciliation tests, advisors, and staged verification |
| P0/Phase 3 | Activation intake cannot self-declare payment or launch | Passed at API-unit level | `backend/api/activations.js`; `backend/tests/unit/activationsApi.test.js` | Requires canonical migrations deployed and live integration test |
| Phase 10 | Public Activation page avoids unsupported pricing, guarantees and fabricated proof | Passed at source/build level | `apps/web/src/pages/Activate.tsx`; localized `activatePage` copy | Full marketing-suite capability audit remains |
| Phase 1 | Canonical domain/state implementation | In progress | Shared contract established; database migration not yet certified | Requires remaining record inventory, schema, compatibility adapters and database tests |
| Migration integrity | Clean local database can replay repository history | Passed for application migrations | A fresh local database replayed all 169 application migrations on 2026-09-14; `supabase db lint --schema public --level warning --fail-on error` reports zero errors | The bundled local Storage/Realtime service images fail before application migrations; staged full-stack replay is still required |
| Admin UX | Role-aware, plain-language administration shell | Passed at source/build/browser-entry level | `apps/web/src/pages/AdminDashboard.tsx`, `apps/web/src/lib/admin-access.ts`, eight passing policy tests, production build, and live rejection of unauthenticated `/admin` access | Authenticated role-based usability sessions remain |
| Admin UX | Work-first home is truthful and responsibility-led | Passed at source/build level | `apps/web/src/components/admin/AdminCommandCenter.tsx`; fabricated fallback metrics, simulated live activity, and non-functional broadcast action removed | Unified assignments, due dates, and onboarding persistence remain |
| Admin security | Central capability policy and trusted role resolution | Passed at source/policy level | `backend/lib/adminCapabilities.js`, `backend/middleware/auth.js`; eight backend policy tests pass; user metadata and email bypasses removed from privileged authorization | Full authenticated API matrix against a deployed database remains |
| Admin security | Privileged routes use task-level capabilities | Implemented at source level | Main admin API plus Pieces, PromoShare, Save & Win, PromoPush, commerce, growth, discovery, leads, and marketplace APIs | End-to-end allow/deny requests against a deployed database remain |
| Admin security | Database capability assignments, temporary grants, RLS, and final-owner protection | Passed in clean-chain database verification; not deployed | `supabase/migrations/20260913234827_admin_capability_foundation.sql`; support 6, reviewer 12, operations manager 21, platform owner 27 capabilities; no owner-only leakage; audited changes and final-owner protection verified | Staged deployment and authenticated HTTP/browser allow/deny checks are required |
| Admin access journey | Owner can assign a clear role, add time-bound access, revoke it, and retain an audit record | Passed in clean-chain database and source/build checks | `AdminTeamAccessTab.tsx`; `/api/admin/admin-team` routes; atomic audited RPCs; three audit events observed for the tested lifecycle | Migration is not deployed; email invitation, onboarding, work reassignment, and authenticated browser role matrix remain |
| Repository verification | Web and backend quality gates | Passed | Web lint: zero errors; web tests: 63/63; backend tests: 113 passed with 4 todo; production web build completed | Build reports a large primary bundle and stale Browserslist data; public SEO dynamic fetch was unavailable locally |
| Legacy database security | Public-schema table and view exposure review | Release blocker | Read-only local catalog scan found 109 public tables without RLS and 31 views without `security_invoker`; admin capability tables themselves have RLS and no direct authenticated grants | Triage and remediate by data sensitivity before any hosted migration; see `ADMIN_SECURITY_REMEDIATION_BACKLOG.md` |

## Evidence standard

For implementation gates, evidence should link to the governing requirement, schema or contract, automated tests, role-based end-to-end checks, failure/reversal checks, and any required operational or specialist approval. “Built,” screenshots alone, or an unverified completion report are insufficient.
