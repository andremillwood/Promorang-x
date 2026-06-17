# PromoShare v2 MVP Architecture

This document defines the recommended MVP architecture for `PromoShare v2` using the current Promorang repo as the base.

The goal is not to redesign the economy from scratch. The goal is to turn the existing PromoShare layer into a clearer, more defensible, more operational system that:

- consumes verified real-world activity
- uses explicit qualification and weighting rules
- distributes funded rewards through cycles
- exposes distinct stakeholder experiences

PromoShare v2 should be a structured cycle engine, not a vague reward page.

## 1. Product Role

PromoShare v2 is the recurring qualified reward layer that sits after verified activity.

Canonical loop:

`Moments -> verified participation -> qualification events -> PromoShare entries -> cycle eligibility -> funded selection -> issued rewards`

PromoShare v2 should not be presented as:

- guaranteed income
- passive yield
- speculative upside
- a replacement for moments, pieces, or gems

It should be presented as:

- a qualified cycle-based reward layer
- a recurring relevance system
- a bridge between verified activity and funded upside

## 2. Current Repo Base

The current repo already provides usable foundations:

- participant-facing PromoShare page:
  - `apps/web/src/pages/PromoShare.tsx`
- PromoShare API layer:
  - `backend/api/promoshare.js`
- platform revenue allocation into PromoShare:
  - `backend/services/revenueService.js`
- sponsor-funded pool surfaces:
  - `apps/web/src/pages/SponsorDashboard.tsx`
- economy framing:
  - `docs/ECONOMY_POSITIONING.md`
- active momentum and proof infrastructure:
  - `moments`
  - participation
  - proof submissions
  - creator/mission linkage
- new attribution system:
  - `supabase/migrations/202605050002_promopush_core_system_layer.sql`

That means PromoShare v2 should be built as a formalization and cleanup of what exists, not a parallel economy.

## 3. MVP Principles

PromoShare v2 MVP should follow these constraints:

- only verified actions should generate PromoShare entries
- every entry should be explainable
- qualification rules should be config-driven
- funding should come from identifiable pools
- selection should be reproducible and auditable
- stakeholder experiences should be different by role

Do not make MVP depend on:

- fully dynamic market mechanics
- pieces/liquidity changing qualification math directly
- complex cross-chain or speculative token logic
- opaque reward assignment

## 4. Recommended System Layers

PromoShare v2 MVP should be structured into five layers:

1. `Activity ingestion layer`
2. `Entry and qualification layer`
3. `Funding and pool layer`
4. `Selection and issuance layer`
5. `Stakeholder presentation layer`

### 4.1 Activity Ingestion Layer

This layer receives validated downstream events from the rest of the platform.

Recommended MVP sources:

- moment joined
- moment checked in
- proof submitted
- proof verified
- repeat moment participation
- referral converted
- creator mission completion

Later sources:

- PromoPush attributed verified joins
- merchant conversion proofs
- sampling redemptions

Important rule:

`PromoPush should not create PromoShare value by itself.`

Only verified downstream actions from PromoPush traffic should count.

### 4.2 Entry And Qualification Layer

This is the actual PromoShare v2 core.

It should:

- record append-only entry events
- compute per-cycle user stats
- determine qualification state
- assign weight based on contribution quality

### 4.3 Funding And Pool Layer

This layer governs where reward money comes from.

MVP funding sources:

- platform revenue allocation
- sponsor-funded PromoShare pools
- campaign-funded pools

Optional later source:

- moment-specific or host-specific pools

### 4.4 Selection And Issuance Layer

This layer decides how qualified users are selected and what rewards are issued.

MVP modes:

- weighted lottery
- tiered bucket selection

Not recommended for MVP:

- continuous real-time rewards
- highly customized pool logic per stakeholder
- open-ended payout promises

### 4.5 Stakeholder Presentation Layer

PromoShare v2 should be visible as its own experience to:

- participants
- hosts
- brands/sponsors
- admins

Each role should see different explanations, controls, and outcomes.

## 5. Recommended Data Model

PromoShare v2 MVP should revolve around five primary entities.

### 5.1 `promoshare_cycles`

Purpose:

- defines a time-bound qualification and reward window

Recommended fields:

- `id`
- `cycle_type`
- `cycle_name`
- `start_at`
- `end_at`
- `status`
- `eligibility_config jsonb`
- `weight_config jsonb`
- `selection_config jsonb`
- `funding_model text`
- `jackpot_amount numeric`
- `created_at`
- `updated_at`

This table already appears conceptually present in current PromoShare code and should remain the governing cycle object.

### 5.2 `promoshare_entries`

Purpose:

- append-only ledger of qualified user earning events

Recommended fields:

- `id`
- `cycle_id`
- `user_id`
- `source_type`
- `source_id`
- `source_action`
- `entry_count`
- `weight_value`
- `metadata jsonb`
- `created_at`

This is the most important new or formalized table in v2.

Without a durable entry ledger, PromoShare remains hard to audit and hard to explain.

### 5.3 `promoshare_user_cycle_stats`

Purpose:

- materialized current state per user per cycle

Recommended fields:

- `id`
- `cycle_id`
- `user_id`
- `eligible boolean`
- `status text`
- `total_entries integer`
- `final_weight numeric`
- `verified_moves integer`
- `moments_joined integer`
- `repeat_participation_count integer`
- `referrals integer`
- `entries_breakdown jsonb`
- `progress_to_qualify jsonb`
- `updated_at`

This should be what the dashboard reads first, not raw event tables.

### 5.4 `promoshare_reward_pools`

Purpose:

- tracks the money or reward capacity available to a cycle

Recommended fields:

- `id`
- `cycle_id`
- `source_type`
  - `platform`
  - `sponsor`
  - `campaign`
  - `moment`
- `source_id`
- `amount`
- `currency`
- `distribution_bucket`
- `metadata jsonb`
- `created_at`

This should unify all reward sources into one funding model.

### 5.5 `promoshare_selections`

Purpose:

- stores actual selected users and issued rewards

Recommended fields:

- `id`
- `cycle_id`
- `user_id`
- `selection_bucket`
- `reward_type`
- `reward_amount`
- `reward_metadata jsonb`
- `status`
- `issued_at`
- `claimed_at`

This becomes the defensible record of who received what and why.

## 6. Qualification Model

Qualification should be explicit and rule-driven.

MVP rule types:

- minimum verified moves
- minimum distinct moments
- minimum repeat participation
- minimum referrals where relevant
- optional campaign or geography filter

Example `eligibility_config`:

```json
{
  "min_verified_moves": 2,
  "min_distinct_moments": 1,
  "min_repeat_participation": 1,
  "min_referrals": 0
}
```

Example `weight_config`:

```json
{
  "proof_verified": 5,
  "repeat_participation": 8,
  "referral_conversion": 12,
  "creator_mission_completion": 10
}
```

Important:

- `eligibility` decides whether a user can enter the cycle
- `weight` decides how much influence they have inside the cycle

Those should not be mixed conceptually.

## 7. Funding Model

PromoShare v2 MVP should support three funding paths:

### 7.1 Platform Allocation

Continue using platform revenue allocation from:

- `backend/services/revenueService.js`

This is the baseline pool growth path.

### 7.2 Sponsor-Funded Pools

Continue using sponsor-funded cycle pools surfaced in:

- `apps/web/src/pages/SponsorDashboard.tsx`

This is the clearest paid-incentive path for stakeholders.

### 7.3 Campaign-Funded Pools

Allow campaigns to explicitly contribute to PromoShare cycles.

This is the most important bridge between PromoPush and PromoShare.

Recommended approach:

- a campaign may allocate a fixed amount or percentage into a reward pool
- only verified downstream actions tied to the campaign should count toward PromoShare entries if configured

## 8. PromoPush Integration

PromoPush should be an attribution and funding input, not a replacement for PromoShare.

Best MVP relationship:

- PromoPush campaign drives traffic into a linked moment
- user scans / clicks / arrives
- only verified downstream activity becomes PromoShare-eligible
- campaign may also fund a PromoShare pool

Recommended integration points:

- `promopush_campaigns` optionally link to a PromoShare cycle or reward pool
- `promopush_events` can generate PromoShare entries only when event types represent validated downstream behavior

Recommended eligible PromoPush-derived event types:

- `join`
- `move_completed`
- `proof_verified`

Recommended non-eligible PromoPush-derived event types for MVP:

- `impression`
- `click`
- `scan`

Those can inform attribution, but should not create PromoShare value on their own.

## 9. Service Architecture

The current repo likely centralizes too much behavior in `promoShareService`.

For MVP, split responsibilities into focused services.

### 9.1 `promoShareCycleService`

Responsibilities:

- create cycles
- start/close cycles
- fetch active cycles
- resolve current cycle windows

### 9.2 `promoShareEntryService`

Responsibilities:

- append entries into `promoshare_entries`
- convert verified source events into PromoShare entries
- prevent duplicate entry creation where required

Suggested methods:

- `recordEntryFromMomentJoin`
- `recordEntryFromProofVerified`
- `recordEntryFromReferralConversion`
- `recordEntryFromCreatorMissionCompletion`
- `recordEntryFromPromoPushVerifiedAction`

### 9.3 `promoShareQualificationService`

Responsibilities:

- recompute user cycle stats
- evaluate eligibility
- compute weights
- populate `promoshare_user_cycle_stats`

### 9.4 `promoShareFundingService`

Responsibilities:

- manage `promoshare_reward_pools`
- attach platform allocations
- attach sponsor funding
- attach campaign funding
- summarize cycle pool availability

### 9.5 `promoShareSelectionService`

Responsibilities:

- simulate draws
- execute weighted lottery
- execute tiered selections
- write `promoshare_selections`

### 9.6 `promoShareAuditService`

Responsibilities:

- append admin and system actions to audit log
- capture cycle creation, recalculation, simulation, draw execution, reward issuance

## 10. API Shape

Keep the existing route structure where possible, but evolve the payloads toward cycle-first clarity.

Recommended public/authenticated routes:

- `GET /api/promoshare/dashboard`
- `GET /api/promoshare/me`
- `GET /api/promoshare/me/entries`
- `GET /api/promoshare/me/history`
- `GET /api/promoshare/cycles/current`
- `GET /api/promoshare/cycles/:id`
- `GET /api/promoshare/cycles/:id/progress`

Recommended admin routes:

- `POST /api/promoshare/admin/cycles`
- `POST /api/promoshare/admin/cycles/:id/recalculate`
- `GET /api/promoshare/admin/cycles/:id/qualified`
- `POST /api/promoshare/admin/cycles/:id/simulate`
- `POST /api/promoshare/admin/cycles/:id/execute`
- `POST /api/promoshare/admin/cycles/:id/execute-tiered`

Recommended sponsor/brand routes:

- `GET /api/promoshare/sponsors/config`
- `GET /api/promoshare/sponsors/pools`
- `POST /api/promoshare/sponsors/pools`
- `POST /api/promoshare/sponsors/calculate`

## 11. Stakeholder Experiences

### 11.1 Participant

Primary surface:

- `/promoshare`

Participant should always understand:

- what cycle they are in
- whether they are qualified
- why they are or are not qualified
- what actions raise their weight
- what rewards are in play

### 11.2 Host

Host should see:

- which hosted moments create PromoShare entries
- which proof actions count
- which recurring moment patterns increase participant PromoShare relevance

### 11.3 Brand / Sponsor

Brand and sponsor should see:

- which pools they funded
- which campaigns or moments drive qualified users
- which content and moment combinations produce recurring eligible activity

### 11.4 Admin

Admin should control:

- cycle lifecycle
- simulation
- draw execution
- auditability
- recalc / maintenance workflows

## 12. What Not To Include In MVP

Do not include the following in PromoShare v2 MVP:

- direct pieces/liquidity participation affecting qualification math
- arbitrary reward logic by every stakeholder type
- guaranteed payout framing
- speculative market language
- non-verified events counting as value

Pieces and liquidity should remain related value systems, but not PromoShare’s qualification backbone in MVP.

## 13. Recommended Build Order

Build PromoShare v2 MVP in this sequence:

### Phase 1: Entry Ledger

- add or formalize `promoshare_entries`
- wire in verified action sources only

### Phase 2: User Cycle Stats

- add or formalize `promoshare_user_cycle_stats`
- compute eligibility and weight deterministically

### Phase 3: Funding Pools

- add or formalize `promoshare_reward_pools`
- connect revenue allocation and sponsor pools

### Phase 4: Selection Engine

- weighted lottery
- tiered selection
- auditable writes to `promoshare_selections`

### Phase 5: Stakeholder Surfaces

- participant clarity first
- sponsor / brand operational views second
- host operational views third
- admin refinement last

## 14. MVP Success Criteria

PromoShare v2 MVP is working if:

- every entry can be traced to a verified action
- every qualified user can be shown why they qualified
- every reward pool has a visible funding source
- brands and sponsors can see what their funding influenced
- PromoPush can feed PromoShare without inflating it through unverified clicks
- participants understand PromoShare as recurring qualified relevance, not vague random rewards

## 15. Bottom Line

PromoShare v2 MVP should be:

- a cycle engine
- fed by verified real-world behavior
- weighted by contribution quality
- funded by real pools
- selected through auditable logic
- exposed through stakeholder-specific dashboards

It should not be:

- a generic rewards tab
- a speculative economy
- a black box
- a duplicate of Pieces, Gems, or PromoPush

PromoShare v2 becomes strongest when it is the clear middle layer between:

- verified participation
- funded upside
- recurring stakeholder relevance
