-- ============================================
-- FEATURED MARKETPLACE MIGRATION
-- Tables for featured content and moment placements
-- ============================================

-- Featured placements table
CREATE TABLE IF NOT EXISTS featured_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placement_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL, -- Can reference content, moments, or pools
    entity_type VARCHAR(50) NOT NULL, -- 'content', 'moment', 'promoshare_pool'
    
    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    duration_days INTEGER NOT NULL,
    
    -- Financials
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    
    -- Status: pending_payment, active, completed, cancelled
    status VARCHAR(20) NOT NULL DEFAULT 'pending_payment',
    activated_at TIMESTAMPTZ,
    
    -- Payment tracking
    payment_method VARCHAR(20), -- 'stripe', 'wallet', 'points'
    payment_transaction_id VARCHAR(255), -- Stripe payment intent ID or internal transaction ID
    paid_at TIMESTAMPTZ,
    
    -- Pricing details (JSON for flexibility)
    pricing_details JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_duration CHECK (duration_days > 0),
    CONSTRAINT valid_amount CHECK (total_amount >= 0),
    CONSTRAINT valid_status CHECK (status IN ('pending_payment', 'active', 'completed', 'cancelled'))
);

-- Ensure updated_at exists for existing tables
ALTER TABLE featured_placements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for featured_placements
CREATE INDEX idx_featured_placements_user ON featured_placements(user_id);
CREATE INDEX idx_featured_placements_type ON featured_placements(placement_type);
CREATE INDEX idx_featured_placements_entity ON featured_placements(entity_id, entity_type);
CREATE INDEX idx_featured_placements_status ON featured_placements(status);
CREATE INDEX idx_featured_placements_dates ON featured_placements(start_date, end_date);
CREATE INDEX idx_featured_placements_active ON featured_placements(status, start_date, end_date) 
    WHERE status = 'active';

-- Featured placement analytics table
CREATE TABLE IF NOT EXISTS featured_placement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES featured_placements(id) ON DELETE CASCADE,
    
    -- Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5, 4) GENERATED ALWAYS AS (
        CASE WHEN impressions > 0 THEN clicks::DECIMAL / impressions::DECIMAL ELSE 0 END
    ) STORED,
    
    -- Engagement
    unique_viewers INTEGER DEFAULT 0,
    avg_time_seconds INTEGER DEFAULT 0,
    
    -- Conversion (for CPC placements)
    conversions INTEGER DEFAULT 0,
    conversion_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Updates
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_placement ON featured_placement_analytics(placement_id);

-- Featured placement clicks table (for detailed click tracking)
CREATE TABLE IF NOT EXISTS featured_placement_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES featured_placements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Click metadata
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    
    -- Conversion tracking
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(10, 2)
);

CREATE INDEX idx_clicks_placement ON featured_placement_clicks(placement_id);
CREATE INDEX idx_clicks_user ON featured_placement_clicks(user_id);
CREATE INDEX idx_clicks_time ON featured_placement_clicks(clicked_at);

-- View for active featured placements with entity details
CREATE OR REPLACE VIEW active_featured_placements AS
SELECT 
    fp.*,
    u.username,
    u.display_name,
    u.avatar_url as user_profile_image,
    COALESCE(a.impressions, 0) as total_impressions,
    COALESCE(a.clicks, 0) as total_clicks,
    COALESCE(a.ctr, 0) as click_through_rate
FROM featured_placements fp
LEFT JOIN users u ON fp.user_id = u.id
LEFT JOIN featured_placement_analytics a ON fp.id = a.placement_id
WHERE fp.status = 'active'
    AND fp.start_date <= NOW()
    AND fp.end_date >= NOW()
ORDER BY fp.created_at DESC;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for featured_placements
DROP TRIGGER IF EXISTS update_featured_placements_updated_at ON featured_placements;
CREATE TRIGGER update_featured_placements_updated_at
    BEFORE UPDATE ON featured_placements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check placement availability
DROP FUNCTION IF EXISTS check_placement_availability(VARCHAR, TIMESTAMPTZ, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION check_placement_availability(
    p_placement_type VARCHAR(50),
    p_start_date TIMESTAMPTZ,
    p_duration_days INTEGER,
    p_available_slots INTEGER DEFAULT 3
)
RETURNS TABLE(available BOOLEAN, slots_available INTEGER, total_slots INTEGER) AS $$
DECLARE
    v_end_date TIMESTAMPTZ;
    v_count INTEGER;
BEGIN
    v_end_date := p_start_date + (p_duration_days || ' days')::INTERVAL;
    
    v_count := (
        SELECT COUNT(*)
        FROM featured_placements
        WHERE placement_type = p_placement_type
            AND status IN ('active', 'pending_payment')
            AND start_date < v_end_date
            AND end_date > p_start_date
    );
    
    RETURN QUERY SELECT 
        (v_count < p_available_slots),
        (p_available_slots - v_count),
        p_available_slots;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-complete expired placements
DROP FUNCTION IF EXISTS auto_complete_expired_placements();
CREATE OR REPLACE FUNCTION auto_complete_expired_placements()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE featured_placements
    SET status = 'completed',
        updated_at = NOW()
    WHERE status = 'active'
        AND end_date < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on featured tables
ALTER TABLE featured_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_placement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_placement_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for featured_placements
DROP POLICY IF EXISTS "Users can view their own bookings" ON featured_placements;
CREATE POLICY "Users can view their own bookings"
    ON featured_placements
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON featured_placements;
CREATE POLICY "Users can create their own bookings"
    ON featured_placements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON featured_placements;
CREATE POLICY "Admins can view all bookings"
    ON featured_placements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all bookings" ON featured_placements;
CREATE POLICY "Admins can update all bookings"
    ON featured_placements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for analytics (admin only for updates, public for reads)
DROP POLICY IF EXISTS "Public can view analytics" ON featured_placement_analytics;
CREATE POLICY "Public can view analytics"
    ON featured_placement_analytics
    FOR SELECT
    TO PUBLIC
    USING (true);

DROP POLICY IF EXISTS "Only service role can update analytics" ON featured_placement_analytics;
CREATE POLICY "Only service role can update analytics"
    ON featured_placement_analytics
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'service'
        )
    );

-- Comment on tables
COMMENT ON TABLE featured_placements IS 'Paid featured placements for content, moments, and PromoShare pools';
COMMENT ON TABLE featured_placement_analytics IS 'Aggregated analytics for featured placements';
COMMENT ON TABLE featured_placement_clicks IS 'Individual click records for CPC placements';

-- Grant permissions
GRANT SELECT, INSERT ON featured_placements TO authenticated;
GRANT SELECT ON featured_placement_analytics TO authenticated;
GRANT SELECT, INSERT ON featured_placement_clicks TO authenticated;
