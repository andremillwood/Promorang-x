-- FULL DIVIDEND IMPLEMENTATION
-- Complete calculate_piece_dividends function with all logic
-- Run this AFTER step1_tables_only.sql has succeeded

-- First, drop any existing versions
DROP FUNCTION IF EXISTS public.calculate_piece_dividends(public.piece_type, uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.calculate_and_distribute_dividends;

-- Create the full implementation
CREATE OR REPLACE FUNCTION public.calculate_piece_dividends(
    p_piece_type public.piece_type,
    p_asset_id uuid,
    p_period_start timestamptz,
    p_period_end timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
AS $func$
DECLARE
    rev_id uuid;
    total_rev numeric(14,4);
    total_pcs integer;
    div_id uuid;
    per_pc numeric(14,8);
BEGIN
    -- Get revenue for the period
    SELECT 
        id, 
        COALESCE(SUM(net_revenue), 0::numeric)
    INTO 
        rev_id, 
        total_rev
    FROM 
        public.piece_revenue_sources
    WHERE 
        piece_type = p_piece_type
        AND asset_id = p_asset_id
        AND period_start >= p_period_start
        AND period_end <= p_period_end
    GROUP BY 
        id
    ORDER BY 
        period_start DESC
    LIMIT 1;

    -- Get total pieces from holdings
    SELECT 
        COALESCE(SUM(pieces), 0::bigint)
    INTO 
        total_pcs
    FROM 
        public.piece_holdings
    WHERE 
        piece_type = p_piece_type
        AND asset_id = p_asset_id;

    -- Check if we have enough to distribute
    IF total_pcs IS NULL OR total_pcs = 0 OR total_rev IS NULL OR total_rev <= 0 THEN
        RETURN NULL;
    END IF;

    -- Calculate dividend per piece (50% of revenue to holders)
    per_pc := (total_rev * 0.50) / total_pcs;

    -- Create the dividend record
    INSERT INTO public.piece_dividends (
        piece_type,
        asset_id,
        revenue_source_id,
        distribution_period_start,
        distribution_period_end,
        total_distribution_pool,
        pieces_eligible,
        dividend_per_piece,
        distribution_status
    ) VALUES (
        p_piece_type,
        p_asset_id,
        rev_id,
        p_period_start,
        p_period_end,
        total_rev * 0.50,
        total_pcs,
        per_pc,
        'pending'
    )
    RETURNING id INTO div_id;

    -- Create claims for all holders
    INSERT INTO public.piece_dividend_claims (
        dividend_id,
        holder_id,
        pieces_held_at_snapshot,
        dividend_amount,
        claim_status
    )
    SELECT 
        div_id,
        holder_id,
        pieces,
        pieces * per_pc,
        'unclaimed'
    FROM 
        public.piece_holdings
    WHERE 
        piece_type = p_piece_type
        AND asset_id = p_asset_id
        AND pieces > 0;

    RETURN div_id;
END;
$func$;

-- Verify it was created
SELECT 
    'Function created successfully!' as status,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'calculate_piece_dividends'
AND n.nspname = 'public';
