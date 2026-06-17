-- Public commerce directory for merchant products, services, and organization offers.
-- This is the stakeholder-safe read model used by marketplace, venue, reward,
-- brand, and admin surfaces instead of reading raw commerce tables directly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'product_type'
  ) THEN
    CREATE TYPE public.product_type AS ENUM ('physical', 'service', 'digital');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(12,2),
  currency text DEFAULT 'USD',
  image_url text,
  type public.product_type DEFAULT 'physical',
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS price numeric(12,2),
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS type public.product_type DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.products
SET
  currency = COALESCE(currency, 'USD'),
  status = COALESCE(status, 'active'),
  metadata = COALESCE(metadata, '{}'::jsonb),
  type = COALESCE(type, 'physical'::public.product_type)
WHERE currency IS NULL
   OR status IS NULL
   OR metadata IS NULL
   OR type IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_organization_id
  ON public.products(organization_id);

CREATE INDEX IF NOT EXISTS idx_products_status_type
  ON public.products(status, type);

CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  category text DEFAULT 'venue',
  phone text,
  website text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'venue',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.venues
SET
  category = COALESCE(category, 'venue'),
  is_active = COALESCE(is_active, true)
WHERE category IS NULL
   OR is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_venues_owner_id
  ON public.venues(owner_id);

CREATE INDEX IF NOT EXISTS idx_venues_category_active
  ON public.venues(category, is_active);

CREATE TABLE IF NOT EXISTS public.merchant_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id uuid,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  sku text,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  cost_price numeric(12,2),
  currency text DEFAULT 'USD',
  inventory_quantity integer DEFAULT 0,
  inventory_policy text DEFAULT 'deny',
  is_active boolean DEFAULT true,
  is_redeemable_with_points boolean DEFAULT false,
  points_cost integer,
  images jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  external_id text,
  external_source text,
  external_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.merchant_products
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS venue_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS price numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_usd numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_points integer,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS cost_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS inventory_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inventory_count integer,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS inventory_policy text DEFAULT 'deny',
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_redeemable_with_points boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS points_cost integer,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS discount_type text,
  ADD COLUMN IF NOT EXISTS discount_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS redemption_limit_per_user integer,
  ADD COLUMN IF NOT EXISTS total_redemptions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sales integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_generated numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_conditions text,
  ADD COLUMN IF NOT EXISTS linked_moment_id uuid,
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS moment_exclusive boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_redeem_on_participation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_kind text DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS fulfillment_mode text DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS service_duration_minutes integer,
  ADD COLUMN IF NOT EXISTS service_capacity integer,
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

UPDATE public.merchant_products
SET
  price = COALESCE(price, price_usd),
  points_cost = COALESCE(points_cost, price_points),
  inventory_quantity = COALESCE(inventory_quantity, inventory_count, 0),
  currency = COALESCE(currency, 'USD'),
  images = CASE
    WHEN images IS NULL OR images = '[]'::jsonb THEN
      CASE
        WHEN image_url IS NOT NULL THEN jsonb_build_array(image_url)
        ELSE COALESCE(images, '[]'::jsonb)
      END
    ELSE images
  END,
  listing_kind = COALESCE(
    listing_kind,
    CASE
      WHEN lower(COALESCE(category, '')) IN ('service', 'services', 'clinic', 'health', 'wellness', 'fitness', 'hotel', 'hospitality') THEN 'service'
      ELSE 'product'
    END
  ),
  visibility = COALESCE(visibility, 'public'),
  is_active = COALESCE(is_active, true)
WHERE true;

CREATE INDEX IF NOT EXISTS idx_merchant_products_public_directory
  ON public.merchant_products(is_active, visibility, category);

CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant_id
  ON public.merchant_products(merchant_id);

CREATE INDEX IF NOT EXISTS idx_merchant_products_organization_id
  ON public.merchant_products(organization_id);

CREATE INDEX IF NOT EXISTS idx_merchant_products_venue_id
  ON public.merchant_products(venue_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active organization products" ON public.products;
CREATE POLICY "Public can view active organization products"
  ON public.products FOR SELECT
  USING (COALESCE(status, 'active') = 'active');

DROP POLICY IF EXISTS "Organization members can manage products" ON public.products;
CREATE POLICY "Organization members can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = products.organization_id
        AND om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = products.organization_id
        AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view active products" ON public.merchant_products;
DROP POLICY IF EXISTS "Merchants can manage their products" ON public.merchant_products;
DROP POLICY IF EXISTS "Merchants can manage their own products" ON public.merchant_products;
DROP POLICY IF EXISTS merchant_products_visibility_policy ON public.merchant_products;

CREATE POLICY merchant_products_visibility_policy
  ON public.merchant_products FOR SELECT
  USING (
    merchant_id = auth.uid()
    OR (
      is_active = true
      AND COALESCE(visibility, 'public') = 'public'
    )
    OR (
      is_active = true
      AND visibility = 'moment_participants'
      AND linked_moment_id IN (
        SELECT mp.moment_id
        FROM public.moment_participants mp
        WHERE mp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Merchants can manage their own products"
  ON public.merchant_products FOR ALL
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

CREATE OR REPLACE VIEW public.view_public_commerce_directory
WITH (security_invoker = true) AS
SELECT
  ('merchant_product:' || mp.id::text) AS listing_id,
  mp.id AS source_id,
  'merchant_products'::text AS source_table,
  COALESCE(mp.listing_kind, 'product') AS listing_kind,
  COALESCE(mp.fulfillment_mode, 'pickup') AS fulfillment_mode,
  mp.name,
  mp.description,
  mp.category,
  public.slugify(mp.category) AS category_slug,
  COALESCE(mp.price, mp.price_usd) AS price,
  COALESCE(mp.currency, 'USD') AS currency,
  mp.compare_at_price,
  COALESCE(mp.points_cost, mp.price_points) AS points_cost,
  COALESCE(mp.is_redeemable_with_points, COALESCE(mp.points_cost, mp.price_points) IS NOT NULL) AS is_redeemable_with_points,
  mp.discount_type,
  mp.discount_value,
  COALESCE(mp.inventory_quantity, mp.inventory_count) AS inventory_quantity,
  CASE
    WHEN COALESCE(mp.inventory_policy, 'deny') = 'continue' THEN true
    WHEN mp.inventory_count IS NULL AND mp.inventory_quantity IS NULL THEN true
    ELSE false
  END AS is_unlimited,
  mp.low_stock_threshold,
  COALESCE(mp.image_url, mp.images->>0) AS image_url,
  COALESCE(mp.images, '[]'::jsonb) AS images,
  mp.variants,
  mp.sku,
  mp.merchant_id AS merchant_user_id,
  mp.organization_id,
  COALESCE(o.name, u.display_name, u.username, 'Local merchant') AS merchant_name,
  o.slug AS merchant_slug,
  o.avatar_url AS merchant_logo_url,
  o.website AS merchant_website,
  COALESCE(vp.id, v.id) AS venue_id,
  COALESCE(vp.slug, public.slugify(v.name) || '-' || left(v.id::text, 8)) AS venue_slug,
  COALESCE(vp.name, v.name) AS venue_name,
  COALESCE(vp.venue_type, v.category) AS venue_type,
  COALESCE(vp.address, v.address) AS address,
  COALESCE(vp.city, NULLIF(split_part(v.address, ',', 1), '')) AS city,
  public.slugify(COALESCE(vp.city, NULLIF(split_part(v.address, ',', 1), ''))) AS city_slug,
  vp.country,
  public.slugify(vp.country) AS country_slug,
  COALESCE(vp.location, v.address) AS location,
  mp.linked_moment_id,
  m.slug AS linked_moment_slug,
  m.title AS linked_moment_title,
  COALESCE(mp.visibility, 'public') AS visibility,
  COALESCE(mp.moment_exclusive, false) AS moment_exclusive,
  COALESCE(mp.auto_redeem_on_participation, false) AS auto_redeem_on_participation,
  mp.booking_url,
  mp.service_duration_minutes,
  mp.service_capacity,
  COALESCE(mp.total_sales, 0) AS total_sales,
  COALESCE(mp.total_redemptions, 0) AS total_redemptions,
  mp.expires_at,
  COALESCE(mp.is_active, true) AS is_active,
  mp.created_at,
  mp.updated_at
FROM public.merchant_products mp
LEFT JOIN public.users u
  ON u.id = mp.merchant_id
LEFT JOIN public.organizations o
  ON o.id = mp.organization_id
LEFT JOIN public.venues v
  ON v.id = mp.venue_id
LEFT JOIN public.venue_profiles vp
  ON vp.id = mp.venue_id
LEFT JOIN public.moments m
  ON m.id = mp.linked_moment_id
WHERE COALESCE(mp.is_active, true) = true
  AND (mp.expires_at IS NULL OR mp.expires_at >= now())

UNION ALL

SELECT
  ('organization_product:' || p.id::text) AS listing_id,
  p.id AS source_id,
  'products'::text AS source_table,
  COALESCE(p.type::text, p.metadata->>'listing_kind', 'product') AS listing_kind,
  COALESCE(p.metadata->>'fulfillment_mode', 'online') AS fulfillment_mode,
  p.name,
  p.description,
  COALESCE(p.metadata->>'category', p.type::text) AS category,
  public.slugify(COALESCE(p.metadata->>'category', p.type::text)) AS category_slug,
  p.price,
  COALESCE(p.currency, 'USD') AS currency,
  NULL::numeric AS compare_at_price,
  NULL::integer AS points_cost,
  false AS is_redeemable_with_points,
  NULL::text AS discount_type,
  NULL::numeric AS discount_value,
  NULL::integer AS inventory_quantity,
  true AS is_unlimited,
  NULL::integer AS low_stock_threshold,
  p.image_url,
  CASE
    WHEN p.image_url IS NOT NULL THEN jsonb_build_array(p.image_url)
    ELSE '[]'::jsonb
  END AS images,
  '[]'::jsonb AS variants,
  NULL::text AS sku,
  NULL::uuid AS merchant_user_id,
  p.organization_id,
  COALESCE(o.name, 'Organization') AS merchant_name,
  o.slug AS merchant_slug,
  o.avatar_url AS merchant_logo_url,
  o.website AS merchant_website,
  NULL::uuid AS venue_id,
  NULL::text AS venue_slug,
  NULL::text AS venue_name,
  NULL::text AS venue_type,
  NULL::text AS address,
  NULL::text AS city,
  NULL::text AS city_slug,
  NULL::text AS country,
  NULL::text AS country_slug,
  NULL::text AS location,
  NULL::uuid AS linked_moment_id,
  NULL::text AS linked_moment_slug,
  NULL::text AS linked_moment_title,
  'public'::text AS visibility,
  false AS moment_exclusive,
  false AS auto_redeem_on_participation,
  p.metadata->>'booking_url' AS booking_url,
  CASE
    WHEN (p.metadata->>'service_duration_minutes') ~ '^[0-9]+$' THEN (p.metadata->>'service_duration_minutes')::integer
    ELSE NULL
  END AS service_duration_minutes,
  CASE
    WHEN (p.metadata->>'service_capacity') ~ '^[0-9]+$' THEN (p.metadata->>'service_capacity')::integer
    ELSE NULL
  END AS service_capacity,
  0 AS total_sales,
  0 AS total_redemptions,
  NULL::timestamptz AS expires_at,
  COALESCE(p.status, 'active') = 'active' AS is_active,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.organizations o
  ON o.id = p.organization_id
WHERE COALESCE(p.status, 'active') = 'active';

GRANT SELECT ON public.view_public_commerce_directory TO anon, authenticated;

COMMENT ON VIEW public.view_public_commerce_directory IS 'Public read model for merchant products, services, organization offers, venue-linked listings, and moment-exclusive commerce.';

NOTIFY pgrst, 'reload schema';
