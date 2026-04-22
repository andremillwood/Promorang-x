-- MINIMAL FIX - Create tables only, skip complex function
-- Run this if the full migration keeps failing

-- Create tables ONLY (no function)
CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL DEFAULT 'content_shares',
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  revenue_type text NOT NULL DEFAULT 'trading_fees',
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL DEFAULT now(),
  transaction_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.piece_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL DEFAULT gen_random_uuid(),
  piece_type text NOT NULL DEFAULT 'content_shares',
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  pieces integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.piece_dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL DEFAULT 'content_shares',
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  revenue_source_id uuid,
  distribution_period_start timestamptz NOT NULL DEFAULT now(),
  distribution_period_end timestamptz NOT NULL DEFAULT now(),
  total_distribution_pool numeric(14,4) NOT NULL DEFAULT 0,
  pieces_eligible integer NOT NULL DEFAULT 0,
  dividend_per_piece numeric(14,8) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_piece_revenue_lookup ON public.piece_revenue_sources(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_piece_holdings_lookup ON public.piece_holdings(piece_type, asset_id);

-- Enable RLS
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividends ENABLE ROW LEVEL SECURITY;

-- Drop the problematic function - recreate as simple version later
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends CASCADE;
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(text, uuid, timestamptz, timestamptz);

-- Create a simple stub function
CREATE OR REPLACE FUNCTION public.calculate_and_distribute_dividends(
  p_piece_type text,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS uuid 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Stub implementation - just return a new UUID
  -- This prevents app crashes while we debug the real issue
  RETURN gen_random_uuid();
END;
$$;
