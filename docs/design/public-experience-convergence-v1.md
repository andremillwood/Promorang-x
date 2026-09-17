# Public Experience Convergence V1

Status: production direction for public/non-authenticated PROMORANG surfaces.

Related product law:
- `DESIGN.md`
- `docs/design/promocard-world-experience-v1.md`
- `docs/design/a-plus-platform-execution-plan.md`
- `.cursor/rules/promorang-object-surfaces.mdc`

## Product definition

Public PROMORANG is not a brochure that explains a different signed-in application. It is the first usable layer of the same market.

A visitor should be able to encounter a real PROMORANG object, understand what is happening, and take one meaningful action before authentication is required.

The public system should make this loop legible:

**Ask → Rally → Respond → Prove**

- **Ask:** a person makes a want visible.
- **Rally:** other people join, vote, share, or add the same ask.
- **Respond:** a host, merchant, creator, brand, community, or operator puts something into the market.
- **Prove:** claims, visits, check-ins, content, referrals, purchases, and other verified actions leave a receipt.

## Canonical public object: Demand Signal

A Demand Signal is the canonical object for visible demand.

It is not a metric card. It should feel like a request slip, wanted notice, petition, tally sheet, signal flare, or other object with a clear physical metaphor.

Minimum anatomy:

1. **Want** — what people are asking for.
2. **Market** — where the request applies.
3. **People in** — the current demand count.
4. **Threshold / opening** — what could happen next.
5. **State** — forming, gathering, nearly there, unlocked.
6. **One next action** — join, vote, share, claim, respond.

Implementation anchor:

`apps/web/src/components/promorang/DemandSignalObject.tsx`

Demand Signals should be driven by the existing discovery-demand system where possible:

- named intents,
- discovery polls,
- vote counts,
- thresholds,
- connected unlocks,
- PromoCard unlock tallies.

Do not invent impressive-looking counts in marketing-only code.

## Authentication continuity

Authentication is a checkpoint, not a new product.

A public action should survive authentication whenever technically possible.

Examples:

- visitor joins a Signal → signs up → sees the same Signal as joined;
- visitor begins a claim → signs up → resumes the claim;
- visitor requests something → signs up → sees that ask in their participation history;
- visitor opens a Moment → signs up → returns to that Moment rather than a generic dashboard.

Use existing `next` / return-path infrastructure instead of routing every successful signup to one universal home.

## Public information architecture

Primary public mental model:

- **Explore** — what exists now.
- **Wanted** — what people are asking for.
- **Moments** — things people can actually join/show up to.
- **For business** — put an outcome, offer, inventory, access, or funded action into the market.
- **Build with PROMORANG** — choose a stakeholder path by job-to-be-done.

Internal product nouns should not dominate navigation.

## Canonical object hierarchy

Public surfaces may use the same stable vocabulary as authenticated surfaces, but only when the object itself can communicate its purpose.

### Demand Signal
Visible want. People can join it.

### Moment
A bounded thing people can attend, do, claim, create around, or participate in.

### Ticket / Pass
Access to a Moment, place, perk, or opening.

### Receipt
Proof that something changed or happened.

### PromoCard
Persistent participation identity and record.

### Piece / Relic
Something kept because participation mattered.

### Scene
A larger cultural/community context that contains repeated activity.

### Run / Trail
A connected sequence of actions or Moments.

Objects should not be explained with generic feature grids when the object can be rendered directly.

## Public copy law

Lead with the human job.

Prefer:
- What do you want?
- Join this signal.
- 84 people are in.
- 16 more to open.
- Put something up.
- Claim your pass.
- You were there. It counted.
- This changed because people moved.

Avoid leading with:
- engagement engine,
- activation infrastructure,
- demand orchestration,
- telemetry,
- flywheels,
- primitives,
- platform architecture,
- dashboards and modules.

B2B pages can become more precise after the desired outcome is clear, but should still show market objects and evidence before feature taxonomies.

## Homepage V1

Implementation anchor:

`apps/web/src/components/marketing/PublicMarketHome.tsx`

The homepage should:

1. show one real Demand Signal in the first viewport,
2. let a visitor put up an anonymous named ask,
3. show live/seeded demand from the existing demand system,
4. explain the loop with a Night Trail rather than feature cards,
5. show aggregate demand as a Paper Receipt,
6. distinguish the people side from the operator/business side,
7. introduce PromoCard as continuity and memory, not as the explanation for the entire platform.

## Migration order

After homepage V1, converge these public surfaces in this order:

1. `/for-brands` and `/for-merchants` — lead with visible demand and response objects rather than benefits grids.
2. `/how-it-works` and `/what-is-promorang` — collapse duplicate explanations into object-led journeys.
3. `/join` — preserve job-first routing but render each path using the object/outcome it controls.
4. public Moment, Scene, creator, merchant, venue, and offer pages — ensure the object seen before signup is the same object resumed after signup.
5. campaign and activation landing pages — use Signal → response → receipt continuity.

## Design Lab role

Design Lab should develop PROMORANG's proprietary interaction vocabulary, not merely higher-fidelity page compositions.

New Design Lab work should answer:

- What object is this?
- Could a person describe it without knowing PROMORANG jargon?
- What state changes does it have?
- What does it look like before and after action?
- Can it survive from public to signed-in use?
- Does it have an ownable physical metaphor?
- Is there exactly one dominant next action?

When a pattern proves durable, promote it from experiment to canonical object and document its state model here or in the relevant canonical specification.

## V1 acceptance test

A new visitor should be able to answer these within ten seconds of landing:

1. What are people doing here?
2. What can I do right now?
3. What happens if more people join?
4. Why would a business care?
5. What would I keep if I become a member?

If the answer requires reading a feature matrix, the surface has failed convergence.
