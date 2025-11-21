-- =====================================================
-- PROMORANG COUPON & DISCOUNT SYSTEM
-- Comprehensive coupon management for marketplace
-- =====================================================

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Ownership
  store_id UUID REFERENCES merchant_stores(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Discount configuration
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_usd', 'fixed_gems', 'fixed_gold', 'free_shipping')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_usd DECIMAL(10, 2), -- Cap for percentage discounts
  
  -- Applicability
  applies_to VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories', 'minimum_purchase')),
  product_ids UUID[], -- Specific products this coupon applies to
  category_ids UUID[], -- Specific categories this coupon applies to
  min_purchase_usd DECIMAL(10, 2) DEFAULT 0,
  min_purchase_gems INTEGER DEFAULT 0,
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Discount applied
  discount_amount_usd DECIMAL(10, 2) DEFAULT 0,
  discount_amount_gems INTEGER DEFAULT 0,
  discount_amount_gold INTEGER DEFAULT 0,
  
  -- Context
  original_total_usd DECIMAL(10, 2),
  final_total_usd DECIMAL(10, 2),
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(coupon_id, user_id, order_id)
);

-- Add coupon fields to orders table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
    ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount_usd') THEN
    ALTER TABLE orders ADD COLUMN discount_amount_usd DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount_gems') THEN
    ALTER TABLE orders ADD COLUMN discount_amount_gems INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount_gold') THEN
    ALTER TABLE orders ADD COLUMN discount_amount_gold INTEGER DEFAULT 0;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);

-- Insert demo coupons for testing
INSERT INTO coupons (
  code,
  name,
  description,
  discount_type,
  discount_value,
  applies_to,
  max_uses,
  max_uses_per_user,
  expires_at,
  is_active
) VALUES
(
  'WELCOME10',
  'Welcome Discount',
  'Get 10% off your first purchase!',
  'percentage',
  10.00,
  'all',
  NULL,
  1,
  NOW() + INTERVAL '90 days',
  true
),
(
  'CREATOR50',
  'Creator Special',
  'Save $50 on any creator bundle',
  'fixed_usd',
  50.00,
  'minimum_purchase',
  100,
  1,
  NOW() + INTERVAL '30 days',
  true
),
(
  'GEMS100',
  '100 Gems Off',
  'Get 100 gems discount on your order',
  'fixed_gems',
  100.00,
  'all',
  NULL,
  3,
  NOW() + INTERVAL '60 days',
  true
),
(
  'FREESHIP',
  'Free Shipping',
  'Free shipping on all orders',
  'free_shipping',
  0.00,
  'all',
  NULL,
  NULL,
  NOW() + INTERVAL '365 days',
  true
),
(
  'FLASH25',
  'Flash Sale',
  'Limited time 25% off everything!',
  'percentage',
  25.00,
  'all',
  50,
  1,
  NOW() + INTERVAL '7 days',
  true
)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE coupons IS 'Coupon and discount codes for marketplace purchases';
COMMENT ON TABLE coupon_usage IS 'Tracks coupon usage history and prevents abuse';
