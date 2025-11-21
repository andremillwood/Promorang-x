-- =====================================================
-- INTEGRATE ADVERTISER & MARKETPLACE COUPON SYSTEMS
-- Links campaign/drop coupons with marketplace discounts
-- =====================================================

-- Add marketplace coupon reference to advertiser coupons
ALTER TABLE advertiser_coupons 
ADD COLUMN IF NOT EXISTS marketplace_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;

-- Add advertiser campaign reference to marketplace coupons
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES advertiser_campaigns(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS drop_id UUID,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'merchant' CHECK (source_type IN ('merchant', 'advertiser', 'platform'));

-- Create index for cross-system lookups
CREATE INDEX IF NOT EXISTS idx_advertiser_coupons_marketplace ON advertiser_coupons(marketplace_coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_campaign ON coupons(campaign_id);
CREATE INDEX IF NOT EXISTS idx_coupons_drop ON coupons(drop_id);
CREATE INDEX IF NOT EXISTS idx_coupons_source ON coupons(source_type);

-- Add campaign/drop tracking to coupon usage
ALTER TABLE coupon_usage
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES advertiser_campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS drop_id UUID,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'marketplace' CHECK (source IN ('marketplace', 'campaign', 'drop'));

CREATE INDEX IF NOT EXISTS idx_coupon_usage_campaign ON coupon_usage(campaign_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_drop ON coupon_usage(drop_id);

-- Function to auto-create marketplace coupon when advertiser creates one
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

-- Trigger to auto-create marketplace coupons
DROP TRIGGER IF EXISTS trigger_create_marketplace_coupon ON advertiser_coupons;
CREATE TRIGGER trigger_create_marketplace_coupon
  AFTER INSERT ON advertiser_coupons
  FOR EACH ROW
  EXECUTE FUNCTION create_marketplace_coupon_from_advertiser();

-- Function to sync advertiser coupon updates to marketplace
CREATE OR REPLACE FUNCTION sync_advertiser_coupon_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update linked marketplace coupon if it exists
  IF NEW.marketplace_coupon_id IS NOT NULL THEN
    UPDATE coupons
    SET
      name = NEW.title,
      description = NEW.description,
      discount_value = NEW.value,
      max_uses = NEW.quantity_total,
      expires_at = NEW.end_date,
      is_active = (NEW.status = 'active'),
      updated_at = NOW()
    WHERE id = NEW.marketplace_coupon_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync updates
DROP TRIGGER IF EXISTS trigger_sync_advertiser_coupon ON advertiser_coupons;
CREATE TRIGGER trigger_sync_advertiser_coupon
  AFTER UPDATE ON advertiser_coupons
  FOR EACH ROW
  WHEN (OLD.marketplace_coupon_id IS NOT NULL)
  EXECUTE FUNCTION sync_advertiser_coupon_updates();

-- Function to track coupon redemption across both systems
CREATE OR REPLACE FUNCTION track_cross_system_redemption()
RETURNS TRIGGER AS $$
DECLARE
  advertiser_coupon_rec RECORD;
BEGIN
  -- Check if this is an advertiser-sourced coupon
  SELECT ac.id, ac.quantity_remaining
  INTO advertiser_coupon_rec
  FROM coupons c
  JOIN advertiser_coupons ac ON c.id = ac.marketplace_coupon_id
  WHERE c.id = NEW.coupon_id;
  
  -- If found, also record in advertiser redemption table
  IF FOUND THEN
    INSERT INTO advertiser_coupon_redemptions (
      coupon_id,
      user_id,
      redeemed_at,
      reward_value,
      reward_unit,
      status
    ) VALUES (
      advertiser_coupon_rec.id,
      NEW.user_id,
      NEW.used_at,
      NEW.discount_amount_usd,
      'usd',
      'completed'
    );
    
    -- Decrement advertiser coupon quantity
    UPDATE advertiser_coupons
    SET quantity_remaining = GREATEST(0, quantity_remaining - 1)
    WHERE id = advertiser_coupon_rec.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cross-system tracking
DROP TRIGGER IF EXISTS trigger_track_cross_redemption ON coupon_usage;
CREATE TRIGGER trigger_track_cross_redemption
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION track_cross_system_redemption();

-- View to see all coupons (both systems) in one place
CREATE OR REPLACE VIEW unified_coupons AS
SELECT 
  c.id,
  c.code,
  c.name,
  c.description,
  c.discount_type,
  c.discount_value,
  c.max_uses,
  c.current_uses,
  c.expires_at,
  c.is_active,
  c.source_type,
  c.campaign_id,
  c.drop_id,
  c.created_at,
  'marketplace' as system,
  NULL as advertiser_id,
  c.store_id
FROM coupons c
WHERE c.source_type IN ('merchant', 'platform')

UNION ALL

SELECT
  c.id,
  c.code,
  c.name,
  c.description,
  c.discount_type,
  c.discount_value,
  c.max_uses,
  c.current_uses,
  c.expires_at,
  c.is_active,
  c.source_type,
  c.campaign_id,
  c.drop_id,
  c.created_at,
  'advertiser' as system,
  ac.advertiser_id,
  NULL as store_id
FROM coupons c
JOIN advertiser_coupons ac ON c.id = ac.marketplace_coupon_id
WHERE c.source_type = 'advertiser';

-- View for coupon analytics across both systems
CREATE OR REPLACE VIEW coupon_analytics AS
SELECT
  c.id as coupon_id,
  c.code,
  c.name,
  c.source_type,
  c.campaign_id,
  c.drop_id,
  COUNT(DISTINCT cu.user_id) as unique_users,
  COUNT(cu.id) as total_redemptions,
  SUM(cu.discount_amount_usd) as total_discount_usd,
  SUM(cu.discount_amount_gems) as total_discount_gems,
  AVG(cu.discount_amount_usd) as avg_discount_usd,
  MIN(cu.used_at) as first_redemption,
  MAX(cu.used_at) as last_redemption
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id, c.code, c.name, c.source_type, c.campaign_id, c.drop_id;

COMMENT ON TABLE coupons IS 'Unified coupon system supporting merchant, advertiser, and platform coupons';
COMMENT ON COLUMN coupons.source_type IS 'Origin of coupon: merchant (store owner), advertiser (campaign), or platform (admin)';
COMMENT ON COLUMN coupons.campaign_id IS 'Link to advertiser campaign if coupon is campaign-generated';
COMMENT ON COLUMN coupons.drop_id IS 'Link to drop if coupon is drop-specific reward';
COMMENT ON VIEW unified_coupons IS 'Combined view of all coupons across merchant and advertiser systems';
COMMENT ON VIEW coupon_analytics IS 'Aggregated redemption analytics for all coupons';
