-- ============================================================================
-- PROMORANG LIQUIDITY NODES & NO-LOSS LOTTERY ENGINE MIGRATION
-- Author: Promorang Core Engineering
-- Date: 2026-08-27
-- Description:
--   Creates the schema for community-financed Promorang Nodes (Liquidity Pools),
--   User Node Stakes (Principal Protected), No-Loss Prize Pools, Draw Records,
--   Winners Ledger, and AMOE Sweepstakes Compliance Entries.
-- ============================================================================

-- 1. Enable UUID generator if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Nodes Table
CREATE TABLE IF NOT EXISTS promorang_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_name VARCHAR(100) NOT NULL,
    node_slug VARCHAR(100) NOT NULL UNIQUE,
    node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('amm_liquidity', 'merchant_coupon_float', 'bounty_settlement', 'general_treasury')),
    description TEXT,
    target_capacity DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
    current_tvl DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    base_annual_yield_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0800, -- 8.00% gross yield
    prize_pool_share DECIMAL(5,4) NOT NULL DEFAULT 0.5000,       -- 50% of gross yield to lottery
    min_stake_usd DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Node Stakes (100% Principal Protection)
CREATE TABLE IF NOT EXISTS node_stakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES promorang_nodes(id) ON DELETE RESTRICT,
    staked_amount DECIMAL(15,2) NOT NULL CHECK (staked_amount > 0),
    accumulated_yield_usd DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    claimed_yield_usd DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaking_pending', 'unstaked')),
    locked_until TIMESTAMP WITH TIME ZONE,
    unstake_requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_node_stakes_user_id ON node_stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_node_stakes_node_id ON node_stakes(node_id);
CREATE INDEX IF NOT EXISTS idx_node_stakes_status ON node_stakes(status);

-- 4. No-Loss Prize Pools
CREATE TABLE IF NOT EXISTS no_loss_prize_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_name VARCHAR(100) NOT NULL,
    pool_slug VARCHAR(100) NOT NULL UNIQUE,
    cadence VARCHAR(20) NOT NULL CHECK (cadence IN ('weekly', 'monthly', 'seasonal')),
    tier_eligibility VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (tier_eligibility IN ('all', 'premium_super', 'super_only')),
    current_prize_pot_usd DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    guaranteed_floor_usd DECIMAL(15,2) NOT NULL DEFAULT 250.00,
    next_draw_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Prize Pool Draws
CREATE TABLE IF NOT EXISTS prize_pool_draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES no_loss_prize_pools(id) ON DELETE CASCADE,
    draw_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_tickets_in_draw BIGINT NOT NULL,
    total_pot_distributed DECIMAL(15,2) NOT NULL,
    winning_ticket_hash TEXT NOT NULL,
    rng_seed TEXT NOT NULL,
    draw_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (draw_status IN ('pending', 'completed', 'disputed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prize_pool_draws_pool_id ON prize_pool_draws(pool_id);

-- 6. Prize Draw Winners
CREATE TABLE IF NOT EXISTS prize_draw_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES prize_pool_draws(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prize_tier VARCHAR(20) NOT NULL CHECK (prize_tier IN ('grand', 'major', 'minor', 'micro')),
    prize_amount_usd DECIMAL(15,2) NOT NULL,
    paid_status VARCHAR(20) NOT NULL DEFAULT 'settled' CHECK (paid_status IN ('pending', 'settled')),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prize_draw_winners_user_id ON prize_draw_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_prize_draw_winners_draw_id ON prize_draw_winners(draw_id);

-- 7. Sweepstakes AMOE Entries (Alternate Method of Entry for Legal Compliance)
CREATE TABLE IF NOT EXISTS sweepstakes_amoe_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID NOT NULL REFERENCES no_loss_prize_pools(id) ON DELETE CASCADE,
    free_tickets_granted INTEGER NOT NULL DEFAULT 10,
    request_ip VARCHAR(45),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sweepstakes_amoe_user ON sweepstakes_amoe_entries(user_id);

-- 8. Seed Default Promorang Nodes & Prize Pools
INSERT INTO promorang_nodes (node_name, node_slug, node_type, description, target_capacity, current_tvl, base_annual_yield_rate, prize_pool_share)
VALUES 
    ('Pieces AMM Liquidity Node', 'pieces-amm-node', 'amm_liquidity', 'Powers liquidity reserves for creator pieces trading and automated market making.', 250000.00, 45000.00, 0.0800, 0.5000),
    ('Merchant Coupon Settlement Node', 'merchant-coupon-node', 'merchant_coupon_float', 'Backs instant checkout discount settlements and merchant float.', 150000.00, 32000.00, 0.0750, 0.5000),
    ('Creator Bounty Clearing Node', 'creator-bounty-node', 'bounty_settlement', 'Guarantees instant payouts on verified campaign milestones.', 100000.00, 18500.00, 0.0900, 0.5000)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO no_loss_prize_pools (pool_name, pool_slug, cadence, tier_eligibility, current_prize_pot_usd, guaranteed_floor_usd, next_draw_at)
VALUES
    ('Sunday Weekly Spark Draw', 'weekly-spark', 'weekly', 'all', 1250.00, 500.00, NOW() + INTERVAL '4 days'),
    ('Monthly Ignite Mega Jackpot', 'monthly-ignite', 'monthly', 'premium_super', 6500.00, 2500.00, NOW() + INTERVAL '18 days'),
    ('Seasonal Grand Operator Crown', 'seasonal-crown', 'seasonal', 'super_only', 35000.00, 10000.00, NOW() + INTERVAL '60 days')
ON CONFLICT (pool_slug) DO NOTHING;
