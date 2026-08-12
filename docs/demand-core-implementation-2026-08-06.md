# Demand Core implementation

This tranche introduces an additive contract for moving Promorang from a collection of campaign features toward one intent-to-execution system.

## Human product language

- **PromoPilot** asks what the organization wants to make happen, shapes the route, and helps steer it after launch.
- **Pulse** is where people discover what is worth doing.
- **Shared value** explains what participants receive and why.
- **Impact** explains what changed and how Promorang knows.
- **Return path** ensures a campaign does not end at conversion.

“Demand plan” is an internal architecture term. It is not required as customer-facing language.

## Contract

A Demand Plan keeps these concerns in one versioned object:

1. Human intent
2. People and eligibility
3. Public experience and actions
4. Proof
5. Shared value
6. Distribution
7. Review, referral, and loyalty return
8. Measurement and forecast evidence
9. Readiness and warnings

## PromoPilot workspace

The initial review experience uses one campaign flight path:

`Outcome → People → Experience → Shared value → Reach → Impact`

Organizations can edit timing, place, audience, participation target, shared-value systems, and distribution channels before saving. A readiness panel identifies unresolved decisions. Saving remains separate from funding, publishing, messaging, issuing Pieces, and moving value.

The contract deliberately retains Promorang's economy:

- **Gems:** funded usable value
- **PromoPoints:** verified contribution and progress
- **Pieces:** participation-linked stake in what people help grow
- **PromoKeys:** earned access and return benefits
- **Memories:** persistent participation record
- **PromoShare:** shared campaign upside
- **PromoPush:** managed distribution channel

These objects keep their existing authoritative ledgers. `demand_plans.shared_value` records how a campaign intends to use them; it does not replace settlement, balances, ownership, redemption, or governance.

## Current vertical slice

- Shared TypeScript contract and validation
- Deterministic backend compiler for six human goals
- Public compile endpoint at `POST /api/demand-plans/compile`
- PromoPilot integration with offline fallback
- Additive `demand_plans` persistence projection linked to an existing campaign
- Tests for contract, intent classification, economy inclusion, proof, distribution, and measurement

## Next slices

1. Add organization context, hours, capacity, location, customer segments, and past campaign evidence to compilation.
2. Add a review screen for people, experience, shared value, reach, staff readiness, and Impact.
3. Make funded values opt-in and amount-aware before readiness can become `ready`.
4. Turn distribution selections into PromoPush, WhatsApp, creator, community, QR, and referral execution jobs.
5. Bind every plan action to the canonical growth-event contract.
6. Add outcome cohorts and comparable-campaign evidence for forecasts.
7. Add repeatable Playbooks with parameters, lineage, and performance history.
8. Add a campaign control loop for pacing, capacity, fraud, budget, and return journeys.

## Execution manifest tranche

`202608060002_promopilot_execution_core.sql` adds an auditable orchestration queue. PromoPilot now translates an owned Demand Plan into individual jobs for:

- Pulse
- PromoPush
- WhatsApp
- QR fulfillment
- creators
- communities
- referrals
- Gems
- PromoPoints
- Pieces
- PromoKeys
- Memories
- PromoShare
- reviews
- return journeys
- Impact measurement

Preparation is idempotent. Repeated preparation updates draft, blocked, ready, failed, or cancelled work but does not overwrite queued, running, or completed jobs. Each job receives a stable idempotency key.

Launch requires a separate explicit confirmation. Required blocked jobs prevent queueing. Optional blocked jobs remain visible and do not silently disappear.

### Authority boundary

Queueing is not treated as successful delivery. A job is complete only when its authoritative adapter records success:

- value movement: its canonical ledger or reserve
- Pieces: Piece earning/issuance authority
- PromoKeys: entitlement/economy authority
- PromoShare: governed pool authority
- public distribution: Pulse or PromoPush authority
- messages: consent-aware provider delivery
- QR: signed resolver/asset authority
- measurement: canonical growth event stream

The execution queue is therefore an orchestration and audit layer, not a replacement for existing domain systems.
