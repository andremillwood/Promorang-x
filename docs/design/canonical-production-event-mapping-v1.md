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

### Participant check-in observation
`moment_participants.checked_in_at` is used by more than one flow. A normal check-in may be immediately verified, while `/complete` can set check-in while proof remains pending.

Therefore the database transition itself emits:

`attendance.checkin.observed`

Truth class: `observed`

Canonical object: `moment_participation`

This producer runs for both rows inserted already checked-in and rows later updated with `checked_in_at`.

Important boundary:

**check-in record ≠ reviewed proof ≠ verified attendance outcome**

Later proof approval is the stronger verification event.

### Guest RSVP intent
A new confirmed `guest_moment_rsvps` row emits:

`attendance.rsvp.observed`

Truth class: `observed`

The event carries only guest count, whether the RSVP is linked to a known user, and record references. It does not copy guest name, mobile, email, pass code, or consent details.

Important boundary:

**RSVP ≠ arrival**

### Guest verified attendance
Guest check-in creates/upserts a first-class `guest_attendance_receipts` record. A receipt in `verified` or `claimed` state emits:

`attendance.guest.verified`

Truth class: `verified`

Canonical object: `guest_attendance_receipt`

The journal records the verification method but not PII or the guest pass code.

### Guest attendance reversal
The existing receipt domain already supports `status='reversed'`.

When the authoritative receipt transitions to reversed, the database appends:

`attendance.guest.reversed`

Truth class: `administrative`

The reversal references the earlier `attendance.guest.verified` canonical event through `reversal_of_event_id` and `causation_event_id`. The prior event remains unchanged.

The current receipt row does not store who performed the reversal, so the canonical reversal actor is intentionally left unset and marked as a domain-state correction. PROMORANG must not attribute an actor the domain cannot prove.

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

The canonical layer defines a general correction envelope but does **not** expose a generic admin “reverse anything” endpoint.

A correction must:
1. reconcile the authoritative domain record first;
2. append a new canonical event;
3. reference the prior event in `reversal_of_event_id` and `causation_event_id`;
4. preserve the original event unchanged;
5. retain the administrative reason where the domain stores one;
6. trigger downstream projection reconciliation where required.

The first real domain-backed example is guest attendance reversal. The generic correction helper remains contract-only until another domain exposes a legitimate reversal mutation.

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
- check-in captured
- claim recorded

### attributed
The event is credibly linked to a campaign/distributor/source, but this does not by itself prove business incrementality.

### verified
A defined verification policy has been satisfied.

Examples in this slice:
- merchant redemption validated
- guest attendance receipt verified
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
- `canonical:attendance-checkin:<moment_participant_id>`
- `canonical:guest-rsvp:<rsvp_id>`
- `canonical:guest-attendance:<attendance_receipt_id>`
- `canonical:guest-attendance-reversed:<attendance_receipt_id>`
- `canonical:proof-submission:<submission_id>`
- `canonical:proof-review:<submission_id>:approve`
- `canonical:proof-review:<submission_id>:reject`
- `canonical:settlement-queued:<queue_id>`
- `canonical:settlement-paid:<queue_id>`
- `canonical:correction:<prior_event_id>:<event_name>`

The service persistence adapter uses `idempotency_key` as the database conflict key and returns the existing event when an insert is ignored as a duplicate. Database trigger producers use `ON CONFLICT (idempotency_key) DO NOTHING`.

## Security / privacy

`canonical_events` is RLS-enabled with no direct `anon` or `authenticated` client policy in v1.

Trusted backend/service-role paths and trusted database trigger functions write the journal.

The journal intentionally does **not** store:
- redemption codes;
- guest pass codes;
- guest names, mobile numbers or emails;
- full proof bundles;
- evidence media URLs;
- free-form proof review reasons;
- payout/payment references;
- unnecessary user profile data.

Those values remain in their existing domain tables and permission boundaries.

## Failure boundary

API-layer canonical journaling is additive and best-effort during convergence.

An already-committed merchant redemption, proof decision, settlement queue, or settlement payment must not be rolled back only because the new journal table has not yet been migrated or because API-layer journaling temporarily fails.

Attendance producers have intentionally moved closer to the transaction boundary as database triggers because the domain table transition itself is the event source.

Failures must become operational alerts before downstream product behavior relies on the journal.

Long term, remaining critical API producers should move toward a transactional outbox or database-side event write once the envelope stabilizes.

## Why mixed API + database producers

Use the narrowest authoritative boundary available.

Database trigger is appropriate where the row transition itself has stable meaning:
- participant check-in observed;
- guest RSVP intent;
- guest attendance receipt verified/reversed.

API/service adapter is currently appropriate where meaning depends on orchestrated domain behavior:
- merchant atomic redemption result;
- proof review;
- settlement queue/paid transition.

This avoids both extremes: duplicating all domain logic into the journal or pretending every row update has the same semantic strength.

## Current producer coverage

### Implemented
- Merchant offer redemption → `offer.redemption.verified`
- Participant check-in row → `attendance.checkin.observed`
- Guest RSVP → `attendance.rsvp.observed`
- Guest attendance receipt → `attendance.guest.verified`
- Guest attendance receipt reversal → `attendance.guest.reversed`
- Proof submitted → `proof.submission.observed`
- Proof approved → `proof.review.verified`
- Proof rejected → `proof.review.rejected`
- Settlement queue created from approved proof → `settlement.payout.queued`
- Manual settlement queue created by Admin → `settlement.payout.queued`
- Manual payout marked paid → `settlement.payout.paid`
- Successful automated payout → `settlement.payout.paid`

### Contract only, not yet exposed as a generic mutation
- generic append-only correction helper

### Not yet canonicalized
- explicit walk-in/door exception objects where no authoritative domain record exists yet
- ranked settlement batch queue events
- real transaction evidence separate from redemption
- Gems / Points / Tickets ledger events
- Piece listing / transfer / provenance events
- PromoShare ticket/draw/result events
- Save & Win principal / prize events
- organization membership / role-grant changes
- Brand activation commitments and evidence-pack decisions
- Agency managed-client approvals / result packaging

## Next producer sequence

1. Define explicit walk-in and door-exception domain records instead of encoding them as UI-only states.
2. Real merchant transaction evidence (`transaction.recorded`) only where transaction-value evidence exists.
3. Creator mission/work projection over proof + settlement lineage.
4. Admin domain-specific holds and reversals for additional domains.
5. Brand activation commitment and evidence-pack projections.
6. Agency managed-client approval/result projections.
7. Gems / Points / Tickets / Save & Win / Piece transfer ledger events.
8. Attention items and notification projections sourced from canonical state transitions.

## Production gate

Do not make analytics, reward settlement, Brand Evidence Packs or Admin decisions dependent on the canonical journal until:

1. migrations are deployed in order;
2. event contract + idempotency tests pass;
3. database-trigger producers are exercised against a migration test database;
4. event counts reconcile to existing domain records;
5. missing-event monitoring exists;
6. reversal semantics are exercised through at least one real domain correction flow;
7. actor/context attribution is reliable or explicitly unknown;
8. privacy review confirms the journal remains reference-oriented;
9. backfill strategy is defined for pre-journal historical records;
10. internal service paths that bypass API producers are identified;
11. journal-write failure rate is observable.
