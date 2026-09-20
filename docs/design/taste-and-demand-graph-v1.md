# Taste and Demand Graph v1

Status: active product/design contract.

## The missing distinction

PROMORANG needs two different participation loops that work together but must never be confused.

### 1. Market appetite — public

**What does this market want right now?**

Examples:
- 842 voices want a reason to try a restaurant.
- 691 voices want early access to a release.
- 519 voices want a movie-night offer.
- 407 voices want a driving experience.

The participant action is explicit:

**I want this too**

That action may increase the public Want count.

### 2. Personal taste — private

**What does this person want more or less of?**

Examples:
- Food & Drink → More like this / Not for me
- Music → More like this / Not for me
- Outdoors → More like this / Not for me
- A specific Moment → Show me more like this
- A specific Offer → This interests me / Not for me

These signals personalize PROMORANG.

They do **not** increase a public Want count unless the person explicitly chooses the public-demand action.

## Product law

> **Taste trains the feed. Wants move the market.**

Do not convert passive browsing, ranking clicks, skips, saves, watch actions or recommendation feedback into public demand.

Public demand must come from a participant action whose meaning is clear at the moment of action.

## Homepage order

The public homepage should prioritize market behavior.

1. Hero — PromoCard + network promise.
2. **What [market] wants** — live real Wants, voice counts, explicit **I want this too** actions.
3. **Taste calibration** — quick personal choices.
4. PromoCard product continuity.
5. Discovery / cultural world.
6. Moments and Offers.
7. Ask / put something else on the table.
8. Return / history.
9. Operator invitation.

A first-time visitor should feel that PROMORANG is already listening to a market, not merely showing a content catalog.

## Discovery order

Discovery is not just retrieval.

Every Discovery surface should do at least one of these:
- reveal something new;
- ask a useful preference question;
- let the participant express a public Want;
- let the participant keep/watch something;
- surface something actually Open.

The product should learn while the participant browses.

## Tinder-like interaction model

“Tinder-like” means **fast, low-friction preference capture**, not literal dating-app imitation.

Use:
- one clear object or category at a time;
- a strong visual;
- two or three understandable choices;
- immediate progression to the next choice;
- optional swipe gestures on touch devices;
- visible buttons for accessibility and clarity;
- undo where practical.

Never make gesture-only interaction mandatory.

### Category calibration

Prompt:
**More of this?**

Actions:
- **More like this**
- **Not for me**

This is private taste data.

### Discovery object

Actions can include:
- **More like this** — private positive taste.
- **Not for me** — private negative taste.
- **Watch this** — durable relationship / return permission.
- **I want this** — explicit public demand only where the object supports a Want.

### Moment

Useful pre-commitment signals:
- **I would go**
- **Maybe**
- **Not for me**

These are preference / intent signals until the person actually RSVPs or reserves.

RSVP remains a separate canonical state.

### Offer

Useful signals:
- **I want this**
- **More like this**
- **Not for me**

“I want this” can be public demand only when the UI explicitly says it contributes to the public Want.

Claim / issuance / redemption remain separate.

### Poll

Poll answers are explicit market input.

A poll can ask:
- What kind of food do you want more of?
- Which area should have more late-night options?
- What kind of music should the next Moment lean toward?
- Which benefit would actually make you try this?
- Which product would you want early access to?

Poll responses can update both:
- the public aggregate for that poll;
- the participant's private taste graph.

The two records should remain distinguishable.

## Preference hierarchy

PROMORANG should learn at multiple resolutions:

### Level 1 — broad taste
- food
- music
- outdoor
- fitness
- arts
- social
- networking
- workshop

### Level 2 — subcategory
Examples:
- food → sushi, brunch, street food, vegan, coffee
- music → dancehall, hip hop, soca, afro house, reggae
- outdoor → beach, hiking, road trips, water activities
- arts → film, visual art, fashion, theatre

### Level 3 — object affinity
- specific place
- specific brand
- specific creator
- specific Scene
- specific Moment pattern
- specific Offer type

### Level 4 — context
- weekday / weekend
- morning / afternoon / evening / late night
- solo / couple / group
- near me / worth travelling for
- free / low spend / premium
- spontaneous / planned

The recommendation layer should eventually combine these rather than treating “likes food” as enough.

## Signal classes

Keep these semantically separate.

### Private taste
- more_like_this
- not_for_me
- category_preference
- context_preference

### Public demand
- want_joined
- poll_vote
- explicit_request

### Relationship / continuity
- watched
- followed
- saved
- joined_scene

### Commitment
- claimed
- reserved
- rsvp

### Verified follow-through
- checked_in
- redeemed
- purchased
- completed
- verified_referral

## Suggested durable graph

When the product is ready for the backend implementation, use a canonical preference-signal record rather than adding fields to every object.

Candidate fields:
- id
- user_id
- object_type
- object_id nullable for category-only signals
- category
- subcategory nullable
- signal_type
- polarity / weight
- source_surface
- market_id / city context
- created_at
- supersedes_signal_id nullable

This should feed ranking and analytics while public Want aggregation continues to use explicit demand records.

## Ranking model

A participant feed should eventually rank using a blend of:

**personal taste × local relevance × current market appetite × real availability × freshness × relationship strength**

Do not let sponsor status silently replace participant utility.

Sponsored inventory must remain visibly sponsored and should still satisfy relevance/eligibility rules.

## What the operator learns

The business side should be able to distinguish:

- 2,000 people were shown food content.
- 780 privately indicated stronger food preference.
- 410 explicitly joined a public Want.
- 190 picked up an Offer.
- 121 visited.
- 73 purchased.

Those are different funnel states.

This distinction is one of PROMORANG's most valuable pieces of market intelligence.

## Current implementation bridge

The repo already has:
- `user_preferences.preferred_categories`;
- lifestyle and time preferences;
- public demand polls / votes;
- PromoCard Watching;
- Offers / claims;
- Moments / RSVP and check-in;
- proof and redemption records.

The first implementation should therefore use existing category preferences as the cold-start taste layer, then introduce object-level preference signals as a dedicated graph rather than overloading public demand.

## Success test

PROMORANG should be able to answer two different questions at the same time:

**Market:** What does Kingston want?

**Person:** What is this participant likely to want next?

The product becomes substantially more valuable when those two graphs inform each other without being collapsed into one.
