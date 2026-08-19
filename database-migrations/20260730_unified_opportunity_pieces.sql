-- =============================================
-- PROMORANG UNIFIED OPPORTUNITY ENGINE MIGRATION
-- Integrates Pieces, Predictions, Moments, Campaigns, and Discoveries
-- =============================================

-- Add opportunity fields to drops (transitioning to opportunities)
ALTER TABLE drops 
  ADD COLUMN IF NOT EXISTS opportunity_type VARCHAR(30) DEFAULT 'campaign' CHECK (opportunity_type IN ('moment', 'campaign', 'discovery')),
  ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS promo_key_required INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_pieces INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS piece_price DECIMAL(10,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS backer_dividend_percent DECIMAL(5,2) DEFAULT 20.00,
  ADD COLUMN IF NOT EXISTS prediction_volume_points INTEGER DEFAULT 0;

-- Link content_pieces to opportunities (drops)
ALTER TABLE content_pieces
  ADD COLUMN IF NOT EXISTS opportunity_id BIGINT REFERENCES drops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS dividend_yield_percent DECIMAL(5,2) DEFAULT 15.00,
  ADD COLUMN IF NOT EXISTS total_checkins_milestone INTEGER DEFAULT 100;

-- Link social_forecasts to opportunities
ALTER TABLE social_forecasts
  ADD COLUMN IF NOT EXISTS opportunity_id BIGINT REFERENCES drops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS forecast_metric VARCHAR(50) DEFAULT 'checkins' CHECK (forecast_metric IN ('checkins', 'submissions', 'sales', 'views'));

-- Create opportunity check-ins table for GPS/QR verification
CREATE TABLE IF NOT EXISTS opportunity_checkins (
    id BIGSERIAL PRIMARY KEY,
    opportunity_id BIGINT REFERENCES drops(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    checkin_type VARCHAR(20) DEFAULT 'qr' CHECK (checkin_type IN ('qr', 'gps', 'receipt', 'photo')),
    proof_url TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    points_awarded INTEGER DEFAULT 0,
    keys_awarded INTEGER DEFAULT 0,
    checked_in_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup by opportunity and user
CREATE INDEX IF NOT EXISTS idx_checkins_opp_user ON opportunity_checkins(opportunity_id, user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created ON opportunity_checkins(checked_in_at);
