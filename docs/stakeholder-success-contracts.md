# Promorang Stakeholder Success Contracts

Status: canonical product/economic architecture

## 1. Purpose

Promorang should not measure stakeholder success by feature usage. It should measure whether each actor produces and receives a useful outcome inside a reciprocal market loop.

The canonical loop is:

`Demand owner supplies/funds value -> distributor or host moves it -> participant acts -> fulfilling stakeholder verifies it -> value settles -> relationship and learning compound`

Every stakeholder journey must answer:

1. What does this actor contribute?
2. What must another actor do in response?
3. What event proves the outcome happened?
4. What value does this actor receive?
5. What is the next state if the outcome worked?

The shared implementation lives in:

- `packages/shared/src/stakeholder-success.ts`

The role-level job guide must consume that contract rather than defining its own parallel copy.

## 2. Marketplace roles vs product permissions

Economic stakeholder roles are deliberately limited to:

- Participant
- Creator
- Host
- Merchant
- Brand
- Agency

Not every product role is a new economy.

- `promoter` is a creator/distributor specialization for economic-success purposes.
- `marketing` is a brand-side operating specialization.
- `admin` is a platform operating permission and is not a marketplace demand role.
- Venue/place should remain an entity or fulfillment context unless it has an independently distinct economic contract.
- Community should become a first-class entity/graph where needed, rather than automatically becoming another dashboard role.

Rule: create a new economic stakeholder role only when its contribution, counterparty, verification event, value received, and success progression are materially different.

## 3. Platform north star

**Weekly incremental verified demand generated per active organization.**

This is intentionally stronger than registrations, impressions, Moments created, claims, or raw redemptions.

Supporting metrics should include:

- time to first verified outcome
- cost per verified outcome
- cost per incremental verified outcome
- commit-to-verified-action conversion
- participant repeat rate
- customer repeat rate
- creator attributable conversion rate
- campaign repeat rate after a verified result
- client repeat-work rate
- net incremental contribution
- demand retained after incentives decline or end

## 4. Value taxonomy

Not every contribution should produce cash.

Promorang recognizes five distinct value classes:

1. **Utility** — the immediate thing becomes easier, better, or possible.
2. **Access** — entry, entitlement, priority, inventory, or invitation.
3. **Reputation** — trusted evidence that the actor can contribute or perform.
4. **Economic value** — funded credit, payout, revenue, or measurable financial return.
5. **Relationship value** — repeat audience, repeat customer, partner trust, client retention, community membership.

These value classes should not be collapsed into one points/currency system.

## 5. Success contracts by stakeholder

### Participant

Success progression:

`Choose worthwhile opportunity -> Commit -> Complete verified action -> Receive value -> Return because it worked`

Primary success outcome: one useful verified action that was worth the participant's time.

Compounding result: better fit, access, recognition, and relationship value from proven preferences and repeat behavior.

### Creator

Success progression:

`Choose useful work -> Deliver and get approved -> Cause attributable verified action -> Settle agreed value -> Win stronger repeat work`

Primary success outcome: a verified supporter/customer action caused by approved creator work.

Compounding result: conversion reputation, predictable earnings, better briefs, stronger repeat partnerships.

### Host

Success progression:

`Put real Moment live -> Create qualified commitment -> Verify attendance -> Bring people back -> Earn partner reinvestment`

Primary success outcome: verified attendance and useful participation.

Compounding result: lower acquisition dependence, stronger repeat audience, improved sponsor/venue leverage.

### Merchant

Success progression:

`Business ready -> Real offer live -> Verified customer action -> Business value realized -> Customer returns -> Positive unit economics`

Primary success outcome: verified incremental customer demand.

Compounding result: repeat customers and profitable demand generation rather than subsidized activity.

### Brand

Success progression:

`Define outcome -> Launch funded/fulfillable activation -> Capture attributable action -> Estimate incremental value -> Make reinvestment decision`

Primary success outcome: measurable customer movement linked to the activation.

Compounding result: better budget allocation and lower uncertainty on future demand investment.

### Agency

Success progression:

`Connect client -> Launch client work -> Prove client outcome -> Package proof -> Earn repeat/expanded work`

Primary success outcome: one verified client outcome end to end.

Compounding result: retention and expansion based on demonstrated outcomes rather than activity reporting.

## 6. Canonical success signals

The shared contract defines stable signal names such as:

- `merchant_business_ready`
- `merchant_offer_live`
- `merchant_customer_action_verified`
- `merchant_value_realized`
- `merchant_repeat_customer_verified`
- `merchant_positive_unit_economics`

Equivalent signal sets exist for all six economic roles.

A signal should be emitted only when the underlying condition is actually true. UI completion must not manufacture success.

Examples:

- Creating a draft does not equal `merchant_offer_live`.
- Clicking Share does not equal `creator_attributed_action_verified`.
- RSVP does not equal `host_attendance_verified`.
- A redemption is attributable activity; it is not automatically incremental value.
- A dashboard view is never a success event.

## 7. Economics guardrail

For commercial activations, the governing inequality is:

`Incremental Value > Incentive Cost + Distribution Cost + Platform Fee + Fulfillment Cost + Other Variable Cost`

The shared `evaluateActivationEconomics()` function returns:

- unknown
- positive
- break-even
- negative

Promorang must not describe an activation as economically successful when incremental value is unknown.

A negative activation may still be intentionally funded for learning, launch, sampling, public interest, or strategic reasons. It must be labeled correctly rather than treated as profitable demand.

## 8. Measurement levels

Analytics must distinguish four levels:

1. **Observed** — the action occurred.
2. **Attributed** — the action can be connected to a campaign, creator, referral, or channel.
3. **Verified** — the action satisfies approved proof rules.
4. **Incremental** — evidence suggests the action happened because of the intervention rather than merely alongside it.

Never substitute a weaker level for a stronger one in commercial reporting.

## 9. Current implementation bridge

`apps/web/src/hooks/useRoleSuccessProgress.ts` already calculates several real role-specific facts and next actions. It is useful operational infrastructure, but it currently mixes:

- arbitrary numeric targets
- role-specific database queries
- progress milestones
- next-action copy
- legacy product assumptions

It should progressively become a **signal adapter** rather than a second product strategy layer.

Target architecture:

`database/API facts -> canonical success signals -> resolveStakeholderSuccess() -> role UI`

The hook may still provide numeric metrics, but stage completion and next-step semantics should come from the shared stakeholder contract.

## 10. Migration order

### Phase A — contract foundation

- canonical shared stakeholder success contracts
- product-role to economic-role normalization
- unit-economics evaluator
- shared role job guide consumes canonical contract
- tests protect role coverage and economics rules

### Phase B — signal adapters

Emit canonical success signals from existing real data.

Priority order:

1. Merchant
2. Brand
3. Agency
4. Creator
5. Host
6. Participant bridge to the existing Moment journey resolver

Merchant is first because it is the recurring economic anchor and already has the clearest observable path from supply to redemption.

### Phase C — outcome-first dashboards

Each workspace should show:

- current success stage
- what has been proven
- what has not been proven
- one recommended next move
- value created for counterparties
- value received by the stakeholder
- economic health where relevant

Advanced mechanics remain behind the operating job.

### Phase D — marketplace health

Add platform-level measures:

- useful supply per verified outcome
- organic participants per participant
- repeat campaigns per verified outcome
- recommendation lift per outcome cohort
- cross-merchant demand transfer
- payout/fulfillment reliability
- incentive-free retention
- local/category liquidity density

## 11. Market-density rule

Promorang should prefer dense liquidity over broad feature/category coverage.

A successful launch cluster contains enough of the following in one geography/category that the loop can close repeatedly:

- demand owners
- real inventory/value
- creators/distributors
- hosts/places
- participants
- fulfillment capacity

A feature is not a substitute for missing market density.

## 12. Product governance rule

Before shipping a new role, currency, progress mechanic, dashboard, or marketplace feature, answer:

- Which stakeholder success contract does it improve?
- Which success signal does it create or make easier to reach?
- Which counterparty receives value?
- How is the outcome verified?
- Does it improve unit economics, retention, liquidity, or learning?

If none of those answers are clear, the feature is outside the core path and should normally be deferred.
