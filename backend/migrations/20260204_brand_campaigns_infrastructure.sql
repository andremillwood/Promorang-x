-- Phase 27: Brand Campaign Creation & Host Discovery
-- Migration: 20260204_brand_campaigns_infrastructure.sql
-- Description: Creates tables for brand budgets, campaign sponsorships, and host discovery preferences

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brand Budgets Table
-- Tracks budget allocations for brand organizations
CREATE TABLE IF NOT EXISTS brand_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    total_budget DECIMAL(10,2) NOT NULL CHECK (total_budget >= 0),
    allocated_budget DECIMAL(10,2) DEFAULT 0 CHECK (allocated_budget >= 0),
    spent_budget DECIMAL(10,2) DEFAULT 0 CHECK (spent_budget >= 0),
    currency TEXT DEFAULT 'USD',
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT budget_allocation_check CHECK (allocated_budget <= total_budget),
    CONSTRAINT budget_spent_check CHECK (spent_budget <= allocated_budget)
);

-- Campaign-Moment Sponsorships Table
-- Links brand campaigns to specific moments they sponsor
CREATE TABLE IF NOT EXISTS campaign_sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
    sponsorship_amount DECIMAL(10,2) NOT NULL CHECK (sponsorship_amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, moment_id)
);

-- Brand Host Preferences Table
-- Stores brand preferences for host discovery and matching
CREATE TABLE IF NOT EXISTS brand_host_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    preferred_categories TEXT[],
    min_audience_size INTEGER CHECK (min_audience_size >= 0),
    max_cost_per_moment DECIMAL(10,2) CHECK (max_cost_per_moment >= 0),
    geographic_targets TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_budgets_org ON brand_budgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_budgets_status ON brand_budgets(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sponsorships_campaign ON campaign_sponsorships(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sponsorships_moment ON campaign_sponsorships(moment_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sponsorships_status ON campaign_sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_brand_host_preferences_org ON brand_host_preferences(organization_id);

-- Row Level Security (RLS) Policies

-- Brand Budgets RLS
ALTER TABLE brand_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand members can view their budgets"
    ON brand_budgets FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Brand admins can manage budgets"
    ON brand_budgets FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Campaign Sponsorships RLS
ALTER TABLE campaign_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sponsorships"
    ON campaign_sponsorships FOR SELECT
    USING (status = 'active');

CREATE POLICY "Brand members can manage their sponsorships"
    ON campaign_sponsorships FOR ALL
    USING (
        campaign_id IN (
            SELECT c.id 
            FROM campaigns c
            JOIN organizations o ON c.advertiser_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- Brand Host Preferences RLS
ALTER TABLE brand_host_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand members can view their preferences"
    ON brand_host_preferences FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Brand admins can manage preferences"
    ON brand_host_preferences FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brand_budgets_updated_at BEFORE UPDATE ON brand_budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_sponsorships_updated_at BEFORE UPDATE ON campaign_sponsorships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_host_preferences_updated_at BEFORE UPDATE ON brand_host_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE brand_budgets IS 'Tracks budget allocations and spending for brand organizations';
COMMENT ON TABLE campaign_sponsorships IS 'Links brand campaigns to sponsored moments with performance tracking';
COMMENT ON TABLE brand_host_preferences IS 'Stores brand preferences for automated host discovery and matching';
