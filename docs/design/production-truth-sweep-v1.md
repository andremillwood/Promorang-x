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


#### T-008 — Admin hard-coded queue badges

File: `apps/web/src/pages/AdminDashboard.tsx`

Finding:
- Admin navigation displayed static “Live” / “3 New” badges independent of authoritative queue state.

Resolution:
- removed the hard-coded queue claims; operator attention counts must come from live sources where shown.

Commit: `ffdc0b39bbce1a0fade3370b59eaffb45b3daade`

Status: **Closed**

#### T-009 — Create Moment partial collaborator persistence

File: `apps/web/src/pages/CreateMoment.tsx`

Finding:
- Moment creation could succeed while collaborator insertion failed silently, yet the UI reported the whole operation as successful.

Resolution:
- collaborator insert errors are checked;
- Moment creation is reported as partial success when team records fail;
- the user lands on the canonical Moment record to review what was actually saved.

Commit: `ac5e3a9f0b8ded63bf7bdfe1487d0304b5770374`

Status: **Closed**

### T-010 — Collaborator acceptance semantics

Status: **Open contract debt**

The current `moment_collaborators` schema defaults records to `confirmed` and does not expose a separate invitation/acceptance lifecycle. Do not invent acceptance UI until an authoritative collaborator invitation contract exists. Treat “confirmed” as current schema behavior, not proof that a linked user explicitly accepted.

#### T-011 — Host sponsorship synthetic offers and escrow

Files:
- `apps/web/src/components/host/HostSponsorshipConsole.tsx`
- `apps/web/src/components/host/SponsorshipRequests.tsx`

Finding:
- hard-coded sponsor brands, offer amounts, escrow totals and earnings were presented as live operations;
- the real sponsorship component's empty state also displayed an illustrative Nike opportunity.

Resolution:
- Host sponsorship console now wraps the authoritative sponsorship request source only;
- hard-coded escrow/earnings/offer state removed;
- empty request state stays honestly empty;
- accepted, funded and paid remain separate states.

Commits:
- `6fae524585de1c8fbff30f924c36b75634b72d86`
- `4000bc62a79c60011f4e3da9a54d6e7615a8b741`

Status: **Closed**

#### T-012 — Merchant Places demo inventory and fabricated telemetry

File: `apps/web/src/components/merchant/MerchantVenueStudio.tsx`

Finding:
- empty venue inventory was replaced by two demo Kingston venues;
- missing capacity, occupancy, rating and linked Moment values were filled with invented numbers.

Resolution:
- venue list uses authoritative merchant venue records only;
- empty stays empty;
- missing capacity/rating stays “Not recorded”;
- occupancy and linked Moment telemetry are not claimed without a source.

Commit: `95f5d827bdee89294b7b8871302ca2ba2c32bfaa`

Status: **Closed**

#### T-013 — Merchant storefront synthetic live state

File: `apps/web/src/components/merchant/MerchantStorefrontConsole.tsx`

Finding:
- demo storefront ID, “Public Visible”, “Open Now”, fake active deal, fake products, fake prices/points and live item counts were presented inside the merchant workspace.

Resolution:
- synthetic customer preview removed;
- storefront link requires authenticated merchant identity;
- offer input is explicitly a draft that continues into the authoritative inventory flow;
- real `ProductCatalogManager` remains the catalog source;
- offer, claim, validation, purchase and fulfillment boundaries are stated explicitly.

Commit: `c313703df5e62aed5b7a43e8a6de0fae11531446`

Status: **Closed**

#### T-014 — Creator Reputation synthetic tiers and score

File: `apps/web/src/components/creator/CreatorReputationDeck.tsx`

Finding:
- creator reputation was entirely illustrative: hard-coded tier names, hard-coded active/completed tier states and a hard-coded `98 / 100` Vibe Score.

Resolution:
- removed invented cultural tier ladder and hidden score;
- creator progress now comes from `useRoleSuccessProgress("creator")`, backed by recorded releases, linked work, attributed joins and verified unlocks;
- stored creator economic tier is shown only when `creator_economic_profiles` records one;
- no tier/score is inferred from likes, views or unverified activity;
- loading/error/absence remain explicit.

Commit: `29fa719b46bb27c5d601b3a40b91375d1150719c`

Status: **Closed**

#### T-015 — Brand Creator Bureau synthetic roster, metrics and payouts

File: `apps/web/src/components/brand/BrandCreatorBureau.tsx`

Finding:
- Brand creator operations were represented by hard-coded creators, stock-photo identities, fake views/likes, invented tiers, fake bounty amounts, a static “32 Active Creators” count, and local approval actions that claimed money was disbursed.

Resolution:
- removed the synthetic roster and local payout/approval simulation;
- Brand distribution now routes into the real Content Drops workspace;
- creator discovery routes to recorded creator profiles;
- evidence review routes to the Brand proof/evidence surface;
- creator fit, availability, reach, approval and payout stay absent unless an authoritative source records them.

Commit: `55f672fa9f62ef732b27366af71e333497842cd3`

Status: **Closed**

#### T-016 — Merchant analytics source failure rendered as real zero

File: `apps/web/src/components/merchant/SalesAnalyticsDashboard.tsx`

Finding:
- failed analytics requests were caught, but the component then rendered null state through `|| 0` fallbacks, making unavailable data look like real zero revenue, sales, customers and redemptions.

Resolution:
- all analytics responses are checked for HTTP success;
- failure clears stale metric state and renders an explicit unavailable state;
- no zero-value business result is substituted for a failed source.

Commit: `0588cd6f8e7fa1540bb9328b8cfa729136286097`

Status: **Closed**

#### T-017 — Merchant fulfillment could bypass payment verification

Files:
- `backend/api/merchant.js`
- `apps/web/src/components/merchant/MerchantCommerceConsole.tsx`

Finding:
- the dedicated order-fulfillment route correctly required `payment_status = paid`, but the generic receipt-status route could mark a linked commerce order delivered and release settlement without re-checking payment;
- the Commerce dashboard also labeled fulfilled purchase receipt value as “Paid revenue,” collapsing payment and fulfillment semantics.

Resolution:
- linked commerce orders must now be verified as paid before receipt fulfillment can proceed;
- settlement release remains downstream of verified payment + fulfillment;
- fulfilled purchase receipt value is labeled descriptively and is no longer presented as a payment-ledger revenue total.

Commits:
- `a1901df9abd9698130d242c2a53050541c984a26`
- `ea8f2b906758a5ea297dcaaee314b13e8b49d9b0`

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
