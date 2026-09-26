# Movement Market Bootstrap v1

Status: implementation contract for a bootstrapped PROMORANG market layer.

## Purpose

PROMORANG already has the canonical product primitives required to test a movement market:

- Demand questions and recorded votes
- Scenes
- Moments
- Offers
- Content Drops
- PromoShare
- PromoCard
- Vault / retained history
- operator response paths
- commercial activation infrastructure

This contract does **not** authorize a new token, tradable asset, bonding curve, speculative security, second Demand family, second Community family, or synthetic activity system.

The goal is to make the existing market feel alive enough to create repeat participation while tying that activity to a business that can deliver value repeatedly and profitably.

## Business law

PROMORANG is bootstrapped.

Every product addition must strengthen this loop:

```
BUSINESS PUTS VALUE ON THE TABLE
→ PROMORANG MAKES REAL DEMAND LEGIBLE
→ PEOPLE MOVE TOWARD THE OPPORTUNITY
→ DISTRIBUTION / CREATION / COMMITMENT OCCUR
→ REAL-WORLD OUTCOME IS VERIFIED
→ BUSINESS SEES ATTRIBUTABLE VALUE
→ BUSINESS PAYS AGAIN
→ PARTICIPANTS KEEP CONSEQUENCE / STATUS / ACCESS
→ THE NETWORK IS EASIER TO MOVE NEXT TIME
```

The first commercial product remains **Activation**.

A merchant, brand, host or venue brings a desired outcome plus real supply, inventory, budget or access. PROMORANG organizes and measures the market response around it.

## Product law

PROMORANG should expose a living market **without collapsing unlike signals into one fake truth**.

The canonical distinctions remain:

- Want ≠ purchase
- Vote ≠ attendance
- Share ≠ referral
- RSVP ≠ attendance
- Threshold ≠ supply
- Demand ≠ response
- Response ≠ outcome
- Proof submission ≠ verified consequence
- Watch ≠ entitlement

## Human language rule

The system may need precise operational states. The participant should experience what happened, not the database record.

> **The system verifies. The product remembers. The person experiences.**

Participant-facing surfaces should prefer:

- demand signal → **I want this**
- operator response → **Someone answered**
- check-in → **I’m here**
- pending proof → **We’re checking it**
- approved proof / verified attendance → **You were there** / **You were part of this** / **It counts**
- attributed referral → **You brought people**
- creator attribution → **You helped move this**
- memory issued → **You kept a Piece**
- retained consequence → **Because you were part of it…**
- return recommendation → **What will you move next?**

Product-writing law:

> **Never describe the record when you can describe what happened to the person.**

Precision terms such as verification, evidence, attribution, redemption and settlement remain valid in APIs, admin/operator audit surfaces, compliance contexts and places where the distinction itself is necessary. Human language must never erase the underlying truth gate.

## Public mental model

The user should understand:

> See what is moving. Move what you want. Watch what happens because people moved together.

The business should understand:

> See what people want. Put something real on the table. Measure what happened.

## Movement is a presentation layer, not a new canonical object

A Thing can be an existing canonical object:

- Demand
- Moment
- Offer
- Content Drop
- Mission
- another source-backed opportunity already supported by the platform

Movement presents truthful signals around that Thing.

For v1, do **not** persist a universal Movement score. Present the underlying counts and lifecycle first. A composite score may only be introduced later if its formula, source data and anti-manipulation rules are explicit and auditable.

## Market state vocabulary

Use a small human vocabulary:

- **EARLY** — a source-backed Thing exists but participation is still small.
- **WARMING** — participation is increasing or approaching an explicitly configured threshold.
- **NEAR TARGET** — a real configured target is close.
- **TARGET MET** — a configured demand threshold has been reached.
- **ANSWERED** — a separate real response / supply object exists.
- **HAPPENING** — an actual live/upcoming Moment or fulfillment exists.
- **REMEMBERED** — verified participation has returned to retained history / Vault.

Never render **UNLOCKED** from engagement alone. “Unlocked” requires a separate supply/response condition that is actually true.

## What’s Moving

The first product slice is a market expression layer, not a new backend.

### Signed-out / public

The public Discover experience should foreground live Demand and source-backed opportunities as “What’s moving” using existing data.

A movement presentation may show:

- current recorded Wants / votes
- configured target and remaining distance
- real response label, if one exists
- real Moment / Offer state if connected
- a share action
- a route to the canonical object

Never show invented velocity, fake percentage change, fake ranks, fake people, synthetic “hot” labels, or fabricated activity.

### Signed-in participant

Participant Discover should progressively converge on the same market language.

The first signed-in slice can continue using canonical nearby benefits and Moments while adding truthful demand rails as data is already available to the participant shell.

## Speculative energy without financial speculation

PROMORANG should preserve the human behaviour:

> I think this is going somewhere.

Initial v1 mechanisms:

- visible real counts
- distance to real targets
- watch / save
- share
- visible response when an operator answers
- retained history after verified participation

Later, once authoritative history exists, PROMORANG may add:

- early-participant provenance
- “you were here when…”
- participant impact history
- movement velocity based on dated authoritative actions
- category/city ranking based on transparent rules

Do not invent historical entry positions before source data exists.

## Pieces

Pieces become strategically important when they are **receipts of verified cultural participation**, not speculative JPEGs.

A Piece may eventually represent a retained consequence such as:

- early participant
- creator contribution
- verified attendance
- verified referral
- host / supplier response
- helped a real Moment reach a verified outcome
- originated or forked a movement

But v1 must reuse existing Vault / retained-history semantics first.

No new Piece issuance system is required for the initial Movement Market slice.

A Piece is valid only when its traits can be derived from authoritative history.

## “Put something on the table”

The operator-facing counterpart of What’s Moving is:

> People want this. What can you make real?

Use the existing demand/opportunity and activation response infrastructure.

Supply may include:

- free inventory
- discounts
- BOGO
- bundles
- access
- experiences
- sponsorship
- venue capacity
- creator participation
- paid distribution budget

The interface must distinguish **interest** from **committed supply**.

## Bootstrap economics

Do not optimize for raw account count.

Initial success should be measured by a dense commercial loop.

### Core pilot KPI

1. A business commits budget, inventory or real supply.
2. PROMORANG exposes the corresponding market object.
3. Real participants signal, share, claim, buy, attend or verify.
4. PROMORANG records attributable evidence.
5. The operator can see what happened.
6. The operator pays for another activation.

The strongest milestone is:

> one operator pays twice.

### Supporting metrics

- activation revenue
- gross margin per activation
- committed inventory value
- Wants / votes
- qualified claims
- verified attendance / redemption / purchase
- attributable PromoShare distribution
- creator participation
- repeat participants
- repeat operator spend
- cost to acquire / activate participants
- organic share contribution

## Genesis Movement

PROMORANG should operate one deliberately designed market experiment using existing primitives.

Requirements:

- understandable in one sentence
- visually compelling
- real target
- real-world outcome possible
- real supply can answer
- sharing is natural
- operator economics can be measured
- participants can retain proof afterward

The experiment should begin as an operational pilot, not a promise of a global platform feature.

## Implementation order

1. Reframe existing public Demand presentation around “What’s moving” without changing canonical truth.
2. Add a shared movement presentation helper/component that derives labels only from source-backed state.
3. Connect source-backed operator responses to an **ANSWERED** presentation state where the data relationship exists.
4. Add a “Put something on the table” operator entry from visible Demand using existing activation/response paths.
5. Instrument market actions already supported: open, watch, share, vote, response, claim, verified outcome.
6. Run a real paid/inventory-backed Genesis Movement.
7. Measure operator repeat intent and economics.
8. Only then add richer provenance / Pieces / velocity / ranking.

## Non-goals

Do not build in this slice:

- crypto token
- blockchain dependency
- NFT marketplace
- floor price
- buy/sell order book
- financial prediction market
- universal speculative asset
- fake real-time ticker
- synthetic Movement score
- new Scene object
- new Demand object
- automatic threshold-to-Moment conversion
- generic global creation system before the pilot proves the loop

## Truth gate

A Movement Market experience is successful only when a person can answer:

1. What is moving?
2. How many real people/actions support that statement?
3. What can I do?
4. What would have to happen next?
5. Has anyone actually answered with real supply?
6. What happened in the real world?
7. What consequence returned to me?
8. What value did the operator receive?
9. Why would either side come back?

If the UI needs invented numbers or jargon to feel alive, the slice has failed.
