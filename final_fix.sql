-- Final fix: Create tables and function, skip existing policies

-- Step 1: Create tables (if not exists)
CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL,
  asset_id uuid NOT NULL,
  revenue_type text NOT NULL DEFAULT 'trading_fees',
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

CREATE TABLE IF NOT EXISTS public.piece_dividend_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type text NOT NULL,
  asset_id uuid NOT NULL,
  dividend_id uuid REFERENCES public.piece_dividends(id),
  holder_id uuid NOT NULL,
  pieces_held integer NOT NULL,
  dividend_amount numeric(14,8) NOT NULL,
  status text DEFAULT 'pending',
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_asset ON public.piece_revenue_sources(piece_type, asset_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_period ON public.piece_revenue_sources(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_piece_holdings_lookup ON public.piece_holdings(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_piece_dividends_asset ON public.piece_dividends(piece_type, asset_id);

-- Step 3: Enable RLS
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividend_claims ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies only if they don't exist (using DO block)
DO $$
BEGIN
  -- Check and create policy for piece_revenue_sources
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'piece_revenue_sources' 
    AND policyname = 'Revenue sources are public'
  ) THEN
    CREATE POLICY "Revenue sources are public" ON public.piece_revenue_sources FOR SELECT USING (true);
  END IF;

  -- Check and create policy for piece_holdings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'piece_holdings'
  ) THEN
    CREATE POLICY "Piece holdings are public" ON public.piece_holdings FOR SELECT USING (true);
  END IF;

  -- Check and create policy for piece_dividends
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'piece_dividends' 
    AND policyname = 'Dividends are public'
  ) THEN
    CREATE POLICY "Dividends are public" ON public.piece_dividends FOR SELECT USING (true);
  END IF;

  -- Check and create policies for piece_dividend_claims
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'piece_dividend_claims'
  ) THEN
    CREATE POLICY "Users can view own claims" ON public.piece_dividend_claims FOR SELECT USING (auth.uid() = holder_id);
    CREATE POLICY "Users can update own claims" ON public.piece_dividend_claims FOR UPDATE USING (auth.uid() = holder_id);
  END IF;
END $$;

-- Step 5: Drop and recreate the function
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends(text, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;

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
BEGIN
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
  
  SELECT COALESCE(SUM(pieces), 0)
  INTO v_total_pieces
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type AND asset_id = p_asset_id;
  
  IF v_total_revenue <= 0 OR v_total_pieces <= 0 THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.piece_dividends (
    piece_type, asset_id, revenue_source_id,
    distribution_period_start, distribution_period_end,
    total_distribution_pool, pieces_eligible, dividend_per_piece
  ) VALUES (
    p_piece_type, p_asset_id, v_revenue_source_id,
    p_period_start, p_period_end,
    v_total_revenue * 0.50, v_total_pieces, 
    (v_total_revenue * 0.50) / v_total_pieces
  ) RETURNING id INTO v_dividend_id;
    
  RETURN v_dividend_id;
END;
$$;
