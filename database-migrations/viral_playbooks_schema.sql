-- Comprehensive Multi-Platform Viral Mechanics SQL Schema

-- 1. Pinduoduo: Slash-It Social Deals
CREATE TABLE IF NOT EXISTS deal_slashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL,
  user_id UUID NOT NULL,
  target_discount_pct NUMERIC(5,2) DEFAULT 50.00,
  current_discount_pct NUMERIC(5,2) DEFAULT 20.00,
  slashes_needed INT DEFAULT 5,
  slashes_completed INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours'
);

CREATE TABLE IF NOT EXISTS deal_slash_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slash_id UUID REFERENCES deal_slashes(id) ON DELETE CASCADE,
  helper_user_id UUID NOT NULL,
  slashed_amount NUMERIC(5,2) DEFAULT 5.00,
  slashed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pokémon GO: Geofenced Flash Raids & Lures
CREATE TABLE IF NOT EXISTS flash_raids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  radius_meters INT DEFAULT 200,
  reward_multiplier NUMERIC(3,2) DEFAULT 2.50,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_spots INT DEFAULT 50,
  claimed_spots INT DEFAULT 0
);

-- 3. Duolingo: Exploration Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak_days INT DEFAULT 0,
  longest_streak_days INT DEFAULT 0,
  last_activity_date DATE,
  streak_freezes_available INT DEFAULT 1,
  total_multiplier NUMERIC(3,2) DEFAULT 1.00
);

-- 4. SnackPass: Friend-to-Friend Drop Gifting
CREATE TABLE IF NOT EXISTS drop_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID NOT NULL,
  recipient_user_id UUID NOT NULL,
  coupon_id UUID NOT NULL,
  gift_message TEXT,
  status VARCHAR(20) DEFAULT 'unclaimed', -- 'unclaimed', 'claimed', 'expired'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Airbnb: SuperMerchant Trust Badges
CREATE TABLE IF NOT EXISTS merchant_trust_ratings (
  merchant_id UUID PRIMARY KEY,
  is_super_merchant BOOLEAN DEFAULT FALSE,
  trust_score NUMERIC(3,2) DEFAULT 4.90,
  total_verified_redemptions INT DEFAULT 0,
  response_rate_pct NUMERIC(5,2) DEFAULT 99.00
);
