# PROMORANG Stakeholder Lifecycle System v2

**Status:** Design Lab doctrine / pre-production contract  
**Branch:** `design/promorang-design-lab`  
**Applies to:** Creator, Host, Merchant/Venue, Brand, Agency and Admin experiences.

## 1. Why this exists

A multi-sided platform becomes incoherent when the participant experience receives deep product design while the people who create, operate, fund, verify and govern the market receive generic dashboards.

The stakeholder experience must therefore be designed at the same level as participant objects.

The governing sequence remains:

**Job → Outcome → Current Move → Proof → Decision → Tools**

But the UI grammar adds a second sequence:

**Work Object → State → Proof Object → Residue → Decision**

The role home is not the product. The lifecycle is the product.

---

## 2. Shared rule

> Shared truth can reuse components. Role-specific work must retain role-specific objects.

A verification stamp, proof receipt, audit event, blocker record or attribution badge may be shared when the underlying truth is identical.

A Creator Brief, Host Run Sheet, Merchant Validation Terminal, Brand Activation Dossier, Agency Client Folio and Admin Exception Case are not variants of one generic dashboard card.

They represent different jobs, liabilities, proof contracts and decisions.

---

## 3. Creator lifecycle

### Job
Choose worthwhile work, create it, prove it, get approved and build reputation.

### Lifecycle
1. Opportunity
2. Brief
3. Accepted
4. Creating
5. Submitted
6. Approved
7. Settled

### Primary work objects
- Opportunity
- Creator Brief
- Deliverable Package
- Submission Folder
- Review / Approval Record
- Settlement Record
- Work History / Reputation Record

### Required pre-acceptance truth
The creator must see before accepting:
- deliverable
- audience / context
- due date
- proof requirement
- approval requirement
- reward / settlement condition
- usage / rights terms where relevant

### Proof transition
`Submitted` is not `Approved`.

`Approved` is not `Settled`.

The UI must preserve these distinct states.

### Residue
After completion, the system should retain:
- brief ID
- final asset reference
- attributed actions
- approval timestamp
- approver identity / organization
- settlement amount and timestamp
- dispute / reversal state if applicable

---

## 4. Host lifecycle

### Job
Fill it, run it and prove who came.

### Lifecycle
1. Plan
2. Publish
3. Invite
4. Doors
5. Live
6. Proof Close
7. Return

### Primary work objects
- Moment Plan
- Run of Show
- Invite / RSVP Ledger
- Door / Arrival Board
- Check-In Record
- Guest Exception
- Proof Close
- Return Audience Record

### Trust rule
RSVP is intent.

Verified arrival is attendance proof.

The UI must never silently convert RSVP into attendance.

### Proof close
A Moment should not remain permanently `Live` after operations end.

Proof Close should reconcile:
- RSVP
- verified arrival
- walk-ins
- rejected / invalid scans
- exceptions
- participation proof where relevant

### Residue
The completed Moment leaves:
- attendance record
- exception record
- proof close timestamp
- return-audience eligibility
- merchant / sponsor proof where relevant

---

## 5. Merchant / Venue lifecycle

### Job
Turn attention into visits, redemptions, purchases and returns.

### Lifecycle
1. Inventory
2. Published
3. Claimed
4. Presented
5. Validated
6. Transaction
7. Repeat

### Primary work objects
- Product / Offer Inventory
- Live Offer
- Claim Record
- Validation Terminal / Slip
- Visit Record
- Order / Transaction Record
- Redemption Receipt
- Repeat / Retarget Record

### Evidence-strength rule
The interface must distinguish:
- viewed
- claimed
- presented
- visited
- redeemed
- paid order
- repeat visit

No weaker event may be presented as a stronger commercial result.

### Validation
A validation should retain:
- validation ID
- PromoCard / user reference as permitted
- offer ID
- place / venue
- timestamp
- operator / device where relevant
- result
- associated order ID only when proven

---

## 6. Brand lifecycle

### Job
Create measurable customer movement and know what actually happened.

### Lifecycle
1. Outcome
2. Ready
3. Funded
4. Live
5. Evidence
6. Decision
7. Scale

### Primary work objects
- Outcome Contract
- Activation Dossier
- Audience Definition
- Budget / Reward Commitment
- Creator Distribution Brief
- Live Evidence Stream
- Evidence Pack
- Attribution Record
- Scale / Change Decision

### Evidence Pack rule
The Evidence Pack is the brand-facing equivalent of the participant Proof Receipt.

It must state:
- activation ID
- desired outcome
- target
- evidence collected
- evidence strength
- attribution method
- what can be claimed
- what cannot be claimed
- next decision

### Metrics integrity
If the evidence supports 11 verified test drives, the interface may claim 11 verified test drives.

It must not convert that into 11 purchases, 11 retained customers or ROI without supporting evidence.

---

## 7. Agency lifecycle

### Job
Produce an undeniable client result without losing client attribution.

### Lifecycle
1. Portfolio
2. Selected Client
3. Preparing
4. Approval
5. Live
6. Proof
7. Expansion

### Primary work objects
- Client Ledger / Portfolio
- Managed Workspace Context
- Client Activation
- Approval Queue
- Live Work Record
- Managed Result Pack
- Proposal / Expansion Record

### Managed context rule
At all times the agency should know:
- agency identity
- active client
- client type
- who owns the resulting work / data
- approval authority
- how to return to the portfolio

Entering a client workspace must not erase agency context.

### Result Pack
The managed result pack should preserve:
- client attribution
- agency management context
- proof
- conclusions
- recommended next move
- client review / approval state

---

## 8. Admin lifecycle

### Job
Resolve the highest-priority exception with evidence and an audit trail.

### Lifecycle
1. Queue
2. Case
3. Evidence
4. Decision
5. Resolution
6. Audit
7. Closed

### Primary work objects
- Priority Queue
- Exception Case
- Verification Case
- Moderation Case
- Support Case
- Payout / KYC Case
- Evidence / Chain-of-Custody Record
- Resolution Record
- Audit Event

### Admin home rule
Admin should open on what requires intervention, not telemetry theatre.

System health metrics may support prioritization but should not displace the current highest-value intervention.

### Audit rule
A resolution is not complete until the system can retain:
- case ID
- evidence considered
- decision
- actor
- timestamp
- downstream state change
- audit event
- escalation / reversal where relevant

---

## 9. Cross-role shared primitives

These may become shared production components when semantics are identical:

- Identity / Organization Context
- State Rail
- Current Move
- Blocker / Prerequisite Record
- Proof Contract
- Verification Stamp
- Evidence Strength Badge
- Attribution Badge
- Proof Receipt
- Approval Record
- Settlement Record
- Timeline / History
- Audit Event
- Decision Record
- Empty / Loading / Error / Revoked / Expired states

Shared visual implementation must not erase role-specific nouns.

---

## 10. Material grammar

Role distinction is not achieved through accent color alone.

### Creator
Production paperwork, submission folders, approval stamps, settlement residue.

### Host
Run sheets, guest lists, arrival ledgers, check-in / wristband / door-control language, proof-close records.

### Merchant / Venue
Offer stock, merchant validation terminals, till / transaction records, replenishment and repeat-customer residue.

### Brand
Activation dossiers, evidence binders, attribution summaries and decision records.

### Agency
Client folios, approval queues, managed context markers, result packs and expansion proposals.

### Admin
Case files, evidence chains, intervention states, resolution records and audit stamps.

The metaphor should support comprehension. It must not become decorative skeuomorphism.

---

## 11. Production convergence gate

A Design Lab lifecycle may move into production only when:

- [ ] Every visible state maps to a real data state.
- [ ] Every proof claim maps to evidence the platform can actually capture.
- [ ] IDs / timestamps are real or omitted.
- [ ] No review-only values appear as production facts.
- [ ] Empty state is truthful and actionable.
- [ ] Loading / error / expired / revoked / rejected states are designed.
- [ ] Role and organization context persists.
- [ ] Mobile preserves the primary decision hierarchy.
- [ ] Desktop density does not become dashboard clutter.
- [ ] A completed action leaves durable residue where appropriate.
- [ ] Proof leads to a decision rather than ending at reporting.

---

## 12. Recommended convergence order

### P0 — proof-critical operating flows
1. Merchant validation / redemption scanner
2. Host arrival / check-in / proof close
3. Creator brief / submission / approval / settlement
4. Admin exception / verification / payout cases

### P1 — commercial decision flows
5. Brand activation / evidence pack / decision
6. Agency client context / managed result pack / expansion

### P2 — supporting systems
7. creator reputation / work history
8. host return audience
9. merchant repeat / retarget
10. brand scale / audience reuse
11. agency portfolio intelligence
12. admin audit / system-health secondary consoles

---

## 13. Definition of done

A stakeholder lifecycle is complete when a first-time eligible operator can answer:

1. Whose work am I operating?
2. What outcome am I responsible for?
3. What state is this work in?
4. What is the single best next move?
5. What is blocking it?
6. What proof must exist before the next state?
7. What evidence exists already?
8. What can I honestly claim from that evidence?
9. What state change will this action create?
10. What residue will remain afterward?
11. What decision follows success or failure?
12. Can I understand all of this without learning internal PROMORANG jargon first?

The target is not six attractive dashboards.

The target is six coherent operating experiences connected by shared platform truth.
