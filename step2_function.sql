-- STEP 2: CREATE FUNCTION ONLY
-- Run this AFTER step1_tables_only.sql has succeeded

-- Drop old functions
DROP FUNCTION IF EXISTS public.calculate_piece_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;

-- Create the main dividend calculation function
CREATE OR REPLACE FUNCTION public.calculate_piece_dividends(
  p_piece_type public.piece_type,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS uuid 
LANGUAGE plpgsql
AS $$
DECLARE
  revenue_id uuid;
  total_rev numeric(14,4);
  total_pieces integer;
  dividend_id uuid;
  per_piece numeric(14,8);
BEGIN
  -- Get revenue for period
  SELECT id, COALESCE(SUM(net_revenue), 0)
  INTO revenue_id, total_rev
  FROM public.piece_revenue_sources
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id
    AND period_start >= p_period_start
    AND period_end <= p_period_end
  GROUP BY id
  ORDER BY period_start DESC
  LIMIT 1;
  
  -- Get total pieces from piece_holdings table
  SELECT COALESCE(SUM(pieces), 0)
  INTO total_pieces
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id;
  
  IF total_pieces = 0 OR total_rev <= 0 THEN
    RETURN NULL;
  END IF;
  
  per_piece := (total_rev * 0.50) / total_pieces;
  
  INSERT INTO public.piece_dividends (
    piece_type, asset_id, revenue_source_id,
    distribution_period_start, distribution_period_end,
    total_distribution_pool, pieces_eligible, dividend_per_piece
  ) VALUES (
    p_piece_type, p_asset_id, revenue_id,
    p_period_start, p_period_end,
    total_rev * 0.50, total_pieces, per_piece
  ) RETURNING id INTO dividend_id;
  
  -- Create claims for all holders using piece_holdings
  INSERT INTO public.piece_dividend_claims (
    dividend_id, holder_id, pieces_held_at_snapshot, dividend_amount
  )
  SELECT 
    dividend_id,
    holder_id,
    pieces,
    pieces * per_piece
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id
    AND pieces > 0;
  
  RETURN dividend_id;
END;
$$;

-- Create triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_fee_structures_touch') THEN
    CREATE TRIGGER trg_piece_fee_structures_touch
      BEFORE UPDATE ON public.piece_fee_structures FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_issuances_touch') THEN
    CREATE TRIGGER trg_piece_issuances_touch
      BEFORE UPDATE ON public.piece_issuances FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_lockups_touch') THEN
    CREATE TRIGGER trg_piece_lockups_touch
      BEFORE UPDATE ON public.piece_lockups FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_price_oracles_touch') THEN
    CREATE TRIGGER trg_piece_price_oracles_touch
      BEFORE UPDATE ON public.piece_price_oracles FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_governance_proposals_touch') THEN
    CREATE TRIGGER trg_piece_governance_proposals_touch
      BEFORE UPDATE ON public.piece_governance_proposals FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_governance_votes_touch') THEN
    CREATE TRIGGER trg_piece_governance_votes_touch
      BEFORE UPDATE ON public.piece_governance_votes FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_piece_holdings_touch') THEN
    CREATE TRIGGER trg_piece_holdings_touch
      BEFORE UPDATE ON public.piece_holdings FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
  END IF;
END $$;

SELECT 'Step 2 Complete: Function and triggers created!' as status;
