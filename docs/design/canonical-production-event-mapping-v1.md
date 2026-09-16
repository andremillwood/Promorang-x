# PROMORANG Canonical Production Event Mapping v1

Status: first production convergence slice

## Purpose

This document maps the Design Lab canonical object/event architecture into real production writes without replacing mature domain tables.

The governing rule remains:

> Different stakeholder interfaces may interpret the work. They may not invent different facts.

The canonical journal is a cross-domain lineage layer. Existing domain records remain authoritative for rich details.

## Existing production truth already in place

### Merchant redemption
The current offer redemption path already:
- executes an atomic redemption RPC;
- updates `offer_issuances`;
- writes `offer_redemption_events`;
- records marketplace funnel state;
- records a verified participant action;
- may update contributor/reward consequences.

The canonical journal therefore references the completed issuance/redemption. It does not replace those writes.

Canonical event:

`offer.redemption.verified`

Truth class: `verified`

Canonical object: `offer_issuance`

Important boundary:

**verified redemption ≠ paid transaction**

No transaction/revenue event is created from the redemption alone.

### Host / creator proof submission
The proof path already stores `proof_submissions` and related evidence. Some submissions are also linked to content missions through `source_mission_id` / mission participation.

Canonical event:

`proof.submission.observed`

Truth class: `observed`

Important boundary:

**submitted evidence ≠ verified participation ≠ approved creator work**

The first event remains proof-generic. Mission linkage is carried only as a reference so later Creator projections can interpret the same proof without creating a second factual history.

### Host/admin proof review
The review path already updates proof state and may trigger participation events, rewards, memories, Pieces, payouts and automation.

Approval canonical event:

`proof.review.verified`

Truth class: `verified`

Rejection canonical event:

`proof.review.rejected`

Truth class: `administrative`

The journal does not copy free-form review reasons or raw evidence URLs. Those remain in the proof domain/audit trail.

### Settlement queue
A verified proof may create `moment_ledger` + `manual_payout_queue` records.

Canonical event:

`settlement.payout.queued`

Truth class: `administrative`

Important boundary:

**approved ≠ queued ≠ paid**

A queue record means PROMORANG has created a settlement obligation/work item. It does not prove the beneficiary has received money.

### Settlement paid
Only the production transition that marks a `manual_payout_queue` row `paid` creates:

`settlement.payout.paid`

Truth class: `verified`

The canonical event records that a payment reference exists but does not copy the payment reference itself into the cross-domain journal.

Both manual paid and successful automated payout paths emit the same canonical settlement-paid event, using the queue item as the stable object.

## Canonical lineage reads

The existing Host/Admin proof audit endpoint now supplements its domain-specific timeline with `canonical_lineage` for the relevant `proof_submission`.

This is intentionally permission-scoped through the existing proof audit authorization boundary. The canonical journal does not expose a broad client-side search API in v1.

If the journal migration is not present yet, lineage returns an empty array rather than making proof audit unavailable.

## Correction / reversal contract

The canonical layer now defines a correction envelope but does **not** expose a generic admin “reverse anything” endpoint.

A correction must:
1. reconcile the authoritative domain record first;
2. append a new canonical event;
3. reference the prior event in `reversal_of_event_id` and `causation_event_id`;
4. preserve the original event unchanged;
5. state the administrative reason;
6. trigger downstream projection reconciliation where required.

Example future event:

`offer.redemption.reversed`

The prior `offer.redemption.verified` event remains in history. The reversal changes current interpretation; it does not rewrite history.

This distinction is critical for dispute handling, payout reconciliation, Brand evidence and Admin audit.

## Canonical event envelope

The first production envelope contains:
- event name + version;
- occurred/recorded time;
- actor user / optional organization / role;
- subject user when relevant;
- canonical object type/id;
- aggregate type/id;
- place/campaign/experience references where known;
- source and source-event reference;
- correlation id;
- stable idempotency key;
- truth class;
- optional causation / reversal reference;
- minimal metadata pointing back to the domain record.

## Truth classes

### observed
A real source record exists, but the event has not crossed a verification boundary.

Examples:
- proof submitted
- RSVP recorded
- claim recorded

### attributed
The event is credibly linked to a campaign/distributor/source, but this does not by itself prove business incrementality.

### verified
A defined verification policy has been satisfied.

Examples in this slice:
- merchant redemption validated
- host/admin proof approved
- payout marked paid with a payment reference

### incremental
Reserved for outcomes supported by a valid incremental/causal method. It must never be inferred merely because an outcome is attributed or verified.

### administrative
A governance/control event such as rejection, queueing, hold, resolution, permission change, or correction.

## Idempotency

Retries must not create duplicate canonical truth.

Initial stable keys:
- `canonical:offer-redemption:<issuance_id>`
- `canonical:proof-submission:<submission_id>`
- `canonical:proof-review:<submission_id>:approve`
- `canonical:proof-review:<submission_id>:reject`
- `canonical:settlement-queued:<queue_id>`
- `canonical:settlement-paid:<queue_id>`
- `canonical:correction:<prior_event_id>:<event_name>`

The persistence adapter uses `idempotency_key` as the database conflict key and returns the existing event when an insert is ignored as a duplicate.

## Security / privacy

`canonical_events` is RLS-enabled with no direct `anon` or `authenticated` client policy in v1.

Trusted backend/service-role paths write and read the journal.

The journal intentionally does **not** store:
- redemption codes;
- full proof bundles;
- evidence media URLs;
- free-form proof review reasons;
- payout/payment references;
- unnecessary user profile data.

Those values remain in their existing domain tables and permission boundaries.

## Failure boundary

During convergence, canonical journaling is additive and best-effort.

An already-committed merchant redemption, proof decision, settlement queue, or settlement payment must not be rolled back only because the new journal table has not yet been migrated or because journaling temporarily fails.

Failures are logged and must become operational alerts before the journal is relied upon as infrastructure.

Long term, critical event creation should move closer to the transaction boundary through a transactional outbox or database-side event write once the envelope stabilizes.

## Why API-layer first

The first slice intentionally instruments the real API boundaries instead of rewriting mature domain services immediately.

Advantages:
- low migration risk;
- existing domain logic remains untouched;
- event contract can be tested with real data;
- the journal can be inspected before broader adoption;
- truth boundaries become explicit without changing current user-visible semantics.

Limitation:
- automatic/internal service calls that bypass these API endpoints are not yet guaranteed to emit canonical events.

That limitation is explicit. The next maturity step is a transactional outbox or service-level producer after this first slice proves the envelope.

## Current producer coverage

### Implemented
- Merchant offer redemption → `offer.redemption.verified`
- Proof submitted → `proof.submission.observed`
- Proof approved → `proof.review.verified`
- Proof rejected → `proof.review.rejected`
- Settlement queue created from approved proof → `settlement.payout.queued`
- Manual settlement queue created by Admin → `settlement.payout.queued`
- Manual payout marked paid → `settlement.payout.paid`
- Successful automated payout → `settlement.payout.paid`

### Contract only, not yet exposed as a mutation
- append-only correction / reversal event

### Not yet canonicalized
- ranked settlement batch queue events
- RSVP / walk-in / check-in distinctions from the canonical attendance source
- real transaction evidence separate from redemption
- Gems / Points / Tickets ledger events
- Piece listing / transfer / provenance events
- PromoShare ticket/draw/result events
- Save & Win principal / prize events
- organization membership / role-grant changes
- Brand activation commitments and evidence-pack decisions
- Agency managed-client approvals / result packaging

## Next producer sequence

1. Host arrival/check-in source of truth — RSVP, arrival, walk-in, exception and verified attendance remain separate.
2. Real merchant transaction evidence (`transaction.recorded`) only where transaction-value evidence exists.
3. Creator mission/work projection over proof + settlement lineage.
4. Admin domain-specific hold / resolution / reversal actions.
5. Brand activation commitment and evidence-pack projections.
6. Agency managed-client approval/result projections.
7. Gems / Points / Tickets / Save & Win / Piece transfer ledger events.
8. Attention items and notification projections sourced from canonical state transitions.

## Production gate

Do not make analytics, reward settlement, Brand Evidence Packs or Admin decisions dependent on the canonical journal until:

1. migration is deployed;
2. event contract + idempotency tests pass;
3. event counts reconcile to existing domain records;
4. missing-event monitoring exists;
5. reversal semantics are exercised through at least one real domain correction flow;
6. actor/context attribution is reliable;
7. privacy review confirms the journal remains reference-oriented;
8. backfill strategy is defined for pre-journal historical records;
9. internal service paths that bypass API producers are identified;
10. journal-write failure rate is observable.
