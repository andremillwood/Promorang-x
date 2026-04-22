# Momentum Engine Domain Model

This document defines the canonical domain model for the Momentum Engine.

## 1. Entity Overview

### 1.1 Moment
Atomic opportunity that a user can join, complete, and verify.

Core fields:
- `id`
- `title`
- `type`: `digital` | `physical` | `hybrid`
- `status`: `draft` | `scheduled` | `joinable` | `active` | `closed` | `archived`
- `pulse_state`: `dormant` | `forming` | `live` | `cooling`
- `venue_id`
- `host_id`
- `creator_id`
- `brand_id`
- `reward_modes[]`: `cash`, `gems`, `perk`, `memory`, `access`
- `proof_requirements[]`
- `capacity_limit`
- `cooldown_policy`
- `gathering_threshold`
- `bonus_multiplier`
- `early_incentive`
- `viral_share_percentage`
- `safety_level`

### 1.2 Gathering
Derived state for a moment whose density threshold is crossed.

Core fields:
- `id`
- `moment_id`
- `threshold_target`
- `threshold_progress`
- `activated_at`
- `active_multiplier`
- `capacity_limit`
- `cooldown_until`
- `surge_band`

### 1.3 Memory
Persistent digital collectible created from a verified completion.

Core fields:
- `id`
- `user_id`
- `moment_id`
- `creator_id`
- `venue_id`
- `brand_id`
- `rarity`
- `collection_key`
- `perk_id`
- `legacy_score`
- `issued_at`
- `expires_at`
- `is_transferable`

### 1.4 Perk
Redeemable or persistent utility created by memory, venue, or campaign logic.

Core fields:
- `id`
- `source_type`: `memory` | `venue` | `brand` | `status`
- `benefit_type`: `discount` | `priority_access` | `exclusive_content` | `bonus_multiplier`
- `benefit_value`
- `redemption_rules`
- `expires_at`
- `active_status`

### 1.5 PulseSignal
Live readout of momentum around a moment or venue.

Core fields:
- `moment_id`
- `venue_id`
- `crowd_level`
- `threshold_progress`
- `urgency_band`
- `current_bonus`
- `saturation_risk`
- `sentiment_band`

### 1.6 ContentMoment
A creator-driven or brand-driven digital-to-physical mission.

Core fields:
- `id`
- `moment_id`
- `content_type`: `video` | `audio` | `ar` | `story` | `drop`
- `entry_action_types[]`
- `physical_unlock_rules`
- `co_branded_memory`
- `o2o_conversion_rate`

### 1.7 ImpactProfile
Measures how much momentum a user generates for others.

Core fields:
- `user_id`
- `impact_score`
- `catalyst_rank`
- `downstream_actions`
- `downstream_rewards_generated`
- `first_mover_count`
- `viral_share_earnings`

### 1.8 VenueNode
A venue with operating constraints and momentum metrics.

Core fields:
- `id`
- `name`
- `capacity_limit`
- `cooldown_policy`
- `verification_modes[]`
- `gathering_efficiency`
- `perk_redemption_rate`
- `safety_mode`

## 2. Relationship Model

- One `VenueNode` can host many `Moments`
- One `Moment` can become one or more `Gatherings` over time
- One verified `Moment` completion can issue one `Memory`
- One `Memory` can attach zero or one `Perk`
- One `ContentMoment` wraps one `Moment`
- One `ImpactProfile` belongs to one user and aggregates cross-moment influence

## 3. State Models

### 3.1 Moment Status
- `draft`
- `scheduled`
- `joinable`
- `active`
- `closed`
- `archived`

### 3.2 Pulse State
- `dormant`: available but inactive
- `forming`: threshold progress underway
- `live`: threshold crossed and multiplier active
- `cooling`: tapering or governed to reduce crowd risk

### 3.3 Proof State
- `unstarted`
- `pending_submission`
- `pending_review`
- `verified`
- `rejected`
- `expired`

### 3.4 Memory Rarity
- `common`
- `rare`
- `epic`
- `legendary`

## 4. Design Rules

### 4.1 Rich Backend, Simple UX
The system can support complex economics and attribution, but the interface should default to:
- what is forming
- what to do next
- what the user keeps

### 4.2 Safety First
No entity should be designed without:
- capacity awareness
- cooldown awareness
- proof hardening
- privacy boundaries

### 4.3 Agent Readiness
Each object should support machine-readable discovery and reasoning without requiring UI scraping.
