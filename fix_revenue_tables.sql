-- Fix: Create all required tables in correct order, then recreate the function

-- Step 1: Ensure piece_type enum exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'piece_type') THEN
    CREATE TYPE public.piece_type AS ENUM ('content_shares', 'venue_shares', 'event_shares', 'host_shares', 'brand_shares');
  END IF;
END $$;

-- Step 2: Create piece_revenue_sources table
CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  revenue_type text NOT NULL CHECK (revenue_type IN (
    'trading_fees', 'content_ad_revenue', 'moment_ticket_sales',
    'moment_sponsorship', 'host_booking_fees', 'merchandise_sales', 'licensing'
  )),
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  transaction_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 3: Create piece_holdings table (needed for the function)
CREATE TABLE IF NOT EXISTS public.piece_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid NOT NULL,
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  pieces integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(holder_id, piece_type, asset_id)
);

-- Step 4: Create piece_dividends table
CREATE TABLE IF NOT EXISTS public.piece_dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  revenue_source_id uuid REFERENCES public.piece_revenue_sources(id),
  distribution_period_start timestamptz NOT NULL,
  distribution_period_end timestamptz NOT NULL,
  total_distribution_pool numeric(14,4) NOT NULL,
  pieces_eligible integer NOT NULL,
  dividend_per_piece numeric(14,8) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'distributed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 5: Create piece_dividend_claims table
CREATE TABLE IF NOT EXISTS public.piece_dividend_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  dividend_id uuid REFERENCES public.piece_dividends(id),
  holder_id uuid NOT NULL,
  pieces_held integer NOT NULL,
  dividend_amount numeric(14,8) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_asset ON public.piece_revenue_sources(piece_type, asset_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_period ON public.piece_revenue_sources(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_piece_holdings_holder ON public.piece_holdings(holder_id);
CREATE INDEX IF NOT EXISTS idx_piece_holdings_asset ON public.piece_holdings(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_piece_dividends_asset ON public.piece_dividends(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_dividend_claims_holder ON public.piece_dividend_claims(holder_id);
CREATE INDEX IF NOT EXISTS idx_dividend_claims_dividend ON public.piece_dividend_claims(dividend_id);

-- Step 7: Enable RLS
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividend_claims ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'piece_revenue_sources' AND policyname = 'Revenue sources are public'
  ) THEN
    CREATE POLICY "Revenue sources are public" ON public.piece_revenue_sources FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'piece_holdings' AND policyname = 'Piece holdings are public'
  ) THEN
    CREATE POLICY "Piece holdings are public" ON public.piece_holdings FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'piece_dividends' AND policyname = 'Dividends are public'
  ) THEN
    CREATE POLICY "Dividends are public" ON public.piece_dividends FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'piece_dividend_claims' AND policyname = 'Users can view own claims'
  ) THEN
    CREATE POLICY "Users can view own claims" ON public.piece_dividend_claims FOR SELECT USING (auth.uid() = holder_id);
    CREATE POLICY "Users can update own claims" ON public.piece_dividend_claims FOR UPDATE USING (auth.uid() = holder_id);
  END IF;
END $$;

-- Step 9: Finally, create the function (now that all tables exist)
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(public.piece_type, uuid, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.calculate_and_distribute_dividends(
  p_piece_type public.piece_type,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS uuid AS $$
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
  
  -- Calculate dividend per piece (50% of revenue goes to holders)
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
  
  -- Create claims for all holders
  INSERT INTO public.piece_dividend_claims (
    piece_type, asset_id, dividend_id, holder_id,
    pieces_held, dividend_amount, status
  )
  SELECT 
    p_piece_type,
    p_asset_id,
    v_dividend_id,
    holder_id,
    pieces,
    pieces * v_dividend_per_piece,
    'pending'
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id
    AND pieces > 0;
    
  RETURN v_dividend_id;
END;
$$ LANGUAGE plpgsql;
