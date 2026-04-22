/**
 * Piece Dividend Service
 * Handles revenue distribution to piece holders
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const creatorEconomicsService = require('./creatorEconomicsService');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// REVENUE TRACKING
// =====================================================

/**
 * Record revenue from a specific source
 */
async function recordRevenue({
  pieceType,
  assetId,
  revenueType,
  grossAmount,
  transactionCount = 1,
  metadata = {},
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Calculate period (daily)
  const periodStart = new Date();
  periodStart.setHours(0, 0, 0, 0);
  
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 1);
  
  // Net revenue after platform fee (usually 50% to holders, 50% to creator/platform)
  const holderSharePercent = getHolderSharePercent(revenueType);
  const netRevenue = grossAmount * holderSharePercent;
  
  // Upsert revenue record
  const { data: existing, error: checkError } = await supabase
    .from('piece_revenue_sources')
    .select('id, gross_revenue, net_revenue, transaction_count')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('revenue_type', revenueType)
    .gte('period_start', periodStart.toISOString())
    .lt('period_start', periodEnd.toISOString())
    .maybeSingle();
  
  if (checkError) throw checkError;
  
  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('piece_revenue_sources')
      .update({
        gross_revenue: existing.gross_revenue + grossAmount,
        net_revenue: existing.net_revenue + netRevenue,
        transaction_count: existing.transaction_count + transactionCount,
        metadata: { ...existing.metadata, ...metadata },
      })
      .eq('id', existing.id);
    
    if (error) throw error;
    
    return { id: existing.id, amount: netRevenue, isNew: false };
  } else {
    // Create new
    const { data, error } = await supabase
      .from('piece_revenue_sources')
      .insert({
        piece_type: pieceType,
        asset_id: assetId,
        revenue_type: revenueType,
        gross_revenue: grossAmount,
        net_revenue: netRevenue,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        transaction_count: transactionCount,
        metadata,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { id: data.id, amount: netRevenue, isNew: true };
  }
}

function getHolderSharePercent(revenueType) {
  const shares = {
    trading_fees: 0.50,      // 50% to holders
    content_ad_revenue: 0.40, // 40% to holders
    moment_ticket_sales: 0.60, // 60% to holders
    moment_sponsorship: 0.50,
    host_booking_fees: 0.50,
    venue_rental: 0.40,
    merchandise_sales: 0.30,
    licensing: 0.50,
  };
  
  return shares[revenueType] || 0.50;
}

// =====================================================
// DIVIDEND DISTRIBUTION
// =====================================================

/**
 * Calculate and distribute dividends for a period
 */
async function distributeDividends({
  pieceType,
  assetId,
  periodStart,
  periodEnd,
  autoDistribute = true,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Get total revenue for period
  const { data: revenues, error: revError } = await supabase
    .from('piece_revenue_sources')
    .select('*')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd);
  
  if (revError) throw revError;
  
  if (!revenues || revenues.length === 0) {
    return { success: false, reason: 'No revenue recorded for period' };
  }
  
  const totalRevenue = revenues.reduce((sum, r) => sum + parseFloat(r.net_revenue), 0);
  
  if (totalRevenue <= 0) {
    return { success: false, reason: 'No distributable revenue' };
  }
  
  // 2. Get piece holders and their balances at snapshot time
  const config = getTableConfig(pieceType);
  const { data: holders, error: holdersError } = await supabase
    .from(config.positions)
    .select('holder_id, pieces_owned')
    .eq(config.idColumn, assetId)
    .gt('pieces_owned', 0);
  
  if (holdersError) throw holdersError;
  
  if (!holders || holders.length === 0) {
    return { success: false, reason: 'No holders to distribute to' };
  }
  
  const totalPieces = holders.reduce((sum, h) => sum + h.pieces_owned, 0);
  const dividendPerPiece = totalRevenue / totalPieces;
  
  // 3. Create dividend record
  const { data: dividend, error: divError } = await supabase
    .from('piece_dividends')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      distribution_period_start: periodStart,
      distribution_period_end: periodEnd,
      total_distribution_pool: totalRevenue,
      pieces_eligible: totalPieces,
      dividend_per_piece: dividendPerPiece,
      distribution_status: 'processing',
    })
    .select()
    .single();
  
  if (divError) throw divError;
  
  // 4. Create claims for each holder
  const claims = holders.map(h => ({
    dividend_id: dividend.id,
    holder_id: h.holder_id,
    pieces_held_at_snapshot: h.pieces_owned,
    dividend_amount: h.pieces_owned * dividendPerPiece,
    claim_status: autoDistribute ? 'auto_distributed' : 'unclaimed',
    auto_distributed: autoDistribute,
  }));
  
  const { error: claimsError } = await supabase
    .from('piece_dividend_claims')
    .insert(claims);
  
  if (claimsError) throw claimsError;
  
  // 5. If auto-distribute, process payments
  if (autoDistribute) {
    await processDividendPayments(dividend.id);
  }
  
  // 6. Update dividend status
  const { error: updateError } = await supabase
    .from('piece_dividends')
    .update({
      distribution_status: autoDistribute ? 'distributed' : 'pending',
      distributed_at: autoDistribute ? new Date().toISOString() : null,
    })
    .eq('id', dividend.id);
  
  if (updateError) throw updateError;
  
  // 7. Record in creator economics (for creator tracking)
  const assetOwner = await getAssetOwner(pieceType, assetId);
  if (assetOwner) {
    const platformShare = revenues.reduce((sum, r) => {
      const platformPortion = parseFloat(r.gross_revenue) - parseFloat(r.net_revenue);
      return sum + platformPortion;
    }, 0);
    
    await creatorEconomicsService.recordCreatorLedgerEntry({
      creatorId: assetOwner,
      sourceType: 'piece_dividend',
      unitCount: 1,
      unitAmount: platformShare,
      grossAmount: platformShare,
      creatorSharePercent: 100,
      creatorShareAmount: platformShare,
      metadata: {
        piece_type: pieceType,
        asset_id: assetId,
        dividend_id: dividend.id,
        total_distributed: totalRevenue,
        holder_count: holders.length,
      },
    });
  }
  
  return {
    success: true,
    dividendId: dividend.id,
    totalDistributed: totalRevenue,
    totalHolders: holders.length,
    dividendPerPiece,
    autoDistributed: autoDistribute,
  };
}

/**
 * Process dividend payments (credit user accounts)
 */
async function processDividendPayments(dividendId) {
  // This would integrate with the economy service to credit user balances
  // For now, we just mark claims as processed
  const { data: claims, error } = await supabase
    .from('piece_dividend_claims')
    .select('*')
    .eq('dividend_id', dividendId)
    .eq('claim_status', 'auto_distributed');
  
  if (error) throw error;
  
  // In production, this would:
  // 1. Credit each user's USD or gem balance
  // 2. Create transaction records
  // 3. Send notifications
  
  console.log(`[PieceDividend] Processed ${claims?.length || 0} dividend payments`);
  
  return { processed: claims?.length || 0 };
}

/**
 * Claim unclaimed dividends
 */
async function claimDividends(holderId, dividendIds = null) {
  if (!supabase) throw new Error('Database not available');
  
  let query = supabase
    .from('piece_dividend_claims')
    .select(`
      *,
      dividend:dividend_id(piece_type, asset_id, distribution_period_end)
    `)
    .eq('holder_id', holderId)
    .eq('claim_status', 'unclaimed');
  
  if (dividendIds) {
    query = query.in('dividend_id', dividendIds);
  }
  
  const { data: claims, error } = await query;
  
  if (error) throw error;
  
  if (!claims || claims.length === 0) {
    return { claimed: 0, totalAmount: 0 };
  }
  
  // Update claims to claimed
  const claimIds = claims.map(c => c.id);
  const { error: updateError } = await supabase
    .from('piece_dividend_claims')
    .update({
      claim_status: 'claimed',
      claimed_at: new Date().toISOString(),
    })
    .in('id', claimIds);
  
  if (updateError) throw updateError;
  
  // Process payments
  const totalAmount = claims.reduce((sum, c) => sum + parseFloat(c.dividend_amount), 0);
  
  // Credit user account (integrate with economy service)
  // await economyService.creditBalance(holderId, totalAmount, 'dividend');
  
  return {
    claimed: claims.length,
    totalAmount,
    claims: claims.map(c => ({
      dividendId: c.dividend_id,
      pieceType: c.dividend.piece_type,
      assetId: c.dividend.asset_id,
      amount: c.dividend_amount,
    })),
  };
}

// =====================================================
// DIVIDEND QUERIES
// =====================================================

/**
 * Get available dividends for a holder
 */
async function getAvailableDividends(holderId) {
  if (!supabase) return [];
  
  const { data: claims, error } = await supabase
    .from('piece_dividend_claims')
    .select(`
      *,
      dividend:dividend_id(
        piece_type,
        asset_id,
        distribution_period_start,
        distribution_period_end,
        dividend_per_piece
      )
    `)
    .eq('holder_id', holderId)
    .eq('claim_status', 'unclaimed')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return claims || [];
}

/**
 * Get dividend history for a holder
 */
async function getDividendHistory(holderId, limit = 20) {
  if (!supabase) return [];
  
  const { data: claims, error } = await supabase
    .from('piece_dividend_claims')
    .select(`
      *,
      dividend:dividend_id(
        piece_type,
        asset_id,
        distribution_period_start,
        distribution_period_end,
        dividend_per_piece,
        total_distribution_pool
      )
    `)
    .eq('holder_id', holderId)
    .in('claim_status', ['claimed', 'auto_distributed'])
    .order('claimed_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return claims || [];
}

/**
 * Get dividend history for an asset (for creator dashboard)
 */
async function getAssetDividendHistory(pieceType, assetId, limit = 12) {
  if (!supabase) return [];
  
  const { data: dividends, error } = await supabase
    .from('piece_dividends')
    .select(`
      *,
      revenue_source:revenue_source_id(*)
    `)
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('distribution_status', 'distributed')
    .order('distribution_period_end', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return dividends || [];
}

// =====================================================
// AUTOMATED DISTRIBUTION JOBS
// =====================================================

/**
 * Run daily dividend distribution job
 * Should be called by cron job
 */
async function runDailyDistribution() {
  if (!supabase) return { processed: 0 };
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date(yesterday);
  today.setDate(today.getDate() + 1);
  
  // Find all assets with revenue yesterday
  const { data: revenues, error } = await supabase
    .from('piece_revenue_sources')
    .select('piece_type, asset_id')
    .gte('period_start', yesterday.toISOString())
    .lt('period_start', today.toISOString())
    .group('piece_type, asset_id');
  
  if (error) throw error;
  
  const results = [];
  
  for (const rev of revenues || []) {
    try {
      const result = await distributeDividends({
        pieceType: rev.piece_type,
        assetId: rev.asset_id,
        periodStart: yesterday.toISOString(),
        periodEnd: today.toISOString(),
        autoDistribute: true,
      });
      
      results.push({
        pieceType: rev.piece_type,
        assetId: rev.asset_id,
        ...result,
      });
    } catch (err) {
      console.error(`[PieceDividend] Failed to distribute for ${rev.piece_type}/${rev.asset_id}:`, err);
      results.push({
        pieceType: rev.piece_type,
        assetId: rev.asset_id,
        success: false,
        error: err.message,
      });
    }
  }
  
  return {
    processed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
    period: {
      start: yesterday.toISOString(),
      end: today.toISOString(),
    },
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getTableConfig(pieceType) {
  const configs = {
    content: {
      positions: 'content_piece_positions',
      idColumn: 'content_id',
    },
    moment: {
      positions: 'moment_piece_positions',
      idColumn: 'moment_id',
    },
    host: {
      positions: 'host_piece_positions',
      idColumn: 'host_id',
    },
    venue: {
      positions: 'venue_piece_positions',
      idColumn: 'venue_id',
    },
  };
  
  return configs[pieceType];
}

async function getAssetOwner(pieceType, assetId) {
  const tableMap = {
    content: { table: 'content_items', ownerCol: 'creator_id' },
    moment: { table: 'moments', ownerCol: 'organizer_id' },
    host: { table: 'host_profiles', ownerCol: 'user_id' },
    venue: { table: 'venue_profiles', ownerCol: null },
  };
  
  const config = tableMap[pieceType];
  if (!config?.ownerCol) return null;
  
  const { data, error } = await supabase
    .from(config.table)
    .select(config.ownerCol)
    .eq('id', assetId)
    .single();
  
  if (error) return null;
  return data?.[config.ownerCol];
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  recordRevenue,
  distributeDividends,
  claimDividends,
  getAvailableDividends,
  getDividendHistory,
  getAssetDividendHistory,
  runDailyDistribution,
  processDividendPayments,
};
