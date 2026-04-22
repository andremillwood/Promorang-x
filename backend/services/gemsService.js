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

  return {
    user_id: userId,
    balance: parseFloat(balance),
    currency: 'GEMS',
    usd_value: parseFloat(balance) * GEMS_EXCHANGE_RATE,
    lifetime_purchased: data?.gems_purchased_total || 0,
    lifetime_traded: data?.gems_traded_total || 0,
    lifetime_withdrawn: data?.gems_withdrawn_total || 0,
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

    const { error } = await supabase
      .from('user_balances')
      .update({
        balance: newBalance,
        gems_purchased_total: newPurchased,
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

  const { error } = await supabase.from('gems_transactions').insert({
    user_id: userId,
    transaction_type: type,
    amount: amount,
    balance_after: balance.balance,
    
    // Purchase metadata
    fiat_amount: metadata.fiat_amount,
    fiat_currency: metadata.fiat_currency || 'USD',
    stripe_payment_intent_id: metadata.stripe_payment_intent_id,
    
    // Trade metadata
    piece_type: metadata.piece_type,
    asset_id: metadata.asset_id,
    pieces_amount: metadata.pieces_amount,
    pool_id: metadata.pool_id,
    
    // Withdrawal metadata
    withdrawal_method: metadata.withdrawal_method,
    
    description: metadata.description || `${type} transaction`,
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
async function createPurchaseIntent(userId, usdAmount) {
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

  // Get Stripe customer
  const { data: user } = await supabase
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  let customerId = user?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: userId },
    });
    customerId = customer.id;
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(actualUsdAmount * 100), // cents
    currency: 'usd',
    customer: customerId,
    description: `Purchase ${gemsAmount} Gems`,
    metadata: {
      user_id: userId,
      gems_amount: gemsAmount,
      usd_amount: actualUsdAmount,
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
    const metadata = paymentIntent.metadata;

    if (metadata.type !== 'gems_purchase') {
      return { success: false, reason: 'Not a gems purchase' };
    }

    const userId = metadata.user_id;
    const gemsAmount = parseInt(metadata.gems_amount);
    const usdAmount = parseFloat(metadata.usd_amount);

    // Credit Gems
    await creditGems(userId, gemsAmount, 'purchase', {
      fiat_amount: usdAmount,
      fiat_currency: 'USD',
      stripe_payment_intent_id: paymentIntent.id,
      description: `Purchased ${gemsAmount} Gems for $${usdAmount.toFixed(2)}`,
    });

    return {
      success: true,
      user_id: userId,
      gems_credited: gemsAmount,
      usd_paid: usdAmount,
    };
  }

  return { success: false, reason: 'Unhandled event type' };
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

  const usdAmount = gemsAmount * GEMS_EXCHANGE_RATE;

  // Minimum withdrawal
  if (usdAmount < 10) {
    throw new Error('Minimum withdrawal is $10.00 (100 Gems)');
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
    transactions: data || [],
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
  
  // History
  getTransactionHistory,
  
  // Utilities
  gemsToUsd,
  usdToGems,
  GEMS_EXCHANGE_RATE,
  MIN_GEMS_PURCHASE,
  MAX_GEMS_PURCHASE,
};
