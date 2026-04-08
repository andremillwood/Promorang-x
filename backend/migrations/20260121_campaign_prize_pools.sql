-- Migration: Add Prize Pool columns to Campaigns
-- Date: 2026-01-21

-- Add columns for campaign-specific prize pools
ALTER TABLE advertiser_campaigns 
ADD COLUMN IF NOT EXISTS prize_pool_gems DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_pool_active BOOLEAN DEFAULT FALSE;

-- Create a table to track campaign-specific draw history if needed
CREATE TABLE IF NOT EXISTS campaign_draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES advertiser_campaigns(id),
    draw_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    winner_id UUID REFERENCES users(id),
    prize_amount DECIMAL NOT NULL,
    metadata JSONB DEFAULT '{}'
);

COMMENT ON COLUMN advertiser_campaigns.prize_pool_gems IS 'Accumulated Gems for campaign-specific PromoShare draws';
COMMENT ON COLUMN advertiser_campaigns.is_pool_active IS 'Enables localized draws for this campaign (typically at Funded maturity)';

-- Support function for atomic increments
CREATE OR REPLACE FUNCTION contribute_to_campaign_pool(p_campaign_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE advertiser_campaigns 
    SET prize_pool_gems = COALESCE(prize_pool_gems, 0) + p_amount
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
