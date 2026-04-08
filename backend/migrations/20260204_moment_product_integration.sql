-- Phase 31: Moment-Product Integration
-- Date: 2026-02-04
-- Purpose: Link merchant products to Moments for event-based rewards

-- ============================================================================
-- 1. Add Moment Linking to Products
-- ============================================================================

-- Add moment linking and visibility controls to merchant_products
ALTER TABLE merchant_products
ADD COLUMN IF NOT EXISTS linked_moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' 
  CHECK (visibility IN ('public', 'moment_participants', 'private')),
ADD COLUMN IF NOT EXISTS moment_exclusive BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_redeem_on_participation BOOLEAN DEFAULT false;

COMMENT ON COLUMN merchant_products.linked_moment_id IS 'Optional moment this product is linked to';
COMMENT ON COLUMN merchant_products.visibility IS 'Who can see this product: public, moment_participants, or private';
COMMENT ON COLUMN merchant_products.moment_exclusive IS 'If true, only moment participants can purchase';
COMMENT ON COLUMN merchant_products.auto_redeem_on_participation IS 'If true, auto-create redemption when user participates in moment';

-- ============================================================================
-- 2. Link Entitlements to Products
-- ============================================================================

-- Add product linking to entitlements
ALTER TABLE entitlements
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS merchant_product_id UUID REFERENCES merchant_products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS auto_create_redemption BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS redemption_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS redemption_sale_id UUID REFERENCES product_sales(id);

COMMENT ON COLUMN entitlements.user_id IS 'User who owns this entitlement';
COMMENT ON COLUMN entitlements.merchant_product_id IS 'Optional merchant product this entitlement grants access to';
COMMENT ON COLUMN entitlements.auto_create_redemption IS 'If true, automatically create product redemption when entitlement is issued';
COMMENT ON COLUMN entitlements.redemption_created_at IS 'When the product redemption was auto-created';
COMMENT ON COLUMN entitlements.redemption_sale_id IS 'Reference to the auto-created product sale';

-- ============================================================================
-- 3. Indexes for Performance
-- ============================================================================

-- Index for moment-product queries
CREATE INDEX IF NOT EXISTS idx_products_moment 
ON merchant_products(linked_moment_id) 
WHERE linked_moment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_visibility
ON merchant_products(visibility, is_active)
WHERE is_active = true;

-- Index for entitlement-product queries
CREATE INDEX IF NOT EXISTS idx_entitlements_product
ON entitlements(merchant_product_id) 
WHERE merchant_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entitlements_auto_redeem
ON entitlements(auto_create_redemption, redemption_created_at)
WHERE auto_create_redemption = true;

-- ============================================================================
-- 4. Unified Redemption Lookup View
-- ============================================================================

-- Ensure image_url column exists (from Phase 29 migration)
ALTER TABLE merchant_products
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a unified view for product redemptions
-- Note: Entitlement-based redemptions are auto-created as product_sales via trigger
CREATE OR REPLACE VIEW unified_redemptions AS
SELECT 
  ps.redemption_code,
  CASE 
    WHEN ps.sale_type = 'redemption' THEN 'entitlement'
    ELSE 'product'
  END AS redemption_type,
  ps.id AS sale_id,
  ps.product_id,
  mp.name AS product_name,
  mp.merchant_id,
  ps.user_id,
  ps.status,
  ps.validated_at,
  ps.validated_by,
  ps.created_at,
  mp.image_url,
  mp.description
FROM product_sales ps
JOIN merchant_products mp ON ps.product_id = mp.id
WHERE ps.redemption_code IS NOT NULL;



COMMENT ON VIEW unified_redemptions IS 'Unified view of product sales with redemption codes (includes both direct purchases and entitlement-based redemptions)';

-- ============================================================================
-- 5. Function: Auto-Create Product Redemption from Entitlement
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_product_redemption()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_auto_redeem BOOLEAN;
  v_sale_id UUID;
  v_redemption_code TEXT;
BEGIN
  -- Only proceed if entitlement has a linked product
  IF NEW.merchant_product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if auto-redemption is enabled
  SELECT auto_create_redemption INTO v_auto_redeem
  FROM entitlements
  WHERE id = NEW.id;

  IF NOT v_auto_redeem THEN
    RETURN NEW;
  END IF;

  -- Generate redemption code (8 characters: 3 letters + 5 numbers)
  v_redemption_code := UPPER(
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    LPAD(floor(random() * 100000)::text, 5, '0')
  );

  -- Create product sale record
  INSERT INTO product_sales (
    product_id,
    user_id,
    merchant_id,
    sale_type,
    amount_paid,
    points_paid,
    redemption_code,
    status,
    created_at
  )
  SELECT
    NEW.merchant_product_id,
    NEW.user_id,
    mp.merchant_id,
    'redemption',
    0,
    0,
    v_redemption_code,
    'pending',
    NOW()
  FROM merchant_products mp
  WHERE mp.id = NEW.merchant_product_id
  RETURNING id INTO v_sale_id;

  -- Update entitlement with redemption info
  UPDATE entitlements
  SET 
    redemption_created_at = NOW(),
    redemption_sale_id = v_sale_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create redemption when entitlement is issued
DROP TRIGGER IF EXISTS trigger_auto_create_redemption ON entitlements;
CREATE TRIGGER trigger_auto_create_redemption
AFTER INSERT ON entitlements
FOR EACH ROW
EXECUTE FUNCTION auto_create_product_redemption();

-- ============================================================================
-- 6. Function: Distribute Escrow to Products
-- ============================================================================

CREATE OR REPLACE FUNCTION distribute_escrow_to_products(
  p_escrow_pool_id UUID,
  p_product_id UUID,
  p_quantity_per_user INTEGER DEFAULT 1
)
RETURNS TABLE(
  user_id UUID,
  entitlements_created INTEGER,
  total_value DECIMAL
) AS $$
BEGIN
  -- Create entitlements for all eligible users
  -- This will auto-trigger product redemption creation
  RETURN QUERY
  WITH eligible_users AS (
    SELECT DISTINCT r.user_id
    FROM redemptions r
    JOIN moments m ON r.moment_id = m.id
    JOIN moment_escrow_pools mep ON m.id = mep.moment_id
    WHERE mep.id = p_escrow_pool_id
      AND r.redeemed_at IS NOT NULL
  ),
  created_entitlements AS (
    INSERT INTO entitlements (
      user_id,
      moment_id,
      merchant_product_id,
      auto_create_redemption,
      issued_at
    )
    SELECT 
      eu.user_id,
      mep.moment_id,
      p_product_id,
      true,
      NOW()
    FROM eligible_users eu
    CROSS JOIN generate_series(1, p_quantity_per_user) AS series
    JOIN moment_escrow_pools mep ON mep.id = p_escrow_pool_id
    RETURNING user_id, id
  )
  SELECT 
    ce.user_id,
    COUNT(*)::INTEGER AS entitlements_created,
    (COUNT(*) * mp.price_usd) AS total_value
  FROM created_entitlements ce
  JOIN merchant_products mp ON mp.id = p_product_id
  GROUP BY ce.user_id, mp.price_usd;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION distribute_escrow_to_products IS 'Distribute escrow pool to users as product entitlements';

-- ============================================================================
-- 7. RLS Policies
-- ============================================================================

-- Allow users to see public products and moment-participant products they have access to
DROP POLICY IF EXISTS merchant_products_visibility_policy ON merchant_products;
CREATE POLICY merchant_products_visibility_policy ON merchant_products
FOR SELECT
USING (
  visibility = 'public'
  OR (
    visibility = 'moment_participants'
    AND linked_moment_id IN (
      SELECT moment_id 
      FROM redemptions 
      WHERE user_id = auth.uid()
        AND redeemed_at IS NOT NULL
    )
  )
  OR merchant_id = auth.uid()
);

-- Allow users to see their own entitlements
DROP POLICY IF EXISTS entitlements_user_policy ON entitlements;
CREATE POLICY entitlements_user_policy ON entitlements
FOR SELECT
USING (user_id = auth.uid());

-- ============================================================================
-- 8. Sample Data (for testing)
-- ============================================================================

-- Example: Create a moment-exclusive product
-- INSERT INTO merchant_products (
--   merchant_id,
--   name,
--   description,
--   price_usd,
--   price_points,
--   category,
--   linked_moment_id,
--   visibility,
--   moment_exclusive,
--   auto_redeem_on_participation
-- ) VALUES (
--   'merchant-uuid',
--   'VIP Coffee Voucher',
--   'Free coffee for moment participants',
--   0,
--   0,
--   'Food & Drink',
--   'moment-uuid',
--   'moment_participants',
--   true,
--   true
-- );

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Phase 31: Moment-Product Integration migration completed successfully';
  RAISE NOTICE 'Added moment linking to merchant_products';
  RAISE NOTICE 'Added product linking to entitlements';
  RAISE NOTICE 'Created unified_redemptions view';
  RAISE NOTICE 'Created auto-redemption trigger';
  RAISE NOTICE 'Created escrow distribution function';
END $$;
