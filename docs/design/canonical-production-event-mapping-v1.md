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

### Host proof submission
The proof path already stores `proof_submissions` and related evidence.

Canonical event:

`proof.submission.observed`

Truth class: `observed`

Important boundary:

**submitted evidence ≠ verified participation**

### Host/admin proof review
The review path already updates proof state and may trigger participation events, rewards, memories, Pieces, payouts and automation.

Approval canonical event:

`proof.review.verified`

Truth class: `verified`

Rejection canonical event:

`proof.review.rejected`

Truth class: `administrative`

The journal does not copy free-form review reasons or raw evidence URLs. Those remain in the proof domain/audit trail.

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
- optional reversal reference;
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

### incremental
Reserved for outcomes supported by a valid incremental/causal method. It must never be inferred merely because an outcome is attributed or verified.

### administrative
A governance/control event such as rejection, hold, resolution, permission change, or correction.

## Idempotency

Retries must not create duplicate canonical truth.

Initial stable keys:
- `canonical:offer-redemption:<issuance_id>`
- `canonical:proof-submission:<submission_id>`
- `canonical:proof-review:<submission_id>:approve`
- `canonical:proof-review:<submission_id>:reject`

## Security / privacy

`canonical_events` is RLS-enabled with no direct `anon` or `authenticated` client policy in v1.

Trusted backend/service-role paths write the journal.

The journal intentionally does **not** store:
- redemption codes;
- full proof bundles;
- evidence media URLs;
- free-form review reasons;
- unnecessary user profile data.

Those values remain in their existing domain tables and permission boundaries.

## Failure boundary

During convergence, canonical journaling is additive and best-effort.

An already-committed merchant redemption or proof decision must not be rolled back only because the new journal table has not yet been migrated or because journaling temporarily fails.

Failures are logged and must become operational alerts before the journal is relied upon as infrastructure.

Long term, critical event creation should move closer to the transaction boundary (database transaction/outbox) once the envelope stabilizes.

## Why API-layer first

The first slice intentionally instruments the real API boundaries instead of rewriting the domain services immediately.

Advantages:
- low migration risk;
- existing domain logic remains untouched;
- event contract can be tested with real data;
- the journal can be inspected before broader adoption.

Limitation:
- automatic/internal service calls that bypass these API endpoints are not yet guaranteed to emit canonical events.

That limitation is explicit. The next maturity step is a transactional outbox or service-level producer after this first slice proves the envelope.

## Next producer sequence

1. Merchant transaction evidence (`transaction.recorded`) — only when real transaction evidence exists.
2. Host/check-in arrival events — RSVP, walk-in and verified attendance remain separate.
3. Creator submission → approval → settlement.
4. Admin hold / resolution / reversal / audit.
5. Brand activation commitment and evidence-pack projections.
6. Agency managed-client approval/result projections.
7. Gems / Points / Tickets / Save & Win / Piece transfer ledger events.
8. Attention items and notification projections sourced from canonical state transitions.

## Production gate

Do not make analytics, reward settlement, Brand Evidence Packs or Admin decisions dependent on the canonical journal until:

1. migration is deployed;
2. idempotency tests pass;
3. event counts reconcile to existing domain records;
4. missing-event monitoring exists;
5. reversal semantics are tested;
6. actor/context attribution is reliable;
7. privacy review confirms the journal remains reference-oriented.
