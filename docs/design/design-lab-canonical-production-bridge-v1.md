# PROMORANG Design Lab ↔ Canonical Objects ↔ Production UI Bridge v1

## Purpose

PROMORANG's Design Lab is not a separate mock product and the canonical object system is not a backend-only taxonomy. The production UI is the point where both become one product.

The governing sequence is:

`CANONICAL SOURCE / DATA → CANONICAL OBJECT SEMANTICS → DESIGN LAB EXPRESSION → ROLE LENS → JOURNEY COMPOSITION → PRODUCTION UI`

This contract prevents design drift while preserving the core thesis:

**One object. Many lenses. One history.**

## Design constitution

The Design Lab laws are production laws:

1. **ONE MOVE** — every major participant surface gives one action visual authority. Secondary actions stay quiet.
2. **OBJECTS > CARDS** — access, proof, memory and retained value should look like recognisable things, not generic SaaS containers.
3. **WORLD > DASHBOARD** — people, places, Scenes and Moments lead the composition. Internal taxonomy and metrics do not.
4. **UTILITY IS QUIET** — controls, settings, filters and metadata support the experience instead of becoming the experience.

These laws do not mean every role looks the same. Operators may need denser workspaces. Participants should receive a cultural, editorial and object-led world.

## Reuse rule

Reuse the canonical object's:

- identity
- lifecycle
- truth state
- provenance
- history
- relationships

Do **not** force reuse of:

- page density
- information hierarchy
- interaction model
- visual prominence
- operator controls

True reuse does not mean visual sameness.

## Canonical production matrix

| Canonical object | Canonical meaning | Design Lab expression | Participant lens | Operator lens | Production surface | Truth boundary |
| --- | --- | --- | --- | --- | --- | --- |
| Discovery | Approved local knowledge or recorded market signal | Editorial signal / question / cultural lead | Something worth knowing or signalling interest in | Evidence of demand / market formation | `/discover`, `/discoveries/:slug` | Proposal ≠ approval; vote ≠ attendance; demand ≠ supply |
| Scene | Persistent social / cultural / market context | Place / world / room | Where I belong, follow or return | Context in which a market/community is constructed | `/scenes`, `/scenes/:slug` | Membership ≠ attendance; Scene ≠ Moment |
| Moment | Time-bound opportunity to act | Cinematic invitation / live opening | What I can do now | Activation to operate and measure | `/moments/:id` | RSVP ≠ attendance; scheduled ≠ verified participation |
| PromoCard | Personal access / entitlement credential | Credential / pass | What I can present or use | Access that was issued and may later be validated | `/card` | Entitlement ≠ redeemed; claim ≠ validation |
| Proof | Participant claim awaiting a decision | Evidence artifact | Did what I did count? | Review / verification work | `/moments/:id/checkin` and proof review workspace | Submission ≠ approval; approval ≠ settlement |
| Piece / Memory | Retained consequence of a verified history | Collectible / receipt / relic | What I kept | Provenance / evidence of a verified outcome | `/vault`, `/memories/:id` | Memory ≠ NFT ≠ financial asset |
| Vault | Retained history and possessed utility | Archive / shelf / collection | What stayed with me | Evidence / retained relationship state | `/vault` | Local UI state ≠ durable history |
| Return / Consequence | New opening created by prior verified action | Invitation / consequence receipt | What opened because I acted | Retention / repeat-action signal | Today, PromoCard, Vault | Intended reward ≠ issued consequence |
| Perk / Offer | Supply made available under defined rules | Ticket / access object | Something I can claim or use | Inventory / issued offer | `/discover?tab=perks`, `/card` | Claim ≠ use; validation ≠ purchase; purchase ≠ fulfillment |
| PromoShare entry | Recorded eligibility / entry arising from qualifying activity | Entry / chance object | A chance I hold | Attribution / eligibility state | `/promoshare`, `/vault` | Share intent ≠ attributed action; entry ≠ win; winner ≠ settled |

## Participant journey composition

The participant experience composes the objects into one world:

`TODAY → DISCOVER → SCENE → MOMENT → PROMOCARD → PROOF → VAULT → RETURN`

This is a journey composition, not a new object hierarchy.

### Today

Job: **What should I do now?**

- one dominant current move
- PromoCard as the primary owned credential
- verified Now & Next below the dominant move
- Scene / Vault / latest Return establish continuity
- no setup checklist or operator dashboard in participant mode

### Discover

Job: **What is worth my attention?**

- editorial opening before filters
- real Moments, approved Discoveries, live perks and demand signals remain visibly distinct
- no synthetic activity to make the market look busy

### Scene

Job: **What world is this part of?**

- spatial, cultural and persistent
- should feel entered, not merely browsed
- Moments live inside a Scene without replacing it

### Moment

Job: **What can I do here, now?**

- time, place, meaning and one primary action first
- access/proof requirements remain visible but secondary
- operational metadata stays out of the participant hierarchy

### PromoCard

Job: **What can I access or use?**

- credential first
- strongest usable entitlement second
- Scene / Return / next opening provide continuity
- points and configuration stay quiet

### Proof

Job: **Did this count?**

- evidence capture must visually distinguish claim, pending review and verified outcome
- pending proof never looks rewarded or completed

### Vault

Job: **What stayed with me?**

- retained world, not finance dashboard
- separate material expressions for usable access, chance, proof/memory and backing
- money-like presentation only when the source is genuinely monetary

## Visual families

Every participant production surface should be explainable through one of the Design Lab families:

### World

Scenes, Moments, places, people, Discover and Today.

Use:
- space
- image
- editorial typography
- atmosphere
- movement

### Objects

PromoCard, tickets, perks, receipts, Pieces, memories, proof artifacts.

Use:
- object-specific material
- recognisable silhouette
- provenance
- tactile state

### Utility

Navigation, filters, settings, metadata, account controls, refresh and system feedback.

Use:
- restrained visual weight
- compact typography
- low-chrome controls

Utility must not visually overpower World or Objects.

## State-driven visual rule

Visual state must be derived from canonical state.

Examples:

- pending proof looks pending, not successful
- claimed perk looks possessed, not redeemed
- PromoShare entry looks like chance, not winnings
- approved Discovery looks published; proposal does not
- RSVP looks like intent; verified attendance looks retained
- empty Vault remains empty

The UI must not add demo values, rewards, attendance or retained objects to make a stage feel complete.

## Design Lab governance requirement

A new or substantially redesigned canonical object should be reviewed in this order:

1. Confirm the canonical meaning and source of truth.
2. Confirm lifecycle / truth boundaries.
3. Select its Design Lab family: World, Object or Utility.
4. Define the participant expression.
5. Define operator expressions only where a real workflow exists.
6. Compose the object into a journey without changing its truth state.
7. Validate production empty/loading/error states.

## Production acceptance criteria

A participant overhaul is aligned when:

- a user can recognise the same canonical object across surfaces without every surface looking identical;
- Today presents one dominant move;
- Discover feels editorial rather than like a filter-heavy marketplace dashboard;
- Scene feels like persistent context rather than a category page;
- Moment feels like an invitation to act rather than an event admin page;
- PromoCard feels like a credential rather than a wallet/account summary;
- Proof visually separates claim, review and decision;
- Vault feels like retained history and possessed utility rather than an asset dashboard;
- utility remains subordinate;
- empty states remain truthful;
- no production UI invents a lifecycle transition unsupported by canonical data.

## Relationship to other contracts

This bridge should be read with:

- `docs/design/promorang-canonical-object-system-v1.md`
- `docs/design/canonical-object-production-map-v1.md`
- `docs/design/participant-world-ui-overhaul-v1.md`
- `docs/design/discovery-scene-market-construction-v1.md`
- `docs/design/proof-receipt-evidence-family-v1.md`
- `docs/design/retained-value-family-v1.md`

The canonical contracts define truth. Design Lab defines expression. Production must satisfy both.