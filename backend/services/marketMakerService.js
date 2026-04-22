/**
 * Market Maker Bot Service
 * Automated liquidity provision and price stabilization
 * Seeds initial liquidity for new pieces and maintains orderly markets
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const pieceAMMService = require('./pieceAMMService');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const MARKET_MAKER_CONFIG = {
  // Initial liquidity settings
  initialPiecesRatio: 0.30,      // 30% of total supply for initial liquidity
  initialCurrencyRatio: 0.15,    // 15% of piece value in currency
  
  // Rebalancing thresholds
  priceDeviationThreshold: 0.10,  // 10% deviation triggers rebalance
  maxInventoryRatio: 0.60,        // Don't hold more than 60% of pieces
  minInventoryRatio: 0.05,        // Don't hold less than 5% of pieces
  
  // Spread settings
  targetSpread: 0.005,            // 0.5% target spread
  maxSpread: 0.02,              // 2% maximum spread
  
  // Intervention settings
  largeTradeThreshold: 0.20,      // 20% of pool = large trade
  interventionCooldown: 5 * 60 * 1000, // 5 minutes between interventions
};

// Bot wallet/identity
const MARKET_MAKER_USER_ID = process.env.MARKET_MAKER_USER_ID || '00000000-0000-0000-0000-000000000001';

// =====================================================
// INITIAL LIQUIDITY SEEDING
// =====================================================

/**
 * Seed initial liquidity for a new piece
 * Called when a piece IPO is launched
 */
async function seedInitialLiquidity({
  pieceType,
  assetId,
  totalPieces,
  initialPrice,
  pieceIssuerId,
}) {
  if (!supabase) {
    console.log('[MarketMaker] Skipping liquidity seed - no database');
    return { success: false, reason: 'No database' };
  }
  
  try {
    // Calculate initial reserves
    const piecesForPool = totalPieces * MARKET_MAKER_CONFIG.initialPiecesRatio;
    const currencyForPool = piecesForPool * initialPrice * MARKET_MAKER_CONFIG.initialCurrencyRatio;
    
    console.log(`[MarketMaker] Seeding liquidity for ${pieceType}/${assetId}`);
    console.log(`  Pieces: ${piecesForPool.toFixed(4)}`);
    console.log(`  Currency: $${currencyForPool.toFixed(2)}`);
    console.log(`  Initial price: $${initialPrice.toFixed(4)}`);
    
    // Create the liquidity pool
    const poolResult = await pieceAMMService.createPool({
      pieceType,
      assetId,
      initialPieces: piecesForPool,
      initialCurrency: currencyForPool,
      createdBy: MARKET_MAKER_USER_ID,
    });
    
    if (!poolResult.success) {
      throw new Error(`Failed to create pool: ${poolResult.error || 'Unknown error'}`);
    }
    
    // Record the seeding
    await supabase.from('market_maker_seeds').insert({
      piece_type: pieceType,
      asset_id: assetId,
      pool_id: poolResult.pool.id,
      pieces_seeded: piecesForPool,
      currency_seeded: currencyForPool,
      initial_price: initialPrice,
      target_spread: MARKET_MAKER_CONFIG.targetSpread,
    });
    
    // Set up monitoring for this pool
    await setupPoolMonitoring(poolResult.pool.id);
    
    return {
      success: true,
      pool_id: poolResult.pool.id,
      pieces_seeded: piecesForPool,
      currency_seeded: currencyForPool,
      lp_tokens: poolResult.lp_tokens,
    };
  } catch (error) {
    console.error('[MarketMaker] Seed liquidity error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Setup monitoring for a pool
 */
async function setupPoolMonitoring(poolId) {
  // In production, this would register with a monitoring service
  // For now, just log it
  console.log(`[MarketMaker] Pool ${poolId} added to monitoring`);
}

// =====================================================
// AUTOMATED MARKET MAKING
// =====================================================

/**
 * Run market making cycle for all active pools
 * Should be called by cron job every minute
 */
async function runMarketMakingCycle() {
  if (!supabase) return { processed: 0 };
  
  console.log('[MarketMaker] Running market making cycle...');
  
  try {
    // Get all pools we're monitoring
    const { data: seeds, error } = await supabase
      .from('market_maker_seeds')
      .select(`
        *,
        pool:pool_id(*)
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    
    const results = [];
    
    for (const seed of seeds || []) {
      try {
        const result = await managePoolLiquidity(seed);
        results.push({
          pool_id: seed.pool_id,
          ...result,
        });
      } catch (err) {
        console.error(`[MarketMaker] Error managing pool ${seed.pool_id}:`, err);
        results.push({
          pool_id: seed.pool_id,
          success: false,
          error: err.message,
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`[MarketMaker] Cycle complete. ${successful}/${results.length} pools managed`);
    
    return {
      processed: results.length,
      successful,
      results,
    };
  } catch (error) {
    console.error('[MarketMaker] Cycle error:', error);
    return {
      processed: 0,
      error: error.message,
    };
  }
}

/**
 * Manage liquidity for a specific pool
 */
async function managePoolLiquidity(seed) {
  const pool = seed.pool;
  
  if (!pool || pool.status !== 'active') {
    return { success: false, reason: 'Pool not active' };
  }
  
  // Get current market maker position
  const lpPosition = await pieceAMMService.getLpPosition(pool.id, MARKET_MAKER_USER_ID);
  
  if (!lpPosition || lpPosition.lp_tokens <= 0) {
    return { success: false, reason: 'No LP position' };
  }
  
  const totalLpTokens = await getTotalLpTokens(pool.id);
  const marketMakerShare = lpPosition.lp_tokens / totalLpTokens;
  
  // Calculate current inventory
  const piecesHeld = pool.pieces_reserve * marketMakerShare;
  const totalPieces = pool.pieces_reserve; // This would need to come from issuance data
  const inventoryRatio = piecesHeld / totalPieces;
  
  // Check if rebalancing needed
  const actions = [];
  
  // 1. Check inventory ratio
  if (inventoryRatio > MARKET_MAKER_CONFIG.maxInventoryRatio) {
    actions.push('reduce_inventory');
  } else if (inventoryRatio < MARKET_MAKER_CONFIG.minInventoryRatio) {
    actions.push('increase_inventory');
  }
  
  // 2. Check spread
  const currentSpread = await calculateCurrentSpread(pool.id);
  if (currentSpread > MARKET_MAKER_CONFIG.maxSpread) {
    actions.push('tighten_spread');
  }
  
  // Execute actions
  const executedActions = [];
  
  for (const action of actions) {
    try {
      switch (action) {
        case 'reduce_inventory':
          await reduceInventory(pool, lpPosition, marketMakerShare);
          executedActions.push('reduce_inventory');
          break;
        case 'increase_inventory':
          await increaseInventory(pool, lpPosition, marketMakerShare);
          executedActions.push('increase_inventory');
          break;
        case 'tighten_spread':
          await tightenSpread(pool, lpPosition);
          executedActions.push('tighten_spread');
          break;
      }
    } catch (err) {
      console.error(`[MarketMaker] Action ${action} failed:`, err);
    }
  }
  
  // Record activity
  await recordMarketMakerActivity(pool.id, actions, executedActions, {
    inventory_ratio: inventoryRatio,
    current_spread: currentSpread,
    market_maker_share: marketMakerShare,
  });
  
  return {
    success: true,
    actions_taken: executedActions,
    inventory_ratio: inventoryRatio,
    current_spread: currentSpread,
  };
}

/**
 * Reduce inventory by removing liquidity and selling pieces
 */
async function reduceInventory(pool, lpPosition, marketMakerShare) {
  // Calculate how much to reduce
  const targetRatio = (MARKET_MAKER_CONFIG.maxInventoryRatio + MARKET_MAKER_CONFIG.minInventoryRatio) / 2;
  const currentPieces = pool.pieces_reserve * marketMakerShare;
  const totalSupply = await getTotalSupply(pool.piece_type, pool.asset_id);
  const targetPieces = totalSupply * targetRatio;
  const piecesToSell = currentPieces - targetPieces;
  
  if (piecesToSell <= 0) return;
  
  console.log(`[MarketMaker] Reducing inventory: selling ${piecesToSell.toFixed(4)} pieces`);
  
  // Calculate LP tokens to withdraw proportional to pieces
  const lpTokensToWithdraw = (piecesToSell / currentPieces) * lpPosition.lp_tokens;
  
  // Remove liquidity
  await pieceAMMService.removeLiquidity({
    poolId: pool.id,
    providerId: MARKET_MAKER_USER_ID,
    lpTokensToRemove: lpTokensToWithdraw,
    minPiecesOut: piecesToSell * 0.95, // 5% slippage tolerance
    minCurrencyOut: 0,
  });
  
  // Sell the pieces
  await pieceAMMService.swapPiecesForCurrency({
    poolId: pool.id,
    traderId: MARKET_MAKER_USER_ID,
    piecesIn: piecesToSell * 0.9, // Sell 90% of withdrawn pieces
    minCurrencyOut: 0,
  });
}

/**
 * Increase inventory by buying pieces
 */
async function increaseInventory(pool, lpPosition, marketMakerShare) {
  // Calculate how much to buy
  const targetRatio = (MARKET_MAKER_CONFIG.maxInventoryRatio + MARKET_MAKER_CONFIG.minInventoryRatio) / 2;
  const currentPieces = pool.pieces_reserve * marketMakerShare;
  const totalSupply = await getTotalSupply(pool.piece_type, pool.asset_id);
  const targetPieces = totalSupply * targetRatio;
  const piecesToBuy = targetPieces - currentPieces;
  
  if (piecesToBuy <= 0) return;
  
  console.log(`[MarketMaker] Increasing inventory: buying ${piecesToBuy.toFixed(4)} pieces`);
  
  // Calculate currency needed
  const quote = await pieceAMMService.getSwapQuote(
    pool.id,
    'currency_to_pieces',
    piecesToBuy * pool.last_price * 1.1 // Add 10% buffer
  );
  
  if (!quote) return;
  
  // Buy pieces
  await pieceAMMService.swapCurrencyForPieces({
    poolId: pool.id,
    traderId: MARKET_MAKER_USER_ID,
    currencyIn: quote.amount_in,
    minPiecesOut: piecesToBuy,
  });
  
  // Add liquidity with new pieces + currency
  const newPosition = await pieceAMMService.getLpPosition(pool.id, MARKET_MAKER_USER_ID);
  const piecesToAdd = newPosition ? newPosition.pieces_owned : piecesToBuy;
  const currencyToAdd = piecesToAdd * pool.last_price;
  
  await pieceAMMService.addLiquidity({
    poolId: pool.id,
    providerId: MARKET_MAKER_USER_ID,
    piecesToAdd: piecesToAdd * 0.8, // Add 80% back to pool
    maxCurrencyToAdd: currencyToAdd * 1.5,
  });
}

/**
 * Tighten spread by adding more liquidity
 */
async function tightenSpread(pool, lpPosition) {
  console.log(`[MarketMaker] Tightening spread on pool ${pool.id}`);
  
  // Add liquidity to reduce spread
  const piecesToAdd = pool.pieces_reserve * 0.05; // Add 5% more
  const currencyToAdd = piecesToAdd * pool.last_price;
  
  await pieceAMMService.addLiquidity({
    poolId: pool.id,
    providerId: MARKET_MAKER_USER_ID,
    piecesToAdd: piecesToAdd,
    maxCurrencyToAdd: currencyToAdd * 1.2,
  });
}

// =====================================================
// INTERVENTION TRADING
// =====================================================

/**
 * Handle large trades that might destabilize the market
 */
async function handleLargeTrade(poolId, tradeSize, tradeType) {
  // Check if this is a market maker intervention trade
  const { data: pool } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .single();
  
  if (!pool) return;
  
  // Calculate trade impact
  const poolValue = pool.currency_reserve + (pool.pieces_reserve * pool.last_price);
  const tradeValue = tradeType === 'currency_to_pieces' 
    ? tradeSize 
    : tradeSize * pool.last_price;
  const tradeRatio = tradeValue / poolValue;
  
  // If trade is > 20% of pool, intervene
  if (tradeRatio > MARKET_MAKER_CONFIG.largeTradeThreshold) {
    console.log(`[MarketMaker] Large trade detected (${(tradeRatio * 100).toFixed(2)}% of pool)`);
    
    // Wait a bit for price to settle, then provide counter-liquidity
    setTimeout(async () => {
      await provideCounterLiquidity(poolId, tradeType);
    }, 30000); // 30 second delay
  }
}

/**
 * Provide counter-liquidity after large moves
 */
async function provideCounterLiquidity(poolId, lastTradeType) {
  try {
    const pool = await pieceAMMService.getPool(poolId);
    if (!pool) return;
    
    // Check if intervention cooldown has passed
    const lastIntervention = await getLastIntervention(poolId);
    if (lastIntervention && 
        (Date.now() - new Date(lastIntervention.created_at).getTime()) < MARKET_MAKER_CONFIG.interventionCooldown) {
      console.log(`[MarketMaker] Intervention cooldown active for pool ${poolId}`);
      return;
    }
    
    // Provide liquidity on the opposite side of the last trade
    if (lastTradeType === 'currency_to_pieces') {
      // Someone bought pieces, we should add more pieces to pool
      console.log(`[MarketMaker] Adding pieces to pool ${poolId}`);
      const piecesToAdd = pool.pieces_reserve * 0.03;
      const currencyToAdd = piecesToAdd * pool.last_price;
      
      await pieceAMMService.addLiquidity({
        poolId,
        providerId: MARKET_MAKER_USER_ID,
        piecesToAdd,
        maxCurrencyToAdd: currencyToAdd * 1.5,
      });
    } else {
      // Someone sold pieces, we should add more currency
      console.log(`[MarketMaker] Adding currency to pool ${poolId}`);
      const currencyToAdd = pool.currency_reserve * 0.03;
      const piecesToAdd = currencyToAdd / pool.last_price;
      
      await pieceAMMService.addLiquidity({
        poolId,
        providerId: MARKET_MAKER_USER_ID,
        piecesToAdd,
        maxCurrencyToAdd: currencyToAdd * 1.5,
      });
    }
    
    // Record intervention
    await recordIntervention(poolId, 'counter_liquidity');
    
  } catch (error) {
    console.error('[MarketMaker] Counter liquidity error:', error);
  }
}

// =====================================================
// MONITORING & REPORTING
// =====================================================

async function calculateCurrentSpread(poolId) {
  // Get buy and sell quotes
  const buyQuote = await pieceAMMService.getSwapQuote(poolId, 'currency_to_pieces', 100);
  const sellQuote = await pieceAMMService.getSwapQuote(poolId, 'pieces_to_currency', 10);
  
  if (!buyQuote || !sellQuote) return 0;
  
  const buyPrice = buyQuote.amount_in / buyQuote.amount_out;
  const sellPrice = sellQuote.amount_out / sellQuote.amount_in;
  
  const spread = (buyPrice - sellPrice) / buyPrice;
  return spread;
}

async function getTotalLpTokens(poolId) {
  const { data, error } = await supabase
    .from('piece_lp_positions')
    .select('lp_tokens')
    .eq('pool_id', poolId);
  
  if (error) return 0;
  return data.reduce((sum, pos) => sum + parseFloat(pos.lp_tokens), 0);
}

async function getTotalSupply(pieceType, assetId) {
  // Get from issuance record
  const { data, error } = await supabase
    .from('piece_issuances')
    .select('total_pieces_issued')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('issuance_type', 'initial')
    .single();
  
  if (error || !data) return 0;
  return data.total_pieces_issued;
}

async function recordMarketMakerActivity(poolId, intendedActions, executedActions, metrics) {
  await supabase.from('market_maker_activities').insert({
    pool_id: poolId,
    intended_actions: intendedActions,
    executed_actions: executedActions,
    inventory_ratio: metrics.inventory_ratio,
    current_spread: metrics.current_spread,
    market_maker_share: metrics.market_maker_share,
  });
}

async function recordIntervention(poolId, interventionType) {
  await supabase.from('market_maker_interventions').insert({
    pool_id: poolId,
    intervention_type: interventionType,
  });
}

async function getLastIntervention(poolId) {
  const { data, error } = await supabase
    .from('market_maker_interventions')
    .select('*')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) return null;
  return data;
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

/**
 * Get market maker performance stats
 */
async function getPerformanceStats() {
  const { data: seeds, error } = await supabase
    .from('market_maker_seeds')
    .select(`
      *,
      pool:pool_id(*),
      activities:market_maker_activities(count)
    `);
  
  if (error) return null;
  
  const totalSeeded = seeds?.length || 0;
  const totalPiecesSeeded = seeds?.reduce((sum, s) => sum + parseFloat(s.pieces_seeded), 0) || 0;
  const totalCurrencySeeded = seeds?.reduce((sum, s) => sum + parseFloat(s.currency_seeded), 0) || 0;
  
  return {
    total_pools_seeded: totalSeeded,
    total_pieces_seeded: totalPiecesSeeded,
    total_currency_seeded: totalCurrencySeeded,
    active_pools: seeds?.filter(s => s.is_active).length || 0,
    pools: seeds,
  };
}

/**
 * Enable/disable market making for a pool
 */
async function togglePoolMonitoring(poolId, isActive) {
  const { error } = await supabase
    .from('market_maker_seeds')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('pool_id', poolId);
  
  if (error) throw error;
  
  return { success: true, pool_id: poolId, is_active: isActive };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Seeding
  seedInitialLiquidity,
  
  // Market making
  runMarketMakingCycle,
  managePoolLiquidity,
  
  // Intervention
  handleLargeTrade,
  provideCounterLiquidity,
  
  // Monitoring
  calculateCurrentSpread,
  getPerformanceStats,
  togglePoolMonitoring,
  
  // Config
  MARKET_MAKER_CONFIG,
  MARKET_MAKER_USER_ID,
};
