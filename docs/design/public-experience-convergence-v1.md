# Public Experience Convergence v1

Status: stacked on `design/canonical-object-system-v1`.

Authoritative dependencies:
- `DESIGN.md`
- `docs/design/discovery-scene-market-construction-v1.md`
- `docs/design/promocard-world-experience-v1.md`
- `docs/design/a-plus-platform-execution-plan.md`
- `.cursor/rules/promorang-object-surfaces.mdc`

## Thesis

Public PROMORANG is the first usable layer of the same canonical market, not a brochure for a different signed-in application.

A visitor should be able to encounter a real recorded object, understand its current truth state, and take one meaningful action before authentication is required.

Participant-facing loop:

**Ask → Signal → Respond → Prove**

Canonical truth underneath remains:

`PROPOSAL → REVIEW → APPROVED DISCOVERY → INTEREST / DEMAND → SCENE CONTEXT → MOMENT / OFFER / PERSON → VERIFIED ACTION → RETAINED HISTORY`

The public layer may compress explanation. It must not collapse those states.

## Demand Signal is a presentation, not a new data family

The canonical object already exists as the **Demand question** defined in `discovery-scene-market-construction-v1.md`.

`DemandSignalObject.tsx` is its public presentation.

Underlying chain:

`QUESTION → OPTION → RECORDED VOTE → AGGREGATE SIGNAL → HUMAN / OPERATOR RESPONSE`

The visual presentation should make these legible:

1. question / want,
2. market or city,
3. real recorded votes,
4. configured threshold when present,
5. possible response when explicitly recorded/configured,
6. one next action.

Truth gates:
- `VOTE ≠ ATTENDANCE`
- `DEMAND ≠ SUPPLY`
- `THRESHOLD ≠ AUTOMATIC MOMENT`
- `SIGNAL ≠ OFFER`
- `OFFER ≠ PURCHASE`

A threshold being met must therefore render as **threshold met**, never **unlocked**, unless a separate supply/offer/Moment record actually exists.

Implementation anchor:

`apps/web/src/components/promorang/DemandSignalObject.tsx`

## Production absence is part of the experience

The public homepage must not seed fake market activity.

Use:
- production listing demand questions,
- production city demand questions,
- their recorded vote counts,
- confirmed writes,
- approved Discoveries and real linked context.

If there are no recorded questions, say so. Empty market state is more valuable than false social proof because it tells PROMORANG what distribution work remains.

## Failed write law

A public ask is not confirmed merely because the browser stored it locally.

- successful authoritative write → may say **recorded**,
- failed authoritative write → must say recording could not be confirmed,
- local/browser state must not be counted or presented as durable public market activity.

This follows PR #129's broader rule:

`LOCAL CLIENT STATE ≠ DURABLE PLATFORM HISTORY`

## Authentication continuity

Authentication is a checkpoint, not a product reset.

A public action should preserve its object and return path whenever the current infrastructure supports it.

Examples:
- open a Demand signal → authenticate → return to that signal,
- begin a Moment/claim flow → authenticate → resume the same object,
- open PromoCard → authenticate → continue to PromoCard rather than generic home.

Use existing `next` / return-path infrastructure.

## Public information architecture

Primary public mental model:

- **Explore** — approved market knowledge and current opportunities.
- **Wanted** — recorded Demand questions and signals.
- **Moments** — concrete things people can actually join or do.
- **For business** — understand market evidence, then create a distinct response.
- **Build with PROMORANG** — choose a path by job-to-be-done.

Do not make internal modules the primary navigation model.

## Object continuity

Public and signed-in surfaces should use the same canonical vocabulary while respecting different role lenses.

### Discovery
Approved public knowledge.

### Demand question / Signal
Recorded expressed interest. Not supply.

### Scene
Persistent cultural / market context.

### Moment / Offer / Person
A concrete response or opportunity.

### Ticket / Pass
Access when access actually exists.

### Receipt / proof artifact
Evidence that a state transition or verified action actually occurred.

### PromoCard
Participant continuity for issued access, returns and retained history.

### Piece / Memory
Retained consequence only when durably issued.

## Homepage v1

Implementation anchor:

`apps/web/src/components/marketing/PublicMarketHome.tsx`

The homepage should:

1. show one recorded Demand question in the first viewport when one exists,
2. otherwise show an explicit empty market state,
3. allow a visitor to submit an ask without pretending a failed write succeeded,
4. show only production-backed vote/question state as public market counts,
5. explain the loop with a Night Trail rather than generic feature cards,
6. render aggregate truth with a Receipt,
7. separate demand from operator response,
8. introduce PromoCard as continuity for actually issued/retained value rather than a magic reward balance.

## Design Lab role

Design Lab should develop PROMORANG's proprietary **presentation and interaction vocabulary** on top of canonical truth, not invent parallel product state.

Every experiment should answer:
- Which canonical object/state is this rendering?
- What is the authoritative source?
- Which state transitions are real?
- Which equivalences are forbidden?
- What should the object look like before and after a verified transition?
- Can the same object survive public → auth → signed-in continuation?
- Is there one dominant next action?

When a presentation proves durable, promote the visual pattern without creating a new data family unless a separate canonical architecture decision explicitly requires one.

## Migration order after homepage

1. `/for-brands` and `/for-merchants`
   - lead with recorded demand evidence,
   - then show a distinct operator response,
   - then show verified outcome evidence.

2. `/how-it-works` and `/what-is-promorang`
   - remove duplicated feature explanations,
   - tell the canonical object journey.

3. `/join`
   - preserve job-first routing,
   - represent each path through the object/outcome it operates.

4. public Moment / Scene / Discovery / creator / merchant / venue / offer pages
   - keep the object stable across authentication.

5. campaign / activation landing pages
   - preserve `signal → response → verified consequence` boundaries.

## Acceptance test

A new visitor should answer within ten seconds:

1. What recorded thing is happening here?
2. What can I do right now?
3. What does my action mean — and what does it **not** mean?
4. Why might an operator/business respond?
5. What would become mine only after a real verified/issued consequence?

If the answer requires a feature matrix, or if the interface invents activity to appear alive, the surface has failed convergence.
