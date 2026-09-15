# PROMORANG UI V2 Migration Plan

Base: `andre/local-working-state`  
Migration branch: `andre/ui-v2-foundation`

## Current status

### Phase 0 — Foundation: implemented, runtime validation pending

Implemented:

- V2 semantic token layer;
- dark authenticated canvas tokens;
- semantic role accents;
- spacing/radius/type hierarchy;
- reduced-motion baseline;
- `PageCanvas`, `PageLead`, `OutcomeSurface`;
- `NextMove`, `OutcomeProgress`, `ProofBlock`, `ValueBlock`, `EvidencePair`;
- `WorkspaceSwitcher`;
- `ConsequenceReceipt`;
- `PromoCardV2`;
- canonical `OpportunityCard`;
- semantic component tests;
- validated local start-page preference and tests.

### Phase 1 — Participant shell canary: implemented, runtime validation pending

`AppLayout.tsx` uses `PromorangAppShell.tsx` only when the active role is `participant`.

Merchant, Creator, Host, Brand, Agency and Admin remain on the legacy `DashboardLayout.tsx` until each role has been migrated and checked in a real runtime.

This is deliberate risk containment. The legacy shell remains intact as a rollback path.

Local comparison override:

- `?ui=v1` persists the legacy Participant shell on that device;
- `?ui=v2` clears the override and restores the V2 Participant shell.

### Phase 2 — Participant Home: implemented, runtime validation pending

`PeopleHome.tsx` now follows:

**Next move + PromoCard → Outcome progress → Proof/Value → Consequence Receipt → Around you**

The former parallel teaching/playbook/tool layers were removed from the primary presentation without deleting their underlying routes or capabilities.

### Phase 3 — Signature objects: full PromoCard presentation migrated

`PromoCardV2` renders the existing shared PromoCard face model. It does not invent another card state machine.

Authoritative face states remain:

- empty;
- nearby;
- ready;
- returned;
- used;
- expired.

The full `/card` route has been reorganized around:

**Card → Use now → What you have → Available to add → What comes next → Proof/value**

Existing fulfilment and redemption behavior remains wired through current helpers/components, including code/merchant validation, QR, manual/automatic/shipping issuance, expiry, code copy/focus return, card aim, nearby benefits, points/keys, memberships, world/community context, and expired history.

`ConsequenceReceipt` remains the canonical persistent proof/value artifact.

### Phase 4 — Discover / Opportunity grammar: started incrementally

`OpportunityCard` defines the canonical opportunity anatomy:

- context/status;
- title/description;
- optional media;
- value;
- proof requirement/context;
- one primary action.

`LivePerkCard` now renders through `OpportunityCard` while preserving `livePerkHref`, localized benefit presentation, claim/share routing, drop/offer routing and return-to-card behavior.

Discover itself has **not** been wholesale rewritten. Search, tabs, filters, map, polls, Moments and acquisition flows remain authoritative.

### Phase 5 — Merchant commercial reference: Home canary implemented

Merchant continues using the legacy authenticated shell.

Only `/dashboard?tab=home` is canaried to `MerchantOutcomeHomeV2`. Promotions, Customers, Sales & Results and Business still render through the existing `MerchantDashboardV2` implementation.

Merchant Home now follows:

**Business context → Next move → Business goal → Success trail → Proof/value → Live promotions**

The next-move logic is isolated in `merchant-outcome.ts` and tested. It may advance through setup, launch, verification and repeat recommendation from available facts, but it intentionally does **not** mark repeat customer or positive economics complete merely from redemption counts.

Current merchant success trail:

**Business ready → Promotion live → First verified customer → Business value → Repeat customer → Positive economics**

`Attributed sales` remains unavailable (`—`) until transaction value is actually captured and attributable.

### Phase 6 — Creator workstream: presentation migrated, truthfulness conservative

`CreatorDashboardV2` no longer presents six equally weighted toolbox cards.

Primary journey is now:

**Choose useful work → Create/get approved → Cause verified action → Settle value → Earn stronger repeat work**

Because the current dashboard wrapper does not have authoritative facts for approval, attribution, settlement or repeat work, only the first stage is shown as current. No later outcome is fabricated.

Operational tabs remain available as compact secondary navigation:

- Opportunities;
- Current work;
- Results;
- Earnings;
- Audience demand;
- Reputation.

### Phase 7 — Host lifecycle: presentation migrated, truthfulness conservative

`HostDashboardV2` now follows:

**Create Moment → Fill it → Run it → Verify attendance → Bring people back → Prove value to partners**

The existing hosted-Moment count is the only fact used to advance the lifecycle. If at least one hosted Moment exists, `Create Moment` may be marked complete and `Fill it` current. Attendance, operating state, repeat behavior and partner proof are not inferred.

Operational tabs remain available as compact secondary navigation:

- Moments;
- Live arrivals;
- Proof review;
- Results;
- Audience demand;
- Partners.

### Phase 8 — Brand: intentionally held for runtime-backed migration

Brand currently combines new-workspace onboarding, campaign operations, client/agency context, budget, attribution, intelligence and gamification. It is not being wholesale rewritten on source inspection alone.

Target spine remains:

**Define outcome → Fund → Launch → Attribute → Determine value → Decide**

### Phase 9 — Admin: intentionally held for runtime-backed migration

Admin already has a stronger Command Center path. Do not perform a cosmetic rewrite before the queue-first operating model can be runtime-validated.

Target spine remains:

**What needs attention → Resolve → Verify resolved → Next priority**

## Validation status

Build/lint/test and rendered browser proof remain pending.

Current Vercel checks are blocked by the connected account build-rate limit rather than a reported application compile failure. No successful CI/local runtime proof has yet been recorded for the branch.

Tests have been added for semantic primitives, start-page validation, live-perk destination rules and Merchant outcome-state resolution, but their successful execution has not been proven in this environment.

**Do not merge or deploy the V2 branch based on source inspection alone.**

## Runtime acceptance — Participant shell and Home

Verify:

- Participant login and post-login routing;
- saved start-page precedence;
- `?ui=v1` / `?ui=v2` shell comparison;
- role switching away from and back to Participant;
- mobile drawer and bottom nav;
- desktop navigation;
- global search/location/language/theme/profile/sign-out controls;
- deep links;
- keyboard/focus order;
- PWA prompt placement;
- empty/new account;
- nearby benefit;
- claimed/ready PromoCard;
- verified used benefit;
- returned and expired states;
- Moment feed empty/error/loading;
- multi-role account.

## Runtime acceptance — Full PromoCard

Verify representative real fulfilment states:

1. code / merchant validation;
2. QR issuance;
3. manual fulfilment;
4. automatic fulfilment;
5. shipping state;
6. expired benefit;
7. recorded use;
8. clipboard success/failure;
9. dialog close and focus return;
10. aim/filter persistence;
11. nearby and next-benefit flows.

## Runtime acceptance — Discover

Verify:

- live perk claim destinations;
- share destinations;
- used/credential-bearing return to PromoCard;
- drop/offer links;
- tabs/search/filter/map unchanged;
- discovery polls/acquisition unchanged;
- empty/loading/error states.

## Runtime acceptance — Merchant Home

Verify:

- no-location state → Business;
- location but no offers → Promotions;
- live offer with no redemption → verification/business tools;
- verified redemption → repeat recommendation;
- no revenue claim without captured transaction value;
- links back into the existing Merchant tabs;
- active-offer and redemption counts against real data;
- mobile and desktop layout.

## Runtime acceptance — Creator

Verify:

- default Opportunity tab;
- all six existing tool surfaces still reachable;
- query-param tab deep links;
- no false completion of approval, attribution, earnings or repeat work;
- mobile horizontal tab usability.

## Runtime acceptance — Host

Verify:

- zero-Moment state;
- hosted-Moment state;
- create-Moment route;
- all existing Host consoles still reachable;
- query-param tab deep links;
- no inferred attendance/repeat/partner success;
- mobile horizontal tab usability.

## Visual checkpoints

Canonical design QA viewports:

- desktop 1440×1024;
- mobile 390×844.

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
