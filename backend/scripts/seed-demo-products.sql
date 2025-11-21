-- =====================================================
-- PROMORANG DEMO PRODUCTS & MERCHANT DATA
-- Seed script for e-commerce testing
-- =====================================================

-- First, ensure we have a merchant store for the demo merchant account
-- Assuming merchant demo user has username 'merchant_demo'

DO $$
DECLARE
  merchant_user_id UUID;
  store_id UUID;
BEGIN
  -- Get the merchant demo user ID
  SELECT id INTO merchant_user_id 
  FROM users 
  WHERE username = 'merchant_demo' 
  LIMIT 1;

  IF merchant_user_id IS NULL THEN
    RAISE NOTICE 'Merchant demo user not found. Please create merchant_demo user first.';
    RETURN;
  END IF;

  -- Create or update merchant store
  INSERT INTO merchant_stores (
    user_id,
    store_name,
    slug,
    description,
    logo_url,
    banner_url,
    business_type,
    contact_email,
    status,
    created_at,
    updated_at
  ) VALUES (
    merchant_user_id,
    'Promorang Official Store',
    'promorang-official',
    'Official merchandise and digital products from Promorang. Premium quality items for creators and fans.',
    'https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    'retail',
    'store@promorang.co',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    store_name = EXCLUDED.store_name,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    banner_url = EXCLUDED.banner_url,
    status = 'active',
    updated_at = NOW()
  RETURNING id INTO store_id;

  -- Delete existing demo products to avoid duplicates
  DELETE FROM products WHERE merchant_store_id = store_id;

  -- Insert Demo Products
  
  -- 1. DIGITAL PRODUCTS
  INSERT INTO products (
    merchant_store_id,
    name,
    slug,
    description,
    price_usd,
    price_gems,
    price_gold,
    category,
    image_url,
    stock_quantity,
    is_digital,
    status,
    created_at,
    updated_at
  ) VALUES
  (
    store_id,
    'Creator Starter Pack',
    'creator-starter-pack',
    'Everything you need to kickstart your creator journey. Includes templates, guides, and exclusive resources.',
    29.99,
    150,
    NULL,
    'digital-products',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
    999,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Premium Content Templates',
    'premium-content-templates',
    '50+ professional templates for social media, YouTube thumbnails, and promotional materials.',
    49.99,
    250,
    NULL,
    'digital-products',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
    999,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Brand Kit Bundle',
    'brand-kit-bundle',
    'Complete brand identity kit with logos, color palettes, fonts, and style guides.',
    79.99,
    400,
    NULL,
    'digital-products',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    999,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Analytics Dashboard Access',
    'analytics-dashboard-access',
    '3-month access to premium analytics dashboard with advanced insights and reporting.',
    99.99,
    500,
    NULL,
    'digital-products',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    999,
    true,
    'active',
    NOW(),
    NOW()
  );

  -- 2. SERVICES
  INSERT INTO products (
    merchant_store_id,
    name,
    slug,
    description,
    price_usd,
    price_gems,
    price_gold,
    category,
    image_url,
    stock_quantity,
    is_digital,
    status,
    created_at,
    updated_at
  ) VALUES
  (
    store_id,
    'Content Strategy Session',
    'content-strategy-session',
    '1-hour personalized content strategy consultation with industry experts.',
    149.99,
    750,
    NULL,
    'services',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    50,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Brand Audit & Review',
    'brand-audit-review',
    'Comprehensive brand audit with actionable recommendations for growth.',
    299.99,
    1500,
    NULL,
    'services',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    30,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Video Editing Package',
    'video-editing-package',
    'Professional editing for 5 videos with color grading, transitions, and effects.',
    499.99,
    2500,
    NULL,
    'services',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
    20,
    true,
    'active',
    NOW(),
    NOW()
  );

  -- 3. PHYSICAL MERCHANDISE
  INSERT INTO products (
    merchant_store_id,
    name,
    slug,
    description,
    price_usd,
    price_gems,
    price_gold,
    category,
    image_url,
    stock_quantity,
    is_digital,
    status,
    created_at,
    updated_at
  ) VALUES
  (
    store_id,
    'Promorang Logo T-Shirt',
    'promorang-logo-tshirt',
    'Premium cotton t-shirt with embroidered Promorang logo. Available in multiple sizes.',
    34.99,
    175,
    NULL,
    'creator-merch',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
    100,
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Creator Hoodie',
    'creator-hoodie',
    'Comfortable pullover hoodie with "Creator" embroidery. Perfect for content creation sessions.',
    59.99,
    300,
    NULL,
    'creator-merch',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop',
    75,
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Promorang Cap',
    'promorang-cap',
    'Adjustable snapback cap with embroidered logo. One size fits all.',
    24.99,
    125,
    NULL,
    'creator-merch',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=600&fit=crop',
    150,
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Sticker Pack',
    'sticker-pack',
    'Set of 10 high-quality vinyl stickers featuring Promorang branding and creator motifs.',
    9.99,
    50,
    NULL,
    'creator-merch',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop',
    500,
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Laptop Sleeve',
    'laptop-sleeve',
    'Padded laptop sleeve with Promorang branding. Fits 13-15 inch laptops.',
    39.99,
    200,
    NULL,
    'creator-merch',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop',
    80,
    false,
    'active',
    NOW(),
    NOW()
  );

  -- 4. FEATURED / PREMIUM ITEMS
  INSERT INTO products (
    merchant_store_id,
    name,
    slug,
    description,
    price_usd,
    price_gems,
    price_gold,
    category,
    image_url,
    stock_quantity,
    is_digital,
    status,
    created_at,
    updated_at
  ) VALUES
  (
    store_id,
    'Ultimate Creator Bundle',
    'ultimate-creator-bundle',
    'Everything you need: Digital templates, brand kit, 3 strategy sessions, and exclusive merch. Best value!',
    499.99,
    2500,
    100,
    'featured-picks',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop',
    25,
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Limited Edition Founder Pack',
    'limited-edition-founder-pack',
    'Exclusive founder edition with signed certificate, premium merch, and lifetime platform benefits.',
    999.99,
    5000,
    500,
    'featured-picks',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    10,
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    store_id,
    'Monthly Creator Box',
    'monthly-creator-box',
    'Curated monthly box with exclusive items, templates, and surprise goodies for creators.',
    49.99,
    250,
    NULL,
    'featured-picks',
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=600&fit=crop',
    100,
    false,
    'active',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Successfully seeded % demo products for Promorang Official Store', (SELECT COUNT(*) FROM products WHERE merchant_store_id = store_id);

END $$;
