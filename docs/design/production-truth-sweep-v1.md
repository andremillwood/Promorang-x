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

#### T-018 — Content Distribution synthetic reward defaults and client verification override

Files:
- `backend/services/contentDistributionService.js`
- `backend/api/content-distribution.js`
- `apps/web/src/pages/ContentDropDetail.tsx`

Finding:
- unconfigured PromoShare entry counts defaulted to one;
- the generic content action payload could contribute a client-supplied `verified` flag;
- the release detail could display configured points when the server actually awarded zero.

Resolution:
- no configured PromoShare entry count now resolves to zero;
- content context marks PromoShare enabled only when explicitly configured;
- generic content actions no longer accept the client `verified` flag as authority;
- release receipts display the server-awarded value, including a real zero, without falling back to configured points;
- release detail no longer implies a reward when none is configured.

Commits:
- `d4a6424fbe952e3300231899fb34a1b46fe62f28`
- `b6783497ed6f86c20ac60dc199b5014b3e4d99c5`
- `e7158cc099076f0baf1cbbda186893f4b2e8c5e0`
- `894e4e9594921cefebcd4fcaf9048d8db8197ec7`

Status: **Closed**

### T-019 — Creator acceptance / availability / rights-review contract

Status: **Open contract debt**

The current production Creator path uses `content_distribution_campaigns`, assets and attributed actions. It does not yet expose one canonical record for creator acceptance, availability, commissioned deliverables, rights terms and approval/review state. Do not represent an open Content Drop as an accepted commission or approved creator brief until that contract exists.

#### T-020 — Host Moments curated fallback and fabricated stage telemetry

Files:
- `apps/web/src/components/host/HostMomentsStagingConsole.tsx`
- `apps/web/src/components/host/SponsorshipRequests.tsx`

Finding:
- when a host had no Moments, the staging console substituted two curated Kingston Moments;
- missing participant count, capacity and reward values were replaced by invented defaults;
- funded sponsorship cards used payout/liquidity language that could imply funded = paid.

Resolution:
- Host Moments now render only authoritative hosted Moment records;
- empty inventory remains an explicit empty state;
- participant count, capacity and reward show “not recorded” when absent;
- RSVP/participant count is explicitly not treated as verified attendance;
- funded sponsorship language no longer implies payout or settlement.

Commits:
- `6bcf78d0a166ccb70e06d8594b3b8e74845b71ea`
- `1fce7fda9a9c70ba36085aa8ade58abb7d4bf9c6`

Status: **Closed**

#### T-021 — Creation-flow silent defaults and partial write truth

Files:
- `apps/web/src/pages/EditMoment.tsx`
- `apps/web/src/pages/AddVenue.tsx`
- `apps/web/src/pages/PutInventoryUp.tsx`

Finding:
- Edit Moment could assign `Screenshot` proof and `check_in` conversion semantics to older Moments that had no such contract;
- failed selected media uploads could still allow a Moment/Venue save to report success;
- invalid inventory quantity input could collapse into an absent/unlimited quantity.

Resolution:
- absent proof/conversion state remains absent unless the operator explicitly chooses it;
- selected Moment/Venue media uploads fail closed instead of silently retaining stale/partial state;
- inventory quantity must be a positive whole number when supplied, otherwise the publish action is rejected;
- blank quantity remains the only intentional no-fixed-limit state.

Commits:
- `0aa6fe8cfd3b93905012a84dc81d2f963aeff30d`
- `e542e2fb0a80ee83d1d7059e40189ceea1b563d1`
- `19da576fb54cc26aaba2890a7a6089c03c12bae4`

Status: **Closed**

#### T-022 — Offer Studio silently published default supply

File: `apps/web/src/pages/OfferStudio.tsx`

Finding:
- new offers defaulted to `status: active` even though status was not exposed in the creation form;
- new offers also defaulted to 100 units, creating supply the operator had not explicitly entered;
- this overrode the unified-offer schema/service's safer `draft` default.

Resolution:
- new offers are always created as `draft`;
- quantity starts blank rather than at an invented 100 units;
- the existing Manage workspace remains the explicit activation boundary;
- success copy now says the offer was saved as draft and must be reviewed/activated;
- form reset preserves the active market city instead of resetting silently to Kingston.

Commit: `647c2a1de9c45a4b7a3e4fc81b81296b46c66d23`

Status: **Closed**

#### T-023 — Onboarding completion and Agency role routing disagreed

Files:
- `apps/web/src/hooks/useUserPreferences.ts`
- `apps/web/src/components/onboarding/PostLoginRouter.tsx`
- `apps/web/src/pages/Onboarding.tsx`
- `apps/web/src/components/onboarding/OnboardingSurvey.tsx`
- `packages/shared/src/promocard-activation.ts`
- `packages/shared/tests/promocard-activation.test.ts`

Finding:
- onboarding page completion used “has at least one preferred category” while post-login queried an `onboarding_completed` field that the preference upsert did not write;
- Agency skipped participant-interest steps, so successful Agency onboarding could still look incomplete;
- Agency selection wrote the active role as Brand and completion mapped Agency to Brand;
- Agency had no role-first landing and fell through to the participant PromoCard;
- preference-save failures were ignored before advancing;
- Skip could bypass durable preference persistence.

Resolution:
- a persisted `user_preferences` row is now the durable onboarding receipt for all roles;
- post-login uses the same source;
- Agency remains `agency` through selection/completion;
- Agency first value lands on the client portfolio;
- save failure blocks progression/completion;
- Skip persists the minimal preference row and preserves the current stakeholder role;
- regression coverage locks the Agency landing.

Commits:
- `aebfcc32e8d1b7869702ee9d3a42f4f86b108b93`
- `e3b76992e358a5088e4463d42d59122eb561bfcc`
- `691bd1ac4284346bc5ba7669018bf25689038b32`
- `33e3bcc3daaa68e74abcd5c36e4ac5f0a7f42736`
- `28246d3fe99063aa0c2821aefc1c65e728ae0478`
- `515299f3a1841e5e1f8fe80d0ccb8f75460c4e9a`

Status: **Closed**

#### T-024 — Participant commerce fallbacks and receipt-state collapse

Files:
- `apps/web/src/pages/CommerceDetail.tsx`
- `apps/web/src/components/discovery/DiscoveriesFeedSection.tsx`
- `packages/shared/src/action-receipt.ts`
- `packages/shared/tests/action-receipt.test.ts`

Finding:
- Commerce Detail could bypass the public commerce directory and synthesize a product as active, points-redeemable, Kingston-based inventory with a default points cost;
- Commerce Detail and Discovery cards displayed a universal hard-coded PromoCard dollar discount without an entitlement source;
- shared receipt presentation described every non-cancelled/refunded/failed receipt as “It counted,” collapsing recorded claims/reservations/purchases with completed fulfillment;
- durable consequence quantities defaulted to one when an awarded record had no explicit quantity.

Resolution:
- direct-product synthesis removed from production Commerce Detail;
- unsupported universal PromoCard savings claims removed;
- shared receipt language is now type/state specific: claim, reservation and purchase records remain distinct from redemption/fulfillment;
- completed/refunded/stopped states have explicit language;
- missing consequence quantity no longer fabricates a numeric one;
- regression tests lock purchase-vs-fulfillment and claim-vs-redemption boundaries.

Commits:
- `4e5feb2feff68c003b669832f68891fbc77d0673`
- `3798037df0957e4d006c9befe55c9543bc059a8a`
- `cd9d93eec41621c43e3994a9a2c790cca81b3aec`
- `6d68e7685f2fa07b868f29321964a8226e78c0aa`

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
