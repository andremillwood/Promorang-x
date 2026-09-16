# PROMORANG Stakeholder Workflow Quality Gates v1

Status: Design Lab production gate

## Purpose

The stakeholder Design Lab is not approved because it looks coherent. A workflow is mature only when its object identity, lifecycle, proof semantics, failure behavior, responsive operating context, accessibility, permissions, and downstream consequences all hold together.

## Canonical workflow model

Every stakeholder workflow must be reviewable as:

`Job → Work Object → State → Action → Proof → Residue → Decision → Return`

A page that cannot identify these elements is not yet a canonical role workspace.

## Gate 01 — Object recognition

Without page headings, a reviewer should still be able to distinguish the role's primary operating artifacts.

- Creator: Brief / Submission / Approval / Settlement
- Host: Run Sheet / Arrival Ledger / Attendance Close
- Merchant/Venue: Offer / Validation / Transaction Evidence
- Brand: Activation Dossier / Evidence Pack / Scale Decision
- Agency: Client Folio / Approval / Managed Result Pack
- Admin: Exception Case / Chain of Custody / Resolution / Audit Event

Shared truth objects may reuse a component family. Role-specific work objects must not collapse into a single dashboard-card primitive.

## Gate 02 — Lifecycle completeness

A workflow must cover beginning, operating state, completion, and at least one believable non-happy path.

### Creator
`Offered → Accepted → Creating → Submitted → Revision → Approved → Settled`

### Host
`Plan → Published → Invites → Doors → Live → Exception → Proof close → Return`

### Merchant/Venue
`Inventory → Published → Claimed → Presented → Validated → Duplicate/Conflict → Transaction → Repeat`

### Brand
`Outcome → Ready → Funded → Live → Evidence → Weak proof → Decision → Scale/Change/Stop`

### Agency
`Portfolio → Client → Preparing → Approval → Blocked → Live → Proof → Expansion`

### Admin
`Queue → Case → Evidence → Escalated → Decision → Resolution → Audit → Closed`

## Gate 03 — Truth boundaries

The UI must not visually or verbally claim a stronger event than the underlying record proves.

- RSVP ≠ verified attendance
- Claim ≠ presentation
- Presentation ≠ validated redemption
- Redemption ≠ paid transaction
- Submission ≠ approval
- Approval ≠ settlement
- Discovery signal ≠ confirmed supply
- Evidence pack ≠ success verdict
- Agency management ≠ client ownership
- Admin decision without audit event ≠ completed resolution

Truth boundaries should be represented by component/state architecture, not documentation alone.

## Gate 04 — Operational density

Metadata is allowed only when it performs an operational job: identify, authenticate, locate, quantify, time, authorize, record, or transform.

Useful examples:
- serial or object ID
- actor / issuer / owner
- timestamp
- place
- validity window
- proof type
- source and destination
- state and reason
- transaction or validation reference

Do not add metadata merely to make a surface look sophisticated.

## Gate 05 — Failure and recovery

Each production workflow must specify:

- blocked state
- error/exception reason
- who can act
- next recovery action
- what remains unchanged while unresolved
- what downstream activity is held
- what record is written after resolution

Examples include creator revision, identity mismatch at doors, duplicate redemption, insufficient attribution, overdue client approval, settlement failure, permission denied, revoked access, offline scan, expired offer, canceled Moment, and admin escalation.

## Gate 06 — Responsive operating context

Responsive design is job-specific.

### Mobile-first operating contexts
- host at door
- merchant validation
- creator submission/check status
- admin urgent exception triage

These require high-contrast primary actions, one-handed use where practical, large hit areas, minimal dense tables, clear offline/loading states, and rapid recovery.

### Desktop-first operating contexts
- brand activation planning
- agency portfolio/client management
- admin evidence review
- merchant inventory and reporting

These may use multi-column composition, context rails, evidence comparison, batch actions, persistent filters, and richer inspection panes.

A desktop layout may not simply enlarge the mobile card stack. A mobile layout may not squeeze desktop data tables into narrow cards.

## Gate 07 — Accessibility

Before production convergence, each canonical component must be checked for:

- text contrast
- minimum readable metadata size
- visible keyboard focus
- non-color state cues
- semantic button/input roles
- screen-reader state labels
- logical focus order
- minimum target sizes
- reduced-motion behavior
- understandable error messages

Do not claim accessibility compliance from Design Lab screenshots alone. Test rendered components.

## Gate 08 — Permission clarity

Every decision action must make clear whether the current role can:

- view
- propose
- submit
- validate
- approve
- settle
- publish
- resolve
- override

Agency context must preserve client ownership. Admin overrides must create audit residue. Creators and hosts must not see controls they cannot legitimately perform.

## Gate 09 — Cross-role consequences

Actions must propagate coherently across stakeholder experiences.

Examples:
- merchant validation updates participant Proof and brand Evidence
- host proof close updates participant trail and brand/agency result packs
- creator approval unlocks settlement and contributes to brand evidence
- admin resolution changes held settlement/validation state and leaves an audit event
- brand activation changes creator/host/merchant work objects only after commitments are valid

A workflow is incomplete if its consequence exists only inside the role that initiated it.

## Gate 10 — Motion as state communication

Motion is allowed when it communicates state change:

- brief accepted
- proof submitted
- revision requested
- key validated
- guest check-in verified
- draw locked
- Piece transfer stamped
- principal returned
- admin resolution recorded

Avoid decorative motion that competes with operational clarity. Provide reduced-motion equivalents.

## Gate 11 — Empty/loading/offline states

Every production workflow must define:

- first-use empty state
- loading state
- partial-data state
- offline/unreachable state where relevant
- no-permission state
- no-results state
- stale-data warning where operational truth may have changed

The fallback state must never invent proof, availability, balance, attribution, or settlement status.

## Gate 12 — Production convergence

A Design Lab workflow can move toward production only when:

1. primary and failure lifecycle states are approved;
2. truth boundaries are explicit in UI/state architecture;
3. real production data fields can support the design without fabricated values;
4. current production functionality has been mapped so no capability disappears;
5. responsive and accessibility checks are complete;
6. downstream cross-role consequences are understood;
7. existing production routes remain reversible until validated.

## Recommended convergence order

1. Merchant validation / redemption truth
2. Host arrivals / check-in / proof close
3. Creator submission / review / approval / settlement
4. Admin exception / evidence / resolution / audit
5. Brand activation / Evidence Pack / decision
6. Agency managed-client / approval / result pack
7. Role home/dashboard recomposition around proven objects

The role homes are last because dashboards should compose mature objects and workflows rather than discover them.
