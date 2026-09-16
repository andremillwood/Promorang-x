# PROMORANG Canonical Object & Event Architecture v1

Status: Design Lab foundation

## Purpose

PROMORANG now has strong participant objects, stakeholder work objects, proof artifacts, economy objects, and cross-role workflows. This document defines the shared object/event spine beneath them so the interface never becomes more rigorous than the data model.

The governing rule is:

> Different stakeholder interfaces may interpret the work. They may not invent different facts.

This architecture adopts the repository's existing Demand OS hierarchy rather than creating a competing ontology:

1. Organization
2. Place
3. Campaign
4. Experience
5. Action
6. Proof
7. Outcome
8. Relationship
9. Incentive
10. Distribution
11. Learning

`Moment` remains a participant-facing presentation of a time-bound or participatory Experience. It is not the universal storage type.

---

## 1. Canonical entity registry

### Identity / ownership

#### Person
A human identity. One person may hold multiple roles.

Canonical facts:
- person_id
- account identity
- verified contact methods
- consent state
- relationship memberships

Not canonical at this layer:
- active UI role
- workspace currently selected
- marketing persona labels

#### Organization
Business, brand, agency, creator studio, venue operator, community, charity, public body, etc.

Canonical facts:
- organization_id
- owner/legal operator where known
- memberships and role grants
- verification status
- organization relationships

#### Membership / Role Grant
Connects Person ↔ Organization with permissions.

Examples:
- creator studio owner
- venue manager
- cashier / validator
- brand marketer
- agency operator
- admin trust operator

A role grant is authorization. It is not identity.

#### Place
A venue, service area, neighborhood, route, or digital location.

Canonical facts:
- place_id
- organization owner/operator
- geography or service area
- operating metadata
- validation capabilities

---

## 2. Demand coordination objects

### Campaign
Coordination envelope for an objective, audience, budget/reward commitments, timeframe, proof policy, distribution plan, and success definition.

Campaign is not the atomic participant object.

### Experience
The public promise or discoverable thing.

Examples:
- Moment
- Offer
- Visit
- Product drop
- Cause/program
- Service
- Content participation

### Discovery Signal
A participant expression of demand or preference.

Truth boundary:
`signal != supply commitment`

May contribute to an Experience only when a supply-side actor explicitly responds or creates one.

### Mission / Creator Brief
A scoped work contract derived from a Campaign/Experience.

Truth boundary:
`accepted brief != submitted work != approved work != settlement`

### Offer / Perk
A promise issued by an organization that can be claimed/presented/validated under defined conditions.

### PromoKey
A branded access credential pointing to an underlying entitlement/access grant.

Truth boundary:
PromoKey presentation does not itself prove use.

### PromoCard
Participant credential/surface that can hold or present multiple access objects. It is not itself the canonical ledger for every benefit.

---

## 3. Action model

An Action records what an actor attempted or performed.

Examples:
- save
- signal/vote
- RSVP
- accept brief
- submit deliverable
- share
- refer
- book
- present credential
- scan
- check in
- validate
- purchase
- review
- list Piece
- buy Piece
- park Gems
- claim reward

Every Action should include where applicable:
- action_id
- action_type
- actor_person_id
- acting_as_organization_id / role_grant_id
- campaign_id
- experience_id
- place_id
- related_object_id(s)
- occurred_at
- source/client/channel
- idempotency key
- correlation/lineage id
- current processing state

An Action is not automatically Proof and does not automatically create an Outcome.

---

## 4. Event contract

Every state-changing event should share a common envelope.

```ts
interface PromorangEventEnvelope {
  event_id: string;
  event_type: string;
  schema_version: number;
  occurred_at: string;
  recorded_at: string;

  actor_person_id?: string;
  actor_organization_id?: string;
  actor_role_grant_id?: string;

  object_type: string;
  object_id: string;

  campaign_id?: string;
  experience_id?: string;
  place_id?: string;
  participant_person_id?: string;

  correlation_id: string;
  causation_event_id?: string;

  source: "web" | "mobile" | "qr" | "pos" | "api" | "admin" | "system" | "import";
  client_event_id?: string;
  idempotency_key?: string;

  confidence?: number;
  verification_state?: "observed" | "attributed" | "verified" | "disputed" | "reversed";

  payload: Record<string, unknown>;
}
```

The exact production schema may differ, but these semantics should remain.

### Required event properties

1. **Identity** — globally unique event id.
2. **Versioning** — event schema can evolve without rewriting history.
3. **Actor** — who/what caused the event.
4. **Object** — what changed.
5. **Time** — occurred_at differs from recorded_at where relevant.
6. **Lineage** — correlation id connects the full demand/proof chain.
7. **Causation** — state transformations point back to prior events.
8. **Source** — scanner, POS, human review, API, etc.
9. **Verification class** — observed / attributed / verified / disputed / reversed.
10. **Idempotency** — repeated scans/retries must not silently create duplicate outcomes.

---

## 5. Proof model

Proof is evidence that can support or challenge a claim about an Action.

Proof types may include:
- QR / signed token
- merchant validation
- host check-in
- human approval
- POS / transaction event
- receipt
- ticket scan
- media submission
- API/webhook event
- geofence/location evidence
- account linkage

Proof record requires:
- proof_id
- subject action/outcome/object
- proof_type
- issuer/source
- captured_at
- verification status
- confidence / limitations where relevant
- immutable source reference when appropriate
- review/audit history

### Proof strength ladder

`Observed → Attributed → Verified → Incremental`

These classes must never be collapsed visually or analytically.

Examples:
- RSVP = observed intent
- creator link click = attributed action
- venue check-in = verified attendance
- POS event = verified transaction evidence
- incremental outcome requires comparison/causal methodology beyond simple attribution

---

## 6. Outcome model

Outcome is a derived or verified business/participant result supported by evidence.

Examples:
- verified attendance
- validated redemption
- paid purchase
- qualified lead
- approved creator publication
- donation
- review
- repeat visit

Outcome must retain references to the supporting Action(s) and Proof(s).

Do not store only an aggregate result when the canonical event lineage can be retained.

---

## 7. Evidence Pack / stakeholder views

Evidence Pack, Managed Result Pack, participant Proof Receipt, merchant Validation Slip, Creator Approval Record, Host Attendance Close, and Admin Case are **views or artifacts over canonical events**, not separate versions of truth.

Example lineage:

`Campaign AC-5021`
→ `Creator Brief CB-0421`
→ `Participant Booking ACT-8821`
→ `Host/Venue Validation PRF-1182`
→ `Outcome OUT-1182 verified_attendance`
→ `Brand Evidence Pack EP-5021 updated`
→ `Agency Result Pack MR-117 updated`
→ optional `Admin Exception EX-7712`
→ `Audit Event AE-7712`

If PRF-1182 is later reversed, every downstream view must reconcile from the same event history.

---

## 8. Relationship graph

A major platform object is the relationship created or strengthened by repeated verified interactions.

Relationships include:
- person ↔ organization
- person ↔ place
- person ↔ Scene/community
- creator ↔ audience/category/place authority
- organization ↔ organization
- agency ↔ client organization
- brand ↔ merchant/venue

Relationship state should be derived from interaction history, consent, and explicit membership—not merely follows or raw points.

This graph supports:
- return audience
- customer lifecycle
- recommendations
- creator reputation
- audience portability rules
- CRM permissions
- win-back / next-best action

---

## 9. Incentive and economy architecture

The economy must keep distinct ledgers and semantics.

### Gems
Spendable internal value.

### Points
Participation/progression record. Not cash-like value.

### PromoShare Tickets
Entries bound to a named draw.

### PromoKey / Perk
Access/benefit entitlement.

### Piece
Durable collectible/provenance object.

### Save & Win principal
Participant-owned parked Gems; separate from the committed prize pool.

Canonical rule:

> Cash-like value, merchant-funded benefits, access, status, participation score, draw entries, and collectibles must never share one balance/ledger semantic.

Each issuance, transfer, hold, spend, reversal, expiration, settlement, and return writes a ledger/event entry.

---

## 10. Piece / marketplace event chain

A Piece should have canonical identity and append-only provenance history.

Events may include:
- piece_issued
- piece_kept
- piece_utility_activated
- listing_created
- listing_updated
- listing_cancelled
- purchase_committed
- gem_settlement_recorded
- ownership_transferred
- transfer_reversed where legally/operationally valid

Ask price is not market value. Transfer history does not imply investment performance.

---

## 11. PromoShare event chain

Canonical objects:
- Draw
- Prize commitment
- Ticket issuance
- Locked ticket set
- Draw result
- Claim

Events:
- draw_opened
- ticket_issued
- ticket_revoked/reversed
- draw_closed
- ticket_set_locked
- result_recorded
- prize_claimed
- claim_expired

Every ticket references exactly one named draw.

---

## 12. Save & Win event chain

Canonical objects:
- Principal reservation
- Prize commitment
- Ticket allocation
- Draw

Events:
- gems_parked
- tickets_issued
- draw_locked
- result_recorded
- principal_released/returned
- prize_awarded if applicable

Principal ledger and prize ledger remain distinct.

---

## 13. Admin and reversals

Admin actions must append corrective events rather than erase original truth.

Examples:
- validation_disputed
- validation_reversed
- proof_rejected
- proof_restored
- settlement_held
- settlement_released
- access_revoked
- membership_suspended
- case_resolved

Every override requires:
- admin actor
- reason
- affected object/event ids
- before/after state
- timestamp
- audit event id

Downstream projections must reconcile from the corrected event history.

---

## 14. Projection/view model

The platform should distinguish:

### Canonical records
What happened / what was issued / what was verified.

### Projections
Optimized views derived from canonical records.

Examples:
- Today feed
- Participant trail
- Merchant customer timeline
- Host arrival count
- Brand Evidence Pack
- Agency Managed Result Pack
- Admin priority queue
- PromoShare ticket balance
- Gem balance
- Piece provenance

A projection may be rebuilt. Canonical event history should not depend on the projection surviving.

---

## 15. Semantic metrics layer

Metrics must declare their evidence class.

Required dimensions:
- observed
- attributed
- verified
- incremental (only when methodology supports it)

Examples:
- `rsvp_observed_count`
- `arrival_verified_count`
- `redemption_verified_count`
- `transaction_verified_value`
- `creator_attributed_booking_count`
- `incremental_visit_estimate` + method/confidence

Avoid generic metrics such as `engagement`, `conversion`, or `impact` without a definition.

---

## 16. Idempotency, duplicates, and offline behavior

Real-world operations require duplicate-safe writes.

Rules:
- client generates a stable idempotency key for irreversible actions where practical
- server returns the existing canonical result for safe retries
- offline actions remain pending until server acknowledgement
- UI never presents pending local state as verified platform truth
- duplicate/conflict creates an exception or explicit resolved duplicate state, not a second outcome

---

## 17. Privacy / consent boundary

Event lineage does not mean every stakeholder sees every event.

Authorization controls:
- which fields a role can read
- which objects they can mutate
- which aggregated evidence they may receive
- whether personal identity is exposed or pseudonymized
- relationship/marketing consent

Agency management does not transfer client ownership. Merchant customer access must correspond to lawful/consented relationships.

---

## 18. Cross-role invariant examples

### Attendance
RSVP != check-in != verified attendance != paid transaction.

### Creator work
Accepted != submitted != approved != settled.

### Discovery
Signal != supply response != published Experience != attendance.

### Merchant
Claim != presentation != validation != purchase.

### Brand analytics
Evidence != attribution != incrementality.

### Admin
Decision without audit residue != completed resolution.

---

## 19. Migration strategy

Do not rewrite the platform around event sourcing at once.

Use an adapter strategy:

1. define canonical IDs and event envelope;
2. map existing production records to canonical object classes;
3. begin emitting canonical events from high-value truth surfaces first;
4. build projections for stakeholder UI from those events where useful;
5. preserve legacy tables behind adapters while migrating;
6. reconcile duplicated ontologies rather than deleting working capability prematurely.

Recommended first event-producing surfaces:

1. merchant validation/redemption
2. host check-in/proof approval
3. creator submission/approval/settlement
4. admin reversals/audit
5. brand/agency Evidence Packs
6. economy ledger issuance/transfer/reversal

---

## 20. Product-design consequence

Every major Design Lab artifact should be able to answer:

- What canonical object does this represent?
- Which event created or changed it?
- What proof supports its state?
- Who is allowed to transform it?
- What downstream projections change?
- What happens if it is disputed/reversed?
- What remains permanently in the audit/provenance trail?

If the design cannot answer these, it is not production-canonical yet.
