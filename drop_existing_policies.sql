-- PRE-MIGRATION: Drop existing policies to avoid 42710 errors
-- Run this first, then run your migration

DROP POLICY IF EXISTS "Revenue sources are public" ON public.piece_revenue_sources;
DROP POLICY IF EXISTS "Fee structures are public" ON public.piece_fee_structures;
DROP POLICY IF EXISTS "Dividends are public" ON public.piece_dividends;
DROP POLICY IF EXISTS "Users can view own claims" ON public.piece_dividend_claims;
DROP POLICY IF EXISTS "Users can update own claims" ON public.piece_dividend_claims;
DROP POLICY IF EXISTS "Governance proposals are public" ON public.piece_governance_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON public.piece_governance_proposals;
DROP POLICY IF EXISTS "Governance votes are public" ON public.piece_governance_votes;
DROP POLICY IF EXISTS "Users can vote" ON public.piece_governance_votes;
DROP POLICY IF EXISTS "Issuances are public" ON public.piece_issuances;
DROP POLICY IF EXISTS "Users can view own lockups" ON public.piece_lockups;
DROP POLICY IF EXISTS "Price oracles are public" ON public.piece_price_oracles;

SELECT 'Existing policies dropped - you can now run the migration' as status;
