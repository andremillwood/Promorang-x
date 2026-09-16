# PROMORANG Participant Product Completeness v1

Status: review contract for `participant-next.html`. Canonical production routes remain unchanged.

## Principle

The five persistent participant destinations simplify navigation; they do **not** simplify away PROMORANG's product economy.

Persistent destinations answer five human questions:

- **Today** — What should I do now?
- **Discover** — What else is worth moving toward or signaling demand for?
- **Card** — What access can I use?
- **Vault** — What came back and remains mine?
- **You** — Who am I becoming through participation?

Product objects and deeper systems appear inside those destinations contextually.

## Level 1 — persistent destinations

### Today

May surface, when relevant:
- one primary current move
- expiring perk / PromoKey / access
- Discovery question that needs a signal
- PromoShare draw closing soon
- Piece just earned
- draw result or proof that matters now
- current PromoCard access shelf

The current move remains dominant. Economy modules are secondary and contextual.

### Discover

Contains:
- Moments and opportunities
- places / merchants / creators
- Discovery polls and demand signals
- emerging Moments formed from demand
- Piece discovery
- Piece Marketplace doorway
- perks / Keys that can be earned
- spatial context

Discover is both recommendation **and** market construction.

### Card

Contains:
- PromoCard credential
- active benefit / credential state
- PromoKeys
- perks
- passes / invitations / gated access
- redemption conditions
- additional access inventory
- recent returned proof

PromoCard is the durable access layer; PromoKeys are compact gated-access objects within that layer.

### Vault

Contains:
- Access
- Proof
- Pieces / kept objects
- Gems
- Points
- PromoShare tickets and entries
- named draw history / results
- Save & Win pots
- claimed rewards
- recent archive

The user-facing Vault information architecture remains **Access / Proof / Kept / Value**. Brand marks describe state and behavior inside those categories; they are not forced into navigation labels.

### You

Contains:
- identity
- belonging / Scenes
- chronological participant trail
- Pieces collection identity
- draw / share history
- participation and contribution outcomes
- following / saved / public profile

You is not primarily settings or vanity metrics. Identity is built from participation history.

## Level 2 — product objects

Contextual objects include:
- Moment
- Discovery question / poll
- Perk
- PromoKey
- Ticket / pass
- PromoCard credential
- Receipt / Proof
- Piece
- PromoShare ticket / entry
- Draw
- Save & Win pot
- Scene
- Merchant / creator / place

Objects should retain their own material and semantic identity rather than becoming one generic card component.

## Level 3 — deep systems

The five-destination navigation does not replace dedicated system pages.

Review deep routes:
- `/discover/poll` — Discovery poll / demand formation
- `/discover/piece` — Piece detail / provenance / utility
- `/discover/marketplace` — Piece Marketplace
- `/card/promokey` — PromoKey detail / redemption
- `/vault/promoshare` — PromoShare named perk draw
- `/vault/save-win` — Save & Win Gem pot

Production equivalents should continue to use canonical domain routes where they already exist.

## Economy truth

Use existing repository authority rather than inventing a new economy:

- PromoCard is what the participant uses.
- Points record participation / proof and are not money.
- Gems are PROMORANG's spendable internal value unit; public economy guidance uses `1 Gem = $1 USD` of platform value.
- Pieces are kept objects / keepsakes with provenance, utility and marketplace context.
- PromoKeys open doors: access, perks or gated value.
- PromoShare tickets are chances in a named draw whose prize is already stated.
- Perk draws can pay a Key, access, partner perk, product or Piece.
- Save & Win is the PromoShare money-draw family: participants park Gems, keep the principal, receive tickets for the named draw, and compete for an extra Gem prize already committed to the pot.

Do not visually or verbally conflate Points, Gems, PromoKeys, Pieces, or draw tickets.

## Review honesty

No-login review mode uses illustrative fixture data and must remain labeled as such.

Production/live mode must use real data or omission for:
- balances
- draw state
- ticket counts
- poll results
- ratings
- distance
- inventory
- verification
- marketplace pricing
- social proof
- personalization reasons

## Desktop contract

Wide-screen product layout should feel native to web:
- dark PROMORANG desktop header
- primary product canvas approximately 860–1000px depending on viewport
- contextual world rail approximately 400–440px
- no mobile bottom nav at desktop width
- context rail adds information rather than repeating the primary column
- no generic dashboard sidebar
- no large accidental white header / theme bleed

## Migration gate

Do not switch canonical participant routes until:
1. complete no-login review passes product and interaction QA;
2. deep system journeys are represented and understandable;
3. live mode is reconciled to real data and honest empty/loading/error states;
4. canonical Piece Marketplace, PromoShare, PromoKey and redemption routes remain intact;
5. role-aware creator / merchant / host / operator behavior is preserved.
