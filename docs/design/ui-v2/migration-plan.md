# PROMORANG UI V2 Migration Plan

Base: `andre/local-working-state`  
Migration branch: `andre/ui-v2-foundation`

## Current status

### Phase 0 — Foundation: implemented; runtime proof now available

Implemented:

- V2 semantic token layer and dark authenticated canvas;
- semantic role accents;
- spacing/radius/type hierarchy;
- reduced-motion baseline;
- `PageCanvas`, `PageLead`, `OutcomeSurface`;
- `NextMove`, `OutcomeProgress`, `ProofBlock`, `ValueBlock`, `EvidencePair`;
- `WorkspaceSwitcher`;
- `ConsequenceReceipt`;
- `PromoCardV2`;
- canonical `OpportunityCard`;
- account-level validated landing-page preference;
- focused tests for V2 semantics and outcome resolvers.

### Phase 1 — Participant shell canary: implemented

`AppLayout.tsx` uses `PromorangAppShell.tsx` only for the Participant role.

Merchant, Creator, Host, Brand, Agency and Admin continue using the proven `DashboardLayout.tsx` until authenticated browser review supports a shell cutover.

Local Participant shell comparison:

- `?ui=v1` persists legacy Participant chrome on that device;
- `?ui=v2` clears the override and restores V2 Participant chrome.

The legacy shell remains intact as a rollback path.

### Phase 2 — Participant Home: implemented

`PeopleHome.tsx` follows:

**Next move + PromoCard → Outcome progress → Proof/Value → Consequence Receipt → Around you**

The redundant `RoleJobFirstGuide` has been removed from the Participant path so the home itself owns the next-move hierarchy.

### Phase 3 — Signature objects: full PromoCard presentation migrated

The full `/card` route now follows:

**Card → Use now → What you have → Available to add → What comes next → Proof/value**

Existing fulfilment/redemption behavior remains wired through current helpers/components, including:

- code / merchant validation;
- QR issuance;
- manual, automatic and shipping flows;
- expiry and recorded-use states;
- copy-code dialog and focus return;
- card aim/filtering;
- nearby/next benefits;
- points/keys;
- memberships and community/world context;
- expired history.

### Phase 4 — Discover / Opportunity grammar: incremental migration started

`LivePerkCard` renders through canonical `OpportunityCard` while preserving destination resolution and benefit-presentation helpers.

Search, tabs, filters, map, polls, Moments and acquisition flows remain on the existing implementation.

### Phase 5 — Merchant commercial reference: Home canary implemented

Only `/dashboard?tab=home` is canaried to `MerchantOutcomeHomeV2`.

Journey:

**Business context → Next move → Business goal → Success trail → Proof/value → Live promotions**

Success trail:

**Business ready → Promotion live → First verified customer → Business value → Repeat customer → Positive economics**

`merchant-outcome.ts` is a pure resolver with tests. Repeat-customer and positive-economics stages are never inferred from redemption counts alone. Attributed sales remain unavailable until transaction value is captured and attributable.

Existing Promotions, Customers, Sales & Results and Business tabs remain authoritative.

### Phase 6 — Creator workstream: presentation migrated conservatively

Journey:

**Choose useful work → Create/get approved → Cause verified action → Settle value → Earn stronger repeat work**

The wrapper does not currently have authoritative approval/attribution/settlement/repeat facts, so no later stage is fabricated. Existing Creator consoles remain accessible as compact secondary tabs.

### Phase 7 — Host lifecycle: presentation migrated conservatively

Journey:

**Create Moment → Fill it → Run it → Verify attendance → Bring people back → Prove value to partners**

Hosted-Moment existence is the only fact used to advance the lifecycle. Attendance, live-operation success, repeat behavior and partner proof are not inferred.

### Phase 8 — Brand decision platform: Home canary implemented

Brand Home now uses `BrandOutcomeHomeV2` when no deeper Brand tab is requested.

Decision spine:

**Customer outcome → Funded/fulfillable supply → Activation live → Attributed action → Incremental value → Scale/modify/stop**

Truthfulness rules:

- a recorded budget does **not** prove funds or inventory are secured;
- redemptions can support attributable-action evidence but do **not** prove sales or incrementality;
- incremental value remains unavailable until approved transaction, margin, lift or other value evidence exists.

`brand-outcome.ts` contains the pure decision resolver and has focused tests.

A legacy demo metric in `useBrandStats()` that calculated `attributedSales = totalRedemptions * 42` has been removed. `attributedSales` is now explicitly unavailable without transaction-value evidence.

Existing Brand tabs and consoles remain authoritative for campaigns, opportunities, creators/distribution, attribution/proof and intelligence/economics.

### Phase 9 — Agency client-outcome workflow: presentation migrated

Agency follows:

**Client connected → Activation live → Verified client outcome → Proof packaged → Repeat client work**

Existing client switching, relationship removal, Quick Add Client and impact reporting remain intact. Recorded campaign redemptions are treated as attributable actions, not automatically client revenue or business lift.

### Phase 10 — Admin queue-first Command Center: presentation migrated

`AdminCommandCenter.tsx` retains existing access checks, query sources, routes and refresh behavior, but now presents:

**Highest-priority work → Remaining operating queue → Responsibilities → Platform evidence**

One priority queue dominates instead of every administrative capability receiving an equal dashboard card. Platform totals are explicitly contextual evidence rather than targets or success claims.

Admin remains on the proven authenticated shell.

## Build / deployment validation

The web Vercel project originally exposed repository-level native dependency/install failures before Vite loaded application code:

1. missing `@esbuild/linux-x64` for `esbuild@0.21.5`;
2. missing SWC Linux native binding for `@vitejs/plugin-react-swc`;
3. a bad deep import resolution for `@promorang/shared/stakeholder-success` caused by the base alias pointing directly to `packages/shared/src/index.ts`.

Repairs committed:

- explicit `@esbuild/linux-x64@0.21.5` optional dependency;
- explicit `@swc/core-linux-x64-gnu@1.15.11` optional dependency;
- explicit Vite alias for `@promorang/shared/stakeholder-success` before the base shared alias.

### Current result

Vercel preview deployment `dpl_5fFLWbv8XMLn9AWmnYZc4Ac6s149` for commit `12fd6f6e8692cd58f564c7e7dce97022497aad83` completed successfully with state **READY**.

The deployed preview is:

`https://promorang-dkkyyxwbu-andre-millwoods-projects.vercel.app`

The root route and `/join` both return the deployed SPA successfully over HTTP.

**The build gate is now passed. Authenticated browser/visual QA remains required before merge or production rollout.**

## Runtime acceptance order

1. Participant `/dashboard?ui=v2` versus `/dashboard?ui=v1`;
2. full `/card` fulfilment states;
3. `/discover?tab=perks` routing and Opportunity presentation;
4. Merchant `/dashboard?tab=home` and links into existing Merchant tabs;
5. Creator default and query-param tabs;
6. Host zero-Moment and hosted-Moment states;
7. Brand Home and deeper Brand tabs;
8. Agency client switching/removal and impact views;
9. Admin `/admin?tab=command` across access levels;
10. desktop 1440×1024;
11. mobile 390×844;
12. keyboard, focus, reduced-motion and recovery-state checks.

## Proof/data integrity gate

PROMORANG UI must distinguish:

- verified fact;
- calculated fact;
- attributed fact;
- estimate/inference;
- unavailable metric.

Never visually celebrate a proxy as a verified stakeholder outcome. Do not manufacture revenue, incremental value, repeat behavior, funding certainty, attendance or economic success from adjacent activity metrics.

## Legacy cleanup

Do not delete the legacy shell or old primitives merely because V2 equivalents exist.

For each migrated journey:

1. list old callers;
2. migrate active callers;
3. mark replaced patterns deprecated;
4. remove only after zero active use and runtime validation;
5. keep docs current so coding agents do not rediscover obsolete patterns.

## Global quality gate

A migrated journey is complete only when:

- the primary action is immediately understandable;
- stakeholder success is explicit;
- verified facts are distinct from estimates/proxies;
- loading, empty, error, success and recovery states exist;
- desktop and mobile are intentional;
- focus/keyboard/reduced-motion behavior is valid;
- current functionality and permissions do not regress;
- visual proof exists from the running application.
