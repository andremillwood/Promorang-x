-- Check if function exists and its state
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'calculate_and_distribute_dividends'
AND n.nspname = 'public';

-- If the above returns nothing or a broken function, run this to fix:

-- Step 1: Drop the broken function completely
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;

-- Step 2: Ensure tables exist first
CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL,
  asset_id uuid NOT NULL,
  revenue_type text NOT NULL,
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  transaction_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.piece_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL,
  piece_type text NOT NULL,
  asset_id uuid NOT NULL,
  pieces integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(holder_id, piece_type, asset_id)
);

CREATE TABLE IF NOT EXISTS public.piece_dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL,
  asset_id uuid NOT NULL,
  revenue_source_id uuid REFERENCES public.piece_revenue_sources(id),
  distribution_period_start timestamptz NOT NULL,
  distribution_period_end timestamptz NOT NULL,
  total_distribution_pool numeric(14,4) NOT NULL,
  pieces_eligible integer NOT NULL,
  dividend_per_piece numeric(14,8) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_piece_revenue_lookup ON public.piece_revenue_sources(piece_type, asset_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_piece_holdings_lookup ON public.piece_holdings(piece_type, asset_id);

-- Step 4: Create the function with proper syntax
CREATE OR REPLACE FUNCTION public.calculate_and_distribute_dividends(
  p_piece_type text,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS uuid 
LANGUAGE plpgsql
AS $$
DECLARE
  v_revenue_source_id uuid;
  v_total_revenue numeric(14,4);
  v_total_pieces integer;
  v_dividend_id uuid;
  v_dividend_per_piece numeric(14,8);
BEGIN
  -- Get revenue for period
  SELECT id, COALESCE(SUM(net_revenue), 0)
  INTO v_revenue_source_id, v_total_revenue
  FROM public.piece_revenue_sources
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id
    AND period_start >= p_period_start
    AND period_end <= p_period_end
  GROUP BY id
  ORDER BY period_start DESC
  LIMIT 1;
  
  -- Get total pieces for asset
  SELECT COALESCE(SUM(pieces), 0)
  INTO v_total_pieces
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id;
  
  -- Exit if no revenue or no holders
  IF v_total_revenue <= 0 OR v_total_pieces <= 0 THEN
    RETURN NULL;
  END IF;
  
  -- Calculate dividend per piece
  v_dividend_per_piece := (v_total_revenue * 0.50) / v_total_pieces;
  
  -- Create dividend record
  INSERT INTO public.piece_dividends (
    piece_type, asset_id, revenue_source_id,
    distribution_period_start, distribution_period_end,
    total_distribution_pool, pieces_eligible, dividend_per_piece
  ) VALUES (
    p_piece_type, p_asset_id, v_revenue_source_id,
    p_period_start, p_period_end,
    v_total_revenue * 0.50, v_total_pieces, v_dividend_per_piece
  ) RETURNING id INTO v_dividend_id;
  
  RETURN v_dividend_id;
END;
$$;
