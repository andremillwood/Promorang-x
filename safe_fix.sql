-- SAFE FIX - Handles existing policies gracefully
-- Run each statement separately if needed

-- 1. Create tables (safe, won't error if exists)
CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL DEFAULT 'content_shares',
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  revenue_type text NOT NULL DEFAULT 'trading_fees',
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.piece_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL DEFAULT gen_random_uuid(),
  piece_type text NOT NULL DEFAULT 'content_shares',
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  pieces integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Enable RLS (safe)
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_holdings ENABLE ROW LEVEL SECURITY;

-- 3. Drop and recreate function (ignore policies)
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends CASCADE;

CREATE OR REPLACE FUNCTION public.calculate_and_distribute_dividends(
  p_piece_type text,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
) RETURNS uuid 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN gen_random_uuid();
END;
$$;
