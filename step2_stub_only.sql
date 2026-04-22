-- STEP 2: STUB FUNCTION ONLY (Minimal)
-- If complex functions fail, use this stub version

DROP FUNCTION IF EXISTS public.calculate_piece_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;

-- Simple stub that returns a UUID
CREATE OR REPLACE FUNCTION public.calculate_piece_dividends(
  p_piece_type public.piece_type,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS uuid 
LANGUAGE sql
AS $$
  SELECT gen_random_uuid();
$$;

-- Triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Create triggers using DO block
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
END;
$$;

SELECT 'Stub function and triggers created. Full implementation can be added later.' as status;
