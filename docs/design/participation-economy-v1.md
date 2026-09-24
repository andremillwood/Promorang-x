# PROMORANG Participation Economy v1

Status: active product/design contract.

Authority:
1. DESIGN.md
2. canonical object/truth contracts
3. public-experience convergence
4. PromoCard product positioning
5. this contract for participation-economy composition

## Thesis

PROMORANG should not collapse into a coupon marketplace.

The participant system is:

> **DESIRE → MOTIVATION → OPPORTUNITY → ACTION → DISTRIBUTION**

The return loop is:

> **Taste → Want → Open → Move → Proof → Earn → Spread → Return**

PromoCard is the participant product that carries the relationship across these stages.

## 1. Desire — what do I want?

Desire has two distinct sources.

### Private taste

Examples:
- Food & Drink
- Music & Entertainment
- Outdoor Adventures
- Fitness & Wellness
- Arts & Culture
- Social Gatherings
- Networking
- Workshops & Learning

Private actions:
- More like this
- Not for me
- save / watch where applicable

Private taste improves ranking and personalization.

> **Taste trains the feed.**

It must not silently increase a public Want count.

### Public Want

Examples:
- I want this restaurant.
- I want this product.
- I want an Afro House experience in Kingston.
- I want early access to this release.

Public actions:
- I want this too
- poll vote
- explicit request

> **Wants move the market.**

## 2. Motivation — what would make me move?

When no suitable supply exists, or live Offers are not compelling, PROMORANG should not dead-end.

Ask:

> **What would make this worth doing?**

Initial motivation vocabulary:
- complimentary drink / sample / tasting / extra
- exclusive access
- early access
- bring-a-friend value
- meaningful savings
- PromoPoints / PromoKey
- paid Gig
- special experience

Motivation is private participant intelligence unless the participant explicitly publishes a Want around it.

This produces better market intelligence than simple affinity:
- likes restaurant X;
- would visit for a tasting;
- ignores token discounts;
- values bring-a-friend access.

## 3. Opportunity — what can I do?

Opportunity is a presentation family over existing canonical objects, not a new canonical object.

### Offer
Direct value that is genuinely available under clear terms.

### Moment
A real time/place experience.

### Challenge
A structured objective with:
- target;
- eligibility;
- progress;
- deadline;
- proof requirement;
- completion state;
- participant value.

Existing `content_missions` are presented as Challenges where appropriate.

### Gig
A limited compensated opportunity with:
- work/deliverable;
- compensation;
- eligibility;
- slots or capacity where applicable;
- deadline;
- proof/acceptance requirement.

Do not call a generic campaign a Gig. A campaign becomes a Gig presentation only when it is explicitly tagged as one or contains real compensation terms.

### Content Drop
A distribution/release opportunity.

A Content Drop may ask a participant to:
- open;
- watch;
- share;
- refer;
- remix;
- create a response;
- move into a linked Moment / Offer / Challenge / Gig.

Content Drop is not a replacement for Challenge or Gig.

It is a way content and opportunities travel.

### Drop as release mode

“Drop” may also be used culturally as a release mode:
- 100 Keys drop Friday.
- 25 Gigs drop Monday.
- a Challenge drops tonight.
- early access drops for 50 PromoCards.

Scarcity must come from authoritative inventory/capacity.

## 4. Action — what did I actually do?

Canonical actions remain distinct.

Examples:
- claimed
- reserved
- RSVP
- checked in
- attended
- purchased
- created
- uploaded
- distributed
- referred
- completed
- redeemed

Do not turn:
- Want into claim;
- claim into use;
- RSVP into attendance;
- proof submission into verified completion;
- share into sale.

## 5. Distribution — what did I help move?

PROMORANG travels outside PROMORANG.

Distribution may include:
- direct share;
- tracked referral;
- creator link;
- community / curator link;
- Content Drop distribution;
- remix / UGC;
- invite;
- embedded or QR path.

Attribution should be based on real tracked paths.

A share can matter without automatically being paid.

The opportunity terms decide what distribution action, if any, earns Points, entries, funded value or compensation.

## PromoPoints

PromoPoints are participation/progression value.

Use them for:
- verified Challenge completion;
- meaningful distribution;
- proof-backed activity;
- repeat participation;
- network progression.

Avoid paying meaningful Points for empty clicks that can be farmed.

PromoPoints are not cash.

The existing economy may convert earned Points into PromoKeys under platform rules.

## PromoKeys

A PromoKey should mean:

> **This opens something.**

A Key is an entitlement / access primitive.

It can gate:
- early access;
- limited inventory;
- special Moments;
- premium Challenges;
- priority windows;
- gated Offers;
- other explicit opportunities.

Do not use Keys as decorative gamification.

## Master Key and Momentum

The Master Key is the trust gate into funded earning opportunities.

It is deliberately separate from ordinary PromoKeys:

- **PromoPoints** record lifetime participation/progression.
- **PromoKeys** grant access to specific gated things.
- **Master Key earned** records that the participant has qualified for the earning layer.
- **Momentum** measures recent useful participation.
- **Master Key active** means the participant currently has access to funded earning opportunities, subject to each opportunity's own eligibility.

### Initial qualification

A participant earns the Master Key only after all four gates are satisfied:

1. **100 qualification credits** from legitimate participation;
2. participation across at least **4 behaviour categories**;
3. at least **3 verified Moves**;
4. at least **1 attributable downstream action** caused through referral/distribution.

No single farmable action can satisfy the qualification by itself. Fifty poll answers, repeated likes, raw impressions or daily logins must not create a Master Key.

Qualification credits are not money and need not equal PromoPoints one-for-one. They are a trust/progression measure.

### Earned versus active

Earning the Master Key is a durable achievement. Access to new funded work is not permanently active.

The initial activity policy uses a rolling **30-day Momentum** window:

- **Active: 40+ Momentum** — full Master Key access, subject to opportunity eligibility.
- **Cooling: 20–39 Momentum** — earning access remains open, with a clear re-engagement cue.
- **Dormant: below 20 Momentum** — the Master Key remains earned, but new funded earning access is paused until meaningful participation rebuilds Momentum.

This is intentionally not a daily-login streak. Momentum should come from useful behaviour, with more weight on proof-backed actions than passive engagement.

### Initial Momentum weights

These are launch policy defaults and should be tuned against real behaviour:

| Action | Momentum |
| --- | ---: |
| meaningful Discovery response | 2 |
| meaningful content engagement | 1 |
| tracked PromoShare distribution | 3 |
| downstream action from PromoShare | 8 |
| save / join a Moment | 2 |
| verified Moment attendance | 10 |
| verified referral | 10 |
| completed Content Drop | 5 |
| verified commercial action | 10 |
| completed funded Gig | 15 |
| completed Challenge | 5–15 according to terms |

Actions must be deduplicated, rate-limited where appropriate and backed by the canonical proof state. Configuration cannot turn an unverified click into verified Momentum.

### Reactivation

A dormant participant does not re-earn the Master Key from zero. The product should show **Master Key earned · Dormant** and the useful Moves available to rebuild Momentum. Reactivation occurs when the participant returns to the configured Momentum threshold.

### Opportunity eligibility

Master Key status is only one gate. A funded opportunity may additionally require a specific PromoKey, geography, age/legal eligibility, category experience, creator capability, capacity, timing or other truthful campaign criteria.

The Master Key never guarantees earnings. It grants access to pursue funded opportunities when eligible.

## Ownership model

### Participants
Can:
- express taste;
- express Wants;
- watch;
- claim;
- RSVP;
- join Challenges;
- take eligible Gigs;
- distribute Content Drops;
- submit proof;
- earn Points / Keys / configured rewards;
- keep verified history on PromoCard.

### Brands / merchants
Can:
- answer public Wants;
- create/fund Offers;
- create Challenges;
- create compensated Gigs;
- publish Content Drops;
- create or sponsor Moments where allowed;
- define proof/value/capacity;
- see truthful outcomes.

### Agencies
May create/manage the same operator opportunities for authorized clients.

### Hosts
May create Moments and relevant Challenges/Content Drops around real experiences.

### Creators
Primary role is distribution and participation.
Creators may receive Gigs, join Challenges and distribute Content Drops.
Publishing new operator-owned Content Drops is not the default creator privilege.

### Platform/admin
May operate/moderate according to platform controls.

## Cold-start law

A quiet marketplace is not a dead end.

If no suitable opportunity exists:

1. capture **Desire**;
2. capture **Motivation**;
3. aggregate explicit public Want where appropriate;
4. keep the relationship on PromoCard;
5. approach the operator with evidence;
6. create real supply only when an operator responds.

Example:

> 842 PromoCards want Restaurant X.
> 316 say a tasting would move them.
> 184 value a complimentary drink.
> 92 value early menu access.

The motivation numbers are private/aggregated research, not public Want counts unless consent and aggregation rules permit their use.

## Participant-facing surfaces

### Homepage
- Hero: PromoCard + image-led taste/motivation calibration.
- First market section: What the market wants.
- Participation Economy: Desire → Motivation → Opportunity → Action → Distribution.
- PromoCard continuity.
- Discovery.

### Discover
Discovery should learn while it shows:
- More like this / Not for me;
- Watch;
- I want this too where explicit public demand exists;
- direct entry into live Opportunities.

### PromoCard
PromoCard should surface:
- Wants / Watching;
- Open;
- Active participation;
- PromoPoints;
- PromoKeys;
- Challenges / Gigs / Content Drops worth acting on;
- Kept history;
- Return reasons.

### Earn / Opportunities
Human types:
- Challenge;
- Gig;
- Offer;
- Activation;
- Content Drop.

Never show raw `mission` or generic internal source types as the primary participant vocabulary.

## Operator surfaces

Operator creation should begin with the job:

> **What do you want people to do?**

Then choose the participation format:
- Offer
- Moment
- Challenge
- Gig
- Content Drop

Every format still needs:
- audience;
- action;
- value;
- capacity;
- timing;
- proof;
- funding / fulfillment;
- return path.

## Data boundaries

Private preference signals live separately from public Wants.

Private signal examples:
- more_like_this
- not_for_me
- motivation

Public demand:
- want_joined
- poll_vote
- explicit_request

Relationship:
- watched
- followed
- saved

Commitment:
- claimed
- reserved
- RSVP
- Challenge joined
- Gig accepted

Verified follow-through:
- checked_in
- redeemed
- purchased
- accepted deliverable
- completed Challenge
- verified referral/distribution action

## Success test

PROMORANG should be able to answer five questions without conflating them:

1. **Desire:** What does this person / market want?
2. **Motivation:** What value would make action worthwhile?
3. **Opportunity:** What real thing can they do now?
4. **Action:** What did they actually do?
5. **Distribution:** What did they help move, and what happened because of it?

If the product can answer those questions truthfully, Points, Keys, Challenges, Gigs, Content Drops, Offers and Moments are not miscellaneous features.

They are the participation economy.
