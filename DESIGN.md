# Promorang DESIGN.md

This file defines how Promorang should look and feel when generating or editing UI.

It is intended for coding agents, designers, and engineers working on the web product.

The product is not a generic dashboard, a coupon app, or a trading terminal.

Promorang is a real-world momentum platform:

- attention becomes verified movement
- movement becomes memory
- memory becomes loyalty, perks, and status

The UI should make that feel simple, alive, and premium.

## Product Shape

The user-facing product should resolve into five primary surfaces:

- `Pulse`: what is happening now
- `Discover`: what is worth exploring
- `Create`: how a user launches a moment or campaign
- `Vault`: what a user earned and kept
- `Dashboard`: role-specific control and reporting

Secondary utilities exist, but must not dominate the mental model:

- `Search`
- `Activity`
- `Saved`
- `Wallet`
- `Settings`

Avoid presenting advanced economy systems as the default product identity.

## Core UX Principle

The interface should always help the user answer three questions:

1. What is happening now?
2. What can I do next?
3. What do I keep if I act?

If a screen does not clearly answer one of those, simplify it.

## Brand Personality

Promorang should feel:

- radiant
- warm
- kinetic
- social
- premium
- grounded in real places

Promorang should not feel:

- corporate SaaS-generic
- spreadsheet-heavy
- like a crypto exchange
- cold or sterile
- childish or gamified in a cheap way

## Visual Direction

The current codebase already has a strong base direction in [apps/web/src/index.css](./apps/web/src/index.css):

- warm cream backgrounds in light mode
- charcoal-based dark mode
- orange primary
- gold/yellow accent
- serif display headings
- sans-serif UI text

Keep that foundation. Refine it rather than replacing it with generic AI-product styling.

### Color Story

Primary palette:

- `Promorang Orange`: action, heat, momentum
- `Gold/Amber Accent`: reward, rarity, unlocks
- `Warm Cream`: softness, hospitality, daylight
- `Charcoal`: seriousness, depth, nighttime energy

Meaning by color:

- orange = join, go, signal, live action
- gold = rewards, rarity, status, perk
- cream = calm discovery, editorial browsing
- charcoal = immersive moments, vault, premium emphasis
- green = verified, completed, healthy state
- red = risk, error, destructive action

Do not introduce purple as a dominant brand color.
Do not drift into blue-heavy enterprise UI unless a specific admin surface truly needs it.

## Typography

Use the existing font logic unless intentionally changed everywhere:

- display/headings: expressive serif
- UI/body: clean sans serif

Typography goals:

- headings feel memorable and editorial
- body text feels clean and highly legible
- labels and metadata feel compact and structured

Rules:

- hero and section titles should feel intentional, not generic
- avoid giant blocks of centered copy
- prefer short, sharp headings with strong line breaks
- uppercase micro-labels can be used for state and metadata, but sparingly

## Layout Tone

Promorang should feel more like a premium consumer product than an enterprise admin suite.

Patterns to prefer:

- generous spacing
- large rounded surfaces
- layered cards with soft depth
- strong hero areas
- sticky action areas when useful
- clear content hierarchy

Patterns to avoid:

- cramped dashboard grids everywhere
- tables as the primary experience unless the screen is explicitly operational
- overuse of tiny pills, chips, and badges
- floating controls with no visual anchor

## Surface Types

Each core surface should have its own mood while staying in one system.

### Pulse

Use:

- stronger contrast
- brighter action color
- live-state indicators
- urgency without chaos
- progress and density signals

Pulse should feel:

- live
- forming
- directional

Pulse should not feel:

- like a noisy trading board
- like a social feed clone

### Discover

Use:

- breathable layouts
- clean filters
- category browsing
- editorial rhythm

Discover should feel:

- browseable
- local
- curious

### Moment Detail

This is the canonical product screen.

It should unify:

- what the moment is
- where it happens
- when it happens
- what action is required
- what proof is needed
- what reward or memory is possible

Moment pages should feel:

- immersive
- trustworthy
- action-oriented

### Vault

Vault is emotional retention, not just inventory.

Use:

- darker or richer premium surfaces where appropriate
- collectible framing
- rarity language
- clear memory cards
- visible perks and legacy value

Vault should feel:

- earned
- prestigious
- personal

It should not feel:

- like a wallet ledger
- like a back-office report

### Dashboard

Dashboard is operational and role-aware.

Use:

- denser information
- task-first modules
- clearer controls
- quieter visual treatment than Pulse or Vault

Dashboard should feel:

- capable
- efficient
- controlled

Not every dashboard needs a hero section.

## Component Guidance

### Buttons

Primary buttons:

- bold
- warm
- obviously clickable
- reserved for one key action per section

Secondary buttons:

- lower contrast
- support navigation and comparison

Avoid placing too many equally weighted CTAs in the same block.

### Cards

Cards are a major part of the product language.

Cards should:

- have a clear top-to-bottom hierarchy
- make scanning easy
- reveal state quickly
- support image, metadata, and action

Cards should not:

- turn into mini-dashboards with too many stats
- contain five unrelated actions

### Badges and Status

Badges should communicate meaning fast:

- `forming`
- `live`
- `verified`
- `rare`
- `legendary`
- `qualified`

Do not use badges as decoration.
Every badge should encode state, rarity, role, or urgency.

### Motion

Motion should be meaningful, not ornamental.

Use motion for:

- page transitions
- state changes
- card reveals
- progress and threshold activation
- perk unlock and reward moments

Avoid:

- constant animation everywhere
- generic floaty microinteractions
- delayed transitions that make the app feel sluggish

Best motion references:

- momentum build
- pulse activation
- reward reveal
- vault unlock

## Information Architecture Rules

- one noun per concept
- one primary CTA per screen region
- economy complexity should be progressively disclosed
- participant flows should not require finance literacy
- role changes should feel like changing tools, not changing apps

If there are two pages with overlapping meaning, consolidate them.

## Language Rules

Use human language first.

Prefer:

- join
- show up
- verify
- unlock
- collect
- keep
- earn
- host
- launch

Avoid leading with:

- exchange
- trade
- asset
- liquidity
- tokenized
- securities-adjacent wording

Advanced economic concepts may exist, but should appear only where relevant.

## Role Experience Guidance

### Participant

Optimize for:

- discovery
- confidence
- quick join
- satisfying completion
- visible retention through vault and status

### Creator

Optimize for:

- publishing
- mission linking
- performance visibility
- conversion clarity

### Host

Optimize for:

- creating moments
- monitoring turnout
- reviewing proof
- understanding outcomes

### Brand

Optimize for:

- campaign launch
- verified movement
- outcome reporting
- repeatability

## Mobile First

Promorang should feel native on mobile.

Priorities:

- thumb-reachable actions
- sticky bottom actions where useful
- large tap targets
- compact but readable metadata
- clear scroll hierarchy

Desktop should feel expanded, not fundamentally different.

## Screen Construction Order

When designing a new screen, prioritize this order:

1. screen purpose
2. primary action
3. state visibility
4. proof of value
5. secondary actions

Do not start from decorative layout patterns.

## Anti-Patterns

Do not generate UI that feels like:

- a generic template marketplace
- a crypto portfolio first
- a beige lifestyle landing page with no product clarity
- a SaaS dashboard full of equal-weight metric cards
- a social app clone with random engagement widgets

## Implementation Notes

Use existing design tokens and extend them carefully.

Preserve and evolve:

- warm gradients
- cream/charcoal contrast model
- orange/gold action system
- serif + sans pairing
- rounded cards and soft shadows

Prefer introducing new semantic tokens for product states such as:

- pulse live
- pulse forming
- verified
- perk active
- rarity rare
- rarity legendary

## First Screens To Rebuild Using This File

Apply this design contract first to:

1. `Pulse`
2. `Discover`
3. `Moment Detail`
4. `Vault`
5. `Dashboard Shell`

These five surfaces should establish the visual and interaction language for the rest of the app.
