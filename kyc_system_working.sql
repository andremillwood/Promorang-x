-- KYC System - Working Version
-- Run this entire file as one transaction

BEGIN;

-- Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_level') THEN
    CREATE TYPE public.kyc_level AS ENUM ('none', 'basic', 'intermediate', 'advanced');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE public.kyc_status AS ENUM ('none', 'pending', 'in_review', 'verified', 'rejected', 'expired', 'suspended');
  END IF;
END $$;

-- Tables
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

CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user ON public.kyc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_status ON public.kyc_profiles(kyc_status);

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

-- Functions
DROP FUNCTION IF EXISTS public.get_user_kyc_limits(uuid);
DROP FUNCTION IF EXISTS public.check_transaction_limits(uuid, text, numeric);
DROP FUNCTION IF EXISTS public.record_kyc_activity(uuid, text, numeric);

CREATE OR REPLACE FUNCTION public.get_user_kyc_limits(p_user_id uuid)
RETURNS TABLE (
  kyc_level text, kyc_status text, daily_deposit_limit numeric,
  daily_withdrawal_limit numeric, daily_trade_limit numeric, max_single_trade numeric,
  can_trade boolean, can_deposit_crypto boolean, can_withdraw_crypto boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT kp.kyc_level::text, kp.kyc_status::text, COALESCE(ktl.daily_deposit_limit, 0),
    COALESCE(ktl.daily_withdrawal_limit, 0), COALESCE(ktl.daily_trade_volume_limit, 0),
    COALESCE(ktl.max_single_trade, 0), COALESCE(ktl.can_trade, false),
    COALESCE(ktl.can_deposit_crypto, false), COALESCE(ktl.can_withdraw_crypto, false)
  FROM public.kyc_profiles kp
  JOIN public.kyc_trading_limits ktl ON kp.kyc_level = ktl.kyc_level
  WHERE kp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_transaction_limits(p_user_id uuid, p_transaction_type text, p_amount numeric)
RETURNS boolean AS $$
DECLARE
  kyc_stat text;
  max_single numeric;
  can_trd boolean;
  daily_dep_lim numeric;
  daily_wd_lim numeric;
  daily_trd_lim numeric;
  daily_dep_curr numeric;
  daily_wd_curr numeric;
  daily_trd_buy_curr numeric;
  daily_trd_sell_curr numeric;
  found_profile boolean;
  found_activity boolean;
BEGIN
  SELECT kp.kyc_status::text, COALESCE(ktl.max_single_trade, 0), COALESCE(ktl.can_trade, false),
    COALESCE(ktl.daily_deposit_limit, 0), COALESCE(ktl.daily_withdrawal_limit, 0), COALESCE(ktl.daily_trade_volume_limit, 0), true
  INTO kyc_stat, max_single, can_trd, daily_dep_lim, daily_wd_lim, daily_trd_lim, found_profile
  FROM public.kyc_profiles kp
  JOIN public.kyc_trading_limits ktl ON kp.kyc_level = ktl.kyc_level
  WHERE kp.user_id = p_user_id;

  IF NOT found_profile THEN
    RAISE EXCEPTION 'KYC profile not found';
  END IF;

  IF kyc_stat <> 'verified' THEN
    RAISE EXCEPTION 'KYC verification required';
  END IF;

  IF p_transaction_type IN ('trade_buy', 'trade_sell') AND NOT can_trd THEN
    RAISE EXCEPTION 'Trading not permitted';
  END IF;

  IF p_amount > max_single THEN
    RAISE EXCEPTION 'Exceeds single transaction limit of %', max_single;
  END IF;

  SELECT COALESCE(deposits_total, 0), COALESCE(withdrawals_total, 0), COALESCE(trade_volume_buy, 0), COALESCE(trade_volume_sell, 0), true
  INTO daily_dep_curr, daily_wd_curr, daily_trd_buy_curr, daily_trd_sell_curr, found_activity
  FROM public.kyc_daily_activity
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;

  IF NOT found_activity THEN
    daily_dep_curr := 0;
    daily_wd_curr := 0;
    daily_trd_buy_curr := 0;
    daily_trd_sell_curr := 0;
  END IF;

  IF p_transaction_type = 'deposit' AND (daily_dep_curr + p_amount) > daily_dep_lim THEN
    RAISE EXCEPTION 'Exceeds daily deposit limit';
  END IF;

  IF p_transaction_type = 'withdrawal' AND (daily_wd_curr + p_amount) > daily_wd_lim THEN
    RAISE EXCEPTION 'Exceeds daily withdrawal limit';
  END IF;

  IF p_transaction_type = 'trade_buy' AND (daily_trd_buy_curr + p_amount) > daily_trd_lim THEN
    RAISE EXCEPTION 'Exceeds daily trade limit';
  END IF;

  IF p_transaction_type = 'trade_sell' AND (daily_trd_sell_curr + p_amount) > daily_trd_lim THEN
    RAISE EXCEPTION 'Exceeds daily trade limit';
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.record_kyc_activity(p_user_id uuid, p_transaction_type text, p_amount numeric)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION public.touch_kyc_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_profiles_touch') THEN
    CREATE TRIGGER trg_kyc_profiles_touch BEFORE UPDATE ON public.kyc_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kyc_limits_touch') THEN
    CREATE TRIGGER trg_kyc_limits_touch BEFORE UPDATE ON public.kyc_trading_limits FOR EACH ROW EXECUTE FUNCTION public.touch_kyc_updated_at();
  END IF;
END $$;

-- RLS
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

COMMIT;

NOTIFY pgrst, 'reload schema';
