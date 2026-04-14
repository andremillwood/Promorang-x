-- Migration: E-commerce & POS Integration tables
-- Stores OAuth connections and synced product data for Shopify, Square, and WooCommerce

-- 1. Merchant Integrations table
CREATE TABLE IF NOT EXISTS public.merchant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('shopify', 'square', 'woocommerce')),
  -- Connection state
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  -- OAuth tokens (encrypted at rest by Supabase)
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  -- Provider-specific identifiers
  external_store_id text,       -- Shopify shop domain, Square merchant ID, WooCommerce site URL
  external_store_name text,
  -- WooCommerce uses API keys instead of OAuth
  api_key text,
  api_secret text,
  -- Sync status
  last_synced_at timestamptz,
  sync_status text DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  sync_error text,
  products_synced integer DEFAULT 0,
  -- Metadata
  scopes text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- One connection per provider per user
  UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX idx_merchant_integrations_user ON merchant_integrations(user_id);
CREATE INDEX idx_merchant_integrations_provider ON merchant_integrations(provider);
CREATE INDEX idx_merchant_integrations_status ON merchant_integrations(status);

-- RLS
ALTER TABLE merchant_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON merchant_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations"
  ON merchant_integrations FOR ALL
  USING (auth.uid() = user_id);

-- 2. Synced Products table
CREATE TABLE IF NOT EXISTS public.synced_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES merchant_integrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- External product data
  external_product_id text NOT NULL,
  external_variant_id text,
  title text NOT NULL,
  description text,
  image_url text,
  price decimal(10,2),
  currency text DEFAULT 'USD',
  sku text,
  inventory_quantity integer,
  is_available boolean DEFAULT true,
  -- Link to Promorang product (if imported)
  merchant_product_id uuid REFERENCES merchant_products(id) ON DELETE SET NULL,
  -- Sync metadata
  external_updated_at timestamptz,
  last_synced_at timestamptz DEFAULT now(),
  sync_action text DEFAULT 'imported' CHECK (sync_action IN ('imported', 'updated', 'removed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- One entry per external product per integration
  UNIQUE(integration_id, external_product_id)
);

-- Indexes
CREATE INDEX idx_synced_products_integration ON synced_products(integration_id);
CREATE INDEX idx_synced_products_user ON synced_products(user_id);
CREATE INDEX idx_synced_products_merchant_product ON synced_products(merchant_product_id);

-- RLS
ALTER TABLE synced_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own synced products"
  ON synced_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own synced products"
  ON synced_products FOR ALL
  USING (auth.uid() = user_id);

-- 3. Updated_at trigger
CREATE TRIGGER update_merchant_integrations_updated_at
  BEFORE UPDATE ON merchant_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synced_products_updated_at
  BEFORE UPDATE ON synced_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RPC to upsert integration (SECURITY DEFINER for server-side token storage)
CREATE OR REPLACE FUNCTION public.upsert_merchant_integration(
  p_user_id uuid,
  p_provider text,
  p_status text,
  p_access_token text DEFAULT NULL,
  p_refresh_token text DEFAULT NULL,
  p_token_expires_at timestamptz DEFAULT NULL,
  p_external_store_id text DEFAULT NULL,
  p_external_store_name text DEFAULT NULL,
  p_api_key text DEFAULT NULL,
  p_api_secret text DEFAULT NULL,
  p_scopes text[] DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  INSERT INTO merchant_integrations (
    user_id, provider, status, access_token, refresh_token,
    token_expires_at, external_store_id, external_store_name,
    api_key, api_secret, scopes
  ) VALUES (
    p_user_id, p_provider, p_status, p_access_token, p_refresh_token,
    p_token_expires_at, p_external_store_id, p_external_store_name,
    p_api_key, p_api_secret, p_scopes
  )
  ON CONFLICT (user_id, provider) DO UPDATE SET
    status = EXCLUDED.status,
    access_token = COALESCE(EXCLUDED.access_token, merchant_integrations.access_token),
    refresh_token = COALESCE(EXCLUDED.refresh_token, merchant_integrations.refresh_token),
    token_expires_at = COALESCE(EXCLUDED.token_expires_at, merchant_integrations.token_expires_at),
    external_store_id = COALESCE(EXCLUDED.external_store_id, merchant_integrations.external_store_id),
    external_store_name = COALESCE(EXCLUDED.external_store_name, merchant_integrations.external_store_name),
    api_key = COALESCE(EXCLUDED.api_key, merchant_integrations.api_key),
    api_secret = COALESCE(EXCLUDED.api_secret, merchant_integrations.api_secret),
    scopes = COALESCE(EXCLUDED.scopes, merchant_integrations.scopes),
    updated_at = now()
  RETURNING row_to_json(merchant_integrations.*) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_merchant_integration TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_merchant_integration TO service_role;
