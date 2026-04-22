-- AMM Liquidity Pools for Pieces Market
-- Constant Product Market Maker (x * y = k) implementation
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. LIQUIDITY POOLS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_liquidity_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  
  -- Pool reserves (pieces and currency)
  pieces_reserve numeric(24,8) NOT NULL DEFAULT 0,
  currency_reserve numeric(24,8) NOT NULL DEFAULT 0,
  
  -- Constant product (x * y = k)
  k_constant numeric(38,16) NOT NULL DEFAULT 0,
  
  -- Pool parameters
  swap_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0030, -- 0.3% default (lower than order book)
  protocol_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0005, -- 0.05% to platform
  lp_fee_percent numeric(5,4) NOT NULL DEFAULT 0.0025, -- 0.25% to LPs
  
  -- Pool status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  
  -- Price tracking
  last_price numeric(24,8),
  price_24h_ago numeric(24,8),
  volume_24h numeric(24,8) DEFAULT 0,
  
  -- Creation info
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
  
  -- LP tokens represent share of pool
  lp_tokens numeric(24,8) NOT NULL DEFAULT 0,
  
  -- Tracked for impermanent loss calculation
  pieces_deposited numeric(24,8) NOT NULL DEFAULT 0,
  currency_deposited numeric(24,8) NOT NULL DEFAULT 0,
  
  -- Fees earned
  fees_earned_pieces numeric(24,8) DEFAULT 0,
  fees_earned_currency numeric(24,8) DEFAULT 0,
  
  -- Entry tracking
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
  
  -- Swap details
  swap_type text NOT NULL CHECK (swap_type IN ('pieces_to_currency', 'currency_to_pieces')),
  trader_id uuid NOT NULL REFERENCES public.users(id),
  
  -- Amounts
  amount_in numeric(24,8) NOT NULL,
  amount_out numeric(24,8) NOT NULL,
  
  -- Fees
  swap_fee numeric(24,8) NOT NULL,
  protocol_fee numeric(24,8) NOT NULL,
  lp_fee numeric(24,8) NOT NULL,
  
  -- Price impact
  price_before numeric(24,8) NOT NULL,
  price_after numeric(24,8) NOT NULL,
  price_impact_percent numeric(8,4) NOT NULL,
  
  -- Slippage check
  expected_amount_out numeric(24,8) NOT NULL,
  minimum_amount_out numeric(24,8) NOT NULL, -- Slippage protection
  slippage_percent numeric(5,4) NOT NULL,
  
  -- Status
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Metadata
  transaction_hash text, -- For blockchain integration
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
  
  -- Breaker settings
  max_price_change_1h_percent numeric(5,2) NOT NULL DEFAULT 20.00, -- 20% max swing per hour
  max_price_change_24h_percent numeric(5,2) NOT NULL DEFAULT 100.00, -- 100% per day
  max_volume_spike_multiplier numeric(5,2) NOT NULL DEFAULT 10.00, -- 10x normal volume
  
  -- Cooldown settings
  cooldown_minutes integer NOT NULL DEFAULT 15,
  
  -- Current state
  is_triggered boolean DEFAULT false,
  triggered_at timestamptz,
  trigger_reason text,
  last_triggered_at timestamptz,
  triggered_count integer DEFAULT 0,
  
  -- Auto-reset
  auto_reset_after_minutes integer DEFAULT 60,
  reset_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_circuit_breakers_pool ON public.piece_circuit_breakers(pool_id);
CREATE INDEX IF NOT EXISTS idx_piece_circuit_breakers_triggered ON public.piece_circuit_breakers(is_triggered);

-- =====================================================
-- 5. PRICE ALERTS & MONITORING
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
-- 6. FUNCTIONS FOR AMM CALCULATIONS
-- =====================================================

-- Calculate output amount for a swap using constant product formula
CREATE OR REPLACE FUNCTION public.calculate_swap_output(
  amount_in numeric,
  reserve_in numeric,
  reserve_out numeric,
  fee_percent numeric
)
RETURNS numeric AS $$
DECLARE
  amount_in_with_fee numeric;
  numerator numeric;
  denominator numeric;
  amount_out numeric;
BEGIN
  -- Apply fee
  amount_in_with_fee := amount_in * (1 - fee_percent);
  
  -- Constant product formula: (x + dx) * (y - dy) = x * y
  -- Solving for dy: dy = (y * dx) / (x + dx)
  numerator := reserve_out * amount_in_with_fee;
  denominator := reserve_in + amount_in_with_fee;
  
  IF denominator = 0 THEN
    RETURN 0;
  END IF;
  
  amount_out := numerator / denominator;
  
  RETURN GREATEST(0, amount_out);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate price impact of a swap
CREATE OR REPLACE FUNCTION public.calculate_price_impact(
  amount_in numeric,
  reserve_in numeric,
  reserve_out numeric
)
RETURNS numeric AS $$
DECLARE
  spot_price numeric;
  execution_price numeric;
  impact numeric;
BEGIN
  IF reserve_in = 0 OR reserve_out = 0 THEN
    RETURN 0;
  END IF;
  
  -- Spot price = reserve_out / reserve_in
  spot_price := reserve_out / reserve_in;
  
  -- Execution price = amount_out / amount_in
  execution_price := (reserve_out * amount_in / (reserve_in + amount_in)) / amount_in;
  
  -- Price impact = (spot - execution) / spot
  impact := (spot_price - execution_price) / spot_price;
  
  RETURN impact * 100; -- Return as percentage
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate LP tokens to mint for a deposit
CREATE OR REPLACE FUNCTION public.calculate_lp_tokens(
  pieces_to_deposit numeric,
  currency_to_deposit numeric,
  current_pieces_reserve numeric,
  current_currency_reserve numeric,
  current_total_lp_tokens numeric
)
RETURNS numeric AS $$
DECLARE
  pieces_share numeric;
  currency_share numeric;
  lp_tokens numeric;
BEGIN
  -- For first deposit, LP tokens = sqrt(pieces * currency) (geometric mean)
  IF current_total_lp_tokens = 0 THEN
    RETURN SQRT(pieces_to_deposit * currency_to_deposit);
  END IF;
  
  -- For subsequent deposits, proportional to reserves
  pieces_share := pieces_to_deposit / current_pieces_reserve;
  currency_share := currency_to_deposit / current_currency_reserve;
  
  -- Use minimum to prevent manipulation
  lp_tokens := LEAST(pieces_share, currency_share) * current_total_lp_tokens;
  
  RETURN lp_tokens;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update pool reserves after swap
CREATE OR REPLACE FUNCTION public.update_pool_after_swap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    -- Update pool reserves
    IF NEW.swap_type = 'pieces_to_currency' THEN
      UPDATE public.piece_liquidity_pools
      SET pieces_reserve = pieces_reserve + NEW.amount_in,
          currency_reserve = currency_reserve - NEW.amount_out,
          k_constant = (pieces_reserve + NEW.amount_in) * (currency_reserve - NEW.amount_out),
          last_price = (currency_reserve - NEW.amount_out) / (pieces_reserve + NEW.amount_in),
          volume_24h = volume_24h + NEW.amount_in * NEW.price_before,
          updated_at = timezone('utc', now())
      WHERE id = NEW.pool_id;
    ELSE -- currency_to_pieces
      UPDATE public.piece_liquidity_pools
      SET currency_reserve = currency_reserve + NEW.amount_in,
          pieces_reserve = pieces_reserve - NEW.amount_out,
          k_constant = (currency_reserve + NEW.amount_in) * (pieces_reserve - NEW.amount_out),
          last_price = (currency_reserve + NEW.amount_in) / (pieces_reserve - NEW.amount_out),
          volume_24h = volume_24h + NEW.amount_in,
          updated_at = timezone('utc', now())
      WHERE id = NEW.pool_id;
    END IF;
    
    -- Update LP fee earnings
    UPDATE public.piece_lp_positions
    SET fees_earned_currency = fees_earned_currency + NEW.lp_fee,
        updated_at = timezone('utc', now())
    WHERE pool_id = NEW.pool_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_pool_after_swap
  AFTER INSERT ON public.piece_amm_swaps
  FOR EACH ROW EXECUTE FUNCTION public.update_pool_after_swap();

-- =====================================================
-- 7. CIRCUIT BREAKER CHECK FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_circuit_breaker(
  p_pool_id uuid,
  p_price_before numeric,
  p_price_after numeric
)
RETURNS boolean AS $$
DECLARE
  v_breaker public.piece_circuit_breakers%ROWTYPE;
  v_price_change_percent numeric;
  v_is_triggered boolean := false;
  v_reason text;
BEGIN
  -- Get breaker settings
  v_breaker := (
    SELECT t.*
    FROM public.piece_circuit_breakers t
    WHERE pool_id = p_pool_id
    LIMIT 1
  );
  
  IF v_breaker.id IS NULL THEN
    RETURN false; -- No breaker configured
  END IF;
  
  -- Check if already triggered and in cooldown
  IF v_breaker.is_triggered THEN
    IF v_breaker.reset_at > timezone('utc', now()) THEN
      RETURN true; -- Still in cooldown
    ELSE
      -- Auto-reset
      UPDATE public.piece_circuit_breakers
      SET is_triggered = false,
          reset_at = null,
          triggered_at = null,
          trigger_reason = null,
          updated_at = timezone('utc', now())
      WHERE id = v_breaker.id;
      
      RETURN false;
    END IF;
  END IF;
  
  -- Calculate price change
  IF p_price_before > 0 THEN
    v_price_change_percent := ABS((p_price_after - p_price_before) / p_price_before * 100);
  ELSE
    v_price_change_percent := 0;
  END IF;
  
  -- Check against limits
  IF v_price_change_percent > v_breaker.max_price_change_1h_percent THEN
    v_is_triggered := true;
    v_reason := format('Price moved %.2f%% in 1 hour (limit: %.2f%%)', 
                       v_price_change_percent, v_breaker.max_price_change_1h_percent);
  END IF;
  
  IF v_is_triggered THEN
    -- Trigger the breaker
    UPDATE public.piece_circuit_breakers
    SET is_triggered = true,
        triggered_at = timezone('utc', now()),
        trigger_reason = v_reason,
        last_triggered_at = timezone('utc', now()),
        triggered_count = triggered_count + 1,
        reset_at = timezone('utc', now()) + (v_breaker.cooldown_minutes || ' minutes')::interval,
        updated_at = timezone('utc', now())
    WHERE id = v_breaker.id;
    
    -- Create alert
    INSERT INTO public.piece_price_alerts (pool_id, alert_type, severity, message, details)
    VALUES (
      p_pool_id,
      'circuit_breaker',
      'critical',
      v_reason,
      jsonb_build_object(
        'price_before', p_price_before,
        'price_after', p_price_after,
        'price_change_percent', v_price_change_percent
      )
    );
    
    -- Pause the pool
    UPDATE public.piece_liquidity_pools
    SET status = 'paused',
        updated_at = timezone('utc', now())
    WHERE id = p_pool_id;
  END IF;
  
  RETURN v_is_triggered;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

ALTER TABLE public.piece_liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_lp_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_amm_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_circuit_breakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_price_alerts ENABLE ROW LEVEL SECURITY;

-- Liquidity pools are public
DROP POLICY IF EXISTS "Liquidity pools are public" ON public.piece_liquidity_pools;
CREATE POLICY "Liquidity pools are public" ON public.piece_liquidity_pools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create pools" ON public.piece_liquidity_pools;
CREATE POLICY "Users can create pools" ON public.piece_liquidity_pools FOR INSERT WITH CHECK (auth.uid() = created_by);

-- LP positions
DROP POLICY IF EXISTS "LP positions are public" ON public.piece_lp_positions;
CREATE POLICY "LP positions are public" ON public.piece_lp_positions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own LP positions" ON public.piece_lp_positions;
CREATE POLICY "Users can manage own LP positions" ON public.piece_lp_positions 
  FOR ALL USING (auth.uid() = provider_id);

-- Swaps are public record
DROP POLICY IF EXISTS "Swaps are public" ON public.piece_amm_swaps;
CREATE POLICY "Swaps are public" ON public.piece_amm_swaps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create swaps" ON public.piece_amm_swaps;
CREATE POLICY "Users can create swaps" ON public.piece_amm_swaps FOR INSERT WITH CHECK (auth.uid() = trader_id);

-- Circuit breakers (admin only for modifications)
DROP POLICY IF EXISTS "Circuit breakers are public" ON public.piece_circuit_breakers;
CREATE POLICY "Circuit breakers are public" ON public.piece_circuit_breakers FOR SELECT USING (true);

-- Alerts
DROP POLICY IF EXISTS "Alerts are public" ON public.piece_price_alerts;
CREATE POLICY "Alerts are public" ON public.piece_price_alerts FOR SELECT USING (true);

notify pgrst, 'reload schema';
