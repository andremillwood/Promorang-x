-- Market Maker Bot Tables
-- Tracks liquidity seeding and market making activities
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. MARKET MAKER SEEDS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.market_maker_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  
  -- Initial seed amounts
  pieces_seeded numeric(24,8) NOT NULL,
  currency_seeded numeric(24,8) NOT NULL,
  initial_price numeric(24,8) NOT NULL,
  
  -- Strategy parameters
  target_spread numeric(5,4) DEFAULT 0.005,
  max_inventory_ratio numeric(5,4) DEFAULT 0.60,
  min_inventory_ratio numeric(5,4) DEFAULT 0.05,
  
  -- Status
  is_active boolean DEFAULT true,
  deactivated_at timestamptz,
  deactivation_reason text,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_market_maker_seeds_pool ON public.market_maker_seeds(pool_id);
CREATE INDEX IF NOT EXISTS idx_market_maker_seeds_asset ON public.market_maker_seeds(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_market_maker_seeds_active ON public.market_maker_seeds(is_active);

-- =====================================================
-- 2. MARKET MAKER ACTIVITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.market_maker_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  
  -- What was intended vs executed
  intended_actions text[] DEFAULT '{}',
  executed_actions text[] DEFAULT '{}',
  
  -- Metrics at time of activity
  inventory_ratio numeric(5,4),
  current_spread numeric(8,4),
  market_maker_share numeric(5,4), -- % of pool owned by MM
  pool_price numeric(24,8),
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_market_maker_activities_pool ON public.market_maker_activities(pool_id);
CREATE INDEX IF NOT EXISTS idx_market_maker_activities_created ON public.market_maker_activities(created_at DESC);

-- =====================================================
-- 3. MARKET MAKER INTERVENTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.market_maker_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  
  intervention_type text NOT NULL CHECK (intervention_type IN (
    'counter_liquidity',
    'spread_tightening',
    'inventory_rebalance',
    'price_stabilization'
  )),
  
  description text,
  pieces_involved numeric(24,8),
  currency_involved numeric(24,8),
  
  price_before numeric(24,8),
  price_after numeric(24,8),
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_market_maker_interventions_pool ON public.market_maker_interventions(pool_id);
CREATE INDEX IF NOT EXISTS idx_market_maker_interventions_created ON public.market_maker_interventions(created_at DESC);

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

ALTER TABLE public.market_maker_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_maker_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_maker_interventions ENABLE ROW LEVEL SECURITY;

-- Public read access (for transparency)
CREATE POLICY "Market maker seeds are public" ON public.market_maker_seeds FOR SELECT USING (true);
CREATE POLICY "Market maker activities are public" ON public.market_maker_activities FOR SELECT USING (true);
CREATE POLICY "Market maker interventions are public" ON public.market_maker_interventions FOR SELECT USING (true);

-- Only system can modify
CREATE POLICY "Only system can modify market maker data" ON public.market_maker_seeds 
  FOR ALL USING (false);
CREATE POLICY "Only system can modify market maker data" ON public.market_maker_activities 
  FOR ALL USING (false);
CREATE POLICY "Only system can modify market maker data" ON public.market_maker_interventions 
  FOR ALL USING (false);

notify pgrst, 'reload schema';
