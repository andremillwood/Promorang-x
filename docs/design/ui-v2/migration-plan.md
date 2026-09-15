# PROMORANG UI V2 Migration Plan

Base: `andre/local-working-state`
Foundation branch: `andre/ui-v2-foundation`

## Current implementation status

### Phase 0 — Foundation: implemented, validation pending

Implemented on the branch:

- V2 semantic token layer;
- dark authenticated canvas tokens;
- role accent tokens;
- spacing/radius hierarchy;
- sans-first product typography classes;
- reduced-motion baseline;
- `PageCanvas`;
- `PageLead`;
- `OutcomeSurface`;
- `NextMove`;
- `OutcomeProgress`;
- `ProofBlock` / `ValueBlock`;
- `EvidencePair`;
- `WorkspaceSwitcher`;
- canonical `ConsequenceReceipt`;
- component tests;
- role-valid local start-page preference and tests.

Build/lint/test proof remains pending because the current Vercel checks are blocked by account build-rate limits, the repository has no GitHub Actions run on the PR, and the available local container cannot currently resolve GitHub for a clean checkout/install.

### Phase 1 — Shell: partially implemented

The shared `ExperienceShell` used by the people-facing journey now uses the V2 dark canvas, sans-first hierarchy, restrained loading/empty states, and V2 spacing/containment. The large `DashboardLayout.tsx` decomposition remains pending so that work can be performed with a real build signal.

### Phase 2 — Participant flagship: first migration implemented

`PeopleHome.tsx` has been migrated from the previous stacked teaching/tool model to the Outcome OS hierarchy:

1. one dominant `NextMove`;
2. PromoCard beside the action rather than buried inside a dashboard;
3. compact outcome progress;
4. proof + value;
5. persistent Consequence Receipt when movement exists;
6. verified current Moments under `Around you`;
7. operating workspaces separated from the personal home.

The migration intentionally removes the old above-the-fold combination of stakeholder loop trail, setup playbook, paper receipt, live-loop actions and other parallel teaching surfaces from Participant Home. Their underlying routes and capabilities have not been deleted.

---

## Migration philosophy

This is a staged product-interface migration, not a screenshot recreation and not a rewrite of PROMORANG functionality.

Every phase must preserve auth and role resolution, permission boundaries, stakeholder-success contracts, data semantics, deep-link behavior, valid existing routes, and backend contracts unless a separately documented change is required.

Each phase should reduce visual/system ambiguity rather than create another coexisting pattern.

---

## Phase 0 — Foundation

### Exit criteria

- build/lint/tests pass;
- existing screens remain stable unless explicitly opted into V2;
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

Examples: Personal / Participant, Creator / individual creator workspace, Merchant / specific business, Brand / specific organization, Agency / client context, Admin / platform context.

Switching workspace should change role-aware navigation and home context together.

### Start page preference

Current branch implements a safe first version using device-local storage namespaced by user + role.

Required precedence is implemented as:

1. explicit deep-link intent;
2. saved valid start page for current role;
3. role default.

Account-synced persistence remains a release follow-up and requires schema migration, generated Supabase type update, RLS review, hook/query mutation, workspace-aware validation, and post-login resolver tests. Do not store arbitrary unvalidated URLs.

---

## Phase 2 — Participant flagship

### Target surfaces

- `PeopleHome` / canonical participant home;
- canonical Discover entry;
- PromoCard preview;
- recent activity/proof.

### First viewport contract

The participant should immediately understand what is worth doing now, what they currently have access to, what recently happened, and the next useful action.

### Implemented on `PeopleHome`

- dominant Next Move;
- PromoCard preview adjacent to the primary action;
- participant success trail;
- proof and value strip;
- persistent consequence receipt when real movement exists;
- verified current Moments with intentionally quieter list treatment;
- personal-vs-operating workspace separation.

### Remaining

- migrate the full PromoCard page to the same V2 object hierarchy without regressing redemption/fulfilment flows;
- migrate canonical Discover around the same opportunity object;
- add screenshot regression coverage once a runnable preview is available.

---

## Phase 3 — Signature objects

### PromoCard V2

PromoCard represents current useful possession/access, not merely balances.

Must support active access, upcoming access, used/verified, expired, revoked/cancelled, offer/perk, and invite/pass states.

### Consequence Receipt

Persistent proof of what occurred and who received what value.

Minimum anatomy: action/event, time/status, verified outcome, stakeholder value, counterparty consequence when relevant, and next action.

### Acceptance

A signature object should be recognizable as PROMORANG even when removed from a dashboard context.

---

## Phase 4 — Merchant commercial reference

Preserve the existing outcome-first Merchant architecture.

Primary navigation remains conceptually Home, Promotions, Customers, Sales & Results, Business.

Home is for doing, not analyzing. Results owns deeper analytics. Never show transaction/revenue claims when transaction value has not been captured.

---

## Phase 5 — Creator workstream

Replace permanent toolbox exposure with progressive work state: available opportunity → accepted/current work → review/approval → live attribution → settlement → stronger next opportunity.

---

## Phase 6 — Host lifecycle

Host Home should be lifecycle-aware: no Moment → Create; upcoming + underfilled → Fill; live/day-of → Operate; ended → Verify; verified → Bring people back; repeat proof → Partner proof/reinvestment.

---

## Phase 7 — Brand decision platform

Permanent journey spine: **Define outcome → Fund → Launch → Attribute → Determine incremental value → Decide**.

Campaigns are executions within that cycle, not the primary mental model.

---

## Phase 8 — Admin operations

Admin should be queue-first. Command Center is the operating model. Default questions: what needs attention, what is highest priority, what can I resolve now, did the resolution succeed?

---

## Phase 9 — Secondary surfaces

Migrate remaining routes only after their parent role/workflow is established. A secondary route should inherit the relevant role/workspace shell and V2 semantic primitives.

---

## Phase 10 — Legacy cleanup

After each migrated journey: list callers, migrate active callers, mark legacy component/style deprecated, remove after no active use remains, and update docs so agents do not rediscover obsolete patterns.

---

# Visual QA contract

Canonical screenshot coverage should eventually include Participant Home desktop + mobile, PromoCard desktop + mobile, Merchant Home desktop + mobile, Creator Home, Host event-day state, Brand Home, Admin Command Center, and onboarding/login role transition.

Target design QA viewports: desktop 1440×1024 and mobile 390×844. Additional responsive checks are required.

# Accessibility gate

Before a migrated journey is complete, verify visible focus, keyboard traversal, appropriate landmarks/headings, accessible names, status/error announcement where dynamic, target sizing, reduced-motion behavior, contrast, tab/menu/dialog semantics from existing primitives, and loading/empty/error/cancellation/recovery behavior.

# Proof/data integrity gate

UI wording must distinguish verified fact, calculated fact, attributed fact, estimate/inference, and unavailable metric. Do not visually celebrate a proxy as if it were a verified stakeholder outcome.

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
