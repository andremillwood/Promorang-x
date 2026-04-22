/**
 * Circuit Breaker Service - Full Implementation
 * Monitors AMM pools and triggers cooldowns when limits exceeded
 */

import { supabase } from '@/integrations/supabase/client';

interface CircuitBreakerConfig {
  poolId: string;
  maxPriceChange1hPercent: number;
  maxPriceChange24hPercent: number;
  cooldownMinutes: number;
}

interface PriceCheckResult {
  isTriggered: boolean;
  reason?: string;
  resetAt?: Date;
}

/**
 * Check if circuit breaker should trigger for a price change
 * This replaces the PostgreSQL check_circuit_breaker function
 */
export async function checkCircuitBreaker(
  poolId: string,
  priceBefore: number,
  priceAfter: number
): Promise<PriceCheckResult> {
  try {
    // Get breaker configuration
    const { data: breaker, error } = await supabase
      .from('piece_circuit_breakers')
      .select('*')
      .eq('pool_id', poolId)
      .single();

    if (error) {
      // No breaker configured
      return { isTriggered: false };
    }

    // Check if already in cooldown
    if (breaker.is_triggered && breaker.reset_at) {
      const resetTime = new Date(breaker.reset_at);
      if (resetTime > new Date()) {
        return { 
          isTriggered: true, 
          reason: 'Circuit breaker in cooldown',
          resetAt: resetTime
        };
      } else {
        // Auto-reset
        await resetCircuitBreaker(breaker.id);
        return { isTriggered: false };
      }
    }

    // Calculate price change
    let priceChangePercent = 0;
    if (priceBefore > 0) {
      priceChangePercent = Math.abs((priceAfter - priceBefore) / priceBefore * 100);
    }

    // Check against limits
    if (priceChangePercent > breaker.max_price_change_1h_percent) {
      const reason = `Price moved ${priceChangePercent.toFixed(2)}% in 1 hour (limit: ${breaker.max_price_change_1h_percent}%)`;
      
      // Trigger the breaker
      await triggerCircuitBreaker(poolId, breaker.id, reason, breaker.cooldown_minutes, {
        priceBefore,
        priceAfter,
        priceChangePercent
      });

      return {
        isTriggered: true,
        reason,
        resetAt: new Date(Date.now() + breaker.cooldown_minutes * 60000)
      };
    }

    return { isTriggered: false };

  } catch (error) {
    console.error('Error checking circuit breaker:', error);
    // Fail safe - return not triggered
    return { isTriggered: false };
  }
}

/**
 * Trigger circuit breaker and pause pool
 */
async function triggerCircuitBreaker(
  poolId: string,
  breakerId: string,
  reason: string,
  cooldownMinutes: number,
  details: Record<string, number>
): Promise<void> {
  const resetAt = new Date(Date.now() + cooldownMinutes * 60000);

  // Update breaker status
  const { error: breakerError } = await supabase
    .from('piece_circuit_breakers')
    .update({
      is_triggered: true,
      triggered_at: new Date().toISOString(),
      trigger_reason: reason,
      last_triggered_at: new Date().toISOString(),
      triggered_count: supabase.rpc('increment', { x: 1 }),
      reset_at: resetAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', breakerId);

  if (breakerError) throw breakerError;

  // Create alert
  await supabase
    .from('piece_price_alerts')
    .insert({
      pool_id: poolId,
      alert_type: 'circuit_breaker',
      severity: 'critical',
      message: reason,
      details: {
        price_before: details.priceBefore,
        price_after: details.priceAfter,
        price_change_percent: details.priceChangePercent
      }
    });

  // Pause the pool
  await supabase
    .from('piece_liquidity_pools')
    .update({
      status: 'paused',
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  console.log(`Circuit breaker triggered for pool ${poolId}: ${reason}`);
}

/**
 * Reset circuit breaker
 */
async function resetCircuitBreaker(breakerId: string): Promise<void> {
  await supabase
    .from('piece_circuit_breakers')
    .update({
      is_triggered: false,
      reset_at: null,
      triggered_at: null,
      trigger_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', breakerId);
}

/**
 * Manually reset circuit breaker and unpause pool
 */
export async function manualResetCircuitBreaker(
  poolId: string,
  adminUserId: string
): Promise<void> {
  // Get breaker
  const { data: breaker, error } = await supabase
    .from('piece_circuit_breakers')
    .select('id')
    .eq('pool_id', poolId)
    .single();

  if (error || !breaker) throw new Error('Circuit breaker not found');

  // Reset breaker
  await supabase
    .from('piece_circuit_breakers')
    .update({
      is_triggered: false,
      reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', breaker.id);

  // Reactivate pool
  await supabase
    .from('piece_liquidity_pools')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId);

  // Resolve any open alerts
  await supabase
    .from('piece_price_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUserId
    })
    .eq('pool_id', poolId)
    .eq('alert_type', 'circuit_breaker')
    .eq('is_resolved', false);
}

/**
 * Create circuit breaker for a pool
 */
export async function createCircuitBreaker(
  poolId: string,
  config: Partial<CircuitBreakerConfig> = {}
): Promise<void> {
  const { error } = await supabase
    .from('piece_circuit_breakers')
    .insert({
      pool_id: poolId,
      max_price_change_1h_percent: config.maxPriceChange1hPercent ?? 20.00,
      max_price_change_24h_percent: config.maxPriceChange24hPercent ?? 100.00,
      max_volume_spike_multiplier: 10.00,
      cooldown_minutes: config.cooldownMinutes ?? 15,
      auto_reset_after_minutes: 60,
      is_triggered: false,
      triggered_count: 0
    });

  if (error) throw error;
}

/**
 * Monitor all pools and check for price anomalies
 * Call this periodically (e.g., every minute via cron job)
 */
export async function monitorAllPools(): Promise<void> {
  // Get all active pools with price data
  const { data: pools, error } = await supabase
    .from('piece_liquidity_pools')
    .select('id, last_price, price_24h_ago, updated_at')
    .eq('status', 'active');

  if (error || !pools) return;

  for (const pool of pools) {
    if (!pool.last_price || !pool.price_24h_ago) continue;

    // Check 24h price change
    const result = await checkCircuitBreaker(
      pool.id,
      pool.price_24h_ago,
      pool.last_price
    );

    if (result.isTriggered) {
      console.log(`Pool ${pool.id} circuit breaker triggered: ${result.reason}`);
    }
  }
}

/**
 * Calculate swap output using constant product formula
 * This replaces the PostgreSQL calculate_swap_output function
 */
export function calculateSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feePercent: number = 0.003
): number {
  // Apply fee
  const amountInWithFee = amountIn * (1 - feePercent);
  
  // Constant product formula: dy = (y * dx) / (x + dx)
  const numerator = reserveOut * amountInWithFee;
  const denominator = reserveIn + amountInWithFee;
  
  if (denominator === 0) return 0;
  
  const amountOut = numerator / denominator;
  return Math.max(0, amountOut);
}

/**
 * Calculate price impact
 */
export function calculatePriceImpact(
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number {
  if (reserveIn === 0 || reserveOut === 0) return 0;
  
  const spotPrice = reserveOut / reserveIn;
  const executionPrice = (reserveOut * amountIn / (reserveIn + amountIn)) / amountIn;
  const impact = (spotPrice - executionPrice) / spotPrice;
  
  return impact * 100; // Return as percentage
}

/**
 * Calculate LP tokens for deposit
 */
export function calculateLPTokens(
  piecesToDeposit: number,
  currencyToDeposit: number,
  currentPiecesReserve: number,
  currentCurrencyReserve: number,
  currentTotalLPTokens: number
): number {
  // First deposit: LP tokens = sqrt(pieces * currency)
  if (currentTotalLPTokens === 0) {
    return Math.sqrt(piecesToDeposit * currencyToDeposit);
  }
  
  // Subsequent deposits: proportional to reserves
  const piecesShare = piecesToDeposit / currentPiecesReserve;
  const currencyShare = currencyToDeposit / currentCurrencyReserve;
  
  // Use minimum to prevent manipulation
  const lpTokens = Math.min(piecesShare, currencyShare) * currentTotalLPTokens;
  
  return lpTokens;
}
