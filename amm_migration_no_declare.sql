-- AMM Liquidity Pools for Pieces Market
-- NO DECLARE BLOCKS VERSION - uses simple SQL functions
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. LIQUIDITY POOLS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_liquidity_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  pieces_reserve numeric(24,8) NOT NULL DEFAULT 0,
  currency_reserve numeric(24,8) NOT NULL DEFAULT 0,
  k_constant numeric(38,16) NOT NULL DEFAULT 0,
  swap_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0030,
  protocol_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0005,
  lp_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0025,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  last_price numeric(24,8),
  price_24h_ago numeric(24,8),
  volume_24h numeric(24,8) DEFAULT 0,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(piece_type, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_liquidity_pools_asset ON public.piece_liquidity_pools(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_piece_liquidity_pools_status ON public.piece_liquidity_pools(status);

-- =====================================================
-- 2. LIQUIDITY PROVIDER POSITIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_lp_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lp_tokens numeric(24,8) NOT NULL DEFAULT 0,
  pieces_deposited numeric(24,8) NOT NULL DEFAULT 0,
  currency_deposited numeric(24,8) NOT NULL DEFAULT 0,
  fees_earned_pieces numeric(24,8) DEFAULT 0,
  fees_earned_currency numeric(24,8) DEFAULT 0,
  first_deposit_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_deposit_at timestamptz,
  last_withdrawal_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(pool_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_lp_positions_provider ON public.piece_lp_positions(provider_id);
CREATE INDEX IF NOT EXISTS idx_piece_lp_positions_pool ON public.piece_lp_positions(pool_id);

-- =====================================================
-- 3. AMM SWAP TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_amm_swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id),
  swap_type text NOT NULL CHECK (swap_type IN ('pieces_to_currency', 'currency_to_pieces')),
  trader_id uuid NOT NULL REFERENCES public.users(id),
  amount_in numeric(24,8) NOT NULL,
  amount_out numeric(24,8) NOT NULL,
  swap_fee numeric(24,8) NOT NULL,
  protocol_fee numeric(24,8) NOT NULL,
  lp_fee numeric(24,8) NOT NULL,
  price_before numeric(24,8) NOT NULL,
  price_after numeric(24,8) NOT NULL,
  price_impact_percent numeric(8,4) NOT NULL,
  expected_amount_out numeric(24,8) NOT NULL,
  minimum_amount_out numeric(24,8) NOT NULL,
  slippage_percent numeric(5,4) NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_piece_amm_swaps_pool ON public.piece_amm_swaps(pool_id);
CREATE INDEX IF NOT EXISTS idx_piece_amm_swaps_trader ON public.piece_amm_swaps(trader_id);
CREATE INDEX IF NOT EXISTS idx_piece_amm_swaps_created ON public.piece_amm_swaps(created_at DESC);

-- =====================================================
-- 4. CIRCUIT BREAKERS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_circuit_breakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  max_price_change_1h_percent numeric(5,2) NOT NULL DEFAULT 20.00,
  max_price_change_24h_percent numeric(5,2) NOT NULL DEFAULT 100.00,
  max_volume_spike_multiplier numeric(5,2) NOT NULL DEFAULT 10.00,
  cooldown_minutes integer NOT NULL DEFAULT 15,
  is_triggered boolean DEFAULT false,
  triggered_at timestamptz,
  trigger_reason text,
  last_triggered_at timestamptz,
  triggered_count integer DEFAULT 0,
  auto_reset_after_minutes integer DEFAULT 60,
  reset_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_circuit_breakers_pool ON public.piece_circuit_breakers(pool_id);
CREATE INDEX IF NOT EXISTS idx_piece_circuit_breakers_triggered ON public.piece_circuit_breakers(is_triggered);

-- =====================================================
-- 5. PRICE ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.piece_liquidity_pools(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('price_spike', 'volume_spike', 'liquidity_drop', 'circuit_breaker')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_price_alerts_pool ON public.piece_price_alerts(pool_id);
CREATE INDEX IF NOT EXISTS idx_piece_price_alerts_unresolved ON public.piece_price_alerts(is_resolved, created_at DESC);

-- =====================================================
-- 6. SIMPLE SQL FUNCTIONS (No DECLARE blocks)
-- =====================================================

-- Calculate output amount using constant product formula
CREATE OR REPLACE FUNCTION public.calculate_swap_output(
  amount_in numeric,
  reserve_in numeric,
  reserve_out numeric,
  fee_percent numeric
)
RETURNS numeric 
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(0, 
    (reserve_out * amount_in * (1 - fee_percent)) / 
    (reserve_in + amount_in * (1 - fee_percent))
  );
$$;

-- Calculate price impact
CREATE OR REPLACE FUNCTION public.calculate_price_impact(
  amount_in numeric,
  reserve_in numeric,
  reserve_out numeric
)
RETURNS numeric 
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN reserve_in = 0 OR reserve_out = 0 THEN 0
    ELSE ((reserve_out / reserve_in) - (reserve_out * amount_in / (reserve_in + amount_in)) / amount_in) / (reserve_out / reserve_in) * 100
  END;
$$;

-- Calculate LP tokens
CREATE OR REPLACE FUNCTION public.calculate_lp_tokens(
  pieces_to_deposit numeric,
  currency_to_deposit numeric,
  current_pieces_reserve numeric,
  current_currency_reserve numeric,
  current_total_lp_tokens numeric
)
RETURNS numeric 
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN current_total_lp_tokens = 0 THEN SQRT(pieces_to_deposit * currency_to_deposit)
    ELSE LEAST(pieces_to_deposit / current_pieces_reserve, currency_to_deposit / current_currency_reserve) * current_total_lp_tokens
  END;
$$;

-- =====================================================
-- 7. TRIGGER FUNCTION (Simplified)
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_pool_after_swap()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.swap_type = 'pieces_to_currency' THEN
      UPDATE public.piece_liquidity_pools
      SET pieces_reserve = pieces_reserve + NEW.amount_in,
          currency_reserve = currency_reserve - NEW.amount_out,
          k_constant = (pieces_reserve + NEW.amount_in) * (currency_reserve - NEW.amount_out),
          last_price = (currency_reserve - NEW.amount_out) / NULLIF(pieces_reserve + NEW.amount_in, 0),
          volume_24h = volume_24h + NEW.amount_in * NEW.price_before,
          updated_at = timezone('utc', now())
      WHERE id = NEW.pool_id;
    ELSE
      UPDATE public.piece_liquidity_pools
      SET currency_reserve = currency_reserve + NEW.amount_in,
          pieces_reserve = pieces_reserve - NEW.amount_out,
          k_constant = (currency_reserve + NEW.amount_in) * (pieces_reserve - NEW.amount_out),
          last_price = (currency_reserve + NEW.amount_in) / NULLIF(pieces_reserve - NEW.amount_out, 0),
          volume_24h = volume_24h + NEW.amount_in,
          updated_at = timezone('utc', now())
      WHERE id = NEW.pool_id;
    END IF;
    
    UPDATE public.piece_lp_positions
    SET fees_earned_currency = fees_earned_currency + NEW.lp_fee,
        updated_at = timezone('utc', now())
    WHERE pool_id = NEW.pool_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_pool_after_swap ON public.piece_amm_swaps;
CREATE TRIGGER trg_update_pool_after_swap
  AFTER INSERT ON public.piece_amm_swaps
  FOR EACH ROW EXECUTE FUNCTION public.update_pool_after_swap();

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

ALTER TABLE public.piece_liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_lp_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_amm_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_circuit_breakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Liquidity pools are public" ON public.piece_liquidity_pools;
DROP POLICY IF EXISTS "Users can create pools" ON public.piece_liquidity_pools;
DROP POLICY IF EXISTS "LP positions are public" ON public.piece_lp_positions;
DROP POLICY IF EXISTS "Users can manage own LP positions" ON public.piece_lp_positions;
DROP POLICY IF EXISTS "Swaps are public" ON public.piece_amm_swaps;
DROP POLICY IF EXISTS "Users can create swaps" ON public.piece_amm_swaps;
DROP POLICY IF EXISTS "Circuit breakers are public" ON public.piece_circuit_breakers;
DROP POLICY IF EXISTS "Alerts are public" ON public.piece_price_alerts;

CREATE POLICY "Liquidity pools are public" ON public.piece_liquidity_pools FOR SELECT USING (true);
CREATE POLICY "Users can create pools" ON public.piece_liquidity_pools FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "LP positions are public" ON public.piece_lp_positions FOR SELECT USING (true);
CREATE POLICY "Users can manage own LP positions" ON public.piece_lp_positions FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Swaps are public" ON public.piece_amm_swaps FOR SELECT USING (true);
CREATE POLICY "Users can create swaps" ON public.piece_amm_swaps FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Circuit breakers are public" ON public.piece_circuit_breakers FOR SELECT USING (true);
CREATE POLICY "Alerts are public" ON public.piece_price_alerts FOR SELECT USING (true);

SELECT 'AMM Migration Complete! Note: Circuit breaker logic needs manual implementation.' as status;
