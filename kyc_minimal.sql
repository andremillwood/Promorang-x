-- KYC System - Minimal Version
-- Step 1: Create types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_level') THEN
    CREATE TYPE public.kyc_level AS ENUM ('none', 'basic', 'intermediate', 'advanced');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE public.kyc_status AS ENUM ('none', 'pending', 'in_review', 'verified', 'rejected', 'expired', 'suspended');
  END IF;
END $$;

-- Step 2: Create tables (no functions yet)
CREATE TABLE IF NOT EXISTS public.kyc_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  kyc_level public.kyc_level NOT NULL DEFAULT 'none',
  kyc_status public.kyc_status NOT NULL DEFAULT 'none',
  first_name text,
  last_name text,
  date_of_birth date,
  nationality text,
  country_of_residence text,
  id_document_type text CHECK (id_document_type IN ('passport', 'drivers_license', 'national_id')),
  id_document_number text,
  id_document_issued_date date,
  id_document_expiry_date date,
  id_document_verified_at timestamptz,
  id_document_verified_by uuid REFERENCES public.users(id),
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  address_verified_at timestamptz,
  address_document_url text,
  phone_number text,
  phone_verified_at timestamptz,
  source_of_funds text CHECK (source_of_funds IN ('salary', 'business', 'investment', 'inheritance', 'gift', 'other')),
  occupation text,
  employer_name text,
  annual_income_range text CHECK (annual_income_range IN ('0-25000', '25000-50000', '50000-100000', '100000-250000', '250000+')),
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  risk_flags jsonb DEFAULT '[]'::jsonb,
  pep_status boolean DEFAULT false,
  sanctions_check_status text DEFAULT 'pending',
  sanctions_check_completed_at timestamptz,
  daily_deposit_limit numeric(14,2) DEFAULT 0,
  daily_withdrawal_limit numeric(14,2) DEFAULT 0,
  max_single_trade_amount numeric(14,2) DEFAULT 0,
  max_portfolio_value numeric(14,2) DEFAULT 0,
  verification_provider text,
  provider_check_id text,
  provider_raw_response jsonb,
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

CREATE TABLE IF NOT EXISTS public.kyc_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  status public.kyc_status NOT NULL,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  selfie_url text,
  liveness_check_result text CHECK (liveness_check_result IN ('passed', 'failed', 'pending')),
  provider text,
  provider_check_id text,
  provider_status text,
  provider_result jsonb,
  requires_manual_review boolean DEFAULT false,
  manual_review_notes text,
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  rejection_category text CHECK (rejection_category IN ('document_quality', 'document_invalid', 'identity_mismatch', 'fraud_suspected', 'underage', 'sanctions', 'other')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.kyc_trading_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_level public.kyc_level NOT NULL UNIQUE,
  daily_deposit_limit numeric(14,2) NOT NULL DEFAULT 0,
  daily_withdrawal_limit numeric(14,2) NOT NULL DEFAULT 0,
  daily_trade_volume_limit numeric(14,2) NOT NULL DEFAULT 0,
  max_single_deposit numeric(14,2) NOT NULL DEFAULT 0,
  max_single_withdrawal numeric(14,2) NOT NULL DEFAULT 0,
  max_single_trade numeric(14,2) NOT NULL DEFAULT 0,
  max_portfolio_value numeric(14,2) NOT NULL DEFAULT 0,
  can_trade boolean DEFAULT false,
  can_deposit_crypto boolean DEFAULT false,
  can_withdraw_crypto boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

INSERT INTO public.kyc_trading_limits (kyc_level, daily_deposit_limit, daily_withdrawal_limit, daily_trade_volume_limit, max_single_deposit, max_single_withdrawal, max_single_trade, max_portfolio_value, can_trade, can_deposit_crypto, can_withdraw_crypto) VALUES
  ('none', 0, 0, 0, 0, 0, 0, 0, false, false, false),
  ('basic', 500, 100, 1000, 500, 100, 500, 5000, true, false, false),
  ('intermediate', 10000, 5000, 50000, 5000, 2500, 10000, 100000, true, true, true),
  ('advanced', 100000, 50000, 500000, 50000, 25000, 50000, 1000000, true, true, true)
ON CONFLICT (kyc_level) DO NOTHING;

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

CREATE TABLE IF NOT EXISTS public.kyc_compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('velocity', 'structuring', 'unusual_pattern', 'sanctions_match', 'pep_match', 'adverse_media', 'suspicious_activity')),
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

-- Step 3: Create simple function using SQL instead of PL/pgSQL where possible
CREATE OR REPLACE FUNCTION public.get_user_kyc_limits(p_user_id uuid)
RETURNS TABLE (
  kyc_level text,
  kyc_status text,
  daily_deposit_limit numeric,
  daily_withdrawal_limit numeric,
  daily_trade_limit numeric,
  max_single_trade numeric,
  can_trade boolean,
  can_deposit_crypto boolean,
  can_withdraw_crypto boolean
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    kp.kyc_level::text,
    kp.kyc_status::text,
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
$$;

-- Step 4: Simple PL/pgSQL function with minimal logic
CREATE OR REPLACE FUNCTION public.check_transaction_limits(p_user_id uuid, p_transaction_type text, p_amount numeric)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
  result text;
BEGIN
  -- Check if profile exists and is verified
  IF NOT EXISTS (
    SELECT 1 FROM public.kyc_profiles kp
    JOIN public.kyc_trading_limits ktl ON kp.kyc_level = ktl.kyc_level
    WHERE kp.user_id = p_user_id AND kp.kyc_status = 'verified'
  ) THEN
    RETURN 'KYC verification required';
  END IF;

  -- All basic checks passed
  RETURN 'ok';
END;
$func$;

-- Step 5: Activity recording function
CREATE OR REPLACE FUNCTION public.record_kyc_activity(p_user_id uuid, p_transaction_type text, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
AS $func$
BEGIN
  INSERT INTO public.kyc_daily_activity (user_id, activity_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    deposits_total = CASE WHEN p_transaction_type = 'deposit' THEN public.kyc_daily_activity.deposits_total + p_amount ELSE public.kyc_daily_activity.deposits_total END,
    deposits_count = CASE WHEN p_transaction_type = 'deposit' THEN public.kyc_daily_activity.deposits_count + 1 ELSE public.kyc_daily_activity.deposits_count END,
    withdrawals_total = CASE WHEN p_transaction_type = 'withdrawal' THEN public.kyc_daily_activity.withdrawals_total + p_amount ELSE public.kyc_daily_activity.withdrawals_total END,
    withdrawals_count = CASE WHEN p_transaction_type = 'withdrawal' THEN public.kyc_daily_activity.withdrawals_count + 1 ELSE public.kyc_daily_activity.withdrawals_count END,
    trade_volume_buy = CASE WHEN p_transaction_type = 'trade_buy' THEN public.kyc_daily_activity.trade_volume_buy + p_amount ELSE public.kyc_daily_activity.trade_volume_buy END,
    trade_volume_sell = CASE WHEN p_transaction_type = 'trade_sell' THEN public.kyc_daily_activity.trade_volume_sell + p_amount ELSE public.kyc_daily_activity.trade_volume_sell END,
    trade_count = CASE WHEN p_transaction_type IN ('trade_buy', 'trade_sell') THEN public.kyc_daily_activity.trade_count + 1 ELSE public.kyc_daily_activity.trade_count END;
END;
$func$;

-- Step 6: Triggers
CREATE OR REPLACE FUNCTION public.touch_kyc_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$func$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_profiles_touch') THEN
    CREATE TRIGGER trg_kyc_profiles_touch BEFORE UPDATE ON public.kyc_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_limits_touch') THEN
    CREATE TRIGGER trg_kyc_limits_touch BEFORE UPDATE ON public.kyc_trading_limits FOR EACH ROW EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
END $$;

-- Step 7: RLS
ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_trading_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_compliance_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_profiles_user" ON public.kyc_profiles;
CREATE POLICY "kyc_profiles_user" ON public.kyc_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "kyc_profiles_no_modify" ON public.kyc_profiles;
CREATE POLICY "kyc_profiles_no_modify" ON public.kyc_profiles FOR ALL USING (false);
DROP POLICY IF EXISTS "kyc_attempts_user" ON public.kyc_verification_attempts;
CREATE POLICY "kyc_attempts_user" ON public.kyc_verification_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "kyc_limits_public" ON public.kyc_trading_limits;
CREATE POLICY "kyc_limits_public" ON public.kyc_trading_limits FOR SELECT USING (true);
DROP POLICY IF EXISTS "kyc_activity_user" ON public.kyc_daily_activity;
CREATE POLICY "kyc_activity_user" ON public.kyc_daily_activity FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "kyc_alerts_none" ON public.kyc_compliance_alerts;
CREATE POLICY "kyc_alerts_none" ON public.kyc_compliance_alerts FOR SELECT USING (false);

NOTIFY pgrst, 'reload schema';
SELECT 'KYC system installed successfully!' as status;
