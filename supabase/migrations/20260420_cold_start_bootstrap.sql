-- Cold Start Bootstrap System
-- Timestamp: 2026-04-20
-- 
-- Comprehensive system for platform cold start including:
-- 1. Monthly sampling provisions with rollover
-- 2. Host/operator tools for Promorang-as-host
-- 3. Representative/Ambassador system
-- 4. Founding Member mechanics
-- 5. B2B venue import and fast-track onboarding

-- =============================================================================
-- PART 1: MONTHLY SAMPLING PROVISIONS (Replaces one-time limit)
-- =============================================================================

-- Track monthly usage and rollover
CREATE TABLE IF NOT EXISTS public.merchant_sampling_allowance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Monthly tracking
  month_year TEXT NOT NULL, -- Format: "2026-04"
  
  -- Allowance configuration
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'pro')),
  base_allowance INTEGER NOT NULL DEFAULT 1,
  rollover_from_previous INTEGER NOT NULL DEFAULT 0,
  bonus_allowance INTEGER NOT NULL DEFAULT 0, -- For referrals, founding status, etc.
  
  -- Usage tracking
  used_this_month INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Calculated totals
  total_available INTEGER GENERATED ALWAYS AS (base_allowance + rollover_from_previous + bonus_allowance) STORED,
  remaining INTEGER GENERATED ALWAYS AS (base_allowance + rollover_from_previous + bonus_allowance - used_this_month) STORED,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (advertiser_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_sampling_allowance_advertiser 
  ON public.merchant_sampling_allowance(advertiser_id, month_year);

-- Allowance history for analytics
CREATE TABLE IF NOT EXISTS public.merchant_sampling_allowance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allowance_id UUID NOT NULL REFERENCES public.merchant_sampling_allowance(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'used', 'rollover', 'bonus_added', 'expired')),
  activations_count INTEGER,
  previous_remaining INTEGER,
  new_remaining INTEGER,
  reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PART 2: HOST/OPERATOR TOOLS (Promorang-as-Host)
-- =============================================================================

-- Host operations log
CREATE TABLE IF NOT EXISTS public.host_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  operator_id UUID NOT NULL REFERENCES public.users(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'bulk_merchant_create',
    'fast_track_sampling',
    'co_branded_activation',
    'venue_import',
    'territory_assign',
    'manual_graduation',
    'tier_upgrade'
  )),
  
  target_merchant_id UUID REFERENCES public.users(id),
  territory TEXT,
  
  operation_data JSONB NOT NULL DEFAULT '{}',
  result_summary JSONB,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'rolled_back')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_host_operations_operator 
  ON public.host_operations(operator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_host_operations_type 
  ON public.host_operations(operation_type, status);

-- Co-branded activations (Promorang + Venue partnerships)
CREATE TABLE IF NOT EXISTS public.co_branded_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Partners
  merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.users(id), -- Promorang operator
  
  -- Partnership terms
  merchant_value_contribution NUMERIC(14,2) NOT NULL,
  host_value_contribution NUMERIC(14,2) NOT NULL,
  total_value_pool NUMERIC(14,2) GENERATED ALWAYS AS (merchant_value_contribution + host_value_contribution) STORED,
  
  -- Revenue share
  merchant_revenue_share_pct INTEGER NOT NULL DEFAULT 70, -- Merchant gets 70%
  host_revenue_share_pct INTEGER NOT NULL DEFAULT 30,    -- Promorang gets 30%
  
  -- Activation reference
  sampling_activation_id UUID REFERENCES public.sampling_activations(id),
  
  -- Partnership metadata
  partnership_type TEXT NOT NULL DEFAULT 'standard' CHECK (partnership_type IN (
    'standard', 'featured', 'exclusive', 'pilot', 'founding'
  )),
  
  -- Marketing assets
  co_branded_assets JSONB, -- URLs to shared graphics, copy, etc.
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PART 3: REPRESENTATIVE/AMBASSADOR SYSTEM
-- =============================================================================

-- Representatives (niche/territory ambassadors)
CREATE TABLE IF NOT EXISTS public.representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Assignment
  niche TEXT NOT NULL, -- e.g., "coffee_shops", "fitness_studios", "nightlife"
  territory TEXT NOT NULL, -- e.g., "brooklyn", "manhattan", "la_downtown"
  territory_geojson JSONB, -- Geographic boundaries
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  
  -- Performance tracking
  venues_onboarded INTEGER NOT NULL DEFAULT 0,
  activations_launched INTEGER NOT NULL DEFAULT 0,
  total_redemptions_generated INTEGER NOT NULL DEFAULT 0,
  commission_earned_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  -- Commission structure
  commission_rate_new_venue NUMERIC(5,4) NOT NULL DEFAULT 0.10, -- 10% of first activation
  commission_rate_recurring NUMERIC(5,4) NOT NULL DEFAULT 0.02, -- 2% of ongoing
  
  -- Contract
  started_at TIMESTAMPTZ,
  contract_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Representative applications
CREATE TABLE IF NOT EXISTS public.representative_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  applicant_id UUID NOT NULL REFERENCES public.users(id),
  niche TEXT NOT NULL,
  territory TEXT NOT NULL,
  
  -- Application data
  experience_description TEXT,
  network_size_estimate INTEGER,
  marketing_plan TEXT,
  
  -- Review
  reviewed_by UUID REFERENCES public.users(id),
  review_notes TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Representative commission payouts
CREATE TABLE IF NOT EXISTS public.representative_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  representative_id UUID NOT NULL REFERENCES public.representatives(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Commission details
  commission_type TEXT NOT NULL CHECK (commission_type IN ('new_venue', 'recurring', 'bonus')),
  base_amount NUMERIC(14,2) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL,
  commission_amount NUMERIC(14,2) GENERATED ALWAYS AS (base_amount * commission_rate) STORED,
  
  -- Related activation
  activation_id UUID REFERENCES public.sampling_activations(id),
  
  -- Payout status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Territory assignment history
CREATE TABLE IF NOT EXISTS public.territory_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  representative_id UUID NOT NULL REFERENCES public.representatives(id),
  territory TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  
  ended_at TIMESTAMPTZ,
  ended_reason TEXT,
  
  UNIQUE (representative_id, territory, assigned_at)
);

CREATE INDEX IF NOT EXISTS idx_representatives_territory 
  ON public.representatives(territory, status);
CREATE INDEX IF NOT EXISTS idx_representatives_niche 
  ON public.representatives(niche, status);

-- =============================================================================
-- PART 4: FOUNDING MEMBER MECHANICS
-- =============================================================================

-- Founding members (early adopters with permanent perks)
CREATE TABLE IF NOT EXISTS public.founding_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Founding status
  member_type TEXT NOT NULL CHECK (member_type IN ('user', 'merchant', 'investor', 'representative')),
  wave INTEGER NOT NULL DEFAULT 1, -- Founding wave (1 = first 100, 2 = next 500, etc.)
  
  -- Badges and perks
  badge_nft_token_id TEXT, -- If we mint NFT badges
  badge_display_name TEXT NOT NULL,
  
  -- Permanent perks (JSON array of perk codes)
  perks JSONB NOT NULL DEFAULT '[]',
  
  -- Unlock progress
  unlocks_achieved JSONB NOT NULL DEFAULT '[]',
  unlocks_available JSONB NOT NULL DEFAULT '[]',
  
  -- Engagement tracking
  referral_count INTEGER NOT NULL DEFAULT 0,
  referral_rewards_earned NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated')),
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Founding member unlocks (progressive feature unlocking)
CREATE TABLE IF NOT EXISTS public.founding_member_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  unlock_code TEXT NOT NULL UNIQUE,
  unlock_name TEXT NOT NULL,
  description TEXT,
  
  -- Requirements
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'participation_count',
    'redemption_count',
    'referral_count',
    'merchant_activation_count',
    'time_since_joining',
    'community_engagement_score'
  )),
  requirement_threshold INTEGER NOT NULL,
  
  -- Reward
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'feature_access',
    'fee_reduction',
    'bonus_allowance',
    'commission_boost',
    'exclusive_badge',
    'priority_support'
  )),
  reward_value JSONB NOT NULL,
  
  -- Availability
  founding_waves_eligible INTEGER[] DEFAULT '{1,2,3}', -- Which waves can unlock
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed founding member unlocks
INSERT INTO public.founding_member_unlocks (unlock_code, unlock_name, description, requirement_type, requirement_threshold, reward_type, reward_value)
VALUES 
  ('early_adopter', 'Early Adopter', 'Join within first 100 members', 'time_since_joining', 1, 'exclusive_badge', '{"badge": "Founding Member", "perks": ["reduced_fees_5pct", "priority_support"]}'),
  ('engagement_10', 'Active Participant', '10 participations in sampling activations', 'participation_count', 10, 'feature_access', '{"feature": "advanced_analytics_preview", "duration": "permanent"}'),
  ('engagement_25', 'Power User', '25 verified participations', 'participation_count', 25, 'feature_access', '{"feature": "beta_features_access", "duration": "permanent"}'),
  ('redemption_master', 'Redemption Master', '25 successful redemptions', 'redemption_count', 25, 'fee_reduction', '{"reduction_pct": 10, "applies_to": "all_transactions"}'),
  ('community_builder', 'Community Builder', 'Refer 5 users who become founding members', 'referral_count', 5, 'commission_boost', '{"boost_pct": 50, "applies_to": "referral_commissions"}'),
  ('merchant_pioneer', 'Merchant Pioneer', 'Launch 3 successful sampling activations', 'merchant_activation_count', 3, 'bonus_allowance', '{"bonus_activations": 2, "rollover": true}')
ON CONFLICT (unlock_code) DO NOTHING;

-- Founding member referral tracking
CREATE TABLE IF NOT EXISTS public.founding_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  referrer_id UUID NOT NULL REFERENCES public.founding_members(id),
  referred_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Referral details
  referral_code_used TEXT,
  referral_source TEXT,
  
  -- Reward tracking
  reward_status TEXT NOT NULL DEFAULT 'pending' CHECK (reward_status IN ('pending', 'awarded', 'expired')),
  reward_amount NUMERIC(14,2),
  awarded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_founding_members_type 
  ON public.founding_members(member_type, wave);
CREATE INDEX IF NOT EXISTS idx_founding_referrals_referrer 
  ON public.founding_referrals(referrer_id, reward_status);

-- =============================================================================
-- PART 5: B2B VENUE IMPORT & FAST-TRACK
-- =============================================================================

-- Bulk venue imports (for Promorang operators)
CREATE TABLE IF NOT EXISTS public.venue_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  operator_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Import metadata
  import_source TEXT NOT NULL CHECK (import_source IN (
    'csv_upload',
    'api_import',
    'scraping',
    'manual_entry',
    'partner_api'
  )),
  source_file_name TEXT,
  
  -- Stats
  total_records INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  
  -- Configuration
  import_config JSONB NOT NULL DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  error_log JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Individual venue import records
CREATE TABLE IF NOT EXISTS public.venue_import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  batch_id UUID NOT NULL REFERENCES public.venue_import_batches(id) ON DELETE CASCADE,
  
  -- Source data (pre-populated)
  source_data JSONB NOT NULL,
  
  -- Extracted fields
  venue_name TEXT,
  venue_address TEXT,
  venue_phone TEXT,
  venue_website TEXT,
  venue_category TEXT,
  venue_social_profiles JSONB,
  
  -- Processing results
  user_id UUID REFERENCES public.users(id), -- Created user ID
  profile_id UUID, -- Created advertiser profile ID
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'validating',
    'creating_user',
    'creating_profile',
    'fast_tracking',
    'completed',
    'failed',
    'skipped_duplicate'
  )),
  
  validation_errors JSONB,
  processing_log JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Fast-tracked venues (skip sampling limits)
CREATE TABLE IF NOT EXISTS public.fast_track_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  merchant_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Fast-track details
  fast_track_type TEXT NOT NULL DEFAULT 'partnership' CHECK (fast_track_type IN (
    'partnership',
    'pilot_program',
    'founding_partner',
    'operator_initiated',
    'bulk_import'
  )),
  
  -- Bypassed limits
  bypass_sampling_limit BOOLEAN NOT NULL DEFAULT FALSE,
  bypass_duration_limit BOOLEAN NOT NULL DEFAULT FALSE,
  bypass_value_limit BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Enhanced provisions
  bonus_monthly_activations INTEGER NOT NULL DEFAULT 0,
  bonus_duration_days INTEGER NOT NULL DEFAULT 0,
  bonus_value_pool NUMERIC(14,2) DEFAULT 0,
  
  -- Approval
  approved_by UUID NOT NULL REFERENCES public.users(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Notes
  partnership_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populated venue profiles (before merchant claims)
CREATE TABLE IF NOT EXISTS public.pre_populated_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Public data sources
  venue_name TEXT NOT NULL,
  venue_slug TEXT UNIQUE,
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  
  -- Enrichment data
  phone TEXT,
  website TEXT,
  email TEXT,
  
  -- Social profiles (scraped)
  social_profiles JSONB,
  
  -- Categories/tags
  categories TEXT[],
  tags TEXT[],
  
  -- Media
  photos JSONB,
  logo_url TEXT,
  
  -- Status
  data_source TEXT, -- Where we got this data
  enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriching', 'completed', 'failed')),
  
  -- Claim tracking
  claimed_by UUID REFERENCES public.users(id),
  claimed_at TIMESTAMPTZ,
  claim_token TEXT UNIQUE, -- Token for claiming via email
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_import_batches_operator 
  ON public.venue_import_batches(operator_id, status);
CREATE INDEX IF NOT EXISTS idx_venue_import_records_batch 
  ON public.venue_import_records(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_fast_track_venues_merchant 
  ON public.fast_track_venues(merchant_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_pre_populated_venues_claim 
  ON public.pre_populated_venues(claimed_by, claim_token) WHERE claimed_by IS NULL;

-- =============================================================================
-- PART 6: REFERRAL LOOPS & CROSS-SIDE INCENTIVES
-- =============================================================================

-- Referral codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Code type determines reward structure
  code_type TEXT NOT NULL DEFAULT 'general' CHECK (code_type IN (
    'general',
    'merchant_invites_merchant',
    'user_invites_venue',
    'representative_recruits',
    'founding_member_boost'
  )),
  
  -- Reward configuration
  reward_for_referrer JSONB,
  reward_for_referee JSONB,
  
  -- Limits
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referrer_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Who was referred
  referred_user_id UUID REFERENCES public.users(id),
  referred_merchant_id UUID REFERENCES public.users(id), -- If referred a venue
  
  -- Action taken
  action_type TEXT NOT NULL CHECK (action_type IN (
    'signup',
    'first_activation',
    'first_purchase',
    'graduation',
    'paid_upgrade'
  )),
  
  -- Reward status
  reward_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  reward_amount NUMERIC(14,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- Cross-side unlocks (community-driven feature unlocking)
CREATE TABLE IF NOT EXISTS public.cross_side_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  unlock_code TEXT NOT NULL UNIQUE,
  unlock_name TEXT NOT NULL,
  description TEXT,
  
  -- What needs to happen to unlock
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'total_users',
    'total_merchants',
    'total_activations',
    'total_redemptions',
    'geographic_coverage',
    'niche_diversity'
  )),
  trigger_threshold INTEGER NOT NULL,
  
  -- What gets unlocked
  feature_unlocked TEXT,
  benefit_description TEXT,
  
  -- Status
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  unlocked_by_data JSONB, -- Snapshot of what triggered it
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial cross-side unlocks
INSERT INTO public.cross_side_unlocks (unlock_code, unlock_name, description, trigger_type, trigger_threshold, feature_unlocked, benefit_description)
VALUES 
  ('first_10_venues', 'First 10 Venues', '10 unique venues onboarded', 'total_merchants', 10, 'advanced_analytics', 'Analytics dashboard unlocked for all merchants'),
  ('first_100_users', 'First 100 Users', '100 unique users engaged', 'total_users', 100, 'social_features', 'Social features unlocked (following, feeds)'),
  ('first_500_redemptions', 'First 500 Redemptions', '500 total redemptions completed', 'total_redemptions', 500, 'market_maker', 'Market maker features activated'),
  ('3_niches_active', 'Niche Diversity', 'Active venues in 3+ different categories', 'niche_diversity', 3, 'cross_niche_targeting', 'Cross-niche targeting available'),
  ('multi_borough', 'Geographic Expansion', 'Active venues in 2+ boroughs/areas', 'geographic_coverage', 2, 'geo_targeting', 'Geographic targeting tools unlocked')
ON CONFLICT (unlock_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_referral_codes_owner 
  ON public.referral_codes(owner_id, code_type);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer 
  ON public.referral_tracking(referrer_id, reward_paid);

-- =============================================================================
-- PART 7: TRIGGERS FOR UPDATED_AT
-- =============================================================================

DO $$
BEGIN
  -- Allowance history trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_sampling_allowance_touch'
  ) THEN
    CREATE TRIGGER trg_sampling_allowance_touch
      BEFORE UPDATE ON public.merchant_sampling_allowance
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_representatives_touch'
  ) THEN
    CREATE TRIGGER trg_representatives_touch
      BEFORE UPDATE ON public.representatives
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_founding_members_touch'
  ) THEN
    CREATE TRIGGER trg_founding_members_touch
      BEFORE UPDATE ON public.founding_members
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_fast_track_venues_touch'
  ) THEN
    CREATE TRIGGER trg_fast_track_venues_touch
      BEFORE UPDATE ON public.fast_track_venues
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_pre_populated_venues_touch'
  ) THEN
    CREATE TRIGGER trg_pre_populated_venues_touch
      BEFORE UPDATE ON public.pre_populated_venues
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_co_branded_activations_touch'
  ) THEN
    CREATE TRIGGER trg_co_branded_activations_touch
      BEFORE UPDATE ON public.co_branded_activations
      FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

-- =============================================================================
-- PART 8: VIEWS FOR ANALYTICS
-- =============================================================================

-- Representative performance view
CREATE OR REPLACE VIEW public.representative_performance AS
SELECT 
  r.id,
  r.user_id,
  r.niche,
  r.territory,
  r.status,
  r.venues_onboarded,
  r.activations_launched,
  r.total_redemptions_generated,
  r.commission_earned_total,
  
  -- Calculated metrics
  CASE WHEN r.venues_onboarded > 0 
    THEN ROUND(r.activations_launched::NUMERIC / r.venues_onboarded, 2)
    ELSE 0 
  END AS activations_per_venue,
  
  CASE WHEN r.activations_launched > 0 
    THEN ROUND(r.total_redemptions_generated::NUMERIC / r.activations_launched, 2)
    ELSE 0 
  END AS avg_redemptions_per_activation,
  
  -- Recent activity (last 30 days)
  COUNT(DISTINCT h.id) FILTER (WHERE h.created_at > NOW() - INTERVAL '30 days') AS recent_operations
  
FROM public.representatives r
LEFT JOIN public.host_operations h ON h.operator_id = r.user_id
GROUP BY r.id;

-- Cold start progress view (platform-level metrics)
CREATE OR REPLACE VIEW public.cold_start_progress AS
SELECT 
  -- User metrics
  (SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '30 days') AS users_last_30d,
  (SELECT COUNT(*) FROM public.founding_members WHERE status = 'active') AS active_founding_members,
  
  -- Merchant metrics
  (SELECT COUNT(*) FROM public.advertiser_profiles WHERE merchant_state = 'NEW') AS new_merchants,
  (SELECT COUNT(*) FROM public.advertiser_profiles WHERE merchant_state = 'SAMPLING') AS sampling_merchants,
  (SELECT COUNT(*) FROM public.advertiser_profiles WHERE merchant_state IN ('GRADUATED', 'PAID')) AS graduated_merchants,
  (SELECT COUNT(*) FROM public.fast_track_venues WHERE expires_at > NOW() OR expires_at IS NULL) AS fast_track_active,
  
  -- Engagement metrics
  (SELECT COUNT(*) FROM public.sampling_participations WHERE created_at > NOW() - INTERVAL '30 days') AS participations_last_30d,
  (SELECT COUNT(*) FROM public.sampling_participations WHERE redeemed = TRUE AND redeemed_at > NOW() - INTERVAL '30 days') AS redemptions_last_30d,
  
  -- Representative metrics
  (SELECT COUNT(*) FROM public.representatives WHERE status = 'active') AS active_representatives,
  (SELECT COUNT(*) FROM public.territory_assignments WHERE ended_at IS NULL) AS active_territories,
  
  -- Cross-side unlocks
  (SELECT COUNT(*) FROM public.cross_side_unlocks WHERE is_unlocked = TRUE) AS unlocks_achieved,
  (SELECT COUNT(*) FROM public.cross_side_unlocks WHERE is_unlocked = FALSE) AS unlocks_pending;

COMMENT ON VIEW public.cold_start_progress IS 
  'Platform-level metrics for tracking cold start progress and network effects';
