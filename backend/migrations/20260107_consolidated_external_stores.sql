-- Migration: Consolidated External Store Integrations
-- Date: 2026-01-07

-- 1. Create external integrations table
CREATE TABLE IF NOT EXISTS merchant_external_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES merchant_stores(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'shopify', 'woocommerce', etc.
    external_store_url TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    api_key TEXT,
    api_secret TEXT,
    store_hash TEXT, -- Specific to BigCommerce
    scopes TEXT[],
    sync_status VARCHAR(20) DEFAULT 'idle', -- 'idle', 'syncing', 'error'
    last_synced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, platform)
);

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_merchant_external_stores_store ON merchant_external_stores(store_id);

-- 2. Update products table for external mapping
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS external_platform VARCHAR(50),
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS external_metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for external lookups
CREATE INDEX IF NOT EXISTS idx_products_external ON products(external_platform, external_id);

-- 3. Add column to track inventory sync preference
ALTER TABLE merchant_stores
ADD COLUMN IF NOT EXISTS auto_sync_inventory BOOLEAN DEFAULT FALSE;

COMMENT ON TABLE merchant_external_stores IS 'Stores credentials and status for external e-commerce platform integrations';
COMMENT ON COLUMN products.external_platform IS 'The source platform if imported (e.g., shopify)';
COMMENT ON COLUMN products.external_id IS 'Unique ID of the product on the external platform';
COMMENT ON COLUMN merchant_external_stores.api_key IS 'API Key or Client ID for platforms like WooCommerce or BigCommerce';
COMMENT ON COLUMN merchant_external_stores.api_secret IS 'API Secret or Client Secret';
COMMENT ON COLUMN merchant_external_stores.store_hash IS 'Unique store identifier for BigCommerce';
