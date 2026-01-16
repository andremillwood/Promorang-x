-- Merchant Sampling Program Schema
-- Timestamp: 2026-01-10
-- 
-- This migration adds the merchant sampling layer that allows new merchants to
-- experience real user participation before committing to paid activations.
-- 
-- Merchant States: NEW, SAMPLING, GRADUATED, PAID
-- 
-- Key Principles:
-- - Value before belief, experience before spend
-- - One sampling activation per merchant (per brand/location)
-- - Integrates with existing Deals, Events, Post Proof entry surfaces
-- - Automatic graduation triggers
-- - No parallel or standalone user flows

-- =============================================================================
-- PART 1: MERCHANT STATE TRACKING
-- =============================================================================

-- Add merchant_state to advertiser_profiles (additive, non-destructive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advertiser_profiles'
      AND column_name = 'merchant_state'
  ) THEN
    ALTER TABLE public.advertiser_profiles
      ADD COLUMN merchant_state TEXT NOT NULL DEFAULT 'NEW'
      CHECK (merchant_state IN ('NEW', 'SAMPLING', 'GRADUATED', 'PAID'));
  END IF;

  -- Track when merchant entered each state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advertiser_profiles'
      AND column_name = 'sampling_started_at'
  ) THEN
    ALTER TABLE public.advertiser_profiles
      ADD COLUMN sampling_started_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advertiser_profiles'
      AND column_name = 'graduated_at'
  ) THEN
    ALTER TABLE public.advertiser_profiles
      ADD COLUMN graduated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advertiser_profiles'
      AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE public.advertiser_profiles
      ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END;
$$;

-- =============================================================================
-- PART 2: SAMPLING ACTIVATIONS TABLE
-- =============================================================================

-- Sampling activations are limited, controlled promotions for new merchants
CREATE TABLE IF NOT EXISTS public.sampling_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Merchant reference
  advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Activation details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Value contribution type (merchant must contribute real value)
  value_type TEXT NOT NULL CHECK (value_type IN ('coupon', 'product', 'voucher', 'experience', 'cash_prize')),
  
  -- Value limits
  value_amount NUMERIC(14,2) NOT NULL,  -- Dollar value or quantity
  value_unit TEXT NOT NULL DEFAULT 'usd',  -- 'usd', 'units', 'redemptions'
  max_redemptions INTEGER NOT NULL DEFAULT 20,  -- Hard cap
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  
  -- Duration limits (7-14 days max)
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7 CHECK (duration_days BETWEEN 7 AND 14),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'expired', 'cancelled')),
  
  -- Integration flags (must integrate with existing surfaces)
  include_in_deals BOOLEAN NOT NULL DEFAULT TRUE,
  include_in_events BOOLEAN NOT NULL DEFAULT FALSE,
  include_in_post_proof BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- PromoShare & Social Shield (mandatory)
  promoshare_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  social_shield_required BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Graduation tracking
  graduation_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  graduation_reason TEXT,
  graduation_triggered_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sampling_activations_advertiser 
  ON public.sampling_activations(advertiser_id, status);
CREATE INDEX IF NOT EXISTS idx_sampling_activations_status 
  ON public.sampling_activations(status, expires_at);

-- =============================================================================
-- PART 3: SAMPLING PARTICIPATION (USER ACTIONS)
-- =============================================================================

-- Track user participation in sampling activations
CREATE TABLE IF NOT EXISTS public.sampling_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  activation_id UUID NOT NULL REFERENCES public.sampling_activations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- User maturity state at time of participation (for graduation tracking)
  user_maturity_state INTEGER NOT NULL DEFAULT 0,
  
  -- Action type (maps to existing entry surfaces)
  action_type TEXT NOT NULL CHECK (action_type IN ('deal_claimed', 'event_rsvp', 'post_submitted', 'share_completed')),
  
  -- Verification status (Social Shield)
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_method TEXT,
  
  -- Redemption tracking
  redeemed BOOLEAN NOT NULL DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  redemption_value NUMERIC(14,2),
  
  -- Metadata
  action_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One participation per user per activation per action type
  UNIQUE (activation_id, user_id, action_type)
);

CREATE INDEX IF NOT EXISTS idx_sampling_participations_activation 
  ON public.sampling_participations(activation_id, verified);
CREATE INDEX IF NOT EXISTS idx_sampling_participations_user 
  ON public.sampling_participations(user_id);

-- =============================================================================
-- PART 4: MERCHANT STATE TRANSITIONS (AUDIT LOG)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.merchant_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  
  trigger_reason TEXT NOT NULL,
  trigger_metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_state_transitions_advertiser 
  ON public.merchant_state_transitions(advertiser_id, created_at DESC);

-- =============================================================================
-- PART 5: SAMPLING LIMITS CONFIGURATION
-- =============================================================================

-- Global configuration for sampling limits (admin-adjustable)
CREATE TABLE IF NOT EXISTS public.sampling_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO public.sampling_config (config_key, config_value, description)
VALUES 
  ('limits', '{
    "max_activations_per_merchant": 1,
    "min_duration_days": 7,
    "max_duration_days": 14,
    "max_product_units": 20,
    "max_voucher_redemptions": 20,
    "max_cash_prize_usd": 100
  }', 'Hard limits for sampling activations'),
  
  ('graduation_triggers', '{
    "redemption_rate_threshold": 0.30,
    "verified_actions_threshold": 25,
    "entry_user_ratio_threshold": 0.60
  }', 'Automatic graduation trigger thresholds'),
  
  ('visibility', '{
    "show_analytics": false,
    "show_forecasting": false,
    "show_optimization": false,
    "show_targeting": false,
    "show_scaling": false
  }', 'Feature visibility during sampling')
ON CONFLICT (config_key) DO NOTHING;

-- =============================================================================
-- PART 6: TRIGGERS FOR UPDATED_AT
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_sampling_activations_touch'
      AND tgrelid = 'public.sampling_activations'::regclass
  ) THEN
    DROP TRIGGER trg_sampling_activations_touch ON public.sampling_activations;
  END IF;
END $$;

CREATE TRIGGER trg_sampling_activations_touch
  BEFORE UPDATE ON public.sampling_activations
  FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_sampling_participations_touch'
      AND tgrelid = 'public.sampling_participations'::regclass
  ) THEN
    DROP TRIGGER trg_sampling_participations_touch ON public.sampling_participations;
  END IF;
END $$;

CREATE TRIGGER trg_sampling_participations_touch
  BEFORE UPDATE ON public.sampling_participations
  FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_sampling_config_touch'
      AND tgrelid = 'public.sampling_config'::regclass
  ) THEN
    DROP TRIGGER trg_sampling_config_touch ON public.sampling_config;
  END IF;
END $$;

CREATE TRIGGER trg_sampling_config_touch
  BEFORE UPDATE ON public.sampling_config
  FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

-- =============================================================================
-- PART 7: HELPER VIEWS FOR SAMPLING METRICS
-- =============================================================================

-- View for sampling activation metrics (used by merchant dashboard)
CREATE OR REPLACE VIEW public.sampling_activation_metrics AS
SELECT 
  sa.id AS activation_id,
  sa.advertiser_id,
  sa.name,
  sa.status,
  sa.value_type,
  sa.value_amount,
  sa.max_redemptions,
  sa.current_redemptions,
  sa.starts_at,
  sa.expires_at,
  sa.graduation_triggered,
  
  -- Participation counts
  COUNT(DISTINCT sp.id) AS total_participations,
  COUNT(DISTINCT sp.user_id) AS unique_participants,
  COUNT(DISTINCT CASE WHEN sp.verified THEN sp.id END) AS verified_actions,
  COUNT(DISTINCT CASE WHEN sp.redeemed THEN sp.id END) AS redemptions,
  
  -- Entry user participation (maturity states 0-2)
  COUNT(DISTINCT CASE WHEN sp.user_maturity_state <= 2 THEN sp.user_id END) AS entry_user_participants,
  
  -- Redemption rate
  CASE 
    WHEN sa.max_redemptions > 0 
    THEN ROUND((sa.current_redemptions::NUMERIC / sa.max_redemptions) * 100, 1)
    ELSE 0 
  END AS redemption_rate_pct,
  
  -- Days remaining
  GREATEST(0, EXTRACT(DAY FROM (sa.expires_at - NOW()))) AS days_remaining

FROM public.sampling_activations sa
LEFT JOIN public.sampling_participations sp ON sp.activation_id = sa.id
GROUP BY sa.id;

COMMENT ON VIEW public.sampling_activation_metrics IS 
  'Aggregated metrics for sampling activations - used by merchant dashboard during sampling state';
