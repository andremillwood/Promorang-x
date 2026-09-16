# PROMORANG Consumer Canonical v1

Status: design reference on `design/promorang-design-lab`

This document defines the canonical hierarchy for the first four consumer destinations. It does **not** remove product capability. It establishes what receives visual authority, what is progressively disclosed, and which production concepts should stop competing for first-screen attention.

It should now be read together with `docs/design/consumer-maturity-v1.md`, which adds the quality bar for editorial restraint, trust, content-format diversity, accessibility, imagery and PromoCard credential maturity.

## Governing model

PROMORANG consumer UI uses three visual families:

1. **World** — people, places, scenes, moments, time, movement.
2. **Objects** — PromoCard, tickets, receipts, passes, pieces, relics.
3. **Utility** — navigation, filters, search, balances, settings, metadata.

Visual priority is normally World → Objects → Utility. The Card and Vault destinations intentionally reverse the first two because the object itself is the destination.

## Global consumer navigation

Primary destinations:

- Today
- Discover
- Card
- Vault
- You

Primary navigation must not expose internal product taxonomy such as demand systems, stakeholder loops, activation engines, world systems, campaign mechanics, inventory rails, PromoShare internals, or role architecture.

## 1. Today

### User question

**What is worth doing now?**

### Canonical hierarchy

1. Local/time context: e.g. `Tuesday · Kingston`.
2. One dominant move with image/world context.
3. PromoCard if there is something immediately usable.
4. `Now & next` — a short verified list, not a feed dump.
5. Latest meaningful consequence/proof only when useful.
6. Consumer navigation.

### Maturity addition

For the participant experience, the dominant move should also be capable of showing real issuer, trust, value, availability, distance and timing information before action when those data exist. Personalization may explain `why this, why now` quietly, but production must never invent recommendation reasons or social proof.

### Keep from production

- current-move resolution
- verified moment feed
- PromoCard state
- scene/crew context when meaningful
- latest return / latest memory
- stakeholder-specific behavior behind the scenes

### Demote from first screen

- stakeholder setup playbooks
- operator/member workspace switching
- detailed ledgers
- role preview controls outside explicit preview mode
- multiple calls to contribute/create/give
- verbose explanation of platform mechanics

### Acceptance criteria

A new user should understand the single best next action within five seconds without understanding PROMORANG terminology.

## 2. Card

### User question

**What can I access or use?**

### Canonical hierarchy

1. PromoCard physical object.
2. One dominant action: show/use/activate/fill, based on card state.
3. `Use now` — the currently presentable benefit/pass.
4. `Near you` — a short list of additional live opportunities.
5. `What changed` — latest unlock, return mark, or next consequence.
6. Progressive disclosure for the complete card inventory and configuration.

### Maturity addition

The PromoCard front should mature as a credible credential. Where backed by real data, it should be able to express issuer identity, issuer verification, state, serial/reference, validity, remaining uses and merchant-validation context without exposing protected redemption mechanics merely for visual interest.

### Keep from production

- current `resolvePromoCardFace` state model
- QR/credential presentation
- merchant validation rules
- owned perks and issuance journeys
- nearby benefits
- aim/filter capability
- scene/crew/world marks
- next-benefit logic

### Demote from first screen

- full eligibility/quantity/expiry matrices for every benefit
- memberships
- PromoPoints/PromoKeys analytics
- repeat-use metrics
- every expired benefit
- detailed aim configuration
- stakeholder contribution controls for participant users

These remain accessible below the fold, in contextual sheets, or in secondary views.

### Acceptance criteria

The PromoCard must be the unmistakable hero object. The screen should read like a wallet/pass experience, not a benefits administration dashboard.

## 3. Vault

### User question

**What has stayed with me?**

### Canonical information model

The Vault is organized around four human concepts rather than product/economic tabs:

### Access
Things still usable: tickets, passes, keys, vouchers.

### Proof
Verified records: receipts, returns, redemptions, attended moments.

### Kept
Identity and provenance: pieces, collectibles, scene marks, culturally meaningful memories.

### Value
Balances with direct utility: Gems, PromoShare tickets, other retained value. PromoPoints may appear as progress/status but should not dominate the Vault.

### Keep from production

- claimed perks
- used perks
- PromoShare balances
- Gems
- memories/proof
- liquidity/backing data when it has a comprehensible consumer meaning

### Replace as first impression

Current economics-first summary cards and four feature tabs should not be the first impression. They make the Vault read like a financial/rewards dashboard instead of retained personal value.

Liquidity/community backing can remain a deeper destination for users who need it.

### Acceptance criteria

A screenshot of the Vault with labels removed should still visually imply `things I own/kept/proved`, not `analytics dashboard`.

## 4. Discover

### User question

**What is worth my attention?**

### Canonical hierarchy

1. City + temporal context.
2. Editorial discovery proposition.
3. `Happening now` dominant feature.
4. `Worth crossing town for` curated set.
5. `Near you` place/moment/perk list.
6. Supporting search, categories and map controls.
7. Creator/distributor tools only when the user is operating in that role or explicitly switches context.

### Maturity addition

Discover should not repeat one visual card template for every result. It should support materially different content formats such as one hero opportunity, compact opportunity rows, live signals, map/place doorways, social-context signals, saved/expiring state and trusted issuer strips. Secondary results should normally use quieter sans-serif hierarchy rather than competing display-serif headlines.

### Keep from production

- city hubs
- real moment data
- curated Kingston inventory
- live perks
- discoveries/polls
- verified venues
- map capability
- search/category filters
- PromoCard aim filtering
- role-aware distribution capability

### Demote from first screen

- tab architecture exposing `discoveries / perks / moments / distribute / places` as peer products
- dense map/grid controls before the user sees anything desirable
- submission/operator actions in the primary consumer hierarchy
- reward mechanics used as the main discovery proposition

### Acceptance criteria

Discover should feel like an editorial guide to a living city/market. Search and map should help users navigate desire, not substitute for it.

## Trust and honesty rule

Design Lab studies may use illustrative ratings, counts, distance, inventory, verification and personalization copy to test hierarchy. Production must never fabricate any of these.

When real data is unavailable:
- omit the signal rather than inventing it
- use an explicit unavailable/unknown state only when the user needs it to understand the action
- never fabricate ratings, social proof, availability, proximity, issuer verification or recommendation reasons

## Accessibility floor

Before a canonical pattern converges into production:
- essential mobile copy should not rely on ultra-small 9–10 px text
- supporting text needs usable contrast against photography
- image overlays must preserve legibility
- icon-only actions need accessible labels
- touch targets should remain practical on mobile
- color must not be the only carrier of state

Actual accessibility compliance still requires implementation and assistive-technology testing.

## State requirements

Every canonical screen must eventually be reviewed in these states where applicable:

- populated
- empty
- loading
- degraded/offline
- first-time user
- returning user
- live/urgent
- used/expired/closed object

## Responsive rules

Mobile is the canonical consumer composition. Desktop should expand the composition without converting it into an enterprise dashboard.

- maintain one dominant action
- cap readable text widths
- use additional width for richer world imagery or parallel object shelves
- do not fill desktop width with more metrics simply because space exists

## Production convergence order

1. Approve Design Lab visual hierarchy and maturity bar.
2. Refactor `PeopleHome` toward Today hierarchy using existing data/hooks.
3. Refactor `MyPromoCard` toward Card hierarchy while preserving redemption behavior.
4. Refactor `Vault` around Access / Proof / Kept / Value.
5. Refactor `Discover` toward editorial hierarchy while preserving map/search/data logic.
6. Converge `You` around identity, belonging, proof and quiet account utility.
7. Add component states to Storybook after local Storybook initialization updates the npm lockfile safely.
8. Run visual QA at mobile and desktop widths.
9. Only then merge the design-system PR or split production migrations into follow-up PRs.

## Non-goals for v1

- redesign merchant/admin/creator workspaces before consumer language is stable
- remove underlying platform mechanics
- optimize every legacy route
- create additional navigation destinations
- introduce a new UI framework
- force Figma parity

The purpose of v1 is to make the consumer surfaces unmistakably PROMORANG and establish a system the rest of the platform can inherit.
