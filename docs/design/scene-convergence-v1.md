# Scene Convergence v1

## Product decision

PROMORANG is a participation marketplace composed of Scenes.

A **Scene** is the canonical community object. It is persistent context around people, identity, demand, places, rituals, Moments, Offers, participation and retained history.

PromoCard gives the individual identity. Scene gives the collective identity.

## Participant contract

A participant should not need to understand "community infrastructure" to get value from a Scene.

The useful loop is:

`DISCOVER → SIGNAL → JOIN / BELONG → SEE WHAT THE SCENE WANTS → ACT → SHARE → UNLOCK / EARN → RETURN`

Joining a Scene must affect what appears on Participant Home and what opportunities become relevant.

## Participant Home

Scenes are first-class feed objects alongside Moments, Discoveries, Drops and live perks.

A Scene card should answer:

- What Scene is this?
- Am I already part of it?
- Why is it relevant now?
- What happens if I enter?

Current convergence keeps production truth:

- public active Scenes come from `scenes`
- joined state comes from `scene_memberships`
- no fake member counts or synthetic activity
- Scene does not imply attendance
- Scene does not imply supply
- demand remains distinct from offers / Moments

## Canonical relationship

`PROMOCARD → SCENES → DEMAND → MOMENT / OFFER / MISSION → PARTICIPATION → PROMOSHARE / ATTRIBUTION → REWARD / RETAINED HISTORY`

Existing production primitives already cover much of this:

- Scene record and metadata
- Scene memberships
- Scene detail and directory
- Moment ↔ Scene links
- approved Discovery ↔ Scene links
- Participant Home movement feed
- demand questions / recorded voting
- Moments and check-in
- Drops / distribution activity
- Offers and fulfillment
- PromoCard and Vault / retained value
- referral / invite attribution

## Remaining convergence work

Do not build a second Community object.

Future passes should connect existing canonical objects to Scene where the relationship is real:

1. show Scene context on feed objects when a canonical relationship exists
2. rank Home around joined Scenes without hiding broader discovery
3. expose Scene demand on Scene detail using recorded demand only
4. expose concrete responses to Scene demand as separate Moment / Offer objects
5. attribute invites, referrals and distribution back to Scene without conflating attribution with verified commercial value
6. provide operators with Scene-scoped demand and activation context
7. keep governance lightweight until a Scene has real resources or decisions to govern

## Truth gates

Forbidden shortcuts:

- Scene = category
- Scene = Moment
- Scene membership = attendance
- vote = purchase
- demand = guaranteed supply
- referral = verified sale
- offer = redemption
- community activity = commercial value without verification

## Acceptance criteria

Scene convergence is working when:

- real Scene cards can appear inside Participant Home
- joined vs discover state is based on `scene_memberships`
- Scene cards route to canonical Scene detail
- no sample activity is used to make Scenes look alive
- Participant Home explains Scenes through action and relevance rather than platform jargon
- Scene remains the collective context that connects demand, participation and commerce without collapsing those canonical objects


## Comprehensive convergence implemented

### 1. Scene-contextual demand

Canonical Scene detail now reads `discovery_questions.scene_id` directly and renders recorded voice counts and leading options. The UI explicitly preserves the truth boundary that demand is a signal, not a purchase or a promise of supply.

Published `demand_activation_responses` are returned with the Scene and rendered against their originating demand item, closing the visible loop from "people want this" to "a real response is taking shape."

### 2. Scene-aware Participant Home ranking

Participant Home now reads the participant's active `scene_memberships`, resolves `moment_scene_links` for live feed Moments, and ranks:

1. joined Scenes
2. Moments canonically linked to joined Scenes
3. demand / Discovery
4. distribution moves
5. other discoverable Scenes

This is relevance, not fabricated popularity. Time ordering remains inside equal relevance bands.

### 3. Scene-scoped Merchant / Brand activation

Demand response routes now preserve:

- `scene_id`
- `demand_id`
- the human-readable `want`
- city context

Merchant supply creation accepts the Scene context and writes it through the existing Drop creation path.

Brand response routes into the existing activation proposal builder. The builder resolves the canonical Scene, links the resulting proposal through `link_activation_scene`, records the originating demand in proposal metadata, and on a sent proposal publishes a `demand_activation_response` back to the originating demand.

No second campaign, community, offer or demand object was introduced.

### 4. PromoShare / invite attribution back to Scene

Scene sharing now uses the existing Scene invite path for authenticated participants before invoking the native share sheet. This means the shared route carries the existing recorded referral code, and a later Scene join can write the existing `hub_member_attributions` record.

The boundary remains explicit:

`SHARE ROUTE ≠ JOIN ≠ VERIFIED ACTION ≠ COMMERCIAL VALUE ≠ REWARD`

A share alone does not create earnings, attendance, conversion or reward.

### 5. Commercial evidence continuity

Existing activation infrastructure already provides the durable commercial bridge:

`Scene → Demand → Activation Proposal → Scene-linked operations → Commerce Receipt / Evidence → Allocation`

This pass reuses `link_activation_scene`, `demand_activation_responses`, existing Offer/Drop infrastructure and existing verified-action attribution rather than introducing parallel ledgers.

## Merge gate

Before merging to `main`:

- branch must remain based directly on current `main` or be updated non-destructively
- deployment/build checks must succeed
- Scene page must tolerate zero demand and zero responses
- participant feed must tolerate anonymous users and zero memberships
- merchant response must preserve `scene_id` into Drop creation
- brand response must preserve `scene_id` and `demand_id` into proposal creation
- published response must not imply fulfillment or supply
- Scene invite attribution must only become membership attribution after an actual join
- no seed/demo activity may be presented as live production truth
