-- Fractional Pieces Trading
-- Allows buying/selling fractions of pieces (e.g., 0.5 pieces)
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. ALTER POSITION TABLES TO SUPPORT DECIMALS
-- =====================================================

-- Content piece positions
ALTER TABLE IF EXISTS public.content_piece_positions 
  ALTER COLUMN pieces_owned TYPE numeric(24,8),
  ALTER COLUMN total_invested TYPE numeric(24,8),
  ALTER COLUMN avg_purchase_price TYPE numeric(24,8);

-- Moment piece positions
ALTER TABLE IF EXISTS public.moment_piece_positions 
  ALTER COLUMN pieces_owned TYPE numeric(24,8),
  ALTER COLUMN total_invested TYPE numeric(24,8),
  ALTER COLUMN avg_purchase_price TYPE numeric(24,8);

-- Host piece positions
ALTER TABLE IF EXISTS public.host_piece_positions 
  ALTER COLUMN pieces_owned TYPE numeric(24,8),
  ALTER COLUMN total_invested TYPE numeric(24,8),
  ALTER COLUMN avg_purchase_price TYPE numeric(24,8);

-- Venue piece positions
ALTER TABLE IF EXISTS public.venue_piece_positions 
  ALTER COLUMN pieces_owned TYPE numeric(24,8),
  ALTER COLUMN total_invested TYPE numeric(24,8),
  ALTER COLUMN avg_purchase_price TYPE numeric(24,8);

-- =====================================================
-- 2. ALTER PIECE STATS TO SUPPORT DECIMALS
-- =====================================================

ALTER TABLE IF EXISTS public.content_piece_stats 
  ALTER COLUMN total_pieces TYPE numeric(24,8),
  ALTER COLUMN available_pieces TYPE numeric(24,8),
  ALTER COLUMN volume_24h TYPE numeric(24,8),
  ALTER COLUMN market_cap TYPE numeric(24,8);

ALTER TABLE IF EXISTS public.moment_piece_stats 
  ALTER COLUMN total_pieces TYPE numeric(24,8),
  ALTER COLUMN available_pieces TYPE numeric(24,8),
  ALTER COLUMN volume_24h TYPE numeric(24,8),
  ALTER COLUMN market_cap TYPE numeric(24,8);

ALTER TABLE IF EXISTS public.host_piece_stats 
  ALTER COLUMN total_pieces TYPE numeric(24,8),
  ALTER COLUMN available_pieces TYPE numeric(24,8),
  ALTER COLUMN volume_24h TYPE numeric(24,8),
  ALTER COLUMN market_cap TYPE numeric(24,8);

ALTER TABLE IF EXISTS public.venue_piece_stats 
  ALTER COLUMN total_pieces TYPE numeric(24,8),
  ALTER COLUMN available_pieces TYPE numeric(24,8),
  ALTER COLUMN volume_24h TYPE numeric(24,8),
  ALTER COLUMN market_cap TYPE numeric(24,8);

-- =====================================================
-- 3. ALTER TRADES TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.piece_trades 
  ALTER COLUMN quantity TYPE numeric(24,8),
  ALTER COLUMN price_per_piece TYPE numeric(24,8),
  ALTER COLUMN total_value TYPE numeric(24,8);

-- =====================================================
-- 4. ALTER LISTINGS TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.piece_listings 
  ALTER COLUMN quantity TYPE numeric(24,8),
  ALTER COLUMN price_per_piece TYPE numeric(24,8),
  ADD COLUMN IF NOT EXISTS filled_quantity numeric(24,8) DEFAULT 0;

-- =====================================================
-- 5. ALTER ISSUANCES TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.piece_issuances 
  ALTER COLUMN total_pieces_issued TYPE numeric(24,8),
  ALTER COLUMN initial_price TYPE numeric(24,8),
  ALTER COLUMN pieces_available TYPE numeric(24,8),
  ALTER COLUMN pieces_locked TYPE numeric(24,8);

-- =====================================================
-- 6. ALTER LOCKUPS TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.piece_lockups 
  ALTER COLUMN locked_pieces TYPE numeric(24,8),
  ALTER COLUMN total_unlocked TYPE numeric(24,8);

-- =====================================================
-- 7. ALTER DIVIDENDS TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.piece_dividends 
  ALTER COLUMN total_distribution_pool TYPE numeric(24,8),
  ALTER COLUMN pieces_eligible TYPE numeric(24,8),
  ALTER COLUMN dividend_per_piece TYPE numeric(24,12);

ALTER TABLE IF EXISTS public.piece_dividend_claims 
  ALTER COLUMN pieces_held_at_snapshot TYPE numeric(24,8),
  ALTER COLUMN dividend_amount TYPE numeric(24,8);

-- =====================================================
-- 8. ALTER GOVERNANCE TABLES
-- =====================================================

ALTER TABLE IF EXISTS public.piece_governance_votes 
  ALTER COLUMN voting_power TYPE numeric(24,8),
  ALTER COLUMN pieces_held_at_vote TYPE numeric(24,8);

-- =====================================================
-- 9. MINIMUM TRADE AMOUNT SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_trading_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  
  -- Minimum trade amounts
  min_trade_amount_pieces numeric(24,8) NOT NULL DEFAULT 0.01,
  min_trade_amount_currency numeric(24,8) NOT NULL DEFAULT 1.00,
  
  -- Precision settings
  pieces_decimal_places integer NOT NULL DEFAULT 8,
  
  -- Display settings
  display_unit text DEFAULT 'pieces', -- or 'shares', 'tokens'
  
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  UNIQUE(piece_type, asset_id)
);

-- Insert default settings for all existing pieces
INSERT INTO public.piece_trading_settings (piece_type, asset_id, min_trade_amount_pieces)
SELECT 'content', id, 0.01
FROM public.content_items
WHERE NOT EXISTS (
  SELECT 1 FROM public.piece_trading_settings 
  WHERE piece_type = 'content' AND asset_id = public.content_items.id
);

-- =====================================================
-- 10. FUNCTIONS FOR FRACTIONAL CALCULATIONS
-- =====================================================

-- Round to specified decimal places
CREATE OR REPLACE FUNCTION public.round_pieces(
  amount numeric,
  decimal_places integer DEFAULT 8
)
RETURNS numeric AS $$
BEGIN
  RETURN ROUND(amount::numeric, decimal_places);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate minimum trade amount
DROP FUNCTION IF EXISTS public.validate_min_trade_amount(public.piece_type, uuid, numeric);
CREATE OR REPLACE FUNCTION public.validate_min_trade_amount(
  p_piece_type public.piece_type,
  p_asset_id uuid,
  p_amount numeric
)
RETURNS boolean AS $$
DECLARE
  v_settings public.piece_trading_settings%ROWTYPE;
BEGIN
  v_settings := (
    SELECT t.* FROM public.piece_trading_settings t
    WHERE piece_type = p_piece_type 
      AND asset_id = p_asset_id
      AND is_active = true
    LIMIT 1
  );
  
  IF v_settings.id IS NULL THEN
    RETURN p_amount >= 0.01; -- Default minimum
  END IF;
  
  RETURN p_amount >= v_settings.min_trade_amount_pieces;
END;
$$ LANGUAGE plpgsql;

-- Calculate voting power (fractional pieces count)
DROP FUNCTION IF EXISTS public.calculate_voting_power(public.piece_type, uuid, uuid);
CREATE OR REPLACE FUNCTION public.calculate_voting_power(
  p_piece_type public.piece_type,
  p_asset_id uuid,
  p_holder_id uuid
)
RETURNS numeric AS $$
DECLARE
  v_positions text;
  v_pieces numeric;
  v_table_name text;
  v_id_column text;
BEGIN
  -- Determine table based on piece type
  CASE p_piece_type
    WHEN 'content' THEN
      v_table_name := 'public.content_piece_positions';
      v_id_column := 'content_id';
    WHEN 'moment' THEN
      v_table_name := 'public.moment_piece_positions';
      v_id_column := 'moment_id';
    WHEN 'host' THEN
      v_table_name := 'public.host_piece_positions';
      v_id_column := 'host_id';
    WHEN 'venue' THEN
      v_table_name := 'public.venue_piece_positions';
      v_id_column := 'venue_id';
    ELSE
      RETURN 0;
  END CASE;
  
  -- Dynamic query (safe because inputs are validated enums/columns)
  v_pieces := 0;
  FOR v_pieces IN EXECUTE format(
    'SELECT COALESCE(pieces_owned, 0) FROM %I WHERE %I = $1 AND holder_id = $2',
    v_table_name, v_id_column
  ) USING p_asset_id, p_holder_id LOOP
    EXIT;
  END LOOP;
  
  RETURN COALESCE(v_pieces, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. UPDATE TRIGGERS FOR FRACTIONAL HANDLING
-- =====================================================

-- Ensure positions never go negative with fractions
DROP FUNCTION IF EXISTS public.check_piece_position_non_negative();
CREATE OR REPLACE FUNCTION public.check_piece_position_non_negative()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pieces_owned < 0 THEN
    RAISE EXCEPTION 'Piece position cannot be negative: %', NEW.pieces_owned;
  END IF;
  
  -- Round to 8 decimal places
  NEW.pieces_owned := ROUND(NEW.pieces_owned, 8);
  NEW.total_invested := ROUND(NEW.total_invested, 8);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all position tables
DO $$
BEGIN
  -- Content positions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_piece_positions') THEN
    DROP TRIGGER IF EXISTS trg_content_positions_check ON public.content_piece_positions;
    CREATE TRIGGER trg_content_positions_check
      BEFORE INSERT OR UPDATE ON public.content_piece_positions
      FOR EACH ROW EXECUTE FUNCTION public.check_piece_position_non_negative();
  END IF;
  
  -- Moment positions  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'moment_piece_positions') THEN
    DROP TRIGGER IF EXISTS trg_moment_positions_check ON public.moment_piece_positions;
    CREATE TRIGGER trg_moment_positions_check
      BEFORE INSERT OR UPDATE ON public.moment_piece_positions
      FOR EACH ROW EXECUTE FUNCTION public.check_piece_position_non_negative();
  END IF;
  
  -- Host positions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_piece_positions') THEN
    DROP TRIGGER IF EXISTS trg_host_positions_check ON public.host_piece_positions;
    CREATE TRIGGER trg_host_positions_check
      BEFORE INSERT OR UPDATE ON public.host_piece_positions
      FOR EACH ROW EXECUTE FUNCTION public.check_piece_position_non_negative();
  END IF;
  
  -- Venue positions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_piece_positions') THEN
    DROP TRIGGER IF EXISTS trg_venue_positions_check ON public.venue_piece_positions;
    CREATE TRIGGER trg_venue_positions_check
      BEFORE INSERT OR UPDATE ON public.venue_piece_positions
      FOR EACH ROW EXECUTE FUNCTION public.check_piece_position_non_negative();
  END IF;
END $$;

-- =====================================================
-- 12. RLS POLICIES FOR TRADING SETTINGS
-- =====================================================

ALTER TABLE public.piece_trading_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trading settings are public" ON public.piece_trading_settings;
CREATE POLICY "Trading settings are public" ON public.piece_trading_settings FOR SELECT USING (true);

notify pgrst, 'reload schema';
