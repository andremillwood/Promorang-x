/**
 * Gems Service
 * Virtual currency for piece trading
 * Internal ledger - zero blockchain costs
 * Stripe-safe: Only handles Gems, never touches Pieces directly
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const GEMS_EXCHANGE_RATE = 1.00; // 1 Gem = $1.00 USD (simple 1:1)
const MIN_GEMS_PURCHASE = 5;     // $5.00 minimum (5 Gems)
const MAX_GEMS_PURCHASE = 1000;  // $1000 maximum per transaction (1000 Gems)
const GEMS_PRECISION = 2;        // 2 decimal places
const PURCHASE_REDEMPTION_HOLD_DAYS = 30;

// =====================================================
// BALANCE MANAGEMENT
// =====================================================

/**
 * Get user's Gems balance
 */
async function getGemsBalance(userId) {
  if (!supabase) {
    return {
      user_id: userId,
      balance: 0,
      currency: 'GEMS',
      usd_value: 0,
      withdrawable_balance: 0,
      pending_purchase_redemption_balance: 0,
      locked_bonus_balance: 0,
      purchased_balance: 0,
      bonus_balance: 0,
      trade_balance: 0,
    };
  }

  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('balance_type', 'gems')
    .eq('currency', 'GEMS')
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is OK
    throw error;
  }

  const balance = data?.balance || 0;
  const redemptionSummary = await getRedemptionSummary(userId);
  const { data: funding } = await supabase
    .from('gem_funding_balances')
    .select('purchased_available,promotional_available')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    user_id: userId,
    balance: parseFloat(balance),
    currency: 'GEMS',
    usd_value: parseFloat(balance) * GEMS_EXCHANGE_RATE,
    lifetime_purchased: data?.gems_purchased_total || 0,
    lifetime_traded: data?.gems_traded_total || 0,
    lifetime_withdrawn: data?.gems_withdrawn_total || 0,
    lifetime_bonus: data?.gems_bonus_total || 0,
    withdrawable_balance: redemptionSummary.withdrawable_balance,
    pending_purchase_redemption_balance: redemptionSummary.pending_purchase_redemption_balance,
    locked_bonus_balance: redemptionSummary.locked_bonus_balance,
    purchased_balance: Number(funding?.purchased_available ?? redemptionSummary.purchased_balance),
    promotional_balance: Number(funding?.promotional_available || 0),
    bonus_balance: redemptionSummary.bonus_balance,
    trade_balance: redemptionSummary.trade_balance,
    next_purchase_redemption_at: redemptionSummary.next_purchase_redemption_at,
  };
}

/**
 * Credit Gems to user (internal use)
 */
async function creditGems(userId, amount, source, metadata = {}) {
  if (!supabase) return { success: true };

  const amountRounded = roundGems(amount);

  const { data: existing, error: checkError } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('balance_type', 'gems')
    .eq('currency', 'GEMS')
    .single();

  if (existing) {
    // Update existing balance
    const newBalance = roundGems(parseFloat(existing.balance) + amountRounded);
    const newPurchased = source === 'purchase' 
      ? roundGems(parseFloat(existing.gems_purchased_total || 0) + amountRounded)
      : existing.gems_purchased_total;
    const newBonus = source === 'bonus'
      ? roundGems(parseFloat(existing.gems_bonus_total || 0) + amountRounded)
      : existing.gems_bonus_total;

    const { error } = await supabase
      .from('user_balances')
      .update({
        balance: newBalance,
        gems_purchased_total: newPurchased,
        gems_bonus_total: newBonus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    // Create new balance
    const { error } = await supabase.from('user_balances').insert({
      user_id: userId,
      balance_type: 'gems',
      currency: 'GEMS',
      balance: amountRounded,
      gems_purchased_total: source === 'purchase' ? amountRounded : 0,
      gems_bonus_total: source === 'bonus' ? amountRounded : 0,
    });

    if (error) throw error;
  }

  // Record transaction
  await recordGemsTransaction(userId, amountRounded, source, metadata);

  return {
    success: true,
    amount_credited: amountRounded,
    new_balance: await getGemsBalance(userId),
  };
}

/**
 * Debit Gems from user (internal use)
 */
async function debitGems(userId, amount, reason, metadata = {}) {
  if (!supabase) return { success: true };

  const amountRounded = roundGems(amount);

  // Check balance
  const currentBalance = await getGemsBalance(userId);
  
  if (currentBalance.balance < amountRounded) {
    throw new Error(`Insufficient Gems balance. Available: ${currentBalance.balance}, Required: ${amountRounded}`);
  }

  const { data: existing, error: checkError } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('balance_type', 'gems')
    .eq('currency', 'GEMS')
    .single();

  if (!existing) {
    throw new Error('No Gems balance found');
  }

  const newBalance = roundGems(parseFloat(existing.balance) - amountRounded);
  const newTraded = reason === 'trade' 
    ? roundGems(parseFloat(existing.gems_traded_total || 0) + amountRounded)
    : existing.gems_traded_total;

  const { error } = await supabase
    .from('user_balances')
    .update({
      balance: newBalance,
      gems_traded_total: newTraded,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (error) throw error;

  // Record transaction (negative amount)
  await recordGemsTransaction(userId, -amountRounded, reason, metadata);

  return {
    success: true,
    amount_debited: amountRounded,
    new_balance: await getGemsBalance(userId),
  };
}

/**
 * Record Gems transaction
 */
async function recordGemsTransaction(userId, amount, type, metadata = {}) {
  if (!supabase) return;

  const balance = await getGemsBalance(userId);
  const nowIso = new Date().toISOString();
  const redeemableAfter = metadata.redeemable_after
    || (type === 'purchase' && amount > 0 ? addDaysIso(nowIso, PURCHASE_REDEMPTION_HOLD_DAYS) : null);
  const objectiveStatus = metadata.objective_status
    || (metadata.objective_code ? 'pending' : 'not_applicable');
  const redemptionStatus = metadata.redemption_status
    || defaultRedemptionStatusForTransaction(type, amount, {
      objectiveStatus,
      redeemableAfter,
      createdAt: nowIso,
    });

  const { error } = await supabase.from('gems_transactions').insert({
    user_id: userId,
    transaction_type: type,
    amount: amount,
    balance_after: balance.balance,
    
    // Purchase metadata
    fiat_amount: metadata.fiat_amount,
    fiat_currency: metadata.fiat_currency || 'USD',
    exchange_rate: metadata.exchange_rate || GEMS_EXCHANGE_RATE,
    stripe_payment_intent_id: metadata.stripe_payment_intent_id,
    
    // Trade metadata
    piece_type: metadata.piece_type,
    asset_id: metadata.asset_id,
    pieces_amount: metadata.pieces_amount,
    pool_id: metadata.pool_id,
    
    // Withdrawal metadata
    withdrawal_method: metadata.withdrawal_method,
    gems_withdrawal_id: metadata.withdrawal_id,

    // Bonus metadata
    bonus_reason: metadata.bonus_reason || metadata.description || null,
    issued_by: metadata.issued_by || null,

    description: metadata.description || `${type} transaction`,
    redemption_status: redemptionStatus,
    redeemable_after: redeemableAfter,
    objective_code: metadata.objective_code || null,
    objective_status: objectiveStatus,
    objective_completed_at: metadata.objective_completed_at || null,
    metadata: metadata.metadata || {},
  });

  if (error) {
    console.error('[Gems] Failed to record transaction:', error);
  }
}

// =====================================================
// PURCHASE (Fiat → Gems)
// =====================================================

/**
 * Create Gems purchase intent (Stripe)
 */
async function createPurchaseIntent(userId, usdAmount, userEmail = null) {
  if (!supabase) {
    return {
      success: true,
      client_secret: 'demo_secret',
      gems_amount: Math.floor(usdAmount / GEMS_EXCHANGE_RATE),
      usd_amount: usdAmount,
    };
  }

  // Validate amount
  if (usdAmount < MIN_GEMS_PURCHASE * GEMS_EXCHANGE_RATE) {
    throw new Error(`Minimum purchase is $${(MIN_GEMS_PURCHASE * GEMS_EXCHANGE_RATE).toFixed(2)}`);
  }
  if (usdAmount > MAX_GEMS_PURCHASE * GEMS_EXCHANGE_RATE) {
    throw new Error(`Maximum purchase is $${(MAX_GEMS_PURCHASE * GEMS_EXCHANGE_RATE).toFixed(2)} per transaction`);
  }

  const gemsAmount = Math.floor(usdAmount / GEMS_EXCHANGE_RATE);
  const actualUsdAmount = gemsAmount * GEMS_EXCHANGE_RATE;

  // Resolve customer ID and email safely across users and profiles tables
  let customerId = null;
  let email = userEmail;

  // 1. Try users table
  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();
    if (user) {
      customerId = user.stripe_customer_id || null;
      if (user.email) email = user.email;
    }
  } catch (err) {
    console.warn('[gemsService] Error querying users table:', err.message);
  }

  // 2. Try profiles table if needed
  if (!customerId || !email) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, stripe_customer_id')
        .eq('id', userId)
        .maybeSingle();
      if (profile) {
        if (!customerId && profile.stripe_customer_id) customerId = profile.stripe_customer_id;
        if (!email && profile.email) email = profile.email;
      }
    } catch (err) {
      console.warn('[gemsService] Error querying profiles table:', err.message);
    }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[gemsService] STRIPE_SECRET_KEY is missing, returning demo client secret');
    return {
      success: true,
      client_secret: 'demo_secret',
      gems_amount: gemsAmount,
      usd_amount: actualUsdAmount,
      exchange_rate: GEMS_EXCHANGE_RATE,
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  if (!customerId) {
    const customerPayload = {
      metadata: { user_id: userId },
    };
    if (email) {
      customerPayload.email = email;
    }
    const customer = await stripe.customers.create(customerPayload);
    customerId = customer.id;

    // Save customer ID if tables exist
    try {
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', userId);
    } catch (_) {}
    try {
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    } catch (_) {}
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(actualUsdAmount * 100), // cents
    currency: 'usd',
    customer: customerId,
    description: `Purchase ${gemsAmount} Gems`,
    metadata: {
      user_id: userId,
      gems_amount: String(gemsAmount),
      usd_amount: String(actualUsdAmount),
      type: 'gems_purchase',
    },
    automatic_payment_methods: { enabled: true },
  });

  return {
    success: true,
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
    gems_amount: gemsAmount,
    usd_amount: actualUsdAmount,
    exchange_rate: GEMS_EXCHANGE_RATE,
  };
}

/**
 * Handle Stripe webhook for successful Gems purchase
 */
async function handleStripeWebhook(event) {
  const { type, data } = event;

  if (type === 'payment_intent.succeeded') {
    const paymentIntent = data.object;
    const metadata = paymentIntent.metadata || {};

    if (metadata.type !== 'gems_purchase') {
      return { handled: false, reason: 'not_gems_purchase' };
    }

    const userId = metadata.user_id;
    const gemsAmount = Number(metadata.gems_amount);
    const usdAmount = Number(((paymentIntent.amount_received || paymentIntent.amount || 0) / 100).toFixed(2));

    if (!userId || !Number.isFinite(gemsAmount) || gemsAmount <= 0) {
      throw new Error('Gem payment intent is missing valid fulfillment metadata');
    }
    if (paymentIntent.status !== 'succeeded' || Number(paymentIntent.amount_received || 0) <= 0) {
      throw new Error('Gem payment intent has not been paid');
    }

    const expectedUsdAmount = Number((gemsAmount * GEMS_EXCHANGE_RATE).toFixed(2));
    if (usdAmount !== expectedUsdAmount) {
      throw new Error(`Gem payment amount mismatch: expected ${expectedUsdAmount}, received ${usdAmount}`);
    }

    const idempotencyKey = `stripe:gems:${paymentIntent.id}`;
    const { data: transaction, error } = await supabase.rpc('fulfill_purchased_gems', {
      p_user_id: userId,
      p_payment_intent_id: paymentIntent.id,
      p_gems_amount: gemsAmount,
      p_fiat_amount: usdAmount,
      p_fiat_currency: String(paymentIntent.currency || 'usd').toUpperCase(),
      p_livemode: Boolean(paymentIntent.livemode),
    });
    if (error) throw error;

    return {
      success: true,
      handled: true,
      user_id: userId,
      gems_credited: gemsAmount,
      usd_paid: usdAmount,
      transaction_id: transaction?.transaction_id || null,
      idempotency_key: idempotencyKey,
      idempotent: Boolean(transaction?.idempotent),
      purchased_available: Number(transaction?.purchased_available || 0),
    };
  }

  return { handled: false, reason: 'unhandled_event_type' };
}

// =====================================================
// WITHDRAWAL (Gems → Fiat)
// =====================================================

/**
 * Request Gems withdrawal
 */
async function requestWithdrawal(userId, gemsAmount, withdrawalMethod = 'bank_transfer') {
  if (!supabase) {
    return {
      success: true,
      withdrawal_id: 'demo-withdrawal-id',
      gems_amount: gemsAmount,
      usd_amount: gemsAmount * GEMS_EXCHANGE_RATE,
      status: 'pending',
    };
  }

  // Check balance
  const balance = await getGemsBalance(userId);
  
  if (balance.balance < gemsAmount) {
    throw new Error(`Insufficient balance. Available: ${balance.balance} Gems`);
  }
  if (balance.withdrawable_balance < gemsAmount) {
    throw new Error(
      `Only ${balance.withdrawable_balance.toFixed(2)} Gems are currently redeemable. ` +
      `${balance.pending_purchase_redemption_balance.toFixed(2)} Gems are still in the 30-day hold and ` +
      `${balance.locked_bonus_balance.toFixed(2)} bonus Gems are still locked to objective completion.`
    );
  }

  const usdAmount = gemsAmount * GEMS_EXCHANGE_RATE;

  // Minimum withdrawal
  if (usdAmount < 10) {
    throw new Error('Minimum withdrawal is $10.00 (10 Gems)');
  }

  // Create withdrawal record
  const { data: withdrawal, error } = await supabase
    .from('gems_withdrawals')
    .insert({
      user_id: userId,
      gems_amount: gemsAmount,
      usd_amount: usdAmount,
      withdrawal_method: withdrawalMethod,
      status: 'pending',
      exchange_rate: GEMS_EXCHANGE_RATE,
      metadata: {
        withdrawable_balance_at_request: balance.withdrawable_balance,
      },
    })
    .select()
    .single();

  if (error) throw error;

  // Debit Gems (hold in escrow)
  await debitGems(userId, gemsAmount, 'withdrawal', {
    withdrawal_id: withdrawal.id,
    withdrawal_method: withdrawalMethod,
    description: `Withdrawal request: ${gemsAmount} Gems → $${usdAmount.toFixed(2)}`,
  });

  return {
    success: true,
    withdrawal_id: withdrawal.id,
    gems_amount: gemsAmount,
    usd_amount: usdAmount,
    status: 'pending',
    estimated_time: '1-3 business days',
  };
}

/**
 * Process approved withdrawal (admin function)
 */
async function processWithdrawal(withdrawalId, adminId) {
  if (!supabase) return { success: true };

  const { data: withdrawal, error } = await supabase
    .from('gems_withdrawals')
    .select('*')
    .eq('id', withdrawalId)
    .eq('status', 'pending')
    .single();

  if (error || !withdrawal) {
    throw new Error('Withdrawal not found or already processed');
  }

  // Execute payout via Stripe
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  const { data: user } = await supabase
    .from('users')
    .select('stripe_connect_account_id')
    .eq('id', withdrawal.user_id)
    .single();

  if (!user?.stripe_connect_account_id) {
    throw new Error('User has no connected bank account');
  }

  const transfer = await stripe.transfers.create({
    amount: Math.round(withdrawal.usd_amount * 100),
    currency: 'usd',
    destination: user.stripe_connect_account_id,
    description: `Gems withdrawal: ${withdrawal.gems_amount} Gems`,
  });

  // Update withdrawal
  await supabase
    .from('gems_withdrawals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      processed_by: adminId,
      stripe_transfer_id: transfer.id,
    })
    .eq('id', withdrawalId);

  return {
    success: true,
    withdrawal_id: withdrawalId,
    usd_paid: withdrawal.usd_amount,
    stripe_transfer_id: transfer.id,
  };
}

// =====================================================
// TRADING (Gems ↔ Pieces)
// =====================================================

/**
 * Execute trade: Gems → Pieces
 */
async function tradeGemsForPieces(userId, poolId, gemsAmount, minPiecesOut, slippageTolerance = 0.01) {
  if (!supabase) {
    return {
      success: true,
      gems_spent: gemsAmount,
      pieces_received: gemsAmount / 10,
      effective_price: 10,
    };
  }

  // Check Gems balance
  const balance = await getGemsBalance(userId);
  
  if (balance.balance < gemsAmount) {
    throw new Error(`Insufficient Gems. Available: ${balance.balance}, Required: ${gemsAmount}`);
  }

  // Import AMM service
  const pieceAMMService = require('./pieceAMMService');

  // Convert Gems to currency value for AMM
  const currencyValue = gemsAmount * GEMS_EXCHANGE_RATE;

  // Execute swap
  const swapResult = await pieceAMMService.swapCurrencyForPieces({
    poolId,
    traderId: userId,
    currencyIn: currencyValue,
    minPiecesOut,
    slippageTolerance,
  });

  // Debit Gems
  await debitGems(userId, gemsAmount, 'trade', {
    piece_type: swapResult.swap.piece_type,
    asset_id: swapResult.swap.asset_id,
    pieces_amount: swapResult.pieces_received,
    pool_id: poolId,
    description: `Traded ${gemsAmount} Gems for ${swapResult.pieces_received} Pieces`,
  });

  return {
    success: true,
    gems_spent: gemsAmount,
    pieces_received: swapResult.pieces_received,
    effective_price: gemsAmount / swapResult.pieces_received,
    swap_details: swapResult,
  };
}

/**
 * Execute trade: Pieces → Gems
 */
async function tradePiecesForGems(userId, poolId, piecesAmount, minGemsOut, slippageTolerance = 0.01) {
  if (!supabase) {
    return {
      success: true,
      pieces_sold: piecesAmount,
      gems_received: piecesAmount * 10,
      effective_price: 10,
    };
  }

  // Import AMM service
  const pieceAMMService = require('./pieceAMMService');

  // Execute swap
  const swapResult = await pieceAMMService.swapPiecesForCurrency({
    poolId,
    traderId: userId,
    piecesIn: piecesAmount,
    minCurrencyOut: minGemsOut * GEMS_EXCHANGE_RATE,
    slippageTolerance,
  });

  // Convert currency received to Gems
  const gemsReceived = Math.floor(swapResult.currency_received / GEMS_EXCHANGE_RATE);

  // Credit Gems
  await creditGems(userId, gemsReceived, 'trade', {
    piece_type: swapResult.swap.piece_type,
    asset_id: swapResult.swap.asset_id,
    pieces_amount: piecesAmount,
    pool_id: poolId,
    description: `Traded ${piecesAmount} Pieces for ${gemsReceived} Gems`,
  });

  return {
    success: true,
    pieces_sold: piecesAmount,
    gems_received: gemsReceived,
    effective_price: gemsReceived / piecesAmount,
    swap_details: swapResult,
  };
}

// =====================================================
// BONUS / PROMOTIONAL
// =====================================================

/**
 * Issue bonus Gems (referral rewards, promotions, etc.)
 */
async function issueBonusGems(userId, amount, reason, adminId = null) {
  if (!supabase) return { success: true };

  const result = await creditGems(userId, amount, 'bonus', {
    description: reason,
    issued_by: adminId,
  });

  return {
    success: true,
    gems_issued: amount,
    reason: reason,
    ...result,
  };
}

/**
 * Issue bonus Gems that stay locked until a stated objective is completed.
 */
async function issueObjectiveLockedBonusGems(userId, amount, reason, objectiveCode, adminId = null) {
  if (!supabase) return { success: true };

  const result = await creditGems(userId, amount, 'bonus', {
    description: reason,
    issued_by: adminId,
    objective_code: objectiveCode,
    objective_status: 'pending',
    redemption_status: 'locked_objective',
  });

  return {
    success: true,
    gems_issued: amount,
    objective_code: objectiveCode,
    reason,
    ...result,
  };
}

/**
 * Unlock bonus Gems for a completed objective.
 */
async function unlockObjectiveBonusGems(
  userId,
  objectiveCode,
  {
    completedAt = new Date().toISOString(),
    adminId = null,
    notes = null,
  } = {}
) {
  if (!supabase) return { success: true };

  const { data, error } = await supabase
    .from('gems_transactions')
    .update({
      objective_status: 'completed',
      objective_completed_at: completedAt,
      redemption_status: 'redeemable',
    })
    .eq('user_id', userId)
    .eq('transaction_type', 'bonus')
    .eq('objective_code', objectiveCode)
    .eq('objective_status', 'pending')
    .select('id');

  if (error) throw error;

  if ((data?.length || 0) > 0) {
    await recordGemsTransaction(userId, 0, 'adjustment', {
      description: `Objective ${objectiveCode} completed. ${data.length} bonus Gem grant(s) unlocked for redemption.`,
      issued_by: adminId,
      objective_code: objectiveCode,
      objective_status: 'completed',
      objective_completed_at: completedAt,
      metadata: notes ? { unlock_notes: notes } : {},
    });
  }

  return {
    success: true,
    unlocked_count: data?.length || 0,
    objective_code: objectiveCode,
  };
}

// =====================================================
// TRANSACTION HISTORY
// =====================================================

/**
 * Get transaction history
 */
async function getTransactionHistory(userId, limit = 50, offset = 0) {
  if (!supabase) {
    return {
      transactions: [],
      total: 0,
    };
  }

  const { data, error, count } = await supabase
    .from('gems_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    transactions: (data || []).map((transaction) => ({
      ...transaction,
      effective_redemption_status: getEffectiveRedemptionStatus(transaction, new Date()),
    })),
    total: count || 0,
    has_more: (count || 0) > (offset + limit),
  };
}

// =====================================================
// UTILITIES
// =====================================================

function roundGems(amount) {
  return Math.round(amount * Math.pow(10, GEMS_PRECISION)) / Math.pow(10, GEMS_PRECISION);
}

function gemsToUsd(gems) {
  return roundGems(gems * GEMS_EXCHANGE_RATE);
}

function usdToGems(usd) {
  return Math.floor(usd / GEMS_EXCHANGE_RATE);
}

function addDaysIso(baseIso, days) {
  const date = new Date(baseIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function defaultRedemptionStatusForTransaction(type, amount, context = {}) {
  if (amount <= 0) return 'not_applicable';
  if (type === 'purchase') return 'pending_30_day_hold';
  if (type === 'bonus') {
    return context.objectiveStatus === 'pending' ? 'locked_objective' : 'redeemable';
  }
  if (type === 'trade_in' || type === 'refund' || type === 'adjustment') return 'redeemable';
  return 'not_applicable';
}

function getEffectiveRedemptionStatus(transaction, referenceDate = new Date()) {
  if (Number(transaction.amount) <= 0) {
    return transaction.redemption_status || 'not_applicable';
  }

  if (transaction.transaction_type === 'purchase') {
    const redeemableAfter = transaction.redeemable_after
      ? new Date(transaction.redeemable_after)
      : new Date(new Date(transaction.created_at).getTime() + PURCHASE_REDEMPTION_HOLD_DAYS * 24 * 60 * 60 * 1000);
    return referenceDate >= redeemableAfter ? 'redeemable' : 'pending_30_day_hold';
  }

  if (transaction.transaction_type === 'bonus') {
    if ((transaction.objective_status || 'not_applicable') === 'pending') {
      return 'locked_objective';
    }
    return transaction.redemption_status === 'non_redeemable' ? 'non_redeemable' : 'redeemable';
  }

  return transaction.redemption_status || defaultRedemptionStatusForTransaction(transaction.transaction_type, Number(transaction.amount));
}

function classifyCreditLot(transaction, referenceDate = new Date()) {
  const amount = roundGems(Number(transaction.amount || 0));
  if (amount <= 0) return null;

  const status = getEffectiveRedemptionStatus(transaction, referenceDate);
  const kind = transaction.transaction_type === 'purchase'
    ? 'purchase'
    : transaction.transaction_type === 'bonus'
      ? 'bonus'
      : 'trade';

  return {
    id: transaction.id,
    createdAt: new Date(transaction.created_at),
    amount,
    remaining: amount,
    status,
    kind,
    redeemableAfter: transaction.redeemable_after || null,
  };
}

function getDebitConsumptionPriority(transaction, referenceDate = new Date()) {
  if (transaction.transaction_type === 'withdrawal') {
    return ['redeemable'];
  }

  if (transaction.transaction_type === 'trade_out' || transaction.transaction_type === 'fee') {
    return ['redeemable', 'pending_30_day_hold', 'locked_objective', 'non_redeemable'];
  }

  return ['redeemable', 'pending_30_day_hold', 'locked_objective', 'non_redeemable'];
}

function allocateDebitAcrossLots(lots, debitTransaction) {
  let remainingDebit = roundGems(Math.abs(Number(debitTransaction.amount || 0)));
  const priority = getDebitConsumptionPriority(debitTransaction, new Date(debitTransaction.created_at));

  for (const desiredStatus of priority) {
    for (const lot of lots) {
      if (remainingDebit <= 0) break;
      if (lot.remaining <= 0 || lot.status !== desiredStatus) continue;

      const applied = Math.min(lot.remaining, remainingDebit);
      lot.remaining = roundGems(lot.remaining - applied);
      remainingDebit = roundGems(remainingDebit - applied);
    }
  }

  if (remainingDebit <= 0) return;

  for (const lot of lots) {
    if (remainingDebit <= 0) break;
    if (lot.remaining <= 0) continue;

    const applied = Math.min(lot.remaining, remainingDebit);
    lot.remaining = roundGems(lot.remaining - applied);
    remainingDebit = roundGems(remainingDebit - applied);
  }
}

async function getRedemptionSummary(userId) {
  if (!supabase) {
    return {
      withdrawable_balance: 0,
      pending_purchase_redemption_balance: 0,
      locked_bonus_balance: 0,
      purchased_balance: 0,
      bonus_balance: 0,
      trade_balance: 0,
      next_purchase_redemption_at: null,
    };
  }

  const { data, error } = await supabase
    .from('gems_transactions')
    .select('id, transaction_type, amount, created_at, redemption_status, redeemable_after, objective_status')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const transactions = data || [];
  const lots = [];

  for (const transaction of transactions) {
    const amount = Number(transaction.amount || 0);
    if (amount > 0) {
      const lot = classifyCreditLot(transaction);
      if (lot) lots.push(lot);
      continue;
    }

    if (amount < 0) {
      allocateDebitAcrossLots(lots, transaction);
    }
  }

  const summary = {
    withdrawable_balance: 0,
    pending_purchase_redemption_balance: 0,
    locked_bonus_balance: 0,
    purchased_balance: 0,
    bonus_balance: 0,
    trade_balance: 0,
    next_purchase_redemption_at: null,
  };

  for (const lot of lots) {
    if (lot.remaining <= 0) continue;

    if (lot.kind === 'purchase') {
      summary.purchased_balance = roundGems(summary.purchased_balance + lot.remaining);
      if (lot.status === 'redeemable') {
        summary.withdrawable_balance = roundGems(summary.withdrawable_balance + lot.remaining);
      } else {
        summary.pending_purchase_redemption_balance = roundGems(summary.pending_purchase_redemption_balance + lot.remaining);
        if (!summary.next_purchase_redemption_at || new Date(lot.redeemableAfter) < new Date(summary.next_purchase_redemption_at)) {
          summary.next_purchase_redemption_at = lot.redeemableAfter;
        }
      }
      continue;
    }

    if (lot.kind === 'bonus') {
      summary.bonus_balance = roundGems(summary.bonus_balance + lot.remaining);
      if (lot.status === 'redeemable') {
        summary.withdrawable_balance = roundGems(summary.withdrawable_balance + lot.remaining);
      } else {
        summary.locked_bonus_balance = roundGems(summary.locked_bonus_balance + lot.remaining);
      }
      continue;
    }

    summary.trade_balance = roundGems(summary.trade_balance + lot.remaining);
    if (lot.status === 'redeemable') {
      summary.withdrawable_balance = roundGems(summary.withdrawable_balance + lot.remaining);
    }
  }

  return summary;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Balance
  getGemsBalance,
  creditGems,
  debitGems,
  
  // Purchase
  createPurchaseIntent,
  handleStripeWebhook,
  
  // Withdrawal
  requestWithdrawal,
  processWithdrawal,
  
  // Trading
  tradeGemsForPieces,
  tradePiecesForGems,
  
  // Bonus
  issueBonusGems,
  issueObjectiveLockedBonusGems,
  unlockObjectiveBonusGems,
  
  // History
  getTransactionHistory,
  
  // Utilities
  gemsToUsd,
  usdToGems,
  GEMS_EXCHANGE_RATE,
  MIN_GEMS_PURCHASE,
  MAX_GEMS_PURCHASE,
  PURCHASE_REDEMPTION_HOLD_DAYS,
};
