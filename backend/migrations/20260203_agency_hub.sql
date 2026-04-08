-- =============================================
-- MIGRATION: AGENCY & SERVICE PROVIDER HUB
-- DATE: 2026-02-03
-- DESCRIPTION: Support for multi-client agencies, service providers, and proposals.
-- =============================================

-- 1. Product Type Enum & Products Table
DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('physical', 'service', 'digital');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    image_url TEXT,
    type product_type DEFAULT 'physical',
    status TEXT DEFAULT 'active', -- active, draft, archived
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agency-Client Relationships (Multi-tenant support)
CREATE TABLE IF NOT EXISTS agency_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'full_service', -- partial, full_service
    status TEXT DEFAULT 'active', -- active, pending, suspended
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agency_id, client_id)
);

-- 3. Proposals Table (Planner to Brand pitches)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'draft', -- draft, sent, accepted, declined
    target_moment_id UUID, -- References moments(id) after conversion
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_agency_clients_agency ON agency_clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_clients_client ON agency_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_planner ON proposals(planner_id);
CREATE INDEX IF NOT EXISTS idx_proposals_brand ON proposals(brand_id);

-- 5. Updated At Trigger for Proposals
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Updated At Trigger for Products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
