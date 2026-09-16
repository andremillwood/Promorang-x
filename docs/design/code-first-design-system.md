# PROMORANG — Code-First Product Design System

Status: **Design constitution v1**  
Primary review surface: `apps/web/design-lab.html`  
Token source: `packages/ui-tokens`  
Production implementation: `apps/web`

## 1. Purpose

PROMORANG should not discover its visual design page-by-page inside production code. The product needs a stable visual language that can be reviewed independently, implemented with real components, and propagated across consumer, merchant, creator and admin experiences without becoming a generic SaaS interface.

The Design Lab is the immediate dependency-free review surface. Storybook becomes the long-term component workshop once initialized locally so the repository lockfile is updated by npm rather than hand-edited remotely.

## 2. Product design thesis

> **The city is the interface.**

PROMORANG should feel like access, movement, discovery, proof and memory. The user should encounter recognizable objects and situations, not a hierarchy of internal platform concepts.

### The four design laws

1. **One move** — one action receives dominant visual authority on a major surface.
2. **Objects over cards** — access, proof and memory use recognizable objects: PromoCards, tickets, receipts, passes and pieces.
3. **World over dashboard** — people, places, scenes, moments and current activity lead composition.
4. **Utility is quiet** — controls, metadata, settings and operational language remain visually subordinate.

These laws are exported from `@promorang/ui-tokens` as `promorangDesignLaws`.

## 3. Visual families

Every consumer-facing element should primarily belong to one of three families.

### World

Represents what is happening outside the interface.

Examples:
- Moments
- Places
- Scenes
- People
- Current move
- Live timing
- Cultural/editorial imagery

World surfaces may be photographic, spatial and editorial. They should not default to identical bordered cards.

### Objects

Represents something the user possesses, uses, proves or keeps.

Examples:
- PromoCard
- Ticket Pass
- PromoKey
- Receipt
- Piece / Relic
- Access pass
- Kept memory

Object surfaces should have object-specific material and geometry. A receipt should not look like a PromoCard. A Ticket should not look like a generic Card component.

### Utility

Represents control and explanation.

Examples:
- Buttons
- Navigation
- Filters
- Forms
- Metadata
- Settings
- Empty/loading/error states

Utility is intentionally restrained so it does not compete with World and Objects.

## 4. Consumer information architecture

Primary consumer navigation is limited to five jobs:

| Destination | User question |
| --- | --- |
| **Today** | What should I do now? |
| **Discover** | What is worth my attention? |
| **Card** | What can I access or use? |
| **Vault** | What have I earned, kept or unlocked? |
| **You** | What is my relationship with this world? |

Internal product language such as stakeholder loops, demand rails, activation engines and operational workspaces must not enter primary consumer navigation.

## 5. Canonical consumer screens

These screens define the visual grammar before expansion to stakeholder workspaces.

### Today

Order of attention:
1. Current date / place context
2. One dominant move
3. PromoCard / currently usable access
4. Two or three verified Now & Next items
5. Latest proof / memory when meaningful
6. Consumer navigation

Today is not a dashboard. Avoid metric grids, multi-column admin patterns, or multiple equally weighted CTAs.

### Discover

Editorial discovery, not database browsing.

Preferred groupings:
- Happening now
- Tonight
- Near you
- Your Scenes
- Worth crossing town for
- People are moving toward

### Card

The PromoCard is the dominant physical object.

Supporting hierarchy:
- Use now
- Near you
- Recently used
- What changed

### Vault

Vault is accumulated relationship, not a crypto wallet.

Object families:
- **Access** — tickets, keys, passes
- **Proof** — receipts
- **Kept** — pieces / collectibles
- **Value** — Gems or balances that can actually be used

### You

Identity and history, not an analytics dashboard.

Focus on:
- identity / profile
- Scenes and affinities
- recent movement
- kept memories
- contribution when relevant

## 6. Token architecture

`packages/ui-tokens/src/index.ts` is the source for new product tokens.

### Primitive layer

Raw values only:
- ink
- paper
- signal orange
- amber
- violet
- cyan
- green
- spacing
- radius
- opacity

### Semantic layer

Components should prefer semantic intent:
- `surface.canvas`
- `surface.raised`
- `surface.objectPaper`
- `text.primary`
- `text.secondary`
- `action.primary`
- `signal.live`
- `signal.reward`
- `signal.collectible`
- `border.quiet`
- etc.

Do not introduce new raw hex values into canonical components when an existing semantic token represents the intent.

## 7. Typography

### Editorial — Fraunces

Use for:
- moment names
- object names
- primary screen statements
- cultural/editorial hierarchy

### Utility — DM Sans

Use for:
- controls
- instructions
- navigation
- metadata
- forms
- compact supporting copy

### Mono

Use sparingly for:
- serials
- references
- receipts
- credential-like data

## 8. Review workflow

### Immediate Design Lab

From repository root:

```bash
npm run dev:design --workspace apps/web
```

Vite opens:

```text
/design-lab.html
```

The Design Lab must use real production components whenever they already exist. Fake visual replicas are acceptable only while a reusable production component does not yet exist.

### Long-term Storybook

Do **not** hand-edit Storybook packages into `package.json` without updating the workspace lockfile.

Initialize locally from `apps/web` using the current official Storybook installer:

```bash
cd apps/web
npm create storybook@latest
```

Choose/retain the React + Vite framework. Commit the resulting package and lockfile changes together.

Current Storybook requirements should be checked before initialization. At the time this design constitution was created, official Storybook documentation requires Node 20+, npm 10+, TypeScript 4.9+, Vite 5+, and supports React + Vite directly.

After initialization, organize stories using this structure:

```text
Foundations/
  Color
  Typography
  Spacing
  Motion
Objects/
  PromoCard
  TicketPass
  PaperReceipt
  Relic
Utility/
  ActionButton
  ConsumerNav
World/
  MomentTile
Screens/
  Today
  Discover
  Card
  Vault
  You
```

## 9. Story state contract

Every canonical component should eventually expose meaningful states, not only a default screenshot.

Minimum examples where relevant:
- default
- active
- disabled
- loading
- empty
- error
- used / redeemed
- locked
- mobile
- wide

Objects may have domain-specific states such as PromoCard `available`, `ready`, `redeemed`, or `credential-visible`.

## 10. Implementation gate

A production UI change that creates a new canonical pattern should answer all of these before merge:

1. Which visual family is this: World, Object, or Utility?
2. What is the dominant user job?
3. What is the one dominant action?
4. Which semantic tokens does it use?
5. Is an existing component being reused?
6. If it introduces a new reusable pattern, is that pattern visible in the Design Lab / Storybook?
7. Does the consumer-facing copy use user language rather than internal architecture jargon?
8. Does the screen remain understandable at mobile width?

## 11. Expansion order

Do not redesign every stakeholder surface simultaneously.

Order:
1. Consumer foundations
2. Today
3. PromoCard
4. Vault
5. Discover / Moment
6. You
7. Merchant
8. Creator / Host
9. Admin

Consumer PROMORANG establishes the brand. Operational workspaces should inherit its tokens and object language while using denser utility patterns appropriate to their jobs.

## 12. Definition of success

The design system is working when a new screen can be designed without asking what rounded card, orange gradient, border opacity, heading style or navigation pattern to invent.

The question should instead become:

> What is happening in the world, what object matters, and what is the user's next move?
