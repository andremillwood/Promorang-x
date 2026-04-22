# Momentum Engine Schema Proposal

This document maps the Momentum Engine onto the current Promorang data model and proposes additive schema changes for V1.

## 1. Current Base We Can Reuse

The repo already contains several primitives that the Momentum Engine can extend rather than replace.

Existing core tables and concepts:
- `moments`
- `moment_participants`
- `profiles`
- `venues`
- `campaigns` and advertiser campaign structures
- `content_items` and content engagement structures

This is good news. We do not need a brand-new platform schema. We need a controlled extension of the current one.

## 2. Recommended Strategy

Use `moments` as the canonical execution object, then add supporting tables for:
- pulse and gathering state
- proof orchestration
- memory issuance
- perk attachment
- impact attribution
- content-to-physical linkage

## 3. Proposed Additions

### 3.1 Extend `moments`

Recommended additive columns:
- `moment_mode text`
  Values: `digital`, `physical`, `hybrid`
- `venue_category text`
- `moment_archetype text`
- `conversion_type text`
- `pulse_state text`
  Values: `dormant`, `forming`, `live`, `cooling`
- `gathering_threshold integer`
- `capacity_limit integer`
- `cooldown_minutes integer`
- `early_incentive_percent numeric`
- `viral_share_percent numeric`
- `memory_enabled boolean default false`
- `memory_rarity text`
- `perk_template_id uuid null`
- `safety_mode text`
  Values: `managed`, `strict`, `invite_only`
- `content_item_id uuid null`
- `venue_node_id uuid null`
- `proof_mode text`
  Values: `single`, `multi_modal`

### 3.2 New table: `moment_pulse_snapshots`

Purpose:
- track live state and historical momentum progression

Columns:
- `id uuid pk`
- `moment_id uuid not null`
- `pulse_state text not null`
- `threshold_progress integer not null default 0`
- `current_bonus_multiplier numeric not null default 1`
- `crowd_level integer not null default 0`
- `sentiment_band text null`
- `saturation_risk text null`
- `captured_at timestamptz not null default now()`

### 3.3 New table: `proof_requirements`

Purpose:
- define proof rules per moment

Columns:
- `id uuid pk`
- `moment_id uuid not null`
- `requirement_type text not null`
  Values: `geofence`, `venue_qr`, `rotating_code`, `timestamped_media`, `receipt`, `merchant_confirm`
- `is_required boolean not null default true`
- `weight numeric not null default 1`
- `metadata jsonb null`
- `created_at timestamptz default now()`

### 3.4 New table: `proof_submissions`

Purpose:
- unify the verification record for physical and hybrid completion

Columns:
- `id uuid pk`
- `moment_id uuid not null`
- `user_id uuid not null`
- `submission_state text not null`
  Values: `pending`, `verified`, `rejected`, `expired`
- `proof_bundle jsonb not null`
- `review_reason text null`
- `reviewed_by uuid null`
- `reviewed_at timestamptz null`
- `created_at timestamptz default now()`

### 3.5 New table: `memories`

Purpose:
- persist collectible outcomes from verified actions

Columns:
- `id uuid pk`
- `user_id uuid not null`
- `moment_id uuid not null`
- `venue_id uuid null`
- `creator_id uuid null`
- `brand_id uuid null`
- `rarity text not null`
- `title text not null`
- `collection_key text null`
- `legacy_score integer not null default 0`
- `perk_id uuid null`
- `is_transferable boolean not null default false`
- `issued_at timestamptz not null default now()`
- `expires_at timestamptz null`
- `metadata jsonb null`

### 3.6 New table: `memory_perks`

Purpose:
- represent active benefits attached to memories or status

Columns:
- `id uuid pk`
- `source_type text not null`
  Values: `memory`, `venue`, `brand`, `status`
- `source_id uuid not null`
- `benefit_type text not null`
  Values: `discount`, `priority_access`, `exclusive_content`, `bonus_multiplier`
- `benefit_value jsonb not null`
- `redemption_rules jsonb null`
- `is_active boolean not null default true`
- `starts_at timestamptz null`
- `expires_at timestamptz null`
- `created_at timestamptz default now()`

### 3.7 New table: `impact_events`

Purpose:
- attribute downstream momentum to catalysts

Columns:
- `id uuid pk`
- `source_user_id uuid not null`
- `downstream_user_id uuid not null`
- `moment_id uuid not null`
- `event_type text not null`
  Values: `share_conversion`, `first_mover_influence`, `gathering_activation_assist`
- `impact_score_delta integer not null default 0`
- `viral_share_amount numeric null`
- `metadata jsonb null`
- `created_at timestamptz default now()`

### 3.8 New table: `user_impact_profiles`

Purpose:
- materialized profile for participant and agent usage

Columns:
- `user_id uuid pk`
- `impact_score integer not null default 0`
- `catalyst_rank text null`
- `first_mover_count integer not null default 0`
- `downstream_action_count integer not null default 0`
- `downstream_reward_value numeric not null default 0`
- `updated_at timestamptz default now()`

### 3.9 New table: `content_moment_links`

Purpose:
- bridge content items and moments explicitly

Columns:
- `id uuid pk`
- `content_item_id uuid not null`
- `moment_id uuid not null`
- `entry_action_types text[] not null default '{}'`
- `physical_unlock_rules jsonb null`
- `o2o_conversion_rate numeric null`
- `is_sponsored boolean not null default false`
- `created_at timestamptz default now()`

### 3.10 New table: `venue_capacity_policies`

Purpose:
- give venues hard safety controls

Columns:
- `id uuid pk`
- `venue_id uuid not null`
- `default_capacity_limit integer not null`
- `cooldown_minutes integer not null default 0`
- `safety_mode text not null default 'managed'`
- `auto_pause_on_capacity boolean not null default true`
- `allow_gatherings boolean not null default true`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

## 4. Suggested Enums

Prefer true enums where values are stable:
- `moment_mode`
- `pulse_state`
- `memory_rarity`
- `submission_state`
- `perk_benefit_type`
- `impact_event_type`

## 5. Migration Plan

### Step 1
Additive columns on `moments` only.

### Step 2
Create `proof_requirements`, `proof_submissions`, `memories`, and `memory_perks`.

### Step 3
Create `moment_pulse_snapshots`, `impact_events`, `user_impact_profiles`.

### Step 4
Create `content_moment_links` and `venue_capacity_policies`.

### Step 5
Add indexes and RLS policies.

## 6. High-Value Indexes

- `moments(pulse_state, starts_at desc)`
- `moments(moment_mode, is_active, starts_at desc)`
- `moment_pulse_snapshots(moment_id, captured_at desc)`
- `proof_submissions(moment_id, user_id, created_at desc)`
- `memories(user_id, issued_at desc)`
- `memories(collection_key, rarity)`
- `impact_events(source_user_id, created_at desc)`
- `content_moment_links(content_item_id, moment_id)`

## 7. Product Notes

This schema proposal keeps the current `moments` table central. That matters because the web app, admin tools, analytics flows, and joins already assume that `moments` is the core operational object.

The safest path is to evolve that object into the Momentum Engine rather than try to replace it.
