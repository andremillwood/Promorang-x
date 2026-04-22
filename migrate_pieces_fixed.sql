-- Pieces Trading Infrastructure & Revenue Distribution
-- FIXED VERSION - Handles existing policies
-- Timestamp: 2026-04-19

-- =====================================================
-- 1. PIECE TRADING FEE STRUCTURE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  fee_type text NOT NULL CHECK (fee_type IN ('platform', 'creator', 'liquidity', 'referral')),
  fee_percent numeric(5,4) NOT NULL CHECK (fee_percent >= 0 AND fee_percent <= 1),
  minimum_fee numeric(12,4) DEFAULT 0,
  maximum_fee numeric(12,4),
  is_active boolean DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT timezone('utc', now()),
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Default fee structures (1% platform, 0.5% creator royalty, 0.5% liquidity)
INSERT INTO public.piece_fee_structures (piece_type, fee_type, fee_percent) VALUES
  ('content', 'platform', 0.0100),
  ('content', 'creator', 0.0050),
  ('content', 'liquidity', 0.0050),
  ('moment', 'platform', 0.0150),
  ('moment', 'creator', 0.0100),
  ('moment', 'liquidity', 0.0050),
  ('host', 'platform', 0.0100),
  ('host', 'creator', 0.0050),
  ('host', 'liquidity', 0.0050),
  ('venue', 'platform', 0.0100),
  ('venue', 'creator', 0.0050),
  ('venue', 'liquidity', 0.0050)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. PIECE REVENUE SOURCES (For Dividends)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  revenue_type text NOT NULL CHECK (revenue_type IN (
    'trading_fees',
    'content_ad_revenue',
    'moment_ticket_sales',
    'moment_sponsorship',
    'host_booking_fees',
    'venue_rental',
    'merchandise_sales',
    'licensing'
  )),
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  transaction_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_asset ON public.piece_revenue_sources(piece_type, asset_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_piece_revenue_sources_period ON public.piece_revenue_sources(period_start, period_end);

-- =====================================================
-- 3. PIECE DIVIDENDS (Revenue Distribution to Holders)
-- =====================================================

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
  distribution_status text NOT NULL DEFAULT 'pending' CHECK (distribution_status IN ('pending', 'processing', 'distributed', 'failed')),
  distributed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_dividends_asset ON public.piece_dividends(piece_type, asset_id, distribution_period_end DESC);
CREATE INDEX IF NOT EXISTS idx_piece_dividends_status ON public.piece_dividends(distribution_status);

-- =====================================================
-- 4. PIECE DIVIDEND CLAIMS (Individual Holder Claims)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_dividend_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dividend_id uuid NOT NULL REFERENCES public.piece_dividends(id) ON DELETE CASCADE,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pieces_held_at_snapshot integer NOT NULL,
  dividend_amount numeric(14,4) NOT NULL,
  claim_status text NOT NULL DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'claimed', 'auto_distributed')),
  claimed_at timestamptz,
  auto_distributed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(dividend_id, holder_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_dividend_claims_holder ON public.piece_dividend_claims(holder_id, claim_status);
CREATE INDEX IF NOT EXISTS idx_piece_dividend_claims_dividend ON public.piece_dividend_claims(dividend_id);

-- =====================================================
-- 5. PIECE GOVERNANCE (Holder Voting)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  proposal_type text NOT NULL CHECK (proposal_type IN (
    'content_update',
    'moment_scheduling',
    'host_feature',
    'venue_improvement',
    'revenue_allocation',
    'fee_adjustment'
  )),
  title text NOT NULL,
  description text NOT NULL,
  proposed_by uuid NOT NULL REFERENCES public.users(id),
  voting_starts_at timestamptz NOT NULL,
  voting_ends_at timestamptz NOT NULL,
  execution_threshold_percent numeric(5,2) NOT NULL DEFAULT 50.00,
  min_participation_percent numeric(5,2) NOT NULL DEFAULT 10.00,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'passed', 'failed', 'executed', 'cancelled')),
  result_for_votes integer DEFAULT 0,
  result_against_votes integer DEFAULT 0,
  result_abstain_votes integer DEFAULT 0,
  result_total_voting_power numeric(18,4) DEFAULT 0,
  executed_at timestamptz,
  execution_tx_id text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_governance_asset ON public.piece_governance_proposals(piece_type, asset_id, status);
CREATE INDEX IF NOT EXISTS idx_piece_governance_status ON public.piece_governance_proposals(status, voting_ends_at);

CREATE TABLE IF NOT EXISTS public.piece_governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.piece_governance_proposals(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  voting_power numeric(18,4) NOT NULL,
  pieces_held_at_vote integer NOT NULL,
  vote_reason text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(proposal_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_governance_votes_proposal ON public.piece_governance_votes(proposal_id, vote);
CREATE INDEX IF NOT EXISTS idx_piece_governance_votes_voter ON public.piece_governance_votes(voter_id);

-- =====================================================
-- 6. PIECE MINTING/ISSUANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  issuer_id uuid NOT NULL REFERENCES public.users(id),
  issuance_type text NOT NULL CHECK (issuance_type IN ('initial', 'additional', 'airdrop', 'reward')),
  total_pieces_issued integer NOT NULL CHECK (total_pieces_issued > 0),
  initial_price numeric(14,4) NOT NULL,
  pieces_available integer NOT NULL,
  pieces_locked integer DEFAULT 0,
  lock_release_schedule jsonb,
  vesting_start_date timestamptz,
  vesting_end_date timestamptz,
  market_opened_at timestamptz,
  market_closed_at timestamptz,
  issuance_status text NOT NULL DEFAULT 'pending' CHECK (issuance_status IN ('pending', 'active', 'paused', 'closed', 'cancelled')),
  regulatory_disclaimer text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_issuances_asset ON public.piece_issuances(piece_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_piece_issuances_issuer ON public.piece_issuances(issuer_id);
CREATE INDEX IF NOT EXISTS idx_piece_issuances_status ON public.piece_issuances(issuance_status);

-- =====================================================
-- 7. PIECE LOCKUPS (Vesting/Restrictions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_lockups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  holder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lockup_type text NOT NULL CHECK (lockup_type IN ('vesting', 'contractual', 'governance', 'staking')),
  locked_pieces integer NOT NULL CHECK (locked_pieces > 0),
  unlock_schedule jsonb NOT NULL,
  total_unlocked integer DEFAULT 0,
  lockup_start_date timestamptz NOT NULL,
  lockup_end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_piece_lockups_holder ON public.piece_lockups(holder_id, is_active);
CREATE INDEX IF NOT EXISTS idx_piece_lockups_asset ON public.piece_lockups(piece_type, asset_id);

-- =====================================================
-- 8. CREATOR ECONOMICS INTEGRATION
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'piece_trade_royalty' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'creator_revenue_source')
  ) THEN
    ALTER TYPE public.creator_revenue_source ADD VALUE 'piece_trade_royalty';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'piece_dividend' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'creator_revenue_source')
  ) THEN
    ALTER TYPE public.creator_revenue_source ADD VALUE 'piece_dividend';
  END IF;
END $$;

-- =====================================================
-- 9. PIECE PRICE ORACLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.piece_price_oracles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  oracle_type text NOT NULL CHECK (oracle_type IN ('engagement', 'revenue', 'hybrid', 'manual')),
  data_sources jsonb NOT NULL,
  update_frequency_minutes integer DEFAULT 60,
  last_update_at timestamptz,
  last_calculated_price numeric(14,4),
  confidence_score numeric(3,2) DEFAULT 1.00,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(piece_type, asset_id)
);

-- =====================================================
-- 10. FUNCTIONS FOR REVENUE DISTRIBUTION (FIXED)
-- =====================================================

-- Drop old function if exists (uses different table name)
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;
DROP FUNCTION IF EXISTS public.calculate_piece_dividends;

-- Create function with correct table references
CREATE OR REPLACE FUNCTION public.calculate_piece_dividends(
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
  GROUP BY id;
  
  -- Get total pieces from piece_holdings table
  SELECT COALESCE(SUM(pieces), 0)
  INTO v_total_pieces
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id;
  
  IF v_total_pieces = 0 OR v_total_revenue <= 0 THEN
    RETURN NULL;
  END IF;
  
  v_dividend_per_piece := (v_total_revenue * 0.50) / v_total_pieces;
  
  INSERT INTO public.piece_dividends (
    piece_type, asset_id, revenue_source_id,
    distribution_period_start, distribution_period_end,
    total_distribution_pool, pieces_eligible, dividend_per_piece
  ) VALUES (
    p_piece_type, p_asset_id, v_revenue_source_id,
    p_period_start, p_period_end,
    v_total_revenue * 0.50, v_total_pieces, v_dividend_per_piece
  ) RETURNING id INTO v_dividend_id;
  
  -- Create claims for all holders using piece_holdings
  INSERT INTO public.piece_dividend_claims (
    dividend_id, holder_id, pieces_held_at_snapshot, dividend_amount
  )
  SELECT 
    v_dividend_id,
    holder_id,
    pieces,
    pieces * v_dividend_per_piece
  FROM public.piece_holdings
  WHERE piece_type = p_piece_type
    AND asset_id = p_asset_id
    AND pieces > 0;
  
  RETURN v_dividend_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers (conditionally)
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
END $$;

-- =====================================================
-- 12. ENABLE RLS
-- =====================================================

ALTER TABLE public.piece_fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividend_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_lockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_price_oracles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. RLS POLICIES (SAFE - CHECKS IF EXISTS)
-- =====================================================

DO $$
BEGIN
  -- piece_fee_structures
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_fee_structures' AND policyname = 'Fee structures are public') THEN
    CREATE POLICY "Fee structures are public" ON public.piece_fee_structures FOR SELECT USING (true);
  END IF;
  
  -- piece_revenue_sources
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_revenue_sources' AND policyname = 'Revenue sources are public') THEN
    CREATE POLICY "Revenue sources are public" ON public.piece_revenue_sources FOR SELECT USING (true);
  END IF;
  
  -- piece_dividends
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_dividends' AND policyname = 'Dividends are public') THEN
    CREATE POLICY "Dividends are public" ON public.piece_dividends FOR SELECT USING (true);
  END IF;
  
  -- piece_dividend_claims
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_dividend_claims' AND policyname = 'Users can view own claims') THEN
    CREATE POLICY "Users can view own claims" ON public.piece_dividend_claims FOR SELECT USING (auth.uid() = holder_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_dividend_claims' AND policyname = 'Users can update own claims') THEN
    CREATE POLICY "Users can update own claims" ON public.piece_dividend_claims FOR UPDATE USING (auth.uid() = holder_id);
  END IF;
  
  -- piece_governance_proposals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_governance_proposals' AND policyname = 'Governance proposals are public') THEN
    CREATE POLICY "Governance proposals are public" ON public.piece_governance_proposals FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_governance_proposals' AND policyname = 'Users can create proposals') THEN
    CREATE POLICY "Users can create proposals" ON public.piece_governance_proposals FOR INSERT WITH CHECK (auth.uid() = proposed_by);
  END IF;
  
  -- piece_governance_votes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_governance_votes' AND policyname = 'Governance votes are public') THEN
    CREATE POLICY "Governance votes are public" ON public.piece_governance_votes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_governance_votes' AND policyname = 'Users can vote') THEN
    CREATE POLICY "Users can vote" ON public.piece_governance_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
  END IF;
  
  -- piece_issuances
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_issuances' AND policyname = 'Issuances are public') THEN
    CREATE POLICY "Issuances are public" ON public.piece_issuances FOR SELECT USING (true);
  END IF;
  
  -- piece_lockups
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_lockups' AND policyname = 'Users can view own lockups') THEN
    CREATE POLICY "Users can view own lockups" ON public.piece_lockups FOR SELECT USING (auth.uid() = holder_id);
  END IF;
  
  -- piece_price_oracles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'piece_price_oracles' AND policyname = 'Price oracles are public') THEN
    CREATE POLICY "Price oracles are public" ON public.piece_price_oracles FOR SELECT USING (true);
  END IF;
END $$;

notify pgrst, 'reload schema';
