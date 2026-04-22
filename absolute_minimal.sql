-- ABSOLUTE MINIMAL - NO POLICIES AT ALL
-- Just tables and stub function

-- Tables only
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

CREATE TABLE IF NOT EXISTS public.piece_revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  revenue_type text NOT NULL CHECK (revenue_type IN (
    'trading_fees', 'content_ad_revenue', 'moment_ticket_sales',
    'moment_sponsorship', 'host_booking_fees', 'venue_rental',
    'merchandise_sales', 'licensing'
  )),
  gross_revenue numeric(14,4) NOT NULL DEFAULT 0,
  net_revenue numeric(14,4) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  transaction_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

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

CREATE TABLE IF NOT EXISTS public.piece_governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id uuid NOT NULL,
  proposal_type text NOT NULL CHECK (proposal_type IN (
    'content_update', 'moment_scheduling', 'host_feature',
    'venue_improvement', 'revenue_allocation', 'fee_adjustment'
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

-- Simple stub function only
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;
DROP FUNCTION IF EXISTS public.calculate_piece_dividends;

CREATE OR REPLACE FUNCTION public.calculate_piece_dividends(
  p_piece_type text,
  p_asset_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
) RETURNS uuid AS $$
BEGIN
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- RLS enable (no policies)
ALTER TABLE public.piece_fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_dividend_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_lockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_price_oracles ENABLE ROW LEVEL SECURITY;
