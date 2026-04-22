/**
 * Pieces Dividend Service - Full Implementation
 * Calculates and distributes dividends to piece holders
 */

import { supabase } from '@/integrations/supabase/client';

interface CalculateDividendParams {
  pieceType: string;
  assetId: string;
  periodStart: Date;
  periodEnd: Date;
}

interface RevenueSource {
  id: string;
  net_revenue: number;
}

interface PieceHolding {
  holder_id: string;
  pieces: number;
}

/**
 * Calculate and distribute dividends for a piece type/asset
 * This replaces the PostgreSQL calculate_piece_dividends function
 */
export async function calculateAndDistributeDividends(
  params: CalculateDividendParams
): Promise<string | null> {
  const { pieceType, assetId, periodStart, periodEnd } = params;

  try {
    // Step 1: Get total revenue for the period
    const { data: revenueData, error: revenueError } = await supabase
      .from('piece_revenue_sources')
      .select('id, net_revenue')
      .eq('piece_type', pieceType)
      .eq('asset_id', assetId)
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString())
      .order('period_start', { ascending: false })
      .limit(1);

    if (revenueError) throw revenueError;
    if (!revenueData || revenueData.length === 0) {
      console.log('No revenue found for period');
      return null;
    }

    const revenueSource = revenueData[0];
    const totalRevenue = revenueData.reduce((sum, r) => sum + (r.net_revenue || 0), 0);

    if (totalRevenue <= 0) {
      console.log('No revenue to distribute');
      return null;
    }

    // Step 2: Get total pieces held
    const { data: holdings, error: holdingsError } = await supabase
      .from('piece_holdings')
      .select('holder_id, pieces')
      .eq('piece_type', pieceType)
      .eq('asset_id', assetId)
      .gt('pieces', 0);

    if (holdingsError) throw holdingsError;
    if (!holdings || holdings.length === 0) {
      console.log('No holders found');
      return null;
    }

    const totalPieces = holdings.reduce((sum, h) => sum + (h.pieces || 0), 0);
    if (totalPieces === 0) {
      console.log('No pieces in circulation');
      return null;
    }

    // Step 3: Calculate dividend per piece (50% of revenue to holders)
    const distributionPool = totalRevenue * 0.50;
    const dividendPerPiece = distributionPool / totalPieces;

    // Step 4: Create dividend record
    const { data: dividend, error: dividendError } = await supabase
      .from('piece_dividends')
      .insert({
        piece_type: pieceType,
        asset_id: assetId,
        revenue_source_id: revenueSource.id,
        distribution_period_start: periodStart.toISOString(),
        distribution_period_end: periodEnd.toISOString(),
        total_distribution_pool: distributionPool,
        pieces_eligible: totalPieces,
        dividend_per_piece: dividendPerPiece,
        distribution_status: 'pending'
      })
      .select()
      .single();

    if (dividendError) throw dividendError;
    if (!dividend) throw new Error('Failed to create dividend record');

    // Step 5: Create claims for all holders
    const claims = holdings.map((holding: PieceHolding) => ({
      dividend_id: dividend.id,
      holder_id: holding.holder_id,
      pieces_held_at_snapshot: holding.pieces,
      dividend_amount: holding.pieces * dividendPerPiece,
      claim_status: 'unclaimed'
    }));

    const { error: claimsError } = await supabase
      .from('piece_dividend_claims')
      .insert(claims);

    if (claimsError) throw claimsError;

    console.log(`Dividend ${dividend.id} created with ${claims.length} claims`);
    return dividend.id;

  } catch (error) {
    console.error('Error calculating dividends:', error);
    throw error;
  }
}

/**
 * Process all unclaimed dividends for a specific holder
 */
export async function processDividendClaims(holderId: string): Promise<number> {
  try {
    // Get all unclaimed claims for the holder
    const { data: claims, error } = await supabase
      .from('piece_dividend_claims')
      .select(`
        id,
        dividend_amount,
        piece_dividends!inner(id, distribution_status)
      `)
      .eq('holder_id', holderId)
      .eq('claim_status', 'unclaimed')
      .eq('piece_dividends.distribution_status', 'distributed');

    if (error) throw error;
    if (!claims || claims.length === 0) return 0;

    let totalClaimed = 0;

    // Process each claim
    for (const claim of claims) {
      // Update claim status
      const { error: updateError } = await supabase
        .from('piece_dividend_claims')
        .update({
          claim_status: 'claimed',
          claimed_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      if (updateError) {
        console.error(`Failed to update claim ${claim.id}:`, updateError);
        continue;
      }

      totalClaimed += claim.dividend_amount;
    }

    return totalClaimed;

  } catch (error) {
    console.error('Error processing dividend claims:', error);
    throw error;
  }
}

/**
 * Get dividend history for a holder
 */
export async function getHolderDividendHistory(
  holderId: string,
  pieceType?: string,
  assetId?: string
) {
  let query = supabase
    .from('piece_dividend_claims')
    .select(`
      *,
      piece_dividends(
        piece_type,
        asset_id,
        distribution_period_start,
        distribution_period_end,
        dividend_per_piece
      )
    `)
    .eq('holder_id', holderId)
    .order('created_at', { ascending: false });

  if (pieceType) {
    query = query.eq('piece_dividends.piece_type', pieceType);
  }

  if (assetId) {
    query = query.eq('piece_dividends.asset_id', assetId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Distribute a pending dividend (mark as distributed)
 */
export async function distributeDividend(dividendId: string): Promise<void> {
  const { error } = await supabase
    .from('piece_dividends')
    .update({
      distribution_status: 'distributed',
      distributed_at: new Date().toISOString()
    })
    .eq('id', dividendId);

  if (error) throw error;
}

/**
 * Auto-distribute dividends to all holders
 */
export async function autoDistributeDividend(dividendId: string): Promise<void> {
  // Get all unclaimed claims for this dividend
  const { data: claims, error: claimsError } = await supabase
    .from('piece_dividend_claims')
    .select('id, holder_id, dividend_amount')
    .eq('dividend_id', dividendId)
    .eq('claim_status', 'unclaimed');

  if (claimsError) throw claimsError;
  if (!claims || claims.length === 0) return;

  // Auto-distribute to each holder
  for (const claim of claims) {
    await supabase
      .from('piece_dividend_claims')
      .update({
        claim_status: 'auto_distributed',
        claimed_at: new Date().toISOString(),
        auto_distributed: true
      })
      .eq('id', claim.id);

    // Here you would integrate with your payment system
    // e.g., transfer funds to holder's wallet
    console.log(`Auto-distributed ${claim.dividend_amount} to holder ${claim.holder_id}`);
  }

  // Mark dividend as distributed
  await distributeDividend(dividendId);
}
