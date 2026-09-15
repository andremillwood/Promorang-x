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
- `PromoCardV2`;
- canonical `OpportunityCard`;
- component tests;
- role-valid local start-page preference and tests.

Build/lint/test proof remains pending because the current Vercel checks are blocked by account build-rate limits, the repository has no GitHub Actions run on the PR, and the available local container cannot currently establish a clean GitHub-backed runtime.

### Phase 1 — Shell: implemented as reversible V2 cutover, runtime validation pending

`AppLayout.tsx` now routes authenticated app traffic through `promorang-v2/shell/PromorangAppShell.tsx`.

The legacy `DashboardLayout.tsx` has deliberately not been deleted or rewritten. It remains available as a rollback reference until V2 has real runtime proof.

The new shell currently provides:

1. restrained authenticated dark chrome;
2. role + organization workspace switching backed by existing `AuthContext` state;
3. role-aware desktop navigation;
4. five-or-fewer mobile primary destinations;
5. search/location/language/theme/profile access;
6. semantic role accents;
7. a simpler primary-work versus secondary-tools hierarchy.

The shared `ExperienceShell` used by people-facing routes also uses the V2 dark canvas, sans-first hierarchy and restrained loading/empty states.

### Phase 2 — Participant flagship: first migration implemented

`PeopleHome.tsx` has been migrated from the previous stacked teaching/tool model to the Outcome OS hierarchy:

1. one dominant `NextMove`;
2. V2 PromoCard beside the action;
3. compact outcome progress;
4. proof + value;
5. persistent Consequence Receipt when movement exists;
6. verified current Moments under `Around you`;
7. operating workspaces separated from the personal home.

The migration intentionally removes the old above-the-fold combination of stakeholder loop trail, setup playbook, paper receipt, live-loop actions and other parallel teaching surfaces from Participant Home. Their underlying routes and capabilities have not been deleted.

### Phase 3 — Signature objects: started

`PromoCardV2` now renders the existing shared PromoCard face model rather than inventing a parallel state machine. Existing model states remain authoritative:

- empty;
- nearby;
- ready;
- returned;
- used;
- expired.

The full `/card` route still uses its existing fulfilment/redemption machinery and has not yet been visually rewritten. This is intentional until runtime validation is available.

`ConsequenceReceipt` is implemented as a persistent verified outcome/value artifact.

### Phase 4 — Discover / Opportunity grammar: foundation implemented

`OpportunityCard` now defines a canonical opportunity anatomy:

- context/status;
- title/description;
- optional media;
- value;
- proof requirement/context;
- one primary action.

The large existing Discover implementation has not yet been rewritten. The next Discover migration should replace presentation patterns incrementally while preserving search, filters, tabs, map, polling, live perks, moments and discovery acquisition behavior.

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

### Runtime acceptance

Before removing the legacy shell, verify:

- role switching;
- organization switching;
- agency client switching;
- participant navigation;
- Merchant/Brand/Creator/Host/Agency navigation;
- Admin command-center access;
- mobile bottom navigation;
- mobile drawer;
- profile/sign-out;
- global search;
- location switcher;
- deep links;
- PWA prompt placement;
- keyboard/focus order.

The legacy layout should remain until these checks pass.

### Start page preference

Current branch implements a safe first version using device-local storage namespaced by user + role.

Required precedence is implemented as:

1. explicit deep-link intent;
2. saved valid start page for current role;
3. role default.

Account-synced persistence remains a release follow-up and requires schema migration, generated Supabase type update, RLS review, hook/query mutation, workspace-aware validation, and post-login resolver tests. Do not store arbitrary unvalidated URLs.

---

## Phase 2 — Participant flagship

### First viewport contract

The participant should immediately understand what is worth doing now, what they currently have access to, what recently happened, and the next useful action.

### Remaining

- runtime-check Participant Home in the new shell;
- add desktop/mobile screenshot regression coverage;
- verify next-move correctness against real accounts with empty, claimed and used states.

---

## Phase 3 — Signature objects

### PromoCard full-page migration

Do not rewrite fulfilment logic. Preserve:

- code flows;
- merchant validation;
- QR passes;
- automatic/manual fulfilment;
- shipping states;
- expiry;
- recorded use;
- stored aim/intention;
- clipboard/copy interactions;
- offer issuance and dialogs.

The V2 full page should use the existing data/state machine and reorganize it into:

**Card → Use this now → Other active value → Used/expired history → Find something else**

### Consequence Receipt

Persistent proof of what occurred and who received what value.

Minimum anatomy: action/event, time/status, verified outcome, stakeholder value, counterparty consequence when relevant, and next action.

---

## Phase 4 — Discover / Opportunity grammar

Discover should become the canonical place to answer:

**What is worth doing, claiming, visiting, joining or helping with now?**

Do not delete existing Discover capabilities just to simplify the page.

Migration sequence:

1. preserve existing tabs/search/filter/map behavior;
2. migrate live perk/opportunity presentation first;
3. migrate Moments into the same hierarchy;
4. demote explanatory/secondary rails;
5. preserve discovery polling/acquisition flows;
6. verify empty/location/loading/error states.

---

## Phase 5 — Merchant commercial reference

Preserve the existing outcome-first Merchant architecture.

Primary navigation remains conceptually Home, Promotions, Customers, Sales & Results, Business.

Home is for doing, not analyzing. Results owns deeper analytics. Never show transaction/revenue claims when transaction value has not been captured.

---

## Phase 6 — Creator workstream

Replace permanent toolbox exposure with progressive work state: available opportunity → accepted/current work → review/approval → live attribution → settlement → stronger next opportunity.

---

## Phase 7 — Host lifecycle

Host Home should be lifecycle-aware: no Moment → Create; upcoming + underfilled → Fill; live/day-of → Operate; ended → Verify; verified → Bring people back; repeat proof → Partner proof/reinvestment.

---

## Phase 8 — Brand decision platform

Permanent journey spine: **Define outcome → Fund → Launch → Attribute → Determine incremental value → Decide**.

Campaigns are executions within that cycle, not the primary mental model.

---

## Phase 9 — Admin operations

Admin should be queue-first. Command Center is the operating model. Default questions: what needs attention, what is highest priority, what can I resolve now, did the resolution succeed?

---

## Phase 10 — Secondary surfaces + legacy cleanup

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
