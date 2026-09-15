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

This is deliberate risk containment, not an incomplete architectural decision.

The V2 shell provides:

1. restrained dark chrome;
2. existing `AuthContext` role/organization workspace state;
3. role-aware desktop navigation;
4. five-or-fewer mobile primary destinations;
5. search/location/language/theme/profile access;
6. semantic role accents;
7. simpler primary-work versus secondary-tools hierarchy;
8. preserved agency-client Brand/Merchant switching behavior.

The legacy shell remains intact as a rollback path.

### Phase 2 — Participant Home: implemented, runtime validation pending

`PeopleHome.tsx` now follows:

**Next move + PromoCard → Outcome progress → Proof/Value → Consequence Receipt → Around you**

Removed from the primary presentation are the former parallel teaching/playbook/tool layers. Their underlying routes and capabilities remain available.

### Phase 3 — Signature objects: started

`PromoCardV2` renders the existing shared PromoCard face model. It does not invent another card state machine.

Authoritative face states remain:

- empty;
- nearby;
- ready;
- returned;
- used;
- expired.

`ConsequenceReceipt` is the canonical persistent proof/value artifact.

The full `/card` route has **not** yet been visually rewritten because it carries real redemption and fulfilment behavior that must be preserved and runtime-tested.

### Phase 4 — Discover / Opportunity grammar: foundation implemented

`OpportunityCard` defines a shared opportunity anatomy:

- context/status;
- title/description;
- optional media;
- value;
- proof requirement/context;
- one primary action.

Discover itself remains on its existing implementation until the new object can be introduced incrementally without breaking search, tabs, map, filters, polls, perks, moments or acquisition flows.

## Validation status

Build/lint/test and rendered browser proof remain pending.

Current Vercel checks are blocked by the connected account build-rate limit rather than a reported application compile failure. No successful CI/local runtime proof has yet been recorded for the new shell.

**Do not merge or deploy the V2 branch based on source inspection alone.**

## Runtime acceptance — Participant shell

Before expanding the shell beyond Participant, verify:

- Participant login and post-login routing;
- saved start-page precedence;
- role switching away from Participant;
- return to Participant;
- organization switching where exposed;
- mobile drawer;
- mobile bottom nav;
- desktop navigation;
- global search;
- location switcher;
- language/theme controls;
- profile access;
- sign out;
- deep links;
- keyboard/focus order;
- PWA prompt placement.

## Runtime acceptance — Participant Home

Verify representative real-account states:

1. empty/new account;
2. nearby benefit available;
3. claimed/ready PromoCard;
4. verified used benefit;
5. returned state;
6. expired state;
7. no confirmed Moments;
8. Moment feed error/loading;
9. multi-role account.

Canonical visual checkpoints:

- desktop 1440×1024;
- mobile 390×844.

## Full PromoCard migration contract

When `/card` is migrated, preserve all current behavior:

- code fulfilment;
- merchant validation;
- QR passes;
- manual/automatic fulfilment;
- shipping state;
- expiry;
- recorded use;
- stored card aim;
- clipboard/copy interactions;
- offer issuance;
- dialogs and recovery states.

V2 information order should become:

**Card → Use this now → Other active value → Used/expired history → Find something else**

## Discover migration contract

Discover should answer:

**What is worth doing, claiming, visiting, joining or helping with now?**

Migration sequence:

1. keep existing data/query behavior;
2. preserve tabs/search/filter/map;
3. introduce canonical Opportunity presentation to live perks first;
4. apply the same grammar to Moments where appropriate;
5. demote secondary/explanatory rails;
6. preserve discovery polling/acquisition flows;
7. verify location/empty/loading/error states.

## Commercial role migration order

### Merchant

Preserve the current outcome-first model:

**Home → Promotions → Customers → Sales & Results → Business**

Home is for doing. Results is for analysis. Never imply revenue when transaction value was not captured.

### Creator

**Available opportunity → Current work → Review → Attributed result → Settlement → Stronger next opportunity**

### Host

**Create → Fill → Operate → Verify → Bring back → Partner proof**

### Brand

**Define outcome → Fund → Launch → Attribute → Determine value → Decide**

### Admin

Queue-first Command Center:

**What needs attention → Resolve → Verify resolved → Next priority**

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
