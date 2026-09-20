# Discovery + Scene Market Construction v1

## Thesis

PROMORANG should treat **Discovery** and **Scene** as separate canonical market objects that become more useful when connected, not as interchangeable feed content.

- A **Discovery** is approved local knowledge about a place, thing, pattern, or opportunity that PROMORANG is willing to publish as a public record.
- A **demand question** records what people want, prefer, or need clarified. It is a market signal, not supply.
- A **Scene** is the persistent cultural / market context that can hold people, places, Discoveries, Moments, rituals, and operator activity over time.

The production chain is:

`PROPOSAL → REVIEW → APPROVED DISCOVERY → INTEREST / DEMAND → SCENE CONTEXT → MOMENT / OFFER / PERSON → VERIFIED ACTION → RETAINED HISTORY`

No interface should silently skip a state in that chain.

## Object boundaries

### Discovery

A proposed Discovery begins as a claim that local knowledge should enter the public market graph.

Lifecycle truth:

`PENDING → APPROVED | REJECTED`

Rules:

- `pending` is not public approval.
- `approved` means the Discovery crossed the platform review boundary.
- `approved` does not imply a live offer, attendance, purchase, fulfillment, endorsement, or ROI.
- Missing Scene, place, media, creator, or action relationships remain missing. The UI must not infer them.
- Public Discovery surfaces should resolve approved production records only; demo or curated fallback records must not be substituted when production data is empty or unavailable.

### Demand question

A demand question is not a Discovery approval state. It is a separate signal object used to measure expressed interest or verify uncertain market information.

Signal chain:

`QUESTION → OPTION → RECORDED VOTE → AGGREGATE SIGNAL → HUMAN / OPERATOR RESPONSE`

Rules:

- Question creation starts from the data actually written.
- Options start with their real recorded vote counts; the client must not seed artificial activity.
- `VOTE ≠ ATTENDANCE`.
- `THRESHOLD ≠ GUARANTEED SUPPLY`.
- `SIGNAL ≠ OFFER`.
- `OFFER ≠ PURCHASE`.
- A failed write must not be presented as a successful signal.

### Scene

A Scene is persistent context, not merely a category or content collection.

A Scene may contain:

- active memberships,
- linked Moments,
- approved Discoveries,
- operators / contributors,
- invitations and attribution,
- recurring rituals or market patterns,
- verified activity accumulated over time.

Rules:

- Only public, active Scenes belong on public Scene surfaces.
- Scene membership is a relationship record, not proof of attendance.
- A linked Moment remains a separate canonical object.
- A linked Discovery remains subject to its own approval truth.
- A Scene does not manufacture supply because demand exists.
- A Scene should remain useful even when no current Moment or offer is active.

## Production market-construction chain

The participant-facing model is:

`FIND → SIGNAL → ENTER CONTEXT → ACT → KEEP`

The canonical objects underneath remain separate:

1. **Discovery** — what is known or approved.
2. **Demand** — what people say they want / confirm.
3. **Scene** — where the market or culture persists.
4. **Moment / Offer / Person** — the concrete response or opportunity.
5. **Verified action** — what actually happened.
6. **Retained history** — what can be kept, revisited, and used later.

A UI may compress the journey for a participant, but the data model must not collapse the truth states.

## Production sources

### Discovery reads

`apps/web/src/hooks/useDiscoveries.ts`

- Public list reads approved production `discoveries` only.
- Detail resolution reads the production Discovery record and real linked context.
- No curated/demo fallback is part of the production read path.

### Discovery market surface

`apps/web/src/components/discovery/DiscoveriesFeedSection.tsx`

- Separates recorded demand questions from approved Discoveries.
- Uses real listing demand sources and real vote writes.
- Does not display fake balances, fallback visits, synthetic perks, or static poll activity.
- Empty/error production states stay empty/error.

### Discovery detail

`apps/web/src/pages/DiscoveryDetail.tsx`

- Resolves the approved canonical Discovery.
- Removes simulated reviews, comments, votes, squad invites, fake unlocks, and local-only Vault claims.
- Makes Scene, creator, source links, recorded interest, and recorded action explicit only when their records exist.

### Discovery proposal

`apps/web/src/components/discovery/SubmitDiscoveryModal.tsx`

- Creates a pending proposal.
- Does not self-approve a participant submission.
- Does not award or claim unrecorded PromoPoints / reputation.
- Write failure remains failure.

### Demand creation

`apps/web/src/components/discovery/AskQuestionModal.tsx`

- Persists the question and its options.
- Starts from zero-state recorded activity instead of seeded votes.
- Does not promise that a threshold automatically creates a Moment, perk, or supply response.

### Shared demand aggregation

`apps/web/src/hooks/useDiscoveryDemand.ts`

- Uses production listing / city demand sources and locally recorded named intent.
- Does not inject static `DISCOVERY_POLLS` or seeded named intent into live market activity.

### Scene reads / membership

`apps/web/src/hooks/useScenes.ts`

- Lists public active Scenes.
- Loads real membership, linked Moments, and approved Discoveries.
- Scene join persists membership and preserves invite attribution when present.

### Scene directory / detail

`apps/web/src/pages/Communities.tsx`
`apps/web/src/pages/CommunityDetail.tsx`

- Directory is backed by live Scene records.
- Detail keeps membership, invite, Moment, Discovery, and people-context relationships separate.
- Scene membership is not treated as attendance.

## Same objects, different role lenses

Canonical reuse does not mean identical dashboards.

### Participant

Needs to answer:

- What is worth noticing?
- What do I want?
- Which Scene is this part of?
- What can I actually do now?
- What should I keep afterward?

The participant surface should be low-jargon and action-oriented.

### Host

Needs to understand:

- What is forming inside the Scene?
- Which demand signals are real?
- What Moments or supply should be created or changed?
- What actually happened after activation?

### Merchant

Needs to see demand as potential supply opportunity, then create a distinct offer / inventory response. Demand itself is not a sale.

### Creator

Needs to see where attention / cultural contribution can add value, then distinguish contribution, distribution, attribution, earning, and settlement.

### Brand

Needs market evidence, audience/context fit, and attributable activation outcomes without treating interest as conversion.

### Agency

Needs client-scoped market context and response planning while preserving client ownership, source provenance, and measured outcomes.

### Admin

Needs source truth, review state, correction history, and the ability to distinguish submitted information from approved public knowledge.

## Truth gates

The following equivalences are forbidden:

- proposal = approval
- Discovery = endorsement
- vote = attendance
- demand = supply
- threshold = automatic Moment
- Scene membership = attendance
- Scene = Moment
- interest = conversion
- offer = purchase
- check-in = purchase
- observed activity = verified value
- local client state = durable platform history

## Empty-state rule

Production absence is meaningful.

When there are no approved Discoveries, no demand questions, no linked Moments, or no Scene relationship, the UI should say so. It must not use sample records to make the market look active.

## Review / moderation boundary

This slice intentionally does not invent a new generalized moderation backend merely to make every Discovery proposal share one review screen. Existing authoritative review / inventory flows remain authoritative until a concrete operator workflow requires consolidation.

What matters now is that participant-facing proposal creation cannot cross the approval boundary by itself.

## Acceptance criteria

This family is converged when:

- approved Discovery public reads no longer depend on curated fallback data,
- proposed Discoveries are pending until reviewed,
- failed proposal writes do not present success,
- demand questions persist real zero-state counts,
- live demand aggregation excludes static seeded activity,
- votes are written through an authoritative source,
- Discovery detail contains no simulated social proof or fabricated downstream outcomes,
- Scene detail uses real Scene / membership / Moment / approved-Discovery relationships,
- the UI names the major truth boundaries instead of hiding them,
- different stakeholder lenses can reuse the same canonical objects without being visually or operationally identical.

## Next family

After this convergence, the next canonical family is:

`Piece + Vault + PromoShare + Save & Win + retained value / history`

That work should preserve the same rule: retained value must be based on durable records, not local optimism or synthetic reward state.
