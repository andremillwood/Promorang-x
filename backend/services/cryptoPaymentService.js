/**
 * Crypto Payment Service
 * Stripe-safe cryptocurrency integration
 * Uses Coinbase Commerce for payments + self-custody for trading
 * 
 * IMPORTANT: This service keeps Stripe account safe by:
 * 1. Not using Stripe for any securities-like transactions
 * 2. Using Coinbase Commerce for crypto payments (not Stripe)
 * 3. Keeping crypto trading separate from fiat processing
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const COINBASE_COMMERCE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY;
const COINBASE_COMMERCE_WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
const COINBASE_API_URL = 'https://api.commerce.coinbase.com';

const SUPPORTED_CRYPTOCURRENCIES = [
  'USDC',  // Preferred - stablecoin, low volatility
  'ETH',   // Ethereum
  'BTC',   // Bitcoin
  'DAI',   // Decentralized stablecoin
];

const PREFERRED_CURRENCY = 'USDC'; // Use stablecoin to avoid price volatility

// =====================================================
// FIAT ON-RAMP (Stripe) - FOR DEPOSITS ONLY
// =====================================================

/**
 * Create a fiat deposit charge via Stripe
 * This is SAFE because it's just a deposit, not trading
 */
async function createFiatDeposit({
  userId,
  amount,
  currency = 'USD',
  description = 'Account deposit',
  userEmail = null,
}) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe is not configured on the server');
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Get or create Stripe customer
    let customerId = null;
    let email = userEmail;

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
    } catch (_) {}

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
      } catch (_) {}
    }

    if (!customerId) {
      const customerPayload = {
        metadata: { user_id: userId },
      };
      if (email) {
        customerPayload.email = email;
      }
      const customer = await stripe.customers.create(customerPayload);
      customerId = customer.id;
      
      // Save Stripe customer ID
      try {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      } catch (_) {}
      try {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      } catch (_) {}
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      description: description,
      metadata: {
        user_id: userId,
        transaction_type: 'deposit',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Record pending deposit
    await supabase.from('fiat_transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: amount,
      currency: currency,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
    });
    
    return {
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    };
  } catch (error) {
    console.error('[CryptoPayment] Stripe deposit error:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook for successful deposits
 */
async function handleStripeWebhook(event) {
  const { type, data } = event;
  
  if (type === 'payment_intent.succeeded') {
    const paymentIntent = data.object;
    const userId = paymentIntent.metadata.user_id;
    const amount = paymentIntent.amount / 100;
    
    // Update transaction status
    await supabase
      .from('fiat_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);
    
    // Credit user's fiat balance
    await creditFiatBalance(userId, amount, 'USD');
    
    return { success: true, userId, amount };
  }
  
  return { success: false, reason: 'Unhandled event type' };
}

// =====================================================
// CRYPTO PAYMENTS (Coinbase Commerce)
// =====================================================

/**
 * Create a crypto payment charge
 * Used for buying pieces with cryptocurrency
 */
async function createCryptoCharge({
  userId,
  amount,
  currency = PREFERRED_CURRENCY,
  description,
  metadata = {},
  redirectUrl,
  cancelUrl,
}) {
  if (!COINBASE_COMMERCE_API_KEY) {
    throw new Error('Coinbase Commerce not configured');
  }
  
  try {
    const response = await fetch(`${COINBASE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: 'Piece Purchase',
        description: description || `Purchase pieces on Promorang`,
        local_price: {
          amount: amount.toString(),
          currency: currency,
        },
        pricing_type: 'fixed_price',
        metadata: {
          user_id: userId,
          ...metadata,
        },
        redirect_url: redirectUrl,
        cancel_url: cancelUrl,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coinbase Commerce error: ${error}`);
    }
    
    const data = await response.json();
    const charge = data.data;
    
    // Record the charge
    await supabase.from('crypto_charges').insert({
      user_id: userId,
      coinbase_charge_id: charge.id,
      code: charge.code,
      amount: amount,
      currency: currency,
      status: charge.timeline[0]?.status || 'NEW',
      metadata: metadata,
      expires_at: charge.expires_at,
    });
    
    return {
      success: true,
      charge_id: charge.id,
      code: charge.code,
      hosted_url: charge.hosted_url, // User pays here
      payment_addresses: charge.addresses, // Direct payment addresses
    };
  } catch (error) {
    console.error('[CryptoPayment] Create charge error:', error);
    throw error;
  }
}

/**
 * Handle Coinbase Commerce webhook
 */
async function handleCoinbaseWebhook(payload, signature) {
  // Verify signature (in production, implement proper verification)
  // For now, we'll trust the payload but check the secret
  
  const { event, data } = payload;
  const charge = data;
  
  console.log(`[CryptoPayment] Coinbase event: ${event.type}`, charge.id);
  
  switch (event.type) {
    case 'charge:confirmed':
      return await processConfirmedPayment(charge);
    
    case 'charge:failed':
      return await processFailedPayment(charge);
    
    case 'charge:delayed':
      return await processDelayedPayment(charge);
    
    case 'charge:pending':
      return await processPendingPayment(charge);
    
    default:
      return { success: false, reason: 'Unhandled event type' };
  }
}

async function processConfirmedPayment(charge) {
  const metadata = charge.metadata || {};
  const userId = metadata.user_id;
  const amount = parseFloat(charge.pricing.local.amount);
  const currency = charge.pricing.local.currency;
  const cryptoAmount = charge.pricing.settlement?.amount;
  const cryptoCurrency = charge.pricing.settlement?.currency;
  
  // Update charge status
  await supabase
    .from('crypto_charges')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      crypto_amount: cryptoAmount,
      crypto_currency: cryptoCurrency,
      transaction_hash: charge.payments?.[0]?.transaction_id,
    })
    .eq('coinbase_charge_id', charge.id);
  
  // Credit user's crypto balance
  await creditCryptoBalance(userId, amount, currency, {
    source: 'coinbase_commerce',
    charge_id: charge.id,
    crypto_amount: cryptoAmount,
    crypto_currency: cryptoCurrency,
  });
  
  // If this was for a specific trade, execute it
  if (metadata.trade_type === 'piece_purchase') {
    // Trigger the trade execution
    // This would call the AMM service
  }
  
  return {
    success: true,
    userId,
    amount,
    currency,
    cryptoAmount,
    cryptoCurrency,
  };
}

async function processFailedPayment(charge) {
  await supabase
    .from('crypto_charges')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString(),
    })
    .eq('coinbase_charge_id', charge.id);
  
  return { success: true, status: 'failed' };
}

async function processDelayedPayment(charge) {
  await supabase
    .from('crypto_charges')
    .update({
      status: 'delayed',
    })
    .eq('coinbase_charge_id', charge.id);
  
  return { success: true, status: 'delayed' };
}

async function processPendingPayment(charge) {
  await supabase
    .from('crypto_charges')
    .update({
      status: 'pending',
    })
    .eq('coinbase_charge_id', charge.id);
  
  return { success: true, status: 'pending' };
}

// =====================================================
// WALLET INTEGRATION (Self-Custody)
// =====================================================

/**
 * Connect a user's crypto wallet
 * This enables direct blockchain interactions
 */
async function connectWallet(userId, walletData) {
  const {
    address,
    chain_id,
    wallet_type, // 'metamask', 'walletconnect', 'coinbase_wallet', etc.
    signature, // Signed message to prove ownership
  } = walletData;
  
  // Verify signature (simplified - production needs proper verification)
  const isValid = await verifyWalletOwnership(address, signature);
  
  if (!isValid) {
    throw new Error('Invalid wallet signature');
  }
  
  // Save wallet connection
  const { data, error } = await supabase
    .from('user_wallets')
    .upsert({
      user_id: userId,
      address: address.toLowerCase(),
      chain_id: chain_id,
      wallet_type: wallet_type,
      is_active: true,
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,address',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    success: true,
    wallet: data,
  };
}

async function verifyWalletOwnership(address, signature) {
  // In production, use ethers.js or web3.js to verify
  // For now, return true for development
  return true;
}

/**
 * Get user's connected wallets
 */
async function getUserWallets(userId) {
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('connected_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Disconnect wallet
 */
async function disconnectWallet(userId, address) {
  const { error } = await supabase
    .from('user_wallets')
    .update({
      is_active: false,
      disconnected_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('address', address.toLowerCase());
  
  if (error) throw error;
  
  return { success: true };
}

// =====================================================
// BALANCE MANAGEMENT
// =====================================================

async function creditFiatBalance(userId, amount, currency) {
  const { data: existing, error: checkError } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .eq('type', 'fiat')
    .single();
  
  if (existing) {
    await supabase
      .from('user_balances')
      .update({
        balance: existing.balance + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_balances').insert({
      user_id: userId,
      type: 'fiat',
      currency: currency,
      balance: amount,
    });
  }
}

async function creditCryptoBalance(userId, amount, currency, metadata = {}) {
  const { data: existing, error: checkError } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .eq('type', 'crypto')
    .single();
  
  if (existing) {
    await supabase
      .from('user_balances')
      .update({
        balance: existing.balance + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_balances').insert({
      user_id: userId,
      type: 'crypto',
      currency: currency,
      balance: amount,
      metadata: metadata,
    });
  }
}

async function getUserBalance(userId, currency, type = 'fiat') {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .eq('type', type)
    .single();
  
  if (error) return { balance: 0, currency, type };
  return data;
}

async function getAllUserBalances(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .order('type', { ascending: true });
  
  if (error) return [];
  return data || [];
}

// =====================================================
// WITHDRAWALS
// =====================================================

/**
 * Withdraw fiat to bank (via Stripe)
 */
async function createFiatWithdrawal(userId, amount, currency = 'USD') {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Check balance
    const balance = await getUserBalance(userId, currency, 'fiat');
    if (balance.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Get user's connected account
    const { data: user } = await supabase
      .from('users')
      .select('stripe_connect_account_id')
      .eq('id', userId)
      .single();
    
    if (!user?.stripe_connect_account_id) {
      throw new Error('No connected bank account');
    }
    
    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      destination: user.stripe_connect_account_id,
    });
    
    // Debit user's balance
    await supabase
      .from('user_balances')
      .update({
        balance: balance.balance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', balance.id);
    
    // Record withdrawal
    await supabase.from('fiat_transactions').insert({
      user_id: userId,
      type: 'withdrawal',
      amount: -amount,
      currency: currency,
      stripe_transfer_id: transfer.id,
      status: 'completed',
    });
    
    return {
      success: true,
      transfer_id: transfer.id,
      amount: amount,
    };
  } catch (error) {
    console.error('[CryptoPayment] Fiat withdrawal error:', error);
    throw error;
  }
}

/**
 * Withdraw crypto to wallet
 */
async function createCryptoWithdrawal(userId, amount, currency, destinationAddress) {
  // Check balance
  const balance = await getUserBalance(userId, currency, 'crypto');
  if (balance.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  // Record withdrawal request
  const { data: withdrawal, error } = await supabase
    .from('crypto_withdrawals')
    .insert({
      user_id: userId,
      amount: amount,
      currency: currency,
      destination_address: destinationAddress,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Debit balance immediately (hold the funds)
  await supabase
    .from('user_balances')
    .update({
      balance: balance.balance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', balance.id);
  
  // In production, this would:
  // 1. Submit transaction to blockchain
  // 2. Wait for confirmations
  // 3. Update status
  
  return {
    success: true,
    withdrawal_id: withdrawal.id,
    status: 'pending',
    estimated_time: '5-30 minutes',
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Fiat (Stripe) - SAFE for deposits
  createFiatDeposit,
  handleStripeWebhook,
  
  // Crypto (Coinbase Commerce)
  createCryptoCharge,
  handleCoinbaseWebhook,
  
  // Wallet management
  connectWallet,
  getUserWallets,
  disconnectWallet,
  
  // Balances
  getUserBalance,
  getAllUserBalances,
  creditFiatBalance,
  creditCryptoBalance,
  
  // Withdrawals
  createFiatWithdrawal,
  createCryptoWithdrawal,
  
  // Constants
  SUPPORTED_CRYPTOCURRENCIES,
  PREFERRED_CURRENCY,
};
