-- Comprehensive KYC (Know Your Customer) System
-- Trading limits, compliance, and verification levels
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. KYC VERIFICATION LEVELS ENUM
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_level') THEN
    CREATE TYPE public.kyc_level AS ENUM (
      'none',           -- No verification
      'basic',          -- Email + phone verified
      'intermediate',   -- ID document verified
      'advanced'        -- Full verification + proof of address
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE public.kyc_status AS ENUM (
      'none',
      'pending',
      'in_review',
      'verified',
      'rejected',
      'expired',
      'suspended'
    );
  END IF;
END $$;

-- =====================================================
-- 2. USER KYC PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Current status
  kyc_level public.kyc_level NOT NULL DEFAULT 'none',
  kyc_status public.kyc_status NOT NULL DEFAULT 'none',
  
  -- Verification details
  first_name text,
  last_name text,
  date_of_birth date,
  nationality text,
  country_of_residence text,
  
  -- Documents
  id_document_type text CHECK (id_document_type IN ('passport', 'drivers_license', 'national_id')),
  id_document_number text,
  id_document_issued_date date,
  id_document_expiry_date date,
  id_document_verified_at timestamptz,
  id_document_verified_by uuid REFERENCES public.users(id),
  
  -- Address verification
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  address_verified_at timestamptz,
  address_document_url text,
  
  -- Phone verification
  phone_number text,
  phone_verified_at timestamptz,
  
  -- Source of funds
  source_of_funds text CHECK (source_of_funds IN (
    'salary', 'business', 'investment', 'inheritance', 'gift', 'other'
  )),
  occupation text,
  employer_name text,
  annual_income_range text CHECK (annual_income_range IN (
    '0-25000', '25000-50000', '50000-100000', '100000-250000', '250000+'
  )),
  
  -- Risk assessment
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  risk_flags jsonb DEFAULT '[]'::jsonb,
  pep_status boolean DEFAULT false, -- Politically Exposed Person
  sanctions_check_status text DEFAULT 'pending',
  sanctions_check_completed_at timestamptz,
  
  -- Trading limits (enforced at application level)
  daily_deposit_limit numeric(14,2) DEFAULT 0,
  daily_withdrawal_limit numeric(14,2) DEFAULT 0,
  max_single_trade_amount numeric(14,2) DEFAULT 0,
  max_portfolio_value numeric(14,2) DEFAULT 0,
  
  -- Verification provider data
  verification_provider text, -- 'onfido', 'jumio', 'manual', etc.
  provider_check_id text,
  provider_raw_response jsonb,
  
  -- Timestamps
  submitted_at timestamptz,
  verified_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  last_reviewed_at timestamptz,
  last_reviewed_by uuid REFERENCES public.users(id),
  expires_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user ON public.kyc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_status ON public.kyc_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_level ON public.kyc_profiles(kyc_level);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_risk ON public.kyc_profiles(risk_level);

-- =====================================================
-- 3. KYC VERIFICATION ATTEMPTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  attempt_number integer NOT NULL DEFAULT 1,
  status public.kyc_status NOT NULL,
  
  -- Documents submitted
  documents jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of {type, url, side}
  selfie_url text,
  liveness_check_result text CHECK (liveness_check_result IN ('passed', 'failed', 'pending')),
  
  -- Provider check
  provider text,
  provider_check_id text,
  provider_status text,
  provider_result jsonb,
  
  -- Manual review
  requires_manual_review boolean DEFAULT false,
  manual_review_notes text,
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  
  -- Rejection details
  rejection_reason text,
  rejection_category text CHECK (rejection_category IN (
    'document_quality', 'document_invalid', 'identity_mismatch', 
    'fraud_suspected', 'underage', 'sanctions', 'other'
  )),
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_kyc_attempts_user ON public.kyc_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_attempts_status ON public.kyc_verification_attempts(status);
CREATE INDEX IF NOT EXISTS idx_kyc_attempts_provider ON public.kyc_verification_attempts(provider_check_id);

-- =====================================================
-- 4. TRADING LIMITS & RESTRICTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_trading_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_level public.kyc_level NOT NULL UNIQUE,
  
  -- Daily limits
  daily_deposit_limit numeric(14,2) NOT NULL DEFAULT 0,
  daily_withdrawal_limit numeric(14,2) NOT NULL DEFAULT 0,
  daily_trade_volume_limit numeric(14,2) NOT NULL DEFAULT 0,
  
  -- Single transaction limits
  max_single_deposit numeric(14,2) NOT NULL DEFAULT 0,
  max_single_withdrawal numeric(14,2) NOT NULL DEFAULT 0,
  max_single_trade numeric(14,2) NOT NULL DEFAULT 0,
  
  -- Portfolio limits
  max_portfolio_value numeric(14,2) NOT NULL DEFAULT 0,
  max_pieces_held integer DEFAULT 0,
  max_assets_traded integer DEFAULT 0,
  
  -- Feature access
  can_trade boolean DEFAULT false,
  can_deposit_crypto boolean DEFAULT false,
  can_withdraw_crypto boolean DEFAULT false,
  can_use_amm boolean DEFAULT false,
  can_provide_liquidity boolean DEFAULT false,
  
  -- Requirements
  requires_id_verification boolean DEFAULT false,
  requires_address_verification boolean DEFAULT false,
  requires_source_of_funds boolean DEFAULT false,
  
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure columns exist in case table was partially created in a previous run
ALTER TABLE public.kyc_trading_limits 
  ADD COLUMN IF NOT EXISTS can_trade boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_deposit_crypto boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_withdraw_crypto boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_use_amm boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_provide_liquidity boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_id_verification boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_address_verification boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_source_of_funds boolean DEFAULT false;

-- Insert default limits
INSERT INTO public.kyc_trading_limits (
  kyc_level, daily_deposit_limit, daily_withdrawal_limit, daily_trade_volume_limit,
  max_single_deposit, max_single_withdrawal, max_single_trade, max_portfolio_value,
  can_trade, can_deposit_crypto, can_withdraw_crypto, can_use_amm, can_provide_liquidity,
  requires_id_verification, requires_address_verification, requires_source_of_funds
) VALUES
  ('none', 0, 0, 0, 0, 0, 0, 0, false, false, false, false, false, false, false, false),
  ('basic', 500, 100, 1000, 500, 100, 500, 5000, true, false, false, true, false, false, false, false),
  ('intermediate', 10000, 5000, 50000, 5000, 2500, 10000, 100000, true, true, true, true, true, true, false, false),
  ('advanced', 100000, 50000, 500000, 50000, 25000, 50000, 1000000, true, true, true, true, true, true, true, true)
ON CONFLICT (kyc_level) DO NOTHING;

-- =====================================================
-- 5. DAILY TRADING ACTIVITY TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_daily_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  
  deposits_total numeric(14,2) DEFAULT 0,
  deposits_count integer DEFAULT 0,
  
  withdrawals_total numeric(14,2) DEFAULT 0,
  withdrawals_count integer DEFAULT 0,
  
  trade_volume_buy numeric(14,2) DEFAULT 0,
  trade_volume_sell numeric(14,2) DEFAULT 0,
  trade_count integer DEFAULT 0,
  
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_kyc_daily_activity_user_date ON public.kyc_daily_activity(user_id, activity_date);

-- =====================================================
-- 6. COMPLIANCE FLAGS & ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  alert_type text NOT NULL CHECK (alert_type IN (
    'velocity', 'structuring', 'unusual_pattern', 'sanctions_match',
    'pep_match', 'adverse_media', 'suspicious_activity'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  description text NOT NULL,
  triggered_rules jsonb DEFAULT '[]'::jsonb,
  evidence jsonb DEFAULT '{}'::jsonb,
  
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'false_positive')),
  
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  resolution_notes text,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_kyc_compliance_user ON public.kyc_compliance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_compliance_status ON public.kyc_compliance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_kyc_compliance_severity ON public.kyc_compliance_alerts(severity);

-- =====================================================
-- 7. FUNCTIONS FOR LIMIT ENFORCEMENT
-- =====================================================

-- Get user's current KYC level and limits
DROP FUNCTION IF EXISTS public.get_user_kyc_limits(uuid);
CREATE OR REPLACE FUNCTION public.get_user_kyc_limits(p_user_id uuid)
RETURNS TABLE (
  kyc_level public.kyc_level,
  kyc_status public.kyc_status,
  daily_deposit_limit numeric,
  daily_withdrawal_limit numeric,
  daily_trade_limit numeric,
  max_single_trade numeric,
  can_trade boolean,
  can_deposit_crypto boolean,
  can_withdraw_crypto boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kp.kyc_level,
    kp.kyc_status,
    COALESCE(ktl.daily_deposit_limit, 0),
    COALESCE(ktl.daily_withdrawal_limit, 0),
    COALESCE(ktl.daily_trade_volume_limit, 0),
    COALESCE(ktl.max_single_trade, 0),
    COALESCE(ktl.can_trade, false),
    COALESCE(ktl.can_deposit_crypto, false),
    COALESCE(ktl.can_withdraw_crypto, false)
  FROM public.kyc_profiles kp
  JOIN public.kyc_trading_limits ktl ON kp.kyc_level = ktl.kyc_level
  WHERE kp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Check if transaction would exceed limits
DROP FUNCTION IF EXISTS public.check_transaction_limits(uuid, text, numeric);
CREATE OR REPLACE FUNCTION public.check_transaction_limits(
  p_user_id uuid,
  p_transaction_type text,
  p_amount numeric
)
RETURNS TABLE (
  allowed boolean,
  reason text,
  current_daily_total numeric,
  daily_limit numeric,
  remaining_limit numeric
) AS $$
DECLARE
  v_limits record;
  v_daily record;
  v_current_total numeric;
  v_daily_limit numeric;
BEGIN
  -- Get user limits
  v_limits := (
    SELECT t.* FROM public.get_user_kyc_limits(p_user_id) t LIMIT 1
  );
  
  IF v_limits.kyc_level IS NULL THEN
    RETURN QUERY SELECT false, 'KYC profile not found', 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;
  
  -- Check if verified
  IF v_limits.kyc_status NOT IN ('verified') THEN
    RETURN QUERY SELECT false, 'KYC verification required', 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;
  
  -- Check trading permission
  IF p_transaction_type IN ('trade_buy', 'trade_sell') AND NOT v_limits.can_trade THEN
    RETURN QUERY SELECT false, 'Trading not permitted at current KYC level', 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;
  
  -- Check single transaction limit
  IF p_amount > v_limits.max_single_trade THEN
    RETURN QUERY SELECT 
      false, 
      format('Exceeds single transaction limit of %s', v_limits.max_single_trade),
      0::numeric, v_limits.max_single_trade, 0::numeric;
    RETURN;
  END IF;
  
  -- Get today's activity
  v_daily := (
    SELECT t.*
    FROM public.kyc_daily_activity t
    WHERE user_id = p_user_id AND activity_date = CURRENT_DATE
    LIMIT 1
  );
  
  -- Determine limit and current total based on transaction type
  CASE p_transaction_type
    WHEN 'deposit' THEN
      v_daily_limit := v_limits.daily_deposit_limit;
      v_current_total := COALESCE(v_daily.deposits_total, 0);
    WHEN 'withdrawal' THEN
      v_daily_limit := v_limits.daily_withdrawal_limit;
      v_current_total := COALESCE(v_daily.withdrawals_total, 0);
    WHEN 'trade_buy' THEN
      v_daily_limit := v_limits.daily_trade_limit;
      v_current_total := COALESCE(v_daily.trade_volume_buy, 0);
    WHEN 'trade_sell' THEN
      v_daily_limit := v_limits.daily_trade_limit;
      v_current_total := COALESCE(v_daily.trade_volume_sell, 0);
    ELSE
      v_daily_limit := 0;
      v_current_total := 0;
  END CASE;
  
  -- Check if would exceed daily limit
  IF (v_current_total + p_amount) > v_daily_limit THEN
    RETURN QUERY SELECT 
      false,
      format('Would exceed daily limit. Current: %s, Limit: %s, Attempted: %s', 
             v_current_total, v_daily_limit, p_amount),
      v_current_total, v_daily_limit, GREATEST(0, v_daily_limit - v_current_total);
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true,
    'Transaction permitted',
    v_current_total, v_daily_limit, (v_daily_limit - v_current_total - p_amount);
END;
$$ LANGUAGE plpgsql;

-- Record transaction activity
DROP FUNCTION IF EXISTS public.record_kyc_activity(uuid, text, numeric);
CREATE OR REPLACE FUNCTION public.record_kyc_activity(
  p_user_id uuid,
  p_transaction_type text,
  p_amount numeric
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.kyc_daily_activity (user_id, activity_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    deposits_total = CASE 
      WHEN p_transaction_type = 'deposit' 
      THEN public.kyc_daily_activity.deposits_total + p_amount 
      ELSE public.kyc_daily_activity.deposits_total 
    END,
    deposits_count = CASE 
      WHEN p_transaction_type = 'deposit' 
      THEN public.kyc_daily_activity.deposits_count + 1 
      ELSE public.kyc_daily_activity.deposits_count 
    END,
    withdrawals_total = CASE 
      WHEN p_transaction_type = 'withdrawal' 
      THEN public.kyc_daily_activity.withdrawals_total + p_amount 
      ELSE public.kyc_daily_activity.withdrawals_total 
    END,
    withdrawals_count = CASE 
      WHEN p_transaction_type = 'withdrawal' 
      THEN public.kyc_daily_activity.withdrawals_count + 1 
      ELSE public.kyc_daily_activity.withdrawals_count 
    END,
    trade_volume_buy = CASE 
      WHEN p_transaction_type = 'trade_buy' 
      THEN public.kyc_daily_activity.trade_volume_buy + p_amount 
      ELSE public.kyc_daily_activity.trade_volume_buy 
    END,
    trade_volume_sell = CASE 
      WHEN p_transaction_type = 'trade_sell' 
      THEN public.kyc_daily_activity.trade_volume_sell + p_amount 
      ELSE public.kyc_daily_activity.trade_volume_sell 
    END,
    trade_count = CASE 
      WHEN p_transaction_type IN ('trade_buy', 'trade_sell') 
      THEN public.kyc_daily_activity.trade_count + 1 
      ELSE public.kyc_daily_activity.trade_count 
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.touch_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_profiles_touch') THEN
    CREATE TRIGGER trg_kyc_profiles_touch
      BEFORE UPDATE ON public.kyc_profiles FOR EACH ROW
      EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_trading_limits_touch') THEN
    CREATE TRIGGER trg_kyc_trading_limits_touch
      BEFORE UPDATE ON public.kyc_trading_limits FOR EACH ROW
      EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
END $$;

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_trading_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_compliance_alerts ENABLE ROW LEVEL SECURITY;

-- KYC profiles - users can see own, admins can see all
DROP POLICY IF EXISTS "Users can view own KYC profile" ON public.kyc_profiles;
CREATE POLICY "Users can view own KYC profile" ON public.kyc_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot modify own KYC" ON public.kyc_profiles;
CREATE POLICY "Users cannot modify own KYC" ON public.kyc_profiles
  FOR ALL USING (false); -- Only admins/system can modify

-- Verification attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON public.kyc_verification_attempts;
CREATE POLICY "Users can view own attempts" ON public.kyc_verification_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Trading limits are public
DROP POLICY IF EXISTS "Trading limits are public" ON public.kyc_trading_limits;
CREATE POLICY "Trading limits are public" ON public.kyc_trading_limits
  FOR SELECT USING (true);

-- Daily activity - users can see own
DROP POLICY IF EXISTS "Users can view own activity" ON public.kyc_daily_activity;
CREATE POLICY "Users can view own activity" ON public.kyc_daily_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Compliance alerts - internal only
DROP POLICY IF EXISTS "Users cannot view compliance alerts" ON public.kyc_compliance_alerts;
CREATE POLICY "Users cannot view compliance alerts" ON public.kyc_compliance_alerts
  FOR SELECT USING (false);

notify pgrst, 'reload schema';
