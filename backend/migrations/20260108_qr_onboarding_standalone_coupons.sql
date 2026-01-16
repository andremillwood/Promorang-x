-- =============================================
-- STANDALONE COUPONS & VENUE QR ONBOARDING SYSTEM
-- Migration: 20260108_qr_onboarding_standalone_coupons.sql
-- =============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENHANCE COUPONS TABLE FOR STANDALONE REDEMPTION
-- =============================================

-- Add redemption type to distinguish marketplace vs standalone coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS redemption_type VARCHAR(20) 
  DEFAULT 'marketplace' CHECK (redemption_type IN ('marketplace', 'standalone', 'hybrid'));

-- Whether merchant must validate before coupon is considered redeemed
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS merchant_validation_required BOOLEAN DEFAULT FALSE;

-- Pre-generated QR code URL for the coupon
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- External redemption URL (for standalone coupons redeemed outside Promorang)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS external_redemption_url TEXT;

-- Instructions for redeeming standalone coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS redemption_instructions TEXT;

-- =============================================
-- COUPON REDEMPTIONS TABLE
-- Tracks when users claim and redeem coupons (especially standalone)
-- =============================================

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique claim code for this user's instance of the coupon
  claim_code VARCHAR(50) UNIQUE,
  claim_qr_url TEXT,
  
  -- Timestamps
  claimed_at TIMESTAMP DEFAULT NOW(),
  redeemed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Validation tracking
  validation_method VARCHAR(20) CHECK (validation_method IN ('qr_scan', 'code_entry', 'auto', 'external')),
  validated_by_user_id UUID REFERENCES users(id),
  validation_location TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'claimed' CHECK (status IN ('claimed', 'redeemed', 'expired', 'cancelled')),
  
  -- Additional data
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure status exists if table was created previously without it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_redemptions' AND column_name = 'status') THEN
        ALTER TABLE coupon_redemptions ADD COLUMN status VARCHAR(20) DEFAULT 'claimed' CHECK (status IN ('claimed', 'redeemed', 'expired', 'cancelled'));
    END IF;
END $$;

-- Indexes for coupon_redemptions
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_claim_code ON coupon_redemptions(claim_code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_status ON coupon_redemptions(status);

-- =============================================
-- VENUE QR CODES TABLE
-- QR codes for IRL onboarding at venues/events
-- =============================================

CREATE TABLE IF NOT EXISTS venue_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Owner information
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('merchant', 'event_creator', 'advertiser', 'creator', 'store')),
  
  -- Venue details
  venue_name VARCHAR(255) NOT NULL,
  venue_type VARCHAR(50), -- 'store', 'event', 'booth', 'restaurant', 'popup', etc.
  venue_address TEXT,
  
  -- Referral attribution
  referral_code VARCHAR(50) NOT NULL,
  
  -- Landing page customization
  landing_page_url TEXT,
  custom_message TEXT,
  custom_logo_url TEXT,
  call_to_action VARCHAR(255) DEFAULT 'Join Promorang & earn rewards!',
  primary_color VARCHAR(7) DEFAULT '#8B5CF6',
  
  -- Generated assets
  qr_image_url TEXT,
  printable_pdf_url TEXT,
  
  -- Analytics
  total_scans INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for venue_qr_codes
CREATE INDEX IF NOT EXISTS idx_venue_qr_codes_owner_id ON venue_qr_codes(owner_id);
CREATE INDEX IF NOT EXISTS idx_venue_qr_codes_referral_code ON venue_qr_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_venue_qr_codes_is_active ON venue_qr_codes(is_active);

-- =============================================
-- VENUE QR SCANS TABLE
-- Track individual scans for analytics
-- =============================================

CREATE TABLE IF NOT EXISTS venue_qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_qr_id UUID REFERENCES venue_qr_codes(id) ON DELETE CASCADE,
  
  -- Scan info
  scanned_at TIMESTAMP DEFAULT NOW(),
  
  -- Conversion tracking
  resulted_in_signup BOOLEAN DEFAULT FALSE,
  signup_user_id UUID REFERENCES users(id),
  signup_completed_at TIMESTAMP,
  
  -- Privacy-safe tracking
  ip_hash VARCHAR(64),
  user_agent TEXT,
  device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
  
  -- Location (optional, if user consents)
  scan_location JSONB
);

-- Indexes for venue_qr_scans
CREATE INDEX IF NOT EXISTS idx_venue_qr_scans_venue_qr_id ON venue_qr_scans(venue_qr_id);
CREATE INDEX IF NOT EXISTS idx_venue_qr_scans_scanned_at ON venue_qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_venue_qr_scans_resulted_in_signup ON venue_qr_scans(resulted_in_signup);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_qr_scans ENABLE ROW LEVEL SECURITY;

-- Coupon redemptions: users can see their own
CREATE POLICY coupon_redemptions_user_read ON coupon_redemptions 
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE mocha_user_id = auth.uid()::text));

-- Coupon redemptions: merchants can read redemptions for their coupons
CREATE POLICY coupon_redemptions_merchant_read ON coupon_redemptions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coupons c
      JOIN merchant_stores ms ON c.store_id = ms.id
      WHERE c.id = coupon_redemptions.coupon_id
      AND ms.user_id = (SELECT id FROM users WHERE mocha_user_id = auth.uid()::text)
    )
  );

-- Venue QR codes: owners can manage their own
CREATE POLICY venue_qr_codes_owner_all ON venue_qr_codes 
  FOR ALL USING (owner_id = (SELECT id FROM users WHERE mocha_user_id = auth.uid()::text));

-- Venue QR scans: venue owners can read scans
CREATE POLICY venue_qr_scans_owner_read ON venue_qr_scans 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venue_qr_codes vqc 
      WHERE vqc.id = venue_qr_scans.venue_qr_id 
      AND vqc.owner_id = (SELECT id FROM users WHERE mocha_user_id = auth.uid()::text)
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger for coupon_redemptions
CREATE TRIGGER update_coupon_redemptions_updated_at 
  BEFORE UPDATE ON coupon_redemptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for venue_qr_codes
CREATE TRIGGER update_venue_qr_codes_updated_at 
  BEFORE UPDATE ON venue_qr_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS
-- =============================================
-- Migration complete: Standalone coupons and venue QR onboarding system ready
