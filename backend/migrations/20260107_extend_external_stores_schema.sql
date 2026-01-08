-- Migration: support additional connection fields for multi-platform
-- Date: 2026-01-07

ALTER TABLE merchant_external_stores
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS api_secret TEXT,
ADD COLUMN IF NOT EXISTS store_hash TEXT; -- Specific to BigCommerce

COMMENT ON COLUMN merchant_external_stores.api_key IS 'API Key or Client ID for platforms like WooCommerce or BigCommerce';
COMMENT ON COLUMN merchant_external_stores.api_secret IS 'API Secret or Client Secret';
COMMENT ON COLUMN merchant_external_stores.store_hash IS 'Unique store identifier for BigCommerce';
