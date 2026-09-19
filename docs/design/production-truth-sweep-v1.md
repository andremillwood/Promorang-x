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

#### T-024 — Participant commerce fallbacks and receipt-state collapse

Files:
- `apps/web/src/pages/CommerceDetail.tsx`
- `apps/web/src/components/discovery/DiscoveriesFeedSection.tsx`
- `packages/shared/src/action-receipt.ts`
- `packages/shared/tests/action-receipt.test.ts`

Finding:
- Commerce Detail could fall through from the canonical public commerce directory to a raw `products` lookup and synthesize active status, points eligibility, points cost, Kingston venue/location and other commerce facts;
- Commerce and Discovery surfaces displayed a universal PromoCard savings badge with hard-coded dollar savings despite no entitlement/offer ledger source;
- the shared commerce receipt presenter treated most non-failed states as “It counted,” collapsing recorded purchase/claim/reservation into completed commerce.

Resolution:
- raw product fallback no longer manufactures production commerce state;
- unsupported universal PromoCard savings claims are removed;
- explicit labelled sample catalogue remains non-actionable instructional content only;
- shared receipt presentation now distinguishes recorded purchase, claim, reservation, redemption, completed fulfillment, refund and stopped states;
- claim ≠ redemption ≠ purchase and purchase ≠ fulfillment are now preserved across web/mobile receipt presentation;
- shared tests lock these boundaries.

Commits:
- `4e5feb2feff68c003b669832f68891fbc77d0673`
- `3798037df0957e4d006c9befe55c9543bc059a8a`
- `cd9d93eec41621c43e3994a9a2c790cca81b3aec`
- `6d68e7685f2fa07b868f29321964a8226e78c0aa`

Status: **Closed**

#### T-025 — PromoShare user-facing synthetic draws and browser-issued rewards

Files:
- `backend/services/promoShareService.js`
- `apps/web/src/pages/PromoShare.tsx`
- `apps/web/src/components/promoshare/PromoShareTicketDrawModal.tsx`
- `apps/web/src/components/SpinWheelModal.tsx`
- `apps/web/src/components/DailyRewardsModal.tsx`

Finding:
- the user-facing PromoShare dashboard returned a complete fake draw economy when Supabase was unavailable;
- PromoShare hero/cycle controls substituted 14 entries, 3.5x multiplier, 1,000 Gems and 5 tickets when authoritative values were absent;
- the ticket draw modal locally deducted entries, selected a random prize, declared a win and claimed Vault issuance without a backend draw;
- Spin Wheel and Daily Rewards generated local Gems/Points/Pieces/boost claims without a server-backed eligibility or issuance record.

Resolution:
- user-facing PromoShare now fails closed when the authoritative data source is unavailable;
- no entry, multiplier, jackpot or ticket fallback is substituted;
- the draw modal is read-only and explains entry → selection → claim → settlement boundaries;
- browser lottery/winner selection and fake Vault issuance are removed;
- local spin/streak reward claims are removed globally.

Commits:
- `6b13df53d6fa7b8a91a0076835c89287d7be879d`
- `b792c541ae5fbf4c0dd89e71b7e38f1ee23fd54e`
- `4d5539377ef48e492f1991fd39aaa59fb29f848d`
- `f1eb12aea70368ac04e92822a6a392bac4b377d9`
- `f49ba4c8b1a4a2e4714404d1f1dbc1db188814b6`

Status: **Closed**

### T-026 — PromoShare claim/distribution atomicity

Status: **Open contract debt**

`promoShareService.claimPrize()` currently marks a winner record claimed before distributing some prize types. A failed downstream distribution can therefore leave “claimed” ahead of delivered value. Reordering naïvely is also unsafe because cash/coupon paths do not yet expose a verified idempotency key that guarantees retry safety. This needs one idempotent claim/distribution transaction (or explicit claiming → distributed/pending-settlement states) before further mutation.

#### T-027 — Activation closeout snapshots were presented as verified outcomes

Files:
- `apps/web/src/hooks/useActivationOperations.ts`
- `apps/mobile/hooks/useActivationOperations.ts`
- `apps/web/src/pages/ActivationDetail.tsx`
- `apps/web/src/components/dashboard/StakeholderReturnPanel.tsx`
- `apps/mobile/app/(tabs)/dashboard.tsx`

Finding:
- activation return figures such as showed up, returned, stories, collaborations and gross value are entered directly by an operator into `activation_outcome_snapshots`;
- the web writer hard-coded every snapshot as `stakeholder_type = agency`;
- report/dashboard surfaces could present those closeout figures without explaining that they may be operator-reported rather than independently verified platform telemetry.

Resolution:
- web snapshots now record the actual supported workspace role and explicit metadata provenance `operator_reported`, `recorder_role`, and `verified_telemetry: false`;
- unsupported roles fail instead of being silently relabelled Agency;
- the unused mobile mutation now requires an explicit schema-supported stakeholder type and records the same provenance;
- Activation Detail labels closeout/report metrics as reported closeout values;
- shared web/mobile return cards explain that closeout metrics may be operator-reported while Gems/access come from their ledgers.

Commits:
- `e8130d94d4f57d662335193feb383d1b6947b9e8`
- `fec2813c8a66d891a4037aef110f128680107256`
- `3b16dd2910ad60ac85d2e8713c5232d09d39d09a`
- `9e36ac8be6e343055a857b44d6637c241fd03f8c`
- `8f787ea28805ce23ee088987c9793a35b3244de1`

Status: **Closed**

#### T-028 — Mobile dashboard shipped sample streak and merchant deal state

File:
- `apps/mobile/app/(tabs)/dashboard.tsx`

Finding:
- the production dashboard unconditionally rendered a hard-coded 5-day streak with four hours remaining;
- sample merchant deal stories and their claim/scanner path were mounted as if they were current user opportunities.

Resolution:
- hard-coded streak and sample deal story/scanner surfaces are development-only;
- production no longer presents those fixtures as live account state.

Commit:
- `8f787ea28805ce23ee088987c9793a35b3244de1`

Status: **Closed**

#### T-029 — RSVP intent leaked into participant attendance summaries

Files:
- `packages/shared/src/people-experience.ts`
- `backend/services/peopleExperienceService.js`
- `packages/shared/src/people-experience.test.ts`
- `backend/tests/unit/peopleExperienceService.test.js`

Finding:
- `event_rsvp` and `MOMENT_RSVP` were classified into the same `went` bucket as verified attendance;
- the shared human-action label defaulted any unrecognized action to “showed up,” allowing unknown verified actions to read like physical presence.

Resolution:
- RSVP action types no longer count as attendance;
- unknown action labels now resolve neutrally to “activity recorded”;
- explicit show-up actions remain `MOMENT_ATTENDANCE`, `check_in`, `moment_join_verified`, `proof_verified`, and other specifically verified visit types;
- shared and backend regression tests lock RSVP intent ≠ attendance.

Commits:
- `78e84f196aacb41e301edb834a7ffe2cfe587e38`
- `ed045b92485faa1af6d780c0552b2461541431a5`
- `d48ee7a32ae351135f53b9516b6e32535953e5ad`
- `0bf37f10c8fd1533d4baa40bc938b894a957803a`

Status: **Closed**

#### T-030 — Public profiles manufactured attendance, rating and venue identity

Files:
- `apps/web/src/pages/UserProfile.tsx`
- `apps/web/src/pages/VenueProfile.tsx`

Finding:
- User Profile counted every `moment_participants` row as attended/verified, including RSVP intent;
- User Profile hard-coded a perfect 5.0 rating with no review source;
- the Sea Deck venue slug could substitute a static venue marked verified/claimed and a static active AftrHrs Moment when directory reads were empty or failed;
- Venue Profile also advertised a generic “Claim Perk to Wallet,” “Community Vault Float,” and “100% Guaranteed” benefit without an entitlement/inventory source;
- a Sea Deck route shortcut could send any recorded next Moment to AftrHrs.

Resolution:
- attended counts and attended-tab records now require `status = checked_in`;
- rating is nullable and no rating/review is displayed unless recorded;
- Sea Deck/AftrHrs fixtures are development-only;
- production venue identity, verification, active Moments and counts come from public directory records;
- unsupported guaranteed-perk/value language is removed;
- venue actions point only to recorded Moment/commerce inventory;
- next-Moment routing uses the actual recorded Moment slug/id.

Commits:
- `c6b2e51e8b9f830158009c223d94607b3d8c32a0`
- `2ed7e5d585fd039e5df1b8a3b24a39457ad16f3e`
- `436e8de3461afa49ba1916c83841c7938eae3c02`

Status: **Closed**

#### T-031 — Public Brand profile exposed local demo financial economics

Files:
- `apps/web/src/pages/BrandProfile.tsx`
- `apps/web/src/lib/promocard/marginPoolService.ts`
- `apps/web/src/lib/promocard/splitTenderService.ts`
- `apps/web/src/components/promocard/MerchantMarginPoolManager.tsx`
- `apps/web/src/components/promocard/HubLiquidityPoolCard.tsx`

Finding:
- public Brand Profile mounted a margin-pool manager backed entirely by browser localStorage;
- missing pools were replaced with built-in merchant economics including cash earned, customers acquired, allowance, active status and “guaranteed” revenue projections;
- the local service shipped three demo merchants as default production data;
- split-tender calculation invented a $10 allowance and $25 minimum spend when no merchant pool existed;
- the hub liquidity component derived “settled gross cash flow” and operator earnings from the same demo pools.

Resolution:
- the public Brand Profile no longer mounts local demo margin economics;
- margin-pool fixtures and local mutations are development-only;
- production reads return no local pools and production local writes fail closed;
- split-tender has zero allowance/eligibility when no recorded pool exists;
- demo margin/liquidity components render only in development.

Commits:
- `ec8631ceaf418275f49ee68fa78d11e80124f5c1`
- `bd1ce78b0ab9afbb7da9877d9b340777d08a9e36`
- `e2db7017fc367340e5c2260ce00a92eccba3914f`
- `91f10aa8b3006cbe34fac5c27636737bf618dc92`
- `a7825c5a7fc3426c3273a5ff5634137d28f4db7a`
- `39d135facae76bffcc88dbbb19e1602c8ff9385b`
- `38cb770099442b4838cad75313e74a9db8280b96`

Status: **Closed**

#### T-032 — Settings reported persistence/deletion that did not exist

File:
- `apps/web/src/pages/Settings.tsx`

Finding:
- payout instructions were “saved” by a client-side timeout with no persistence or authoritative payout-method store;
- the screen collected sensitive payout text despite having nowhere durable to store it;
- account deletion removed only a handful of application rows, left the authentication account and other dependent records, signed out, then reported “account deleted”;
- the password-reset button had no action.

Resolution:
- Settings no longer collects or claims to save payout instructions without an authoritative store;
- payout setup explicitly routes to recorded Wallet state or Support;
- partial destructive row deletion is removed;
- account deletion clearly states that no data is deleted from this screen and routes to Support until an atomic server-side deletion workflow exists;
- the no-op password reset control is replaced with truthful guidance rather than pretending the action exists.

Commits:
- `bf7af9cd1ea3719e1982a0c2b4cb4b38157c2063`
- `df41421a7dc13afb4af6a753e5b0e13a035c74c1`
- `56ef52c8c2755a28ee92352a283ae826e24cb323`

Status: **Closed**

#### T-033 — Public marketing examples were presented as live proof or guaranteed economics

Files:
- `apps/web/src/pages/ForBrands.tsx`
- `apps/web/src/pages/HowItWorks.tsx`
- `apps/web/src/components/value/MerchantRoiSimulator.tsx`
- `apps/web/src/components/value/CreatorEarningsSimulator.tsx`
- `apps/web/src/pages/ForMerchants.tsx`

Finding:
- Brand marketing labeled a static Scene Pulse “live” and showed hard-coded 84% / 92% verified figures;
- Brand and Merchant pages rendered unsourced proof-stat strips through translation-defined values;
- a Brand campaign preview used example metrics with a live badge;
- How It Works rendered simulated role/account stats without an explicit user-facing “not live data” boundary;
- Merchant ROI modeling used fixed gross-margin/ad-acquisition assumptions while claiming zero-waste, 100% verified/performance-based economics and “lock in” projected gains;
- Creator modeling presented fixed niche bounty/rate assumptions as available-now work, direct escrow payouts, secured earnings and invented Gems conversion.

Resolution:
- Brand Scene Pulse and campaign reports are explicitly illustrative; hard-coded verification percentages and live badges are removed;
- unsourced Brand/Merchant stat strips are removed;
- How It Works labels simulated role previews as illustrative and not live account data;
- Merchant calculator remains useful but explicitly labels its 65% margin / $48 comparison-cost inputs as scenario assumptions and removes guaranteed-performance language;
- Creator calculator labels all fees/rates as example assumptions, removes “available now,” escrow/funding claims and the fabricated Gems conversion;
- calculator outputs are planning scenarios, not current platform performance, offers, approved earnings or settlement.

Commits:
- `3bb3f1635b3ff57191ca6d221a0fdeaad5f5e0c4`
- `b18f3b497cbf9496b93dd6ce277914b3b733f2e3`
- `0b148312b402ff4ec90b3e3abffa038bc7572943`
- `581bfb36bc1f6719b4d2f848357fa6ea7c2fb82e`
- `df861aa5b01d3330e0fa115460072885d62a9ec4`
- `54ffca8e73c2efb8e055322a3a0b443b0c7aa060`

Status: **Closed**

#### T-027 — Return snapshots lost provenance and stakeholder scope

Files:
- `apps/web/src/hooks/useActivationOperations.ts`
- `apps/mobile/hooks/useActivationOperations.ts`
- `apps/web/src/pages/ActivationDetail.tsx`
- `apps/web/src/hooks/useStakeholderReturn.ts`
- `apps/web/src/components/dashboard/StakeholderReturnPanel.tsx`
- `apps/mobile/hooks/useStakeholderReturn.ts`
- `apps/mobile/app/(tabs)/dashboard.tsx`

Finding:
- activation closeout figures such as showed up, returned, stories, collaborations and gross value are manually entered operator review snapshots, but were presented downstream without preserving that provenance;
- web and mobile outcome writers hard-coded `stakeholder_type = agency`;
- return aggregation queried all snapshots owned by a user without stakeholder-role scoping, allowing one role's closeout to bleed into another role's dashboard;
- participant return could consume operator closeout snapshots even though participant is not a valid snapshot stakeholder type;
- mobile `gemsMoved` could substitute gross monetary value for Gems, collapsing incompatible units.

Resolution:
- new closeout snapshots record `operator_reported` provenance, recorder role and `verified_telemetry: false` in metadata;
- supported stakeholder role is recorded instead of silently relabeling the recorder as Agency;
- unsupported roles fail closed rather than inventing a stakeholder type;
- Activation Detail labels entered figures as operator-reported closeout, not independently verified telemetry;
- web/mobile return aggregation is scoped to the active stakeholder role;
- participant return excludes operator closeout snapshots;
- Gems movement remains sourced from the Gems ledger and is no longer substituted from gross value.

Commits:
- `e8130d94d4f57d662335193feb383d1b6947b9e8`
- `fec2813c8a66d891a4037aef110f128680107256`
- `3b16dd2910ad60ac85d2e8713c5232d09d39d09a`
- `eb8645bb03f963ce607d680b2638962c16bf84da`
- `62a0b067ad7a3544ace3db3cebb11ae50b3ae173`
- `99204f5bc3916577c9e7d621322cd99c207d8877`

Status: **Closed**

#### T-028 — Mobile Gems balance presented as USD platform value

File:
- `apps/mobile/app/(tabs)/dashboard.tsx`

Finding:
- the participant dashboard rendered a raw Gems balance as `US$… platform value`, collapsing Gems denomination, cash value and withdrawal eligibility into one state.

Resolution:
- the dashboard now labels the recorded Gems balance as Gems only;
- cash value and withdrawal eligibility are explicitly separate wallet states;
- mobile return metrics also keep Gems movement separate from gross monetary value.

Commits:
- `99204f5bc3916577c9e7d621322cd99c207d8877`
- `5d85581c9ef8a27f6c05a5c3d181763aec7bb220`

Status: **Closed**

#### T-029 — Public role promises and Ops Theatre guaranteed outcomes

Files:
- `apps/web/src/pages/WhatIsPromorang.tsx`
- `apps/web/src/components/onboarding/OpsTheatreOrientationModal.tsx`

Finding:
- the public product explainer promised guaranteed foot traffic, guaranteed real-world action, universal creator payment/commission, built-in sponsorship funding, and GPS/receipt verification of every interaction;
- the production-used Ops Theatre orientation described invented weekly missions, instant rewards, fixed leaderboard behavior, scarce campaign slots, free merchant allowances, automatic payouts/recaps, and secondary Piece royalties as if they were operating facts.

Resolution:
- public role promises now describe recorded demand, configured proof, attributed outcomes, explicit funding/terms and verified evidence without guaranteeing conversion or payout;
- check-in intent, proof verification, issuance, earning and settlement remain separate states;
- the Ops Theatre modal is now a factual role-orientation surface with one real next move and explicit state boundaries;
- scripted weekly outcomes, fake scarcity, fake allowances, guaranteed traffic and browser-era reward promises are removed.

Commits:
- `dd541d06668903f22e03581cd3fe168adcb786f2`
- `00fb3740b9bd4bb9ec2aa491034fbb30fd3a3216`

Status: **Closed**

#### T-030 — Remaining guaranteed-outcome and synthetic funded-supply claims

Files:
- `apps/web/src/pages/ExploreRewards.tsx`
- `apps/web/src/pages/Help.tsx`
- `apps/web/src/pages/MidasBrandSponsorshipProposal.tsx`
- `apps/web/src/pages/CreateProposal.tsx`
- `apps/web/src/components/promocard/MerchantMarginPoolManager.tsx`
- `backend/api/merchantSampling.js`
- `backend/services/bufferDropService.js`
- `backend/api/platform-drops.js`
- `packages/shared/src/value-instruments.ts`
- `apps/web/src/pages/EconomyConcept.tsx`
- `apps/web/src/components/nodes/PromorangNodeHub.tsx`

Finding:
- demand thresholds and locally managed wishlist state were presented as guaranteed deals, customer headcount, foot traffic and attendee attribution;
- local wishlist actions also announced PromoPoint rewards without durable issuance;
- creator/merchant/brand help copy overstated guaranteed payouts, guaranteed traffic and universal proof coverage;
- commercial proposals and simulators presented UGC, visits, ROAS, revenue and product trial as guaranteed outputs rather than targets or scenarios;
- merchant projection math treated full-cap conversion as guaranteed revenue;
- paid sampling graduation promised guaranteed reach;
- platform-buffer services fabricated a funded pool and active paid drops when the database was unavailable, and community-drop creation could return a fake successful active drop without persistence or funding;
- Save & Win/Gem copy preserved principal correctly but collapsed platform denomination, exit rules and withdrawal eligibility into “take it out whenever.”

Resolution:
- demand is presented as demand; threshold ≠ supply, attendance or merchant commitment;
- browser-local wishlist actions no longer claim durable Point issuance;
- public/help/commercial copy now separates targets, attribution, approval, earning and settlement from guarantees;
- calculators and margin cards are labelled as scenarios or projected targets;
- sampling uses configurable paid distribution rather than guaranteed reach;
- buffer pool/drop inventory now fails closed when authoritative storage/funding is unavailable;
- community-drop creation returns unavailable rather than a synthetic funded object;
- funded buffer-drop copy says eligible approved completion can receive the configured reward while funded capacity exists;
- Save & Win keeps principal but exit/hold/withdrawal rules remain explicit;
- 1 USD Gem denomination is not presented as universal immediate cash-out eligibility.

Commits:
- `2e6d47dc0ad294d74632fbf22c9946a14b9e9f12`
- `ab5957bb2dbaaa7fed4f1d499930a131e462e55d`
- `6b9d2172756bb3a6c626a1585fdb2ef66fa8f21e`
- `6684cbca104fe710555b1c042699c1e35e9b8aae`
- `eba5bb14b80391e46d176a718bd1ed42b91e97ca`
- `c2ed759d693f78ccde36e087ff010e4e802c795b`
- `93f3d3336992fabde6d8c43aa72e84921ad140e4`
- `cb9127cc991b3011565c1125b8b32168c3bfc657`
- `557b79c43dc8b4604c59c8c01c20509d815b060b`
- `194bf5658d016346a8fb37f6593074ce9c61a5c5`
- `b955f1b33a3bec484b605a1f129ca089eaea60ac`
- `2f59a8edf1446ceb5b961cdedd8afd5f72d86b51`

Status: **Closed**

#### T-031 — Rewards wishlist fixtures presented as live market demand

Files:
- `apps/web/src/pages/ExploreRewards.tsx`
- `apps/web/src/data/rewardsData.ts`

Finding:
- the Rewards page seeded static merchant/perk requests into a section labelled as live community demand;
- voting and request creation mutated browser component state only;
- those local actions could appear to publish market demand and previously implied Point issuance;
- a `moment.reward` text field was presented as a verified perk / included pass without proving inventory, eligibility, fulfillment or issuance.

Resolution:
- static reward-demand fixtures are limited to development/test mode;
- production Rewards does not substitute local merchant requests when canonical demand is absent;
- production demand creation points to the durable Discover demand flow instead of browser-only state;
- production empty state explicitly says no authoritative reward-demand requests are recorded on the surface;
- local vote/request UI no longer claims Point issuance;
- Moment reward text is labelled as recorded reward terms, with availability and issuance deferred to the Moment's actual rules.

Commits:
- `5c2b0716bdffdb34e2128ea1acb4084126c2247e`
- `258fa28244d04a115ced96df2bb0c9a6b10ec307`

Status: **Closed**


#### T-032 — Discover and Found could manufacture durable success in the browser

Files:
- `apps/web/src/lib/discovery-card.ts`
- `apps/web/src/hooks/useDiscoveryCard.ts`
- `apps/web/src/hooks/useDiscoveryDemand.ts`
- `apps/web/src/hooks/useDiscoveryFound.ts`
- `apps/web/src/components/discovery/DiscoveryPath.tsx`
- `apps/web/src/components/radar/DiscoveryWidget.tsx`
- `apps/web/src/components/discovery/PutUpFoundModal.tsx`
- `apps/web/src/components/discovery/FoundListingCard.tsx`
- `apps/web/src/pages/Discover.tsx`
- `backend/services/peopleExperienceService.js`
- `supabase/migrations/20260918220000_remove_found_listing_fixtures.sql`
- `supabase/migrations/20260918221000_harden_found_claim_atomicity.sql`

Finding:
- Discover persisted a local card unlock before either the API or RPC confirmed a server-issued redemption code, then returned that local object as success if every durable write failed;
- local card rows were merged into city-level card counts and local named intents could become demand state when authoritative reads failed;
- Found creation and claim mutated browser storage first and returned local success after API/RPC failure;
- the Found list always merged two hard-coded seed requests into production and the database migration inserted those same synthetic requests;
- the generic Discovery widget updated vote totals before the vote mutation resolved;
- the Found claim service could fall back to a stale unclaimed row after a failed/racing update and could report a finder slip even when slip insertion failed;
- the SQL claim RPC used `ON CONFLICT DO NOTHING` but could return a newly generated slip code that was never persisted.

Resolution:
- browser storage caches only card unlocks that contain a persisted redemption code;
- production demand/card counts and Found listings now come from authoritative RPC results; fixture/local fallbacks are development-only;
- Discover vote UI waits for the durable vote mutation and separates recorded vote state from PromoCard issuance state;
- a successful vote with failed perk issuance remains a successful vote but shows the perk as not on the card and exposes a retry;
- Found create/claim surfaces remain open and show failure instead of navigating/closing as success;
- Found client mutations write local cache only after durable API/RPC success;
- backend Found mutation errors and races fail closed;
- finder-slip issuance is retry-safe and the SQL claim transaction returns only the redemption code actually stored;
- a forward migration removes the two synthetic Found fixtures and any slips created from them.

Commits:
- `db93e90ae89b2d29184cdb30c6a98eb34413f6ba`
- `df1556bd312a15f156b98ae01bd783d9f2fb8098`
- `43e099b442e1357c09a5171adcde84c00b19f03e`
- `588db03df05b2b9489c4459a8c28c8f8dbd55e0d`
- `c8a788e537a1635160cbcaa5f5030d97253e5002`
- `642b4efec89cb0bda21099c11ad177d78b7b17c2`
- `cd56f52983023609f6fcd6e89768471472d0c316`
- `58fce3fa364564670ec121e0c191b87397f0a586`
- `ccb95ce06030adaa216c892b7f8cfd2eda176670`
- `ef3b72d329c3b3be7207a5bc573a41d48c2e6411`
- `4c2deaeb1196e773aaecccb700c11f5e65eb47c2`
- `e24232ac312a68939ea48dd0f33d2b1bbc50bb3a`
- `ee018fb6a187497c492bcbb9c228ddcfd54c432b`

Status: **Closed**


#### T-034 — Referral and PromoShare distribution could manufacture attribution and performance

Files:
- `backend/api/referrals.js`
- `apps/web/src/lib/promoShareRail.ts`
- `apps/web/src/hooks/usePromoShareRail.ts`
- `apps/web/src/hooks/useReferrals.ts`
- `apps/web/src/components/promoshare/PromoShareAction.tsx`
- `apps/web/src/components/participant/ReferralsSection.tsx`
- `apps/web/src/lib/promoShareRail.test.ts`

Finding:
- the referral API returned demo referral codes when its authoritative store was unavailable;
- the same failure path reported 15 referrals, 80% conversion, USD/Gems/Points earnings, Silver tier status, valid demo referrers and successful tracking;
- affiliate/share routes could therefore look attributable even though no durable referral code existed;
- PromoShare independently synthesized a user referral code from the user id or a fixed `PROMO-VIP876` fallback and stored it in the browser;
- Referral UI rendered missing stats as zero and displayed per-code zero counters even though the code endpoint does not source per-code counters.

Resolution:
- referral API read/write routes now fail unavailable rather than substituting demo codes, metrics, tiers, validation or mutation success;
- OAuth signup remains non-blocking, but explicitly returns `tracked: false` when referral storage is unavailable;
- PromoShare appends `ref=` only when the canonical referral-code endpoint supplied a recorded code;
- reading the current referral code is side-effect free; creation happens only through the explicit create-code mutation;
- generic sharing remains available without pretending attribution exists;
- Referral UI distinguishes source failure from zero activity and no longer presents unsupported per-code counters;
- regression coverage locks the rule that a share URL without a recorded referral code contains no `ref` parameter.

Status: **Closed**


#### T-035 — Primary Discover mixed static catalogue state with live market truth

Files:
- `apps/web/src/pages/Discover.tsx`
- `apps/web/src/hooks/useListingDiscoveryPolls.ts`
- `apps/web/src/hooks/useCityDiscoveryPolls.ts`
- `apps/web/src/lib/discovery-demand.ts`
- `apps/web/src/hooks/useDiscoveryDemand.ts`
- `apps/web/src/lib/discovery-path.ts`
- `apps/web/src/components/discovery/DiscoveryPath.tsx`
- `apps/web/src/components/discovery/DiscoveriesFeedSection.tsx`
- `supabase/migrations/20260918223000_discovery_vote_state.sql`

Finding:
- production Discover initialized and repeatedly merged `getActiveDiscoveryPolls()` from the static design catalogue into live market questions;
- the Places tab and map used `VERIFIED_VENUES` static records rather than the public venue directory;
- Moments missing coordinates could receive curated or default coordinates, creating map pins not sourced from the Moment record;
- “already voted” state survived in browser localStorage independently of `discovery_votes`.

Resolution:
- the primary Discover catalogue is now composed from recorded/newly-created questions and server-backed listing polls only;
- Places use `view_public_venue_directory`; source failure renders unavailable rather than static venues;
- missing Moment/venue coordinates remain missing and are omitted from the map instead of receiving guessed pins;
- public listing/city poll views expose only the current authenticated user’s recorded vote;
- Discovery path state derives “already voted” from that authoritative vote plus successful votes in the current session, not localStorage;
- recorded options are disabled and identified as the current user’s vote.

Status: **Closed**


#### T-036 — Create Moment trusted static venue and browser/URL demand context

Files:
- `apps/web/src/components/venues/SmartVenuePicker.tsx`
- `apps/web/src/pages/CreateMoment.tsx`
- `apps/web/src/lib/discovery-found.ts`
- `apps/web/src/lib/discovery-found.test.ts`

Finding:
- Create Moment sourced venue suggestions from the static `VERIFIED_VENUES` design catalogue and labelled them verified partner venues;
- selecting one could auto-fill address, coordinates and capacity as current facts;
- a `?found=` URL or browser-cached Found row was enough for the form to say “Claimed demand” and “People already asked…” without re-reading recorded market state;
- a `?found=` query parameter also bypassed the normal sign-in gate before entering the creation form.

Resolution:
- venue suggestions now read `view_public_venue_directory`;
- directory rows are labelled from recorded verification/claim state rather than universally as verified partners;
- the picker fills only recorded identity/location and does not infer capacity or coordinates that the public directory does not expose;
- manual venue entry remains available when the directory is empty or unavailable;
- Found workspace links carry the recorded city so the create flow can re-read the correct market record;
- Create Moment re-loads the Found record through the experience API and describes it as recorded demand only when that row is returned as claimed;
- URL title/location values may prefill a draft but are not treated as evidence of demand when the source record cannot be verified;
- authentication is required for Create Moment even when a `found` parameter is present, while the handoff URL is preserved through sign-in.

Status: **Closed**


#### T-037 — PromoShare still advertised synthetic daily, squad and pre-loaded-card mechanics

Files:
- `apps/web/src/pages/PromoShare.tsx`
- `apps/web/src/components/StoryGamificationRail.tsx`
- `apps/web/src/components/RightUtilityRail.tsx`
- `apps/web/src/components/TeamSlashModal.tsx`
- `apps/web/src/components/promoshare/CardDropCreator.tsx`
- `apps/web/src/pages/CardDropClaim.tsx`

Finding:
- the production `/promoshare` route still rendered a mock story rail with fictional daily wheel/streak/scene/drop activity;
- the right utility rail presented a fabricated active squad slash, countdown, friend progress, daily Piece boost and named saved perks;
- PromoShare opened `TeamSlashModal`, which invented a 15-minute deal, 1/3 joined state, target price and referral URL without a campaign or server record;
- `CardDropCreator` generated browser-only “pre-loaded” dollar balances and claim links, then promised 5% commission and +25% recharge without funding, issuance or settlement records;
- the claim receiver itself was already truth-safe: `/claim-drop` ignores legacy amount/from/code parameters and only opens a recorded live drop by slug.

Resolution:
- production PromoShare no longer mounts the mock story rail, synthetic right rail, squad-slash modal or browser-generated Card Drop creator;
- the PromoShare hero no longer advertises the unsupported squad-slash action;
- the legacy mock rail/slash/drop components are explicitly development-only so an accidental future import cannot expose them in production;
- authoritative PromoShare cycle, entry, draw and history data remain unchanged;
- generic sharing remains available without implying a reward, funded card balance or attributable conversion.

Status: **Closed**


#### T-038 — Discover promoted chronological inventory as “Featured” and “Trending”

Files:
- `apps/web/src/pages/Discover.tsx`
- `apps/web/src/components/discovery/DiscoverRightRail.tsx`

Finding:
- Discover orders filtered Moments by recorded start time, but labelled the first row “Featured” without a featured-placement source;
- the same chronological list was sliced into a “Trending in … / Hot” rail without popularity, trend or heat evidence.

Resolution:
- the primary hero is labelled **Up next**, matching the actual chronological selection rule;
- the right rail is labelled **Up next in {city} / By start time** and explicitly states it is not a popularity or trend ranking;
- stale unused mock social/gamification imports were removed from Discover.

Status: **Closed**


#### T-039 — Saved and Activity utilities reported browser-only success / false emptiness

Files:
- `apps/web/src/pages/Saved.tsx`
- `apps/web/src/components/SavedCollections.tsx`
- `apps/web/src/components/SaveButton.tsx`
- `apps/web/src/pages/Activity.tsx`
- `apps/web/src/components/ActivityFeed.tsx`
- `apps/web/supabase/migrations/20260202_social_features.sql`
- `supabase/migrations/202604200006_feed_generation_function.sql`

Finding:
- `/saved` rendered a local default collection, created/deleted temporary browser collections, and showed success toasts despite TODO-only persistence;
- the shared Save button toggled saved state optimistically and reported “Saved!” / “Removed” without writing `saved_moments`;
- `/activity` converted personalized-feed RPC failure into an empty feed;
- the Activity feed invented unread/read state locally and exposed “Mark all read” even though the personalized `activity_feed` RPC has no read-receipt contract for those rows.

Resolution:
- Saved reads the existing private `saved_moments` ledger and joins recorded Moment rows;
- source failure is rendered as unavailable, not an empty collection;
- custom collection labels derive from recorded `collection_name`; because the schema has no standalone empty-collection record, the UI no longer pretends an empty collection can be created;
- deleting a custom collection label moves its rows back to `Saved` instead of deleting saved Moments;
- SaveButton reads, inserts and deletes `saved_moments` and changes UI state only after a successful write;
- Activity RPC failure remains an error with retry;
- personalized Activity is read-only until its actual `activity_feed` rows have an authoritative read-receipt contract; local unread dots and fake mark-read actions are removed.

Status: **Closed**


#### T-040 — Following collapsed source failures into empty states and exposed non-functional filters

Files:
- `apps/web/src/pages/Following.tsx`
- `supabase/migrations/202609110004_aftrhrs_guest_moment_going.sql`

Finding:
- failure loading the follow graph, followed profiles, followed Moments or participation counts was logged but rendered as a normal empty Following state;
- per-user Moment counts and suggestion stats treated count-query failure as `0`;
- participant counts used a fallback helper that could degrade to a narrower raw table count or `0`, omitting guest/event participation represented by the canonical public Moment directory;
- the visible **New** filter performed no filtering at all;
- suggested-user decoration implied ranking/popularity without a dedicated ranking source.

Resolution:
- Following now exposes source failure explicitly with retry rather than presenting “not following” or “no Moments”;
- followed-user Moment counts and suggestion counts throw on source failure instead of becoming zero;
- displayed going counts come from `view_public_moment_directory.participant_count`, which combines account joins, guest RSVPs and event participations;
- when a Moment has no corresponding public-directory count row, participation is unknown rather than coerced to zero;
- **Soon** means a recorded start within the next three days and **New** means the Moment record was created within the last seven days;
- unsupported popularity/star decoration was removed from suggestions.

Status: **Closed**


#### T-041 — Creator directory mixed fabricated identities, verification and performance proof into production

Files:
- `apps/web/src/pages/Creators.tsx`

Finding:
- `/creators` merged four sample creator identities into the live creator-role directory;
- the sample identities included invented bios, locations, tags, audience-movement counts, claim counts and ticket counts;
- real creator profiles without metrics received fallback values such as `120+ Moves`, `45 Claims` and `12 Tickets`;
- every row was labelled **Verified Distributor** even though creator-role membership is not a verification record;
- the directory claimed it was ranked by verifiable movement/claims/engagement while the actual database query ordered profiles alphabetically;
- profile-source failure could be replaced by the sample directory instead of remaining unavailable.

Resolution:
- production creator discovery now contains only accounts with a recorded `creator` role and a recorded profile;
- profile query failure throws and renders an explicit unavailable state with retry;
- sample creators and all fallback movement/claim/ticket figures are removed;
- creator-role membership is labelled as **Creator role**, not verification;
- the directory states its actual ordering rule and makes no popularity/performance ranking claim;
- category/tag filters that depended on sample-only tags are removed;
- public performance proof is withheld until a dedicated recorded metric source exists;
- creator-value copy now distinguishes eligible recorded attribution/reward/draw outcomes from universal guarantees.

Status: **Closed**


#### T-042 — UserProfile and FollowButton converted source gaps into false identity/social state

Files:
- `apps/web/src/pages/UserProfile.tsx`
- `apps/web/src/components/FollowButton.tsx`

Finding:
- profile-source failure was indistinguishable from “profile not found”;
- the current-user auth fallback invented a default bio and location that had never been saved as profile facts;
- hosted/attended count query errors were not checked, while follower/following counts were hard-coded to zero;
- public profiles exposed Attended and Saved tabs even though those histories were not backed by a public contract; Saved always rendered empty;
- hosted/attended tab query failure was converted to a normal empty section;
- FollowButton ignored follow-status read errors and treated them as “not following,” allowing the UI to expose the wrong next mutation.

Resolution:
- profile-source failure has a distinct unavailable state; “not found” is reserved for a successful read with no profile record;
- auth fallback for the current account supplies only account-backed identity fields and leaves unsaved bio/location empty;
- public hosted count comes from the public Moment directory and follower/following counts come from `user_follows`; count-source failure is shown as unavailable rather than zero;
- attended count/history and saved history are account-owner-only on this surface;
- own Saved history reads the private `saved_moments` ledger;
- Hosted uses the public Moment directory rather than unrestricted Moment rows;
- tab loading/source failure is explicit and cannot masquerade as an empty section;
- FollowButton verifies current follow state before enabling follow/unfollow and disables mutation when that read fails.

Status: **Closed**


#### T-043 — Creator share feed published static polls/Moments and invented reward promises

Files:
- `apps/web/src/components/creator/ThingsWorthSharingFeed.tsx`
- `apps/web/src/hooks/useListingDiscoveryPolls.ts`
- `apps/web/src/components/promoshare/PromoShareAction.tsx`

Finding:
- the production creator share feed sourced discovery cards from static `DISCOVERY_POLLS` and Moment cards from `CURATED_KINGSTON_MOMENTS`;
- those fixture objects were presented as shareable/live inventory on `/creators`;
- static poll vote counts were presented as current response counts;
- share CTAs attached fixed “25 points + 1 ticket” and “50 points + 2 tickets” reward rules without a source-backed eligibility configuration;
- missing live inventory could therefore be obscured by fixture supply.

Resolution:
- discovery-share cards now come from `view_public_listing_discovery_polls` through `useListingDiscoveryPolls`;
- Moment-share cards now come from `view_public_moment_directory` and only include recorded upcoming active Moments;
- source loading/failure/empty states remain explicit and are never replaced by fixtures;
- recorded poll response counts remain visible because they come from the public poll view;
- creator-share actions no longer pass fixed reward/ticket rules; they remain generic PromoShare routes until a recorded reward rule exists;
- share copy identifies recorded signals/Moments rather than “live” or reward-bearing inventory by assumption.

Status: **Closed**


#### T-044 — Creator release routes mixed seeded compatibility, false-zero failures and premature publish success

Files:
- `apps/web/src/hooks/useContentDistribution.ts`
- `apps/web/src/pages/ContentDrops.tsx`
- `apps/web/src/pages/ContentDropDetail.tsx`
- `apps/web/src/components/creator/CreatorMissionsHub.tsx`
- `backend/api/content-distribution.js`
- `backend/services/contentDistributionService.js`

Finding:
- the canonical Content Drop detail hook still consulted the seeded Content Drop and seeded leaderboard modules before the live API, so production truth depended on an environment gate rather than the routed source contract itself;
- Content Drop list, account-list, context and leaderboard failures could render as an empty market, no releases, no context or zero performance;
- the publish form created an `active` campaign first and attached its primary asset second, while the campaign mutation announced “Content Drop launched” after only the first write;
- an asset-write failure could therefore leave an incomplete campaign active while the UI had already reported launch success;
- the legacy `CreatorMissionsHub` still contained fabricated brands, cash bounties, claim counts, deadlines and browser-only claim success even though the current Creator dashboard no longer mounted it.

Resolution:
- canonical Content Drop hooks now read only the live content-distribution API; seeded records remain isolated to explicit development/test modules rather than the production route contract;
- HTTP status is preserved so not-found can remain distinct from source unavailable;
- live-market, account, context and leaderboard failures render explicit unavailable/retry states; leaderboard-dependent metrics render unknown rather than fabricated zero;
- content-distribution service reads fail unavailable when the database client is absent, and the context endpoint now propagates individual source-query errors instead of converting them into empty related-object state;
- release publication is staged `draft → asset attached → active`;
- the campaign stays non-public if the asset or activation step fails, and the UI reports an incomplete draft rather than successful publication;
- the generic create hook now reports only that the release record was created; the page reports “Release published” only after the asset write and owner-only activation transition both succeed;
- the legacy Creator Missions compatibility component delegates to the real release workspace, eliminating the fabricated bounty board if an older import is re-mounted.

Status: **Closed**


#### T-045 — Developer console fabricated live credentials and API execution

Files:
- `apps/web/src/pages/DeveloperConsole.tsx`
- `apps/web/src/pages/ForDevelopers.tsx`
- `backend/api/v1/keys.js`
- `backend/middleware/apiKeyAuth.js`
- `backend/migrations/20260824_developer_api_keys.sql`

Finding:
- the production-routed Developer Console initialized with a fabricated `pk_live_` credential, generated new “production” secrets entirely in the browser, and reported revoke/create success without an authoritative key write;
- the backend key endpoints returned mock key records, mock plaintext credentials and demo revoke success when the database client was unavailable;
- API-key authentication accepted any supplied API key with wildcard scopes when the key store was unavailable;
- the public developer page labelled a timer-driven static response generator as a live headless playground and displayed successful claim/operator payloads without executing those actions.

Resolution:
- the console now lists, creates and revokes only through the authenticated `/api/v1/keys` source;
- signed-out and source-unavailable states are explicit; no demo key is substituted;
- plaintext keys are shown only when the server successfully creates a persisted key record, while the list renders masked records only;
- backend key endpoints fail unavailable when the key store is absent, validate environment/scopes, list active records only, and confirm a matching active record before reporting revoke success;
- API-key middleware now fails unavailable rather than granting mock wildcard authority when its source is absent;
- the developer playground is now labelled as illustrative payload examples and does not claim to execute feed, claim, reward or operator mutations.

Status: **Closed**


#### T-046 — Brand analytics and shared media fabricated verification, evidence and performance proof

Files:
- `apps/web/src/components/ImageGallery.tsx`
- `apps/web/src/components/analytics/BrandAnalyticsDashboard.tsx`
- `apps/web/src/components/analytics/EvidenceFeed.tsx`
- `apps/web/src/components/analytics/AutomatedRecap.tsx`
- `apps/web/src/components/brand/BrandEvidencePack.tsx`
- `apps/web/src/components/brand/BrandIntelligenceConsole.tsx`
- `apps/web/src/pages/Analytics.tsx`
- `backend/migrations/20260114_verified_actions.sql`

Finding:
- the shared ImageGallery used on Moment and Discovery detail called every image a “verified attendee” upload and generated random heart/flame counts on each render without uploader, verification or reaction records;
- the production Brand analytics route mounted a legacy dashboard whose EvidenceFeed unconditionally generated fake people, GPS verification, locations and reward issuance and labelled the result “Live Verified Actions / Streaming Evidence”;
- its recap injected fake visual evidence, called aggregate participants “verified actions,” asserted a fixed “42% better than average ad spend,” projected 500 more verified actions, and exposed unimplemented share/scale controls as if they were supported decisions;
- the legacy dashboard could also collapse its analytics source failure into zero aggregate metrics and hard-coded every campaign row as Active;
- the existing `verified_actions` table is user-owned under RLS and is not a valid cross-user Brand visual-evidence feed, so repurposing it would overstate access/provenance.

Resolution:
- shared media now displays only its recorded caption plus neutral record provenance; random reactions and unsupported attendee-verification language are removed;
- the historical Brand analytics component now delegates to the canonical `BrandEvidencePack`, preserving one Brand evidence model instead of a second weaker dashboard;
- the legacy EvidenceFeed remains a compatibility component but renders an honest source-boundary state rather than synthetic evidence;
- the legacy recap renders only values/evidence supplied by a caller and no longer adds fake benchmarks, projections, agency branding, verified-outcome claims or unsupported share/scale actions;
- the canonical Brand intelligence summary renders campaign/result counts as unknown on source failure and provides retry rather than substituting zero;
- no new evidence backend was introduced because the existing production Brand pack already composes authenticated O2O analytics and campaign records.

Status: **Closed**


#### T-047 — Identity visibility claimed privacy changes without a durable write

Files:
- `apps/web/src/components/human/IdentityMarkers.tsx`
- `apps/web/src/hooks/useStakeholderLeverage.ts`
- `apps/web/src/components/discovery/PublicProfileView.tsx`

Finding:
- the confirmed Identity Marker visibility switch changed no database state at all; its handler contained a TODO but still toasted “Made public” / “Made private”;
- identity-marker source failure was rendered through the same path as an empty identity history;
- marker confirmation updated by marker id without also scoping the write to the authenticated owner in the client mutation;
- the legacy PublicProfileView loaded the viewer’s private journeys and identity markers while viewing another profile, waited on those unrelated private queries, then did not use them in the rendered target profile;
- that public-profile component also treated a profile-source failure as “not found or private” and could expose Follow/Following actions before a reliable follow-state read.

Resolution:
- Identity Marker visibility now writes `is_public` through an authenticated owner-scoped mutation and reports success only after the database update succeeds;
- marker confirmation is owner-scoped and now exposes mutation failure instead of silently leaving the editor in an ambiguous state;
- identity-marker read failure renders unavailable with retry rather than “your identity is forming”;
- PublicProfileView no longer queries the viewer’s private journeys/markers for another person’s profile;
- profile-source failure is distinct from not-found/private, and follow mutation controls remain disabled when follow state is loading or unavailable.

Status: **Closed**


#### T-048 — Wallet pass locally forged PromoKeys after ignored conversion failures

Files:
- `apps/web/src/pages/Wallet.tsx`
- `apps/web/src/components/wallet/DigitalWalletPass3D.tsx`
- `apps/web/src/components/wallet/PromoKeyForgeModal.tsx`

Finding:
- the production Wallet mounted a 3D pass with a second PromoKey conversion path separate from the Wallet's canonical conversion mutation;
- the legacy forge modal attempted a direct RPC but only logged RPC errors, then used a timer to declare “Successfully forged,” subtract Points and add PromoKeys in local React state regardless of whether a durable conversion occurred;
- its success state described minting as settled and showed a locally calculated new key balance;
- the 3D pass therefore could disagree with the authoritative Wallet ledger and visually manufacture spendable PromoKeys;
- the pass also used a fabricated fallback member code and “Verified Member / Active” identity language when those facts were not supplied by an account/pass source.

Resolution:
- the 3D pass no longer owns local Points/PromoKey balances and renders the recorded balances supplied by Wallet;
- its conversion CTA opens the Wallet's existing authenticated `/economy/convert/points-to-promokeys` flow, which reports success only after the API accepts the conversion and then refreshes authoritative balances;
- the duplicate forge modal is retained only as a non-mutating compatibility boundary and cannot mint, settle or alter local balances;
- fabricated member-id fallback and unsupported verified/active labels were removed from the pass.

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
