# PROMORANG UI V2 Migration Plan

Base: `andre/local-working-state`
Foundation branch: `andre/ui-v2-foundation`

## Migration philosophy

This is a staged product-interface migration, not a screenshot recreation and not a rewrite of PROMORANG functionality.

Every phase must preserve:

- auth and role resolution;
- permission boundaries;
- stakeholder-success contracts;
- data semantics;
- deep-link behavior;
- valid existing routes;
- backend contracts unless a separately documented change is required.

Each phase should reduce visual/system ambiguity rather than create another coexisting pattern.

---

## Phase 0 — Foundation

### Deliverables

- V2 semantic token layer.
- Dark authenticated canvas tokens.
- Role accent tokens.
- spacing/radius hierarchy.
- sans-first product typography classes.
- reduced-motion baseline.
- `PageCanvas`.
- `PageLead`.
- `OutcomeSurface`.
- `NextMove`.
- `OutcomeProgress`.
- `ProofBlock` / `ValueBlock`.
- `WorkspaceSwitcher`.
- `ConsequenceReceipt`.
- component tests.
- design/migration documentation.

### Non-goals

- no wholesale legacy-theme override;
- no role-dashboard rewrite;
- no routing changes;
- no new product feature;
- no automatic deployment.

### Exit criteria

- build/lint/tests pass;
- existing screens remain visually stable until explicitly opted into V2;
- new V2 components use semantic tokens;
- basic semantic/accessibility tests pass.

---

## Phase 1 — Shell and workspace context

### Target

Refactor the responsibilities currently concentrated in `DashboardLayout.tsx` without changing route behavior.

### Proposed structure

```text
promorang-v2/shell/
  PromorangAppShell.tsx
  ProductChrome.tsx
  WorkspaceSwitcher.tsx
  DesktopRoleNav.tsx
  MobileRoleNav.tsx
  RouteContextHeader.tsx
  PageOutlet.tsx
```

### Responsibilities to separate

1. user/workspace context;
2. role navigation configuration;
3. desktop chrome;
4. mobile chrome;
5. route metadata;
6. page rendering/presentation exceptions;
7. demo-only chrome.

### Rules

- keep existing route destinations authoritative;
- keep existing role resolution authoritative;
- do not move business logic into presentation components;
- route presentation should be owned by the route/page, not a growing list of shell exceptions;
- keep mobile primary destinations <= 5 where possible.

### Workspace model

Workspace must represent role + organization/client context together.

Examples:

- Personal / Participant
- Creator / individual creator workspace
- Merchant / specific business
- Brand / specific organization
- Agency / client context
- Admin / platform context

Switching workspace should change role-aware navigation and home context together.

### Start page preference

Implement only after persistence is designed safely.

Required precedence:

1. explicit deep-link intent;
2. saved valid start page for current workspace;
3. role default.

Persistence work must include:

- schema migration;
- generated Supabase type update;
- RLS review;
- hook/query mutation;
- Settings UI;
- path validation by role/workspace;
- post-login resolver tests.

Do not store arbitrary unvalidated URLs.

---

## Phase 2 — Participant flagship

### Target surfaces

- `PeopleHome` / canonical participant home;
- canonical Discover entry;
- PromoCard preview;
- recent activity/proof.

### First viewport contract

The participant should immediately understand:

- what is worth doing now;
- what they currently have access to;
- what recently happened;
- the next useful action.

### Reduce

- explanatory ecosystem panels;
- simultaneous teaching of Scenes/Missions/Guilds/Crews/Gems/etc.;
- duplicate progress/gamification layers;
- card grids whose items have equal visual weight.

### Introduce

- photographic opportunity lead;
- dominant NextMove;
- PromoCard preview;
- recent ConsequenceReceipt;
- contextual discovery beneath primary action.

---

## Phase 3 — Signature objects

### PromoCard V2

PromoCard represents current useful possession/access, not merely balances.

Must support states such as:

- active access;
- upcoming access;
- used/verified;
- expired;
- revoked/cancelled;
- offer/perk;
- invite/pass.

### Consequence Receipt

Persistent proof of what occurred and who received what value.

Minimum anatomy:

- action/event;
- time/status;
- verified outcome;
- stakeholder value;
- counterparty consequence when relevant;
- next action.

### Acceptance

A signature object should be recognizable as PROMORANG even when removed from a dashboard context.

---

## Phase 4 — Merchant commercial reference

Preserve the existing outcome-first Merchant architecture.

Primary navigation remains conceptually:

- Home
- Promotions
- Customers
- Sales & Results
- Business

### Merchant Home

Home is for doing, not analyzing.

Dominant choices should remain ordinary business outcomes:

- get more customers;
- bring customers back;
- fill a slow period;
- increase spend;
- get bookings;
- generate content/reviews;
- reward existing customers.

### Results

Results owns deeper analytics.

Never show transaction/revenue claims when transaction value has not been captured.

---

## Phase 5 — Creator workstream

Replace permanent toolbox exposure with progressive work state:

1. available opportunity;
2. accepted/current work;
3. review/approval;
4. live attribution;
5. settlement;
6. stronger next opportunity.

Primary user language should be opportunities/work/results/earnings rather than internal object terminology.

---

## Phase 6 — Host lifecycle

Host Home should be lifecycle-aware:

- no Moment → Create;
- upcoming + underfilled → Fill;
- live/day-of → Operate / arrivals;
- ended → Verify;
- verified → Bring people back;
- repeat proof → Partner proof/reinvestment.

Do not show all lifecycle tools at equal prominence all the time.

---

## Phase 7 — Brand decision platform

Permanent journey spine:

**Define outcome → Fund → Launch → Attribute → Determine incremental value → Decide**

Campaigns are executions within that cycle, not the primary mental model.

Brand UI should be calmer than participant/creator surfaces and emphasize decision evidence.

---

## Phase 8 — Admin operations

Admin should be queue-first.

Command Center is the operating model.

Default questions:

- what needs attention?
- what is highest priority?
- what can I resolve now?
- did the resolution succeed?

The large underlying capability set remains accessible through search, grouped tools and contextual deep links, but should not be the default cognitive model.

---

## Phase 9 — Secondary surfaces

Migrate remaining routes only after their parent role/workflow is established.

Examples include:

- wallet;
- saved;
- activity;
- people;
- crews/guilds;
- advanced analytics;
- experimental economy surfaces;
- creator content libraries;
- deep admin tools.

A secondary route should inherit the relevant role/workspace shell and V2 semantic primitives.

---

## Phase 10 — Legacy cleanup

After each migrated journey, identify replaced visual APIs.

For each replacement:

1. list callers;
2. migrate active callers;
3. mark legacy component/style deprecated;
4. remove after no active use remains;
5. update docs so agents do not rediscover obsolete patterns.

Particular legacy patterns to review include generic glow/gradient treatments, duplicate card abstractions, route-specific shell exceptions and role-specific hard-coded colors.

---

# Visual QA contract

Canonical screenshot coverage should eventually include:

- Participant Home desktop + mobile;
- PromoCard desktop + mobile;
- Merchant Home desktop + mobile;
- Creator Home;
- Host event-day state;
- Brand Home;
- Admin Command Center;
- onboarding/login role transition.

Target viewports for design QA:

- desktop: 1440×1024;
- mobile: 390×844;

Additional responsive checks should cover narrower and wider widths; the canonical screenshots are references, not the only supported viewports.

# Accessibility gate

Before a migrated journey is complete, verify:

- visible focus;
- keyboard traversal;
- appropriate landmarks/headings;
- accessible names;
- status/error announcement where dynamic;
- target sizing;
- reduced-motion behavior;
- contrast;
- tab/menu/dialog semantics from existing primitives;
- loading, empty, error, cancellation and recovery behavior.

# Proof/data integrity gate

UI wording must distinguish:

- verified fact;
- calculated fact;
- attributed fact;
- estimate/inference;
- unavailable metric.

Do not visually celebrate a proxy as if it were a verified stakeholder outcome.

# Per-phase PR template

Every migration PR should answer:

1. Which user journey was migrated?
2. What V1 patterns were replaced?
3. What business/product behavior intentionally stayed unchanged?
4. What loading/empty/error/success/cancel/recovery states were covered?
5. What desktop/mobile evidence was checked?
6. What tests changed?
7. What legacy APIs remain and why?
8. What remains explicitly unverified?
