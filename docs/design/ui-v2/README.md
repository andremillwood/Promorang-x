# PROMORANG UI V2 — Outcome OS

Status: active migration branch (`andre/ui-v2-foundation`).

## Purpose

PROMORANG UI V2 reorganizes the authenticated experience around one invariant stakeholder loop:

**Outcome → Next move → Proof → Value → Repeat**

The goal is not to replace product logic. It is to make existing logic legible, role-appropriate, visually coherent, and easier to operate.

## Product rule

**PROMORANG should understand the complexity so the stakeholder does not have to.**

## Current branch implementation

The branch now includes the first visible application of V2, not only design-system scaffolding.

### Participant Home

`PeopleHome.tsx` now follows:

**Next move + PromoCard → Outcome progress → Proof/Value → Consequence Receipt → Around you**

The previous parallel teaching/tool stack was removed from the Participant Home presentation while preserving the underlying capabilities and routes.

### People experience shell

`ExperienceShell.tsx` now uses the V2 dark canvas, contemporary sans hierarchy and restrained loading/empty states. This reduces the visual mismatch when moving from Participant Home to other people-facing surfaces while their deeper migrations are pending.

### Start page

Users can choose a role-valid local start page in Appearance/Preferences. Post-login precedence is:

1. explicit deep link;
2. saved valid role start page;
3. role default.

The first persistence version is device-local and scoped by user + role. Account-synced workspace persistence remains a schema/RLS follow-up.

## Visual character

The product should feel premium, contemporary, culturally aware, editorial, human, and grounded in real-world activity. It must not become generic SaaS, neon-dashboard UI, crypto UI, a gaming interface, a nightlife-only product, a wall of cards, or a family of unrelated role dashboards.

Default interface chrome is restrained. Signature PROMORANG objects may be expressive: PromoCard, Consequence Receipt, Access Pass, verified Proof, Moment media and Opportunity objects.

A useful rule: **quiet system, expressive objects.**

## Core role outcomes

Participant: find one worthwhile thing → commit → act → receive value → return.

Creator: choose useful work → create/get approved → cause a verified action → settle value → earn stronger repeat work.

Host: create Moment → fill → operate → verify attendance → bring people back → prove value to partners.

Merchant: business ready → promotion live → verified customer action → business value → repeat customer → positive economics.

Brand: define outcome → launch funded/fulfillable supply → attributed action → incremental value → reinvestment decision.

Agency: connect client → activate → prove client outcome → package proof → repeat work.

Admin: work requiring attention → resolve → verify resolution → move to next operational priority.

## Role home contract

Every major stakeholder home should make these questions answerable quickly:

1. Where am I / which workspace am I operating?
2. What am I trying to accomplish?
3. What should I do next?
4. What has PROMORANG actually verified?
5. What value did I or the counterparty receive?
6. What should happen next?

Recommended composition: context/workspace → dominant `NextMove` → compact `OutcomeProgress` → proof + value → relevant current work → secondary history/tools.

## Canonical semantic components

Initial V2 primitives live in `apps/web/src/components/promorang-v2/`: `PageCanvas`, `PageLead`, `OutcomeSurface`, `NextMove`, `OutcomeProgress`, `ProofBlock`, `ValueBlock`, `EvidencePair`, `WorkspaceSwitcher`, and `ConsequenceReceipt`.

New components should describe meaning, not styling. Prefer `ProofSummary` over `GlowCard`, `OpportunityCard` over `GlassPanel`, etc.

## Design token policy

V2 semantic tokens live in `apps/web/src/styles/promorang-v2.css` and are loaded after the legacy stylesheet. Migration is opt-in. Existing screens should not be globally restyled merely because V2 exists.

Do not introduce new hard-coded component colors when an appropriate semantic token exists. Role colors identify context; they do not repaint entire role products.

## Typography and containment

Operational/product UI should use the contemporary sans stack. Expressive serif typography may remain for deliberately editorial surfaces, but it should not be the default product heading grammar.

Do not wrap every section in a bordered card. Prefer typography, spacing, alignment/grouping and divider/background shift before containment.

## Media

Photography is part of the product system, not decoration. Participant/culture surfaces have a high media allowance; Creator/Host medium; Brand selective evidence/campaign media; Merchant analytics low; Admin minimal except review context.

Prefer real, documentary-feeling people/places/objects and controlled contrast.

## Navigation grammar

The exact labels can differ by stakeholder, but primary navigation should preserve a stable conceptual order:

**Home → Work/Opportunity → Relationships/Objects → Evidence/Results → Value/Account**

Only a small number of destinations should be primary at once.

## Multi-role workspace model

Changing workspace should change role context, organization/client context, primary navigation, role home, success contract and available tools/permissions together.

## Accessibility and motion

V2 must preserve or improve visible focus, semantic labels/headings, keyboard navigation, target sizes generally >=44px where practical, status announcements, reduced motion, and meaningful loading/empty/error/cancelled/success states.

Use the least motion needed for context continuity, stage completion, verified success and signature-object continuity. Do not add decorative continuous motion to operational interfaces.

## Migration order

0. Foundation tokens + primitives
1. App shell / workspace model
2. Participant home
3. PromoCard + Consequence Receipt
4. Merchant
5. Creator
6. Host
7. Brand
8. Admin
9. Secondary surfaces
10. Legacy cleanup

## Agent / Cursor instruction

Before creating a new UI primitive, inspect `apps/web/src/components/promorang-v2/`. Use V2 semantic tokens rather than one-off colors. Do not introduce a new top-level navigation concept without demoting/replacing another. Do not expose technical/internal vocabulary when ordinary stakeholder language is available. Do not invent product behavior from design mockups. Treat repository functionality and stakeholder-success contracts as authoritative.
