-- ============================================================================
-- LINK ADVERTISER RESOURCES TO ACCOUNTS
-- Transition campaigns, coupons, and metrics to the new multi-account system
-- ============================================================================

BEGIN;

-- 1. ADD ACCOUNT COLUMN TO RELEVANT TABLES
-- We wrap in DO blocks to ensure we don't error if columns already exist
DO $$
BEGIN
    -- advertiser_campaigns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_campaigns') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advertiser_campaigns' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE advertiser_campaigns ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_advertiser_campaigns_account ON advertiser_campaigns(advertiser_account_id);
        END IF;
    END IF;

    -- advertiser_coupons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_coupons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advertiser_coupons' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE advertiser_coupons ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_advertiser_coupons_account ON advertiser_coupons(advertiser_account_id);
        END IF;
    END IF;

    -- advertiser_campaign_metrics
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_campaign_metrics') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advertiser_campaign_metrics' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE advertiser_campaign_metrics ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_advertiser_metrics_account ON advertiser_campaign_metrics(advertiser_account_id);
        END IF;
    END IF;

    -- advertiser_coupon_redemptions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_coupon_redemptions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advertiser_coupon_redemptions' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE advertiser_coupon_redemptions ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_advertiser_redemptions_account ON advertiser_coupon_redemptions(advertiser_account_id);
        END IF;
    END IF;

    -- unified coupons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE coupons ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_coupons_advertiser_account ON coupons(advertiser_account_id);
        END IF;
    END IF;

    -- drops
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drops') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drops' AND column_name = 'advertiser_account_id') THEN
            ALTER TABLE drops ADD COLUMN advertiser_account_id UUID REFERENCES advertiser_accounts(id) ON DELETE SET NULL;
            CREATE INDEX idx_drops_advertiser_account ON drops(advertiser_account_id);
        END IF;
    END IF;
END $$;

-- Update trigger function to propagate advertiser_account_id
CREATE OR REPLACE FUNCTION create_marketplace_coupon_from_advertiser()
RETURNS TRIGGER AS $$
DECLARE
  new_coupon_id UUID;
  coupon_code VARCHAR(50);
BEGIN
  -- Generate unique code from advertiser coupon title
  coupon_code := UPPER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]', '', 'g'));
  coupon_code := SUBSTRING(coupon_code FROM 1 FOR 20) || SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6);
  
  -- Only create marketplace coupon if reward type is 'coupon' or 'discount'
  IF NEW.reward_type IN ('coupon', 'discount') THEN
    -- Determine discount type based on value_unit
    INSERT INTO coupons (
      code,
      name,
      description,
      created_by,
      advertiser_account_id,
      discount_type,
      discount_value,
      applies_to,
      max_uses,
      max_uses_per_user,
      starts_at,
      expires_at,
      is_active,
      source_type,
      metadata
    ) VALUES (
      coupon_code,
      NEW.title,
      NEW.description,
      NEW.advertiser_id,
      NEW.advertiser_account_id,
      CASE 
        WHEN NEW.value_unit = 'percentage' THEN 'percentage'
        WHEN NEW.value_unit = 'usd' THEN 'fixed_usd'
        WHEN NEW.value_unit = 'gems' THEN 'fixed_gems'
        ELSE 'percentage'
      END,
      NEW.value,
      'all',
      NEW.quantity_total,
      1, -- max uses per user
      NEW.start_date,
      NEW.end_date,
      NEW.status = 'active',
      'advertiser',
      jsonb_build_object(
        'advertiser_coupon_id', NEW.id,
        'original_reward_type', NEW.reward_type,
        'conditions', NEW.conditions
      )
    )
    RETURNING id INTO new_coupon_id;
    
    -- Link back to advertiser coupon
    UPDATE advertiser_coupons 
    SET marketplace_coupon_id = new_coupon_id 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. DATA MIGRATION: Map existing resources to owner accounts
-- Link existing items to the primary account of the user who previously owned them

-- advertiser_campaigns
UPDATE advertiser_campaigns c
SET advertiser_account_id = a.id
FROM advertiser_accounts a
WHERE c.advertiser_id = a.owner_id
AND c.advertiser_account_id IS NULL;

-- advertiser_coupons
UPDATE advertiser_coupons c
SET advertiser_account_id = a.id
FROM advertiser_accounts a
WHERE c.advertiser_id = a.owner_id
AND c.advertiser_account_id IS NULL;

-- unified coupons
UPDATE coupons c
SET advertiser_account_id = a.id
FROM advertiser_accounts a
WHERE c.created_by = a.owner_id
AND c.source_type = 'advertiser'
AND c.advertiser_account_id IS NULL;

-- advertiser_campaign_metrics
UPDATE advertiser_campaign_metrics m
SET advertiser_account_id = a.id
FROM advertiser_accounts a
WHERE m.advertiser_id = a.owner_id
AND m.advertiser_account_id IS NULL;

-- drops
UPDATE drops d
SET advertiser_account_id = a.id
FROM advertiser_accounts a
WHERE d.creator_id = a.owner_id
AND d.advertiser_account_id IS NULL;

-- 3. UPDATE RLS POLICIES (Example for Campaigns)
-- We transition from user-based check to account-member based check

-- Update advertiser_campaigns policies
ALTER TABLE advertiser_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advertisers can view their own campaigns" ON advertiser_campaigns;
DROP POLICY IF EXISTS "Team members can view campaigns" ON advertiser_campaigns;
CREATE POLICY "Team members can view campaigns" ON advertiser_campaigns
    FOR SELECT TO authenticated
    USING (check_advertiser_permission(auth.uid(), advertiser_account_id, 'view_campaigns'));

DROP POLICY IF EXISTS "Advertisers can manage their own campaigns" ON advertiser_campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON advertiser_campaigns;
CREATE POLICY "Admins can manage campaigns" ON advertiser_campaigns
    FOR ALL TO authenticated
    USING (check_advertiser_permission(auth.uid(), advertiser_account_id, 'edit_campaigns'));

-- Update advertiser_coupons policies
ALTER TABLE advertiser_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view team coupons" ON advertiser_coupons;
CREATE POLICY "Team members can view team coupons" ON advertiser_coupons
    FOR SELECT TO authenticated
    USING (check_advertiser_permission(auth.uid(), advertiser_account_id, 'view_coupons'));

DROP POLICY IF EXISTS "Managers can manage team coupons" ON advertiser_coupons;
CREATE POLICY "Managers can manage team coupons" ON advertiser_coupons
    FOR ALL TO authenticated
    USING (check_advertiser_permission(auth.uid(), advertiser_account_id, 'edit_coupons'));

COMMIT;
