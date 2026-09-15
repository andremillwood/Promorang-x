# PROMORANG UI V2 — Outcome OS

Status: foundation implementation branch (`andre/ui-v2-foundation`).

## Purpose

PROMORANG UI V2 reorganizes the authenticated experience around one invariant stakeholder loop:

**Outcome → Next move → Proof → Value → Repeat**

The goal is not to replace product logic. It is to make existing logic legible, role-appropriate, visually coherent, and easier to operate.

## Product rule

**PROMORANG should understand the complexity so the stakeholder does not have to.**

The UI should expose stakeholder jobs and verified outcomes before internal platform ontology.

## Visual character

The product should feel premium, contemporary, culturally aware, editorial, human, and grounded in real-world activity.

It must not become:

- generic SaaS;
- neon-dashboard UI;
- crypto UI;
- a gaming interface;
- a nightlife-only product;
- a wall of cards;
- a family of unrelated role dashboards.

## Default versus signature surfaces

Default interface chrome is restrained.

Signature PROMORANG objects may be expressive:

- PromoCard;
- Consequence Receipt;
- Access Pass;
- verified Proof;
- Moment media;
- Opportunity objects.

A useful rule: **quiet system, expressive objects.**

## Core role outcomes

### Participant
Find one worthwhile thing → commit → act → receive value → return.

### Creator
Choose useful work → create/get approved → cause a verified action → settle value → earn stronger repeat work.

### Host
Create Moment → fill → operate → verify attendance → bring people back → prove value to partners.

### Merchant
Business ready → promotion live → verified customer action → business value → repeat customer → positive economics.

### Brand
Define outcome → launch funded/fulfillable supply → attributed action → incremental value → reinvestment decision.

### Agency
Connect client → activate → prove client outcome → package proof → repeat work.

### Admin
Work requiring attention → resolve → verify resolution → move to next operational priority.

## Role home contract

Every major stakeholder home should make these questions answerable quickly:

1. Where am I / which workspace am I operating?
2. What am I trying to accomplish?
3. What should I do next?
4. What has PROMORANG actually verified?
5. What value did I or the counterparty receive?
6. What should happen next?

Recommended composition:

1. context / workspace;
2. dominant `NextMove`;
3. compact `OutcomeProgress`;
4. proof + value;
5. relevant current work;
6. secondary history/tools.

## Canonical semantic components

Initial V2 primitives live in `apps/web/src/components/promorang-v2/`.

Foundation:

- `PageCanvas`
- `PageLead`
- `OutcomeSurface`
- `NextMove`
- `OutcomeProgress`
- `ProofBlock`
- `ValueBlock`
- `EvidencePair`
- `WorkspaceSwitcher`
- `ConsequenceReceipt`

New components should describe meaning, not styling. Prefer `ProofSummary` over `GlowCard`, `OpportunityCard` over `GlassPanel`, etc.

## Design token policy

V2 semantic tokens live in `apps/web/src/styles/promorang-v2.css` and are loaded after the legacy stylesheet.

Migration is opt-in. Existing screens should not be globally restyled merely because V2 exists.

Do not introduce new hard-coded component colors when an appropriate semantic token exists.

Role colors identify context; they do not repaint entire role products.

## Typography

Operational/product UI should use the contemporary sans stack. Expressive serif typography may remain for deliberately editorial surfaces, but it should not be the default product heading grammar.

## Containment

Do not wrap every section in a bordered card.

Use hierarchy in this order:

1. typography;
2. spacing;
3. alignment/grouping;
4. divider/background shift;
5. containment only when the region represents a meaningful object.

## Media

Photography is part of the product system, not decoration.

- Participant/culture surfaces: high media allowance.
- Creator/Host: medium media allowance.
- Brand: selective evidence/campaign media.
- Merchant analytics: low media allowance.
- Admin: minimal media except review context.

Prefer real, documentary-feeling people/places/objects and controlled contrast. Avoid random stock imagery, aggressive HDR, artificial skin treatment, and generic nightclub lasers as a default aesthetic.

## Navigation grammar

The exact labels can differ by stakeholder, but primary navigation should preserve a stable conceptual order:

**Home → Work/Opportunity → Relationships/Objects → Evidence/Results → Value/Account**

Only a small number of destinations should be primary at once. Scenes, Missions, Drops, Guilds, Crews, PromoShare, Gems and other PROMORANG objects may remain valid product concepts without all becoming top-level navigation.

## Multi-role workspace model

Multi-role users should operate through an explicit workspace switcher.

Changing workspace should change together:

- role context;
- organization/client context;
- primary navigation;
- role home;
- success contract;
- available tools and permissions.

The intended default-route precedence is:

1. explicit deep-link intent;
2. saved valid workspace start page;
3. role default.

Persistence for the saved workspace start page is a separate implementation item and must include database/type/RLS validation before release.

## Accessibility

V2 must preserve or improve:

- visible focus;
- semantic labels and headings;
- keyboard navigation inherited from existing Radix primitives;
- target sizes generally >= 44px where practical;
- status announcements for dynamic state changes;
- reduced-motion behavior;
- meaningful loading/empty/error/cancelled/success states.

Animation must never be the only carrier of state.

## Motion

Use the least motion needed to communicate:

- context continuity;
- stage completion;
- verified success;
- signature-object continuity.

Do not add decorative continuous motion to operational interfaces.

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

Do not skip to a full product reskin. Each phase should migrate a coherent journey and remove/deprecate the visual patterns it replaces.

## Definition of done for a migrated screen

A screen is not complete merely because it looks better.

It must pass:

### Hierarchy
The primary action or operating priority is immediately understandable.

### Role outcome
The user can understand what success means in this context.

### Proof integrity
Verified facts are clearly distinguished from estimates/inference.

### System fidelity
Only approved V2 semantic tokens/components are introduced for the new presentation layer.

### Responsive intent
Desktop and mobile are both intentionally composed rather than one being a compressed version of the other.

### State completeness
Relevant loading, empty, error, success, cancellation and recovery states are designed.

### Accessibility
Focus, keyboard behavior, semantic labels, contrast and reduced motion remain valid.

### Regression safety
Existing functionality and permission boundaries continue to work.

## Agent / Cursor instruction

When modifying a migrated surface:

1. inspect `apps/web/src/components/promorang-v2/` before creating a new UI primitive;
2. use V2 semantic tokens rather than one-off colors;
3. do not introduce a new top-level navigation concept without demoting/replacing another;
4. do not expose technical/internal vocabulary when ordinary stakeholder language is available;
5. do not invent product behavior from design mockups;
6. treat repository functionality and stakeholder-success contracts as authoritative;
7. record intentional deviations in the relevant design/migration document.
