-- Promorang Community Drops & Collective Tipping Mechanics SQL Schema & Database Expansion

-- 1. Create enum for deal tipping status
CREATE TYPE tipping_status AS ENUM ('pending', 'tipped', 'expired', 'sold_out');

-- 2. Add collective tipping fields to existing coupons/deals table
ALTER TABLE IF EXISTS coupons
  ADD COLUMN IF NOT EXISTS tipping_threshold INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_claims INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tipping_status tipping_status DEFAULT 'tipped',
  ADD COLUMN IF NOT EXISTS tipping_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS squad_min_size INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS squad_bonus_discount_pct NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS merchant_commission_rate NUMERIC(5,2) DEFAULT 10.00, -- e.g. 10% platform fee
  ADD COLUMN IF NOT EXISTS off_peak_hours JSONB DEFAULT '[]'::jsonb; -- e.g. [{"day": 2, "start": "14:00", "end": "17:00", "multiplier": 1.5}]

-- 3. Create table for Deal Squads (Viral Group Unlocks)
CREATE TABLE IF NOT EXISTS deal_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  leader_user_id UUID NOT NULL,
  squad_code VARCHAR(16) UNIQUE NOT NULL,
  min_required INT DEFAULT 3,
  current_members_count INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- 4. Create table for Squad Members
CREATE TABLE IF NOT EXISTS deal_squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES deal_squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- 5. Function to update tipping status automatically
CREATE OR REPLACE FUNCTION check_deal_tipping_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_claims >= NEW.tipping_threshold AND NEW.tipping_status = 'pending' THEN
    NEW.tipping_status := 'tipped';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_tipping ON coupons;
CREATE TRIGGER trigger_check_tipping
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION check_deal_tipping_status();
