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
