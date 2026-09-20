# PROMORANG Stakeholder Production Convergence Matrix v1

**Status:** Design Lab → production planning  
**Source doctrine:** `promorang-job-first-workspace-standard.md`, `stakeholder-object-system-v1.md`, `stakeholder-lifecycle-system-v2.md`.

## 1. Purpose

The stakeholder Design Lab should not become a parallel product that never reaches the real PROMORANG routes.

This matrix connects the new stakeholder object/lifecycle system to the current production route families and defines what should converge first.

The governing rule is:

> Do not transplant the Design Lab visually. Converge the semantics, state model, proof model and object behavior into production using real data.

---

## 2. Existing production backbone

The web dashboard currently routes role workspaces through `apps/web/src/pages/Dashboard.tsx`, including:

- `CreatorDashboardV2`
- `HostDashboardV2`
- `BrandDashboardV2`
- `MerchantDashboardV2`
- `AgencyDashboard`
- Admin redirect to the protected admin command surface

Participant remains separate through the participant / PeopleHome experience.

The current repository also contains role-specific route families for creator missions/content, host guest operations and participants, merchant offers/venues/orders, brand campaigns/activation intelligence, agency managed workspaces, and admin verification/support/moderation/payout/audit systems.

---

# 3. Creator convergence

## Design Lab lifecycle

Opportunity → Brief → Accepted → Creating → Submitted → Approved → Settled

## Production destinations

Primary:
- `CreatorDashboardV2`

Related production families:
- creator opportunities / missions
- content missions
- Content Drops / creator releases
- UGC / submission review
- referrals / distribution attribution where creator-linked
- creator earnings / settlement surfaces where present

## First components to extract

### `CreatorBriefObject`
Required fields:
- brief ID
- issuer / brand / campaign
- outcome
- deliverable
- audience/context
- due date
- proof contract
- reward / settlement conditions
- usage/rights requirement where relevant
- acceptance state

### `CreatorSubmissionPackage`
Required fields:
- submission ID
- brief ID
- asset references
- submission timestamp
- attributable action evidence
- review state
- reviewer / organization
- revision request

### `CreatorApprovalRecord`
Required fields:
- approval decision
- evidence considered
- timestamp
- approver
- approved reward

### `CreatorSettlementRecord`
Required fields:
- reward type
- amount
- settlement state
- settlement timestamp
- reversal/dispute state

## Production behavior to remove
- accepting work without seeing proof requirements
- showing reward without settlement conditions
- collapsing submitted, approved and paid into one success state
- invented creator-performance fallback metrics

## P0 route
Creator mission / opportunity detail before dashboard restyling.

---

# 4. Host convergence

## Design Lab lifecycle

Plan → Publish → Invite → Doors → Live → Proof Close → Return

## Production destinations

Primary:
- `HostDashboardV2`

Related production families:
- Create Moment
- Organizer Workspace
- Host Guest Operations
- Participants
- Guest RSVP
- Guest Pass
- Check-In
- Moment Record
- venue / event operations

## First components to extract

### `MomentRunSheet`
Required fields:
- Moment ID
- venue
- date/time
- operational milestones
- capacity
- arrival window
- cutoff
- proof-close state
- blockers

### `ArrivalLedger`
Required fields:
- RSVP count
- verified arrivals
- walk-ins
- invalid / rejected arrivals
- guest exceptions
- check-in source / operator where appropriate

### `AttendanceProofClose`
Required fields:
- verified attendance count
- unresolved exceptions
- close timestamp
- closer/operator
- evidence basis

### `ReturnAudienceRecord`
Required fields:
- eligibility rule
- verified participant set
- consent / targeting constraints
- next Moment / follow-up context

## Production behavior to remove
- RSVP represented as attendance
- Moment remaining visually live after operations ended
- attendance metrics without a proof-close state
- generic participant counts that do not disclose verification level

## P0 route
Check-In + Host Guest Operations + Proof Close.

---

# 5. Merchant / Venue convergence

## Design Lab lifecycle

Inventory → Published → Claimed → Presented → Validated → Transaction → Repeat

## Production destinations

Primary:
- `MerchantDashboardV2`

Related production families:
- Merchant Action Studio
- Offer Studio
- Add Product
- Add Venue
- Merchant Coupon / offer hub
- Offer Detail
- Commerce Detail
- orders / receipts
- venue profiles
- redemption / QR scanning

## First components to extract

### `OfferInventoryObject`
Required fields:
- offer/product ID
- place / merchant
- available inventory
- validity
- proof type
- claim terms
- state

### `MerchantValidationTerminal`
Required fields:
- validation ID
- offer ID
- participant/PromoCard reference as permitted
- place
- timestamp
- operator/device where appropriate
- outcome
- duplicate / revoked state

### `CommerceEvidenceRecord`
Required fields:
- redemption evidence
- separate paid-order evidence
- POS / transaction ID where proven
- amount where permitted
- timestamp

### `RepeatAudienceRecord`
Required fields:
- evidence basis
- eligibility
- recency/frequency
- follow-up action

## Production behavior to remove
- claim shown as purchase
- redemption shown as paid order
- synthetic live inventory
- silent default inventory quantities
- a scanner action with no durable validation record

## P0 route
Merchant redemption scanner / validation path.

---

# 6. Brand convergence

## Design Lab lifecycle

Outcome → Ready → Funded → Live → Evidence → Decision → Scale

## Production destinations

Primary:
- `BrandDashboardV2`

Related production families:
- Create Campaign / PromoPilot
- Campaign Detail
- Activation Detail
- Campaign Intelligence
- PromoPush
- PromoPush Creator
- Offer Studio
- creator selection
- campaign landing surfaces
- brand profiles

## First components to extract

### `ActivationDossier`
Required fields:
- activation ID
- brand/client identity
- primary outcome
- target
- audience
- desired action
- proof contract
- value/reward
- funding/approval state
- channels / creators where relevant

### `LiveEvidenceStream`
Required fields:
- event type
- proof level
- source
- timestamp
- attribution method
- confidence

### `BrandEvidencePack`
Required fields:
- outcome vs target
- verified evidence
- source breakdown
- attribution confidence
- what can be claimed
- what cannot be claimed
- cost/incentive context
- decision

### `ScaleDecisionRecord`
Required fields:
- repeat/change/stop/scale
- rationale
- audience change
- budget/reward change
- next activation link

## Production behavior to remove
- campaign-management metaphor before customer outcome
- unsupported ROI / conversion conclusions
- evidence panels with no claim-strength distinction
- advanced intelligence front-loaded before activation readiness

## P1 route
Campaign Detail / Activation Detail after P0 proof systems are trustworthy.

---

# 7. Agency convergence

## Design Lab lifecycle

Portfolio → Selected Client → Preparing → Approval → Live → Proof → Expansion

## Production destinations

Primary:
- `AgencyDashboard`

Related production families:
- managed client workspace context
- Proposal Workspace
- client campaign / activation workspaces
- analytics / reporting
- creator selection
- client approvals
- commercial proposal / service catalog surfaces

## First components to extract

### `ClientFolio`
Required fields:
- agency identity
- client identity
- client type
- relationship type
- active work
- state
- current blocker
- latest verified result

### `ManagedWorkspaceContext`
Existing concept should remain canonical and be visually integrated with lifecycle objects.

Required truth:
- active client
- managing agency
- attribution owner
- permissions
- return-to-portfolio action

### `ManagedResultPack`
Required fields:
- client
- manager
- result
- evidence
- attribution ownership
- decision
- review state

### `ExpansionRecord`
Required fields:
- proposal / next move
- evidence basis
- client approval
- commercial state

## Production behavior to remove
- agency identity disappearing inside client workspace
- result ownership appearing to belong to agency when client owns it
- portfolio presented as account metrics without a current client move
- proposal flow detached from proven client result

## P1 route
Managed client workspace + result pack.

---

# 8. Admin convergence

## Design Lab lifecycle

Queue → Case → Evidence → Decision → Resolution → Audit → Closed

## Production destinations

Primary:
- Admin command route

Related production families:
- Verification Hub
- proof / moderation
- payouts / KYC
- support
- audit ledger
- CRM / growth operations
- supply / inventory exceptions
- PromoShare admin
- featured placement admin

## First components to extract

### `PriorityExceptionQueue`
Required fields:
- case ID
- case type
- severity
- impacted object
- downstream impact
- SLA / urgency only when backed by real policy/data
- owner

### `ExceptionCaseFile`
Required fields:
- object / event under review
- conflict
- evidence
- history
- linked users/organizations as authorized
- settlement / access impact

### `ChainOfCustody`
Required fields:
- evidence/event ID
- timestamp
- source
- actor/system
- mutation history

### `ResolutionRecord`
Required fields:
- decision
- actor
- evidence basis
- state changes
- downstream consequences
- timestamp

### `AuditEvent`
Required fields:
- immutable event ID
- case ID
- actor
- action
- timestamp
- reversal/escalation link if applicable

## Production behavior to remove
- command center opening on decorative telemetry
- fake SLA / latency / activity claims
- queues with unexplained static counts
- resolution that changes state without a durable audit record

## P0 route
Verification / payout / proof exceptions first.

---

# 9. Shared production component layer

The following should become shared semantic components rather than duplicated role UI:

- `OperatingIdentityContext`
- `LifecycleStateRail`
- `CurrentMovePanel`
- `BlockerRecord`
- `ProofContract`
- `EvidenceStrengthBadge`
- `AttributionBadge`
- `VerificationStamp`
- `ProofReceipt`
- `ApprovalRecord`
- `SettlementRecord`
- `DecisionRecord`
- `TimelineLedger`
- `AuditEvent`
- `TruthfulEmptyState`

These components should receive domain-specific nouns/content through typed props but must preserve a common truth model.

---

# 10. Data model requirements before visual convergence

The visual system will fail if lifecycle state exists only in copy.

Where missing, production data should expose structured fields for:

- primary outcome
- intended audience
- lifecycle state
- proof type
- proof strength
- proof source
- attribution method
- attribution confidence
- blocker / prerequisite
- approval state
- funding / reward commitment
- validation state
- settlement state
- post-result decision
- evidence / audit event IDs

UI should not infer strong states from weak or ambiguous fields.

---

# 11. Rollout plan

## Phase A — proof infrastructure

1. Merchant validation terminal + validation record
2. Host arrival ledger + proof close
3. Creator proof submission + approval + settlement states
4. Admin exception case + chain-of-custody + resolution

These flows produce truth used elsewhere in the platform.

## Phase B — decision infrastructure

5. Brand Evidence Pack
6. Agency Managed Result Pack
7. shared Decision Record

## Phase C — role home convergence

8. CreatorDashboardV2
9. HostDashboardV2
10. MerchantDashboardV2
11. BrandDashboardV2
12. AgencyDashboard
13. Admin command

Role homes should be changed after the lifecycle objects exist, so the home can compose real operating objects instead of mock dashboard modules.

## Phase D — mobile convergence

Map the same job/state/proof hierarchy into the existing mobile role dashboard views. Do not simply shrink desktop layouts.

---

# 12. Acceptance test

A production role experience passes convergence when:

- a user can identify the work object immediately
- the current lifecycle state is truthful
- the next valid move is obvious
- prerequisites are explicit
- proof requirements appear before the action that depends on them
- completion visibly changes the object
- the system retains evidence / residue of that change
- metrics do not imply more than evidence proves
- evidence produces a decision
- role/client/organization attribution remains intact
- advanced tools are available without dominating the primary job

The final product should not look like six dashboards sharing a design system.

It should feel like six professional operating environments sharing a truth system.
