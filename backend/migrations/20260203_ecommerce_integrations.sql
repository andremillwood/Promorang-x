-- =============================================
-- MIGRATION: E-COMMERCE INTEGRATIONS
-- DATE: 2026-02-03
-- DESCRIPTION: Foundation for Shopify and WooCommerce sync.
-- =============================================

-- 1. External Integrations Table
CREATE TABLE IF NOT EXISTS external_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'shopify', 'woocommerce'
    status TEXT DEFAULT 'inactive', -- active, inactive, error
    credentials JSONB DEFAULT '{}', -- Encrypted access tokens or API keys
    last_sync_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{"auto_sync": true, "sync_images": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, platform)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_org ON external_integrations(organization_id);

-- 3. Trigger for updated_at
CREATE TRIGGER update_external_integrations_updated_at
    BEFORE UPDATE ON external_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
