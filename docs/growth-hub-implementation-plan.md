# Growth Hub Implementation Plan

Prepared by: Senior Dev Hand-off
Date: 2025-10-27

## 1. Objectives
- Provide auditable tracking for all Growth Hub money and gem flows.
- Introduce performance-led creator rewards capped at 5% of Promorang revenue.
- Close UX gaps so users understand share availability (paid vs. engagement) and can act without navigation glitches.

## 2. Data & Tracking Workstreams

### 2.1 Database Schema (Supabase/Postgres)
Create the following tables (pseudo-DDL for reference):

```sql
-- Monetary/gem ledger
CREATE TABLE growth_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  source_type text NOT NULL CHECK (source_type IN ('staking', 'staking_claim', 'funding_pledge', 'shield_premium', 'creator_reward')), 
  source_id uuid NOT NULL, -- references channel/position/project/subscription
  amount numeric(14,2) NOT NULL, -- positive inflow, negative outflow
  currency text NOT NULL CHECK (currency IN ('gems', 'usd')),
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'
);

-- Staking positions (persisted replacement for mock store)
CREATE TABLE staking_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  channel_id text NOT NULL,
  amount numeric(14,2) NOT NULL,
  multiplier numeric(6,3) NOT NULL,
  lock_until timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'withdrawable')),
  earned_so_far numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Funding pledges
CREATE TABLE funding_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES funding_projects(id),
  backer_id uuid NOT NULL REFERENCES users(id),
  amount numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Shield subscriptions
CREATE TABLE shield_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  policy_id text NOT NULL,
  premium_paid numeric(14,2) NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active','expired','cancelled'))
);

-- Creator performance rewards
CREATE TABLE creator_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES users(id),
  metric text NOT NULL CHECK (metric IN ('views','paid_shares','free_shares','comments')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  threshold numeric NOT NULL,
  actual numeric NOT NULL,
  reward_amount numeric(14,2) NOT NULL,
  reward_currency text NOT NULL CHECK (reward_currency IN ('usd','gems','shares')),
  status text NOT NULL CHECK (status IN ('pending','processed','paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'
);
```

_Next Actions (DB):_
1. Confirm naming/IDs match existing Supabase `users` table (adjust FK columns).
2. Generate migration files (Supabase CLI) with the above schema and seed data for development parity.
3. Backfill ledger entries when migrating off the mock store (script to snapshot current Map data).

### 2.2 Backend Services
- Replace `backend/api/mockStore.js` usage in `backend/api/growth.js` with repository layer hitting Supabase tables.
- Add transactional helpers so staking/pledge/shield endpoints:
  1. Validate balance (gems) from wallet service.
  2. Insert ledger entry (negative when user spends, positive when they earn).
  3. Update wallet balances atomically (use database transactions).
- Introduce `/api/growth/ledger` endpoint that paginates a user’s entries for UI consumption.

### 2.3 Revenue Guardrail (≤5% redistribution)
- Add daily job (Cron/Supabase Edge Function) to compute total revenue vs. pending rewards. If `sum(reward_amount) > total_revenue * 0.05`, scale down newest rewards or defer them.
- Persist the guardrail decision in `creator_rewards.metadata` (`{"scaled": true, "scale_factor": 0.8}` etc.) for transparency.

## 3. Creator Performance Rewards

### 3.1 Metrics Collection
- Extend content analytics pipeline to track: daily unique views, `paid_shares`, `free_shares_awarded`, `comments_count` (store in `content_metrics_daily`).
- Define baseline thresholds (per creator tier) in config table `creator_reward_tiers` with fields: `metric`, `tier`, `threshold`, `reward_type`, `reward_value`.

### 3.2 Reward Job Flow
1. Nightly job aggregates metrics per creator for the previous day/week.
2. For each creator & metric that crosses a threshold, insert a `creator_rewards` row (status `pending`).
3. When finance approves / guardrail check passes, mark `status='processed'` and enqueue wallet credit (`growth_ledger` entry + wallet balance update).
4. Notify creators via existing notification system (add template “Performance Bonus Unlocked”).

## 4. Frontend Tasks

### 4.1 Growth Hub UI Enhancements
- Consume new `/api/growth/ledger` endpoint to show transactions under a "History" tab.
- Show live balances by reading `gems_balance` after each staking/pledge action (already passed via API, just ensure state refresh).
- Add banners/tooltips explaining difference between paid shares and engagement/free shares (see §5).

### 4.2 Wallet & Feed Updates
- Wallet page: include “Performance Rewards” card with last payout, next review date.
- HomeFeed cards: differentiate between `available_shares` (paid) and `engagement_shares_remaining` (free). Messaging guidelines:
  - If `available_shares === 0` but `engagement_shares_remaining > 0`, show "Claim engagement shares by sharing early".
  - Always show a disabled “Buy Shares” button with tooltip when paid shares are sold out.

### 4.3 Creator Dashboard (future milestone)
- Surface metrics, thresholds, and remaining progress to next reward.
- Provide breakdown of how guardrail scaling affected payouts.

## 5. Immediate Fixes (Checked-in Work)
- [x] Growth Hub CTA in wallet & nav dropdown (done earlier today).
- [ ] Update `ButtonGroup` to stop event bubbling so Tip/Buy buttons don’t navigate away.
- [ ] Show share availability messaging per §4.2 (work in progress below).

## 6. QA Guidance
- Add integration tests (supabase-mocked) covering staking happy path and insufficient balance edge cases.
- Snapshot tests for new ledger UI (React Testing Library).
- Performance rewards guardrail: unit tests verifying scaling logic with various revenue scenarios.

## 7. Hand-off Checklist for Junior Dev
1. Generate Supabase migrations using the schema outlines.
2. Create new TypeScript data models/services for staking/pledge/shield/rewards.
3. Swap frontend fetches to real endpoints once backend ready.
4. Implement UI tooltips/banners per §4 and write Cypress smoke tests.
5. Validate 5% revenue cap logic with fixture data before launch.

Questions? Ping senior dev with ledger schema draft before running migrations.
