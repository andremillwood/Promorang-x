/**
 * Piece AMM (Automated Market Maker) Service
 * Constant Product Market Maker implementation for piece trading
 * Formula: x * y = k (pieces * currency = constant)
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const pieceTradingService = require('./pieceTradingService');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const DEFAULT_SWAP_FEE = 0.003; // 0.3%
const DEFAULT_PROTOCOL_FEE = 0.0005; // 0.05%
const DEFAULT_LP_FEE = 0.0025; // 0.25%

const DEFAULT_SLIPPAGE_TOLERANCE = 0.01; // 1% default
const MAX_SLIPPAGE_TOLERANCE = 0.5; // 50% max allowed

// =====================================================
// POOL MANAGEMENT
// =====================================================

/**
 * Create a new liquidity pool for a piece
 */
async function createPool({
  pieceType,
  assetId,
  initialPieces,
  initialCurrency,
  swapFeePercent = DEFAULT_SWAP_FEE,
  createdBy,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Validate
  if (initialPieces <= 0 || initialCurrency <= 0) {
    throw new Error('Initial reserves must be greater than 0');
  }
  
  // Check if pool already exists
  const { data: existing, error: checkError } = await supabase
    .from('piece_liquidity_pools')
    .select('id')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .single();
  
  if (existing) {
    throw new Error('Liquidity pool already exists for this piece');
  }
  
  // Calculate k constant (x * y = k)
  const kConstant = initialPieces * initialCurrency;
  const initialPrice = initialCurrency / initialPieces;
  
  // Create pool
  const { data: pool, error: poolError } = await supabase
    .from('piece_liquidity_pools')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      pieces_reserve: initialPieces,
      currency_reserve: initialCurrency,
      k_constant: kConstant,
      last_price: initialPrice,
      price_24h_ago: initialPrice,
      swap_fee_percent: swapFeePercent,
      protocol_fee_percent: DEFAULT_PROTOCOL_FEE,
      lp_fee_percent: DEFAULT_LP_FEE,
      status: 'active',
      created_by: createdBy,
    })
    .select()
    .single();
  
  if (poolError) throw poolError;
  
  // Mint LP tokens for creator (geometric mean)
  const lpTokens = Math.sqrt(initialPieces * initialCurrency);
  
  const { data: lpPosition, error: lpError } = await supabase
    .from('piece_lp_positions')
    .insert({
      pool_id: pool.id,
      provider_id: createdBy,
      lp_tokens: lpTokens,
      pieces_deposited: initialPieces,
      currency_deposited: initialCurrency,
    })
    .select()
    .single();
  
  if (lpError) throw lpError;
  
  // Create default circuit breaker
  await createCircuitBreaker(pool.id);
  
  return {
    success: true,
    pool,
    lp_position: lpPosition,
    lp_tokens: lpTokens,
    initial_price: initialPrice,
  };
}

/**
 * Add liquidity to an existing pool
 */
async function addLiquidity({
  poolId,
  providerId,
  piecesToAdd,
  maxCurrencyToAdd,
  slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Get pool
  const { data: pool, error: poolError } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .eq('status', 'active')
    .single();
  
  if (poolError || !pool) {
    throw new Error('Pool not found or not active');
  }
  
  // Calculate required currency based on current ratio
  // pieces / currency = new_pieces / new_currency
  const requiredCurrency = (piecesToAdd * pool.currency_reserve) / pool.pieces_reserve;
  
  if (requiredCurrency > maxCurrencyToAdd) {
    throw new Error(`Insufficient currency. Required: ${requiredCurrency.toFixed(4)}, Provided max: ${maxCurrencyToAdd.toFixed(4)}`);
  }
  
  // Check for slippage in ratio
  const currentRatio = pool.pieces_reserve / pool.currency_reserve;
  const depositRatio = piecesToAdd / requiredCurrency;
  const ratioDiff = Math.abs(currentRatio - depositRatio) / currentRatio;
  
  if (ratioDiff > slippageTolerance) {
    throw new Error(`Price slippage too high: ${(ratioDiff * 100).toFixed(2)}% > ${(slippageTolerance * 100).toFixed(2)}%`);
  }
  
  // Calculate LP tokens to mint
  const totalLpTokens = await getTotalLpTokens(poolId);
  const lpTokensToMint = calculateLpTokens(
    piecesToAdd,
    requiredCurrency,
    pool.pieces_reserve,
    pool.currency_reserve,
    totalLpTokens
  );
  
  // Update pool reserves
  const newPiecesReserve = parseFloat(pool.pieces_reserve) + piecesToAdd;
  const newCurrencyReserve = parseFloat(pool.currency_reserve) + requiredCurrency;
  const newK = newPiecesReserve * newCurrencyReserve;
  
  const { error: updateError } = await supabase
    .from('piece_liquidity_pools')
    .update({
      pieces_reserve: newPiecesReserve,
      currency_reserve: newCurrencyReserve,
      k_constant: newK,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poolId);
  
  if (updateError) throw updateError;
  
  // Update or create LP position
  const { data: existingPosition, error: checkError } = await supabase
    .from('piece_lp_positions')
    .select('*')
    .eq('pool_id', poolId)
    .eq('provider_id', providerId)
    .single();
  
  if (existingPosition) {
    await supabase
      .from('piece_lp_positions')
      .update({
        lp_tokens: existingPosition.lp_tokens + lpTokensToMint,
        pieces_deposited: existingPosition.pieces_deposited + piecesToAdd,
        currency_deposited: existingPosition.currency_deposited + requiredCurrency,
        last_deposit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPosition.id);
  } else {
    await supabase
      .from('piece_lp_positions')
      .insert({
        pool_id: poolId,
        provider_id: providerId,
        lp_tokens: lpTokensToMint,
        pieces_deposited: piecesToAdd,
        currency_deposited: requiredCurrency,
      });
  }
  
  return {
    success: true,
    pieces_added: piecesToAdd,
    currency_added: requiredCurrency,
    lp_tokens_received: lpTokensToMint,
    pool_share_percent: (lpTokensToMint / (totalLpTokens + lpTokensToMint) * 100).toFixed(4),
  };
}

/**
 * Remove liquidity from a pool
 */
async function removeLiquidity({
  poolId,
  providerId,
  lpTokensToRemove,
  minPiecesOut = 0,
  minCurrencyOut = 0,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Get pool and LP position
  const [{ data: pool }, { data: position }] = await Promise.all([
    supabase.from('piece_liquidity_pools').select('*').eq('id', poolId).single(),
    supabase.from('piece_lp_positions').select('*').eq('pool_id', poolId).eq('provider_id', providerId).single(),
  ]);
  
  if (!pool || !position) {
    throw new Error('Pool or position not found');
  }
  
  if (position.lp_tokens < lpTokensToRemove) {
    throw new Error('Insufficient LP tokens');
  }
  
  // Calculate amounts to return
  const totalLpTokens = await getTotalLpTokens(poolId);
  const shareOfPool = lpTokensToRemove / totalLpTokens;
  
  const piecesOut = pool.pieces_reserve * shareOfPool;
  const currencyOut = pool.currency_reserve * shareOfPool;
  
  // Add accumulated fees (proportional to share)
  const feesEarnedPieces = position.fees_earned_pieces * shareOfPool;
  const feesEarnedCurrency = position.fees_earned_currency * shareOfPool;
  
  const totalPiecesOut = piecesOut + feesEarnedPieces;
  const totalCurrencyOut = currencyOut + feesEarnedCurrency;
  
  // Check minimums
  if (totalPiecesOut < minPiecesOut || totalCurrencyOut < minCurrencyOut) {
    throw new Error('Slippage exceeded minimum output');
  }
  
  // Update pool reserves
  const { error: updateError } = await supabase
    .from('piece_liquidity_pools')
    .update({
      pieces_reserve: pool.pieces_reserve - piecesOut,
      currency_reserve: pool.currency_reserve - currencyOut,
      k_constant: (pool.pieces_reserve - piecesOut) * (pool.currency_reserve - currencyOut),
      updated_at: new Date().toISOString(),
    })
    .eq('id', poolId);
  
  if (updateError) throw updateError;
  
  // Update LP position
  const remainingTokens = position.lp_tokens - lpTokensToRemove;
  if (remainingTokens <= 0) {
    // Delete position if fully withdrawn
    await supabase.from('piece_lp_positions').delete().eq('id', position.id);
  } else {
    const remainingShare = remainingTokens / position.lp_tokens;
    await supabase
      .from('piece_lp_positions')
      .update({
        lp_tokens: remainingTokens,
        pieces_deposited: position.pieces_deposited * remainingShare,
        currency_deposited: position.currency_deposited * remainingShare,
        fees_earned_pieces: position.fees_earned_pieces - feesEarnedPieces,
        fees_earned_currency: position.fees_earned_currency - feesEarnedCurrency,
        last_withdrawal_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', position.id);
  }
  
  return {
    success: true,
    pieces_out: totalPiecesOut,
    currency_out: totalCurrencyOut,
    fees_pieces: feesEarnedPieces,
    fees_currency: feesEarnedCurrency,
  };
}

// =====================================================
// SWAPS (TRADING)
// =====================================================

/**
 * Swap currency for pieces (buy)
 */
async function swapCurrencyForPieces({
  poolId,
  traderId,
  currencyIn,
  minPiecesOut,
  slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Get pool
  const { data: pool, error: poolError } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .eq('status', 'active')
    .single();
  
  if (poolError || !pool) {
    throw new Error('Pool not found or not active');
  }
  
  // Check circuit breaker
  const breakerTriggered = await checkCircuitBreaker(poolId);
  if (breakerTriggered) {
    throw new Error('Trading temporarily paused due to circuit breaker');
  }
  
  // Calculate output
  const piecesOut = calculateSwapOutput(
    currencyIn,
    pool.currency_reserve,
    pool.pieces_reserve,
    pool.swap_fee_percent
  );
  
  if (piecesOut <= 0) {
    throw new Error('Swap output too small');
  }
  
  // Check slippage
  const expectedPiecesOut = (currencyIn * pool.pieces_reserve) / pool.currency_reserve;
  const actualSlippage = (expectedPiecesOut - piecesOut) / expectedPiecesOut;
  
  if (actualSlippage > slippageTolerance) {
    throw new Error(`Slippage too high: ${(actualSlippage * 100).toFixed(2)}% > ${(slippageTolerance * 100).toFixed(2)}%`);
  }
  
  // Check minimum output
  if (piecesOut < minPiecesOut) {
    throw new Error(`Minimum output not met: ${piecesOut.toFixed(8)} < ${minPiecesOut.toFixed(8)}`);
  }
  
  // Calculate fees
  const totalFee = currencyIn * pool.swap_fee_percent;
  const protocolFee = currencyIn * pool.protocol_fee_percent;
  const lpFee = currencyIn * pool.lp_fee_percent;
  
  // Price impact
  const newPrice = (parseFloat(pool.currency_reserve) + currencyIn) / (parseFloat(pool.pieces_reserve) - piecesOut);
  const priceImpact = calculatePriceImpact(currencyIn, pool.currency_reserve, pool.pieces_reserve);
  
  // Record swap
  const { data: swap, error: swapError } = await supabase
    .from('piece_amm_swaps')
    .insert({
      pool_id: poolId,
      swap_type: 'currency_to_pieces',
      trader_id: traderId,
      amount_in: currencyIn,
      amount_out: piecesOut,
      swap_fee: totalFee,
      protocol_fee: protocolFee,
      lp_fee: lpFee,
      price_before: pool.last_price,
      price_after: newPrice,
      price_impact_percent: priceImpact,
      expected_amount_out: expectedPiecesOut,
      minimum_amount_out: minPiecesOut,
      slippage_percent: actualSlippage,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (swapError) throw swapError;
  
  // Check if circuit breaker should trigger
  await checkAndTriggerCircuitBreaker(poolId, pool.last_price, newPrice);
  
  return {
    success: true,
    swap,
    pieces_received: piecesOut,
    effective_price: currencyIn / piecesOut,
    price_impact_percent: priceImpact,
    fees_paid: totalFee,
  };
}

/**
 * Swap pieces for currency (sell)
 */
async function swapPiecesForCurrency({
  poolId,
  traderId,
  piecesIn,
  minCurrencyOut,
  slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // Get pool
  const { data: pool, error: poolError } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .eq('status', 'active')
    .single();
  
  if (poolError || !pool) {
    throw new Error('Pool not found or not active');
  }
  
  // Check circuit breaker
  const breakerTriggered = await checkCircuitBreaker(poolId);
  if (breakerTriggered) {
    throw new Error('Trading temporarily paused due to circuit breaker');
  }
  
  // Calculate output
  const currencyOut = calculateSwapOutput(
    piecesIn,
    pool.pieces_reserve,
    pool.currency_reserve,
    pool.swap_fee_percent
  );
  
  if (currencyOut <= 0) {
    throw new Error('Swap output too small');
  }
  
  // Check slippage
  const expectedCurrencyOut = (piecesIn * pool.currency_reserve) / pool.pieces_reserve;
  const actualSlippage = (expectedCurrencyOut - currencyOut) / expectedCurrencyOut;
  
  if (actualSlippage > slippageTolerance) {
    throw new Error(`Slippage too high: ${(actualSlippage * 100).toFixed(2)}% > ${(slippageTolerance * 100).toFixed(2)}%`);
  }
  
  // Check minimum output
  if (currencyOut < minCurrencyOut) {
    throw new Error(`Minimum output not met: ${currencyOut.toFixed(8)} < ${minCurrencyOut.toFixed(8)}`);
  }
  
  // Calculate fees
  const totalFee = currencyOut * pool.swap_fee_percent;
  const protocolFee = currencyOut * pool.protocol_fee_percent;
  const lpFee = currencyOut * pool.lp_fee_percent;
  
  // Price impact
  const newPrice = (parseFloat(pool.currency_reserve) - currencyOut) / (parseFloat(pool.pieces_reserve) + piecesIn);
  const priceImpact = calculatePriceImpact(piecesIn, pool.pieces_reserve, pool.currency_reserve);
  
  // Record swap
  const { data: swap, error: swapError } = await supabase
    .from('piece_amm_swaps')
    .insert({
      pool_id: poolId,
      swap_type: 'pieces_to_currency',
      trader_id: traderId,
      amount_in: piecesIn,
      amount_out: currencyOut,
      swap_fee: totalFee,
      protocol_fee: protocolFee,
      lp_fee: lpFee,
      price_before: pool.last_price,
      price_after: newPrice,
      price_impact_percent: priceImpact,
      expected_amount_out: expectedCurrencyOut,
      minimum_amount_out: minCurrencyOut,
      slippage_percent: actualSlippage,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (swapError) throw swapError;
  
  // Check circuit breaker
  await checkAndTriggerCircuitBreaker(poolId, pool.last_price, newPrice);
  
  return {
    success: true,
    swap,
    currency_received: currencyOut,
    effective_price: currencyOut / piecesIn,
    price_impact_percent: priceImpact,
    fees_paid: totalFee,
  };
}

/**
 * Get a quote for swapping (no execution)
 */
async function getSwapQuote(poolId, swapType, amountIn, slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE) {
  if (!supabase) return null;
  
  const { data: pool, error } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .single();
  
  if (error || !pool) return null;
  
  let amountOut, priceImpact, newPrice;
  
  if (swapType === 'currency_to_pieces') {
    amountOut = calculateSwapOutput(
      amountIn,
      pool.currency_reserve,
      pool.pieces_reserve,
      pool.swap_fee_percent
    );
    priceImpact = calculatePriceImpact(amountIn, pool.currency_reserve, pool.pieces_reserve);
    newPrice = (parseFloat(pool.currency_reserve) + amountIn) / (parseFloat(pool.pieces_reserve) - amountOut);
  } else {
    amountOut = calculateSwapOutput(
      amountIn,
      pool.pieces_reserve,
      pool.currency_reserve,
      pool.swap_fee_percent
    );
    priceImpact = calculatePriceImpact(amountIn, pool.pieces_reserve, pool.currency_reserve);
    newPrice = (parseFloat(pool.currency_reserve) - amountOut) / (parseFloat(pool.pieces_reserve) + amountIn);
  }
  
  const expectedOut = swapType === 'currency_to_pieces'
    ? (amountIn * pool.pieces_reserve) / pool.currency_reserve
    : (amountIn * pool.currency_reserve) / pool.pieces_reserve;
  
  const slippage = (expectedOut - amountOut) / expectedOut;
  const minimumOut = amountOut * (1 - slippageTolerance);
  
  return {
    pool_id: poolId,
    swap_type: swapType,
    amount_in: amountIn,
    amount_out: amountOut,
    expected_amount_out: expectedOut,
    minimum_amount_out: minimumOut,
    slippage_percent: slippage * 100,
    price_impact_percent: priceImpact,
    price_before: pool.last_price,
    price_after: newPrice,
    effective_price: swapType === 'currency_to_pieces' ? amountIn / amountOut : amountOut / amountIn,
    fee_amount: amountIn * pool.swap_fee_percent,
  };
}

// =====================================================
// CIRCUIT BREAKERS
// =====================================================

async function createCircuitBreaker(poolId, settings = {}) {
  const { error } = await supabase
    .from('piece_circuit_breakers')
    .insert({
      pool_id: poolId,
      max_price_change_1h_percent: settings.maxPriceChange1h || 20,
      max_price_change_24h_percent: settings.maxPriceChange24h || 100,
      cooldown_minutes: settings.cooldownMinutes || 15,
      auto_reset_after_minutes: settings.autoResetAfter || 60,
    });
  
  if (error) throw error;
}

async function checkCircuitBreaker(poolId) {
  const { data: breaker, error } = await supabase
    .from('piece_circuit_breakers')
    .select('*')
    .eq('pool_id', poolId)
    .single();
  
  if (error || !breaker) return false;
  
  // Check if in cooldown period
  if (breaker.is_triggered && breaker.reset_at) {
    const now = new Date();
    const resetTime = new Date(breaker.reset_at);
    
    if (now < resetTime) {
      return true; // Still in cooldown
    }
  }
  
  return false;
}

async function checkAndTriggerCircuitBreaker(poolId, priceBefore, priceAfter) {
  // Call the database function
  const { data: triggered, error } = await supabase
    .rpc('check_circuit_breaker', {
      p_pool_id: poolId,
      p_price_before: priceBefore,
      p_price_after: priceAfter,
    });
  
  if (error) {
    console.error('Circuit breaker check failed:', error);
    return false;
  }
  
  return triggered;
}

// =====================================================
// CALCULATION HELPERS
// =====================================================

function calculateSwapOutput(amountIn, reserveIn, reserveOut, feePercent) {
  const amountInWithFee = amountIn * (1 - feePercent);
  const numerator = reserveOut * amountInWithFee;
  const denominator = reserveIn + amountInWithFee;
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

function calculatePriceImpact(amountIn, reserveIn, reserveOut) {
  if (reserveIn === 0 || reserveOut === 0) return 0;
  
  const spotPrice = reserveOut / reserveIn;
  const amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
  const executionPrice = amountOut / amountIn;
  
  const impact = (spotPrice - executionPrice) / spotPrice;
  return impact * 100; // Return as percentage
}

function calculateLpTokens(piecesAdded, currencyAdded, piecesReserve, currencyReserve, totalLpTokens) {
  if (totalLpTokens === 0) {
    return Math.sqrt(piecesAdded * currencyAdded);
  }
  
  const piecesShare = piecesAdded / piecesReserve;
  const currencyShare = currencyAdded / currencyReserve;
  
  return Math.min(piecesShare, currencyShare) * totalLpTokens;
}

async function getTotalLpTokens(poolId) {
  const { data, error } = await supabase
    .from('piece_lp_positions')
    .select('lp_tokens')
    .eq('pool_id', poolId);
  
  if (error) return 0;
  
  return data.reduce((sum, pos) => sum + parseFloat(pos.lp_tokens), 0);
}

// =====================================================
// QUERIES
// =====================================================

async function getPool(poolId) {
  const { data, error } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('id', poolId)
    .single();
  
  if (error) throw error;
  return data;
}

async function getPoolByAsset(pieceType, assetId) {
  const { data, error } = await supabase
    .from('piece_liquidity_pools')
    .select('*')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .single();
  
  if (error) return null;
  return data;
}

async function getAllPools(status = 'active') {
  const { data, error } = await supabase
    .from('piece_liquidity_pools')
    .select(`
      *,
      asset:asset_id(id, title, name, image_url)
    `)
    .eq('status', status)
    .order('volume_24h', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function getLpPosition(poolId, providerId) {
  const { data, error } = await supabase
    .from('piece_lp_positions')
    .select('*')
    .eq('pool_id', poolId)
    .eq('provider_id', providerId)
    .single();
  
  if (error) return null;
  return data;
}

async function getProviderPositions(providerId) {
  const { data, error } = await supabase
    .from('piece_lp_positions')
    .select(`
      *,
      pool:pool_id(*)
    `)
    .eq('provider_id', providerId)
    .gt('lp_tokens', 0);
  
  if (error) throw error;
  return data || [];
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Pool management
  createPool,
  addLiquidity,
  removeLiquidity,
  
  // Swaps
  swapCurrencyForPieces,
  swapPiecesForCurrency,
  getSwapQuote,
  
  // Queries
  getPool,
  getPoolByAsset,
  getAllPools,
  getLpPosition,
  getProviderPositions,
  
  // Helpers
  calculateSwapOutput,
  calculatePriceImpact,
};
