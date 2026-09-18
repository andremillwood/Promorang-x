# PROMORANG Production Truth Sweep v1

Status: **C19 release-blocker ledger**
Parent: [Product Completion Contract v1](product-completion-contract-v1.md)
Branch: `design/canonical-object-system-v1`

## Purpose

No primary production journey may rely on synthetic state merely to look active or complete.

This ledger tracks production-facing findings involving:
- demo or mock records;
- curated fallback inventory;
- seeded activity;
- hard-coded people/counts/outcomes;
- fake rewards/Gems/points;
- fake proof/attendance;
- client-only authoritative state;
- successful UI after failed writes;
- placeholder outcomes presented as recorded truth.

## Rules

Allowed:
- explicit DEV/test fixtures;
- Design Lab/review harnesses;
- clearly labeled preview content isolated from production reads.

Forbidden:
- production fallback from missing data to sample records;
- local-only issuance;
- invented attendance, conversion, purchase, fulfillment or settlement;
- configured reward displayed as issued reward;
- seeded votes/signals displayed as live demand;
- fake queue metrics or applicants in operator surfaces.

Production absence remains absence.

## Sweep 01 — primary web/stakeholder surfaces

Initial files reviewed:
- `PeopleHome.tsx`
- `Discover.tsx`
- `Communities.tsx`
- `CommunityDetail.tsx`
- `MomentDetail.tsx`
- `MyPromoCard.tsx`
- `Vault.tsx`
- Creator / Host / Merchant / Brand / Agency dashboard homes
- `OrganizerWorkspace.tsx`
- `AdminDashboard.tsx`
- `AdminVerificationHub.tsx`

### Closed findings

#### T-001 — Discover curated Moment fallback

File: `apps/web/src/pages/Discover.tsx`

Finding:
- curated editorial Moments could be merged into the live Moment inventory;
- curated metadata also constructed a reward string.

Resolution:
- curated inventory is DEV-only;
- production Discover uses authoritative Moment inventory;
- curated DEV records no longer fabricate a reward.

Commit: `39fc25c322ee1ca19733e2c1e7da0fb351a06c29`

Status: **Closed**

#### T-002 — Moment Detail demo/culture fallback

File: `apps/web/src/pages/MomentDetail.tsx`

Finding:
- missing production Moment could fall through to demo/culture records;
- the detail page defaulted missing reward to “Complimentary Item & Verified Badge”.

Resolution:
- illustrative Moment fallback is DEV-only;
- production absence resolves as absence/not-found;
- missing reward now renders an explicit “no attendee perk recorded” state;
- no reward is invented.

Commit: `960d1f5b671e626e0d0783bf84190a122dbcee81`

Status: **Closed**

#### T-003 — Admin Trust hard-coded triage

File: `apps/web/src/components/admin/AdminVerificationHub.tsx`

Finding:
- verification cards, applicants, rewards and performance metrics were hard-coded local state.

Resolution:
- replaced by the source-backed moderation/proof/KYC/history workspace.

Commit: `e096b626721258a5ffc7ec03620a8ceb52757110`

Status: **Closed**

## Findings requiring follow-up

### T-004 — Production aliases and compatibility fixture imports

Status: **In review**

Several production files still import modules whose production-safe behavior depends on Vite aliases or environment gates.

Required:
- verify every alias remains empty/safe in production;
- prefer removing unnecessary fixture imports from canonical primary surfaces where practical;
- confirm build/test modes do not leak fixture state.

### T-005 — Local/browser persistence

Status: **In review**

Search remaining primary surfaces for:
- `localStorage`
- `sessionStorage`
- client-generated balances/entries/rewards
- local success state not refreshed from an authoritative source.

Browser persistence may store preferences or drafts, but must not become durable platform truth.

### T-006 — Hard-coded metrics and social proof

Status: **In review**

Search all public, participant and stakeholder surfaces for:
- static attendance;
- approval rates;
- ROI;
- views;
- “people going” counts;
- fake avatars/names;
- threshold completion;
- fake rewards.

### T-007 — Mutation failure semantics

Status: **In review**

Check proposal, vote, join, check-in, proof, redemption, fulfillment, content approval, campaign launch and payment/value writes.

Required:
- failed write remains failure;
- optimistic UI must reconcile with authoritative state;
- retries must not duplicate irreversible consequences.

## Next sweep order

1. stakeholder deep workflows;
2. create/edit flows;
3. commerce;
4. wallet/economy/PromoShare;
5. utilities;
6. profiles/directories;
7. marketing pages;
8. mobile;
9. backend compatibility and issuance paths.

## C19 closure gate

C19 closes only when:
- no primary-path production fixture fallback remains;
- no fake operator queue remains;
- no local-only issuance or settlement remains;
- no static social proof is presented as live;
- failed mutations cannot produce success UI;
- all remaining fixtures are explicitly DEV/test/review-only;
- exact release build and real-record QA confirm the above.
