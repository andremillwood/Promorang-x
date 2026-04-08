-- Migration: Moment-Centric Pricing Refactor
-- Date: 2026-02-04
-- Purpose: Transform from user-subscription model to per-Moment SKU-based pricing

-- =====================================================
-- PART 1: Add SKU Pricing Fields to Moments Table
-- =====================================================

ALTER TABLE moments 
  ADD COLUMN IF NOT EXISTS sku_type TEXT CHECK (sku_type IN ('A1', 'A2', 'A3', 'A4', 'A5', 'S1', 'S2', 'S3')),
  ADD COLUMN IF NOT EXISTS brand_cost_usd DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS reward_pool_usd DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS platform_fee_usd DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS ops_buffer_usd DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed', 'partial')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT, -- Stripe payment ID or similar
  ADD COLUMN IF NOT EXISTS pricing_metadata JSONB DEFAULT '{}';

-- Add index for SKU queries
CREATE INDEX IF NOT EXISTS idx_moments_sku_type ON moments(sku_type);
CREATE INDEX IF NOT EXISTS idx_moments_payment_status ON moments(payment_status);

-- =====================================================
-- PART 2: Create Escrow Pools Table
-- =====================================================

CREATE TABLE IF NOT EXISTS moment_escrow_pools (
  id BIGSERIAL PRIMARY KEY,
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  total_amount_usd DECIMAL(10,2) NOT NULL CHECK (total_amount_usd >= 0),
  distributed_amount_usd DECIMAL(10,2) DEFAULT 0 CHECK (distributed_amount_usd >= 0),
  remaining_amount_usd DECIMAL(10,2) NOT NULL CHECK (remaining_amount_usd >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'refunded', 'locked')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one escrow pool per moment
CREATE UNIQUE INDEX IF NOT EXISTS idx_escrow_pools_moment_unique ON moment_escrow_pools(moment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_pools_status ON moment_escrow_pools(status);

-- =====================================================
-- PART 3: Create Escrow Distribution Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS escrow_distributions (
  id BIGSERIAL PRIMARY KEY,
  escrow_pool_id BIGINT REFERENCES moment_escrow_pools(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10,2) NOT NULL CHECK (amount_usd > 0),
  metadata JSONB DEFAULT '{}',
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_dist_pool ON escrow_distributions(escrow_pool_id);
CREATE INDEX IF NOT EXISTS idx_escrow_dist_user ON escrow_distributions(user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_dist_moment ON escrow_distributions(moment_id);

-- =====================================================
-- PART 4: Create Escrow Refund Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS escrow_refunds (
  id BIGSERIAL PRIMARY KEY,
  escrow_pool_id BIGINT REFERENCES moment_escrow_pools(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10,2) NOT NULL CHECK (amount_usd > 0),
  refund_method TEXT DEFAULT 'account_credit' CHECK (refund_method IN ('account_credit', 'stripe_refund', 'manual')),
  refund_reference TEXT, -- Stripe refund ID or similar
  metadata JSONB DEFAULT '{}',
  refunded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_refunds_pool ON escrow_refunds(escrow_pool_id);
CREATE INDEX IF NOT EXISTS idx_escrow_refunds_brand ON escrow_refunds(brand_id);

-- =====================================================
-- PART 5: Create Brand Accounts Table
-- =====================================================

CREATE TABLE IF NOT EXISTS brand_accounts (
  id BIGSERIAL PRIMARY KEY,
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_balance_usd DECIMAL(10,2) DEFAULT 0 CHECK (account_balance_usd >= 0),
  total_spent_usd DECIMAL(10,2) DEFAULT 0 CHECK (total_spent_usd >= 0),
  total_refunded_usd DECIMAL(10,2) DEFAULT 0 CHECK (total_refunded_usd >= 0),
  moments_created INT DEFAULT 0 CHECK (moments_created >= 0),
  successful_moments INT DEFAULT 0 CHECK (successful_moments >= 0),
  sku_unlock_status JSONB DEFAULT '{}', -- Track which SKUs are unlocked
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one account per brand
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_accounts_brand_unique ON brand_accounts(brand_id);

-- =====================================================
-- PART 6: Remove User Subscription Fields (Deprecated)
-- =====================================================

-- Archive old subscription data before dropping
DO $$
BEGIN
  -- Only create archive table if subscription columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_tier'
  ) THEN
    CREATE TABLE IF NOT EXISTS user_subscriptions_archive (
      user_id UUID,
      subscription_tier TEXT,
      subscription_status TEXT,
      subscription_expires_at TIMESTAMPTZ,
      archived_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO user_subscriptions_archive (user_id, subscription_tier, subscription_status, subscription_expires_at)
    SELECT id, subscription_tier, subscription_status, subscription_expires_at
    FROM users
    WHERE subscription_tier IS NOT NULL;
  END IF;
END $$;

-- Drop deprecated columns
ALTER TABLE users 
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_expires_at,
  DROP COLUMN IF EXISTS subscription_started_at;

-- =====================================================
-- PART 7: Update Existing Moments with Default SKU
-- =====================================================

-- Assign default SKU to existing moments
-- Since we don't have tier information, default all to A1 (Community Moment)
-- Brands can update these later if needed
UPDATE moments
SET 
  sku_type = 'A1',
  brand_cost_usd = 50,
  platform_fee_usd = 10,
  reward_pool_usd = 0,
  payment_status = 'pending'
WHERE sku_type IS NULL;

-- =====================================================
-- PART 8: Create Helper Functions
-- =====================================================

-- Function to auto-update escrow pool updated_at timestamp
CREATE OR REPLACE FUNCTION update_escrow_pool_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_escrow_pool_timestamp
BEFORE UPDATE ON moment_escrow_pools
FOR EACH ROW
EXECUTE FUNCTION update_escrow_pool_timestamp();

-- Function to auto-update brand account timestamp
CREATE OR REPLACE FUNCTION update_brand_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_account_timestamp
BEFORE UPDATE ON brand_accounts
FOR EACH ROW
EXECUTE FUNCTION update_brand_account_timestamp();

-- =====================================================
-- PART 9: Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE moment_escrow_pools IS 'Escrow accounts for Moment reward pools. Funds locked when Moment created, distributed to participants, unused funds refunded to brand.';
COMMENT ON TABLE escrow_distributions IS 'Tracks individual reward distributions from escrow pools to participants.';
COMMENT ON TABLE escrow_refunds IS 'Tracks refunds of unused escrow funds back to brands.';
COMMENT ON TABLE brand_accounts IS 'Brand billing accounts for tracking spend, refunds, and SKU unlock status.';

COMMENT ON COLUMN moments.sku_type IS 'SKU type: A1-A5 (core), S1-S3 (scale). Determines pricing structure.';
COMMENT ON COLUMN moments.brand_cost_usd IS 'Total cost paid by brand for this Moment.';
COMMENT ON COLUMN moments.reward_pool_usd IS 'Total reward pool allocated for participants.';
COMMENT ON COLUMN moments.platform_fee_usd IS 'Platform fee (Promorang revenue) for this Moment.';
COMMENT ON COLUMN moments.payment_status IS 'Payment status: pending, paid, refunded, failed, partial.';

-- =====================================================
-- PART 10: Grant Permissions (if using RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE moment_escrow_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_accounts ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your auth setup)
-- Example: Brands can view their own escrow pools
CREATE POLICY brand_view_own_escrow ON moment_escrow_pools
  FOR SELECT
  USING (
    moment_id IN (
      SELECT id FROM moments WHERE sponsor_id = auth.uid()
    )
  );

-- Service role can manage all escrow operations
CREATE POLICY service_manage_escrow ON moment_escrow_pools
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Migration Complete
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Moment-Centric Pricing Migration Complete';
  RAISE NOTICE 'Created tables: moment_escrow_pools, escrow_distributions, escrow_refunds, brand_accounts';
  RAISE NOTICE 'Updated moments table with SKU pricing fields';
  RAISE NOTICE 'Archived and removed user subscription fields';
  RAISE NOTICE 'Assigned default SKUs to existing moments';
END $$;
