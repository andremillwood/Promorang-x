/**
 * REFERRAL COMMISSION TRACKER
 * Utility to track earnings and trigger referral commissions
 * Call this whenever a user earns something
 */

const referralService = require('../services/referralService');

/**
 * Track an earning and calculate referral commission
 * @param {Object} params - Earning parameters
 * @param {string} params.userId - ID of the user who earned
 * @param {string} params.earningType - Type of earning (drop_completion, campaign_spend, etc.)
 * @param {number} params.amount - Amount earned
 * @param {string} params.currency - Currency type (usd, gems, points)
 * @param {string} params.transactionId - Optional transaction ID
 * @param {string} params.sourceTable - Optional source table name
 * @param {Object} params.metadata - Optional metadata
 */
async function trackEarning(params) {
  const {
    userId,
    earningType,
    amount,
    currency = 'gems',
    transactionId = null,
    sourceTable = null,
    metadata = {},
  } = params;

  if (!userId || !earningType || !amount) {
    console.warn('[Referral Tracker] Missing required parameters');
    return null;
  }

  try {
    // Calculate and process commission
    const commission = await referralService.calculateCommission({
      referredUserId: userId,
      earningType,
      earningAmount: amount,
      earningCurrency: currency,
      sourceTransactionId: transactionId,
      sourceTable,
      metadata,
    });

    if (commission) {
      console.log(`[Referral Tracker] Commission calculated for user ${userId}: ${commission.commission_amount} ${commission.commission_currency}`);

      // Check if user should be activated
      await referralService.activateReferral(userId);

      // Update referrer's tier if needed
      await referralService.updateReferralTier(commission.referrer_id);
    }

    return commission;
  } catch (error) {
    console.error('[Referral Tracker] Error tracking earning:', error);
    return null;
  }
}

/**
 * Track drop completion earning
 */
async function trackDropCompletion(userId, gemReward, dropId) {
  return trackEarning({
    userId,
    earningType: 'drop_completion',
    amount: gemReward,
    currency: 'gems',
    transactionId: dropId,
    sourceTable: 'drops',
    metadata: {
      drop_id: dropId,
      reward_type: 'gems',
    },
  });
}

/**
 * Track campaign spend
 */
async function trackCampaignSpend(userId, spendAmount, campaignId) {
  return trackEarning({
    userId,
    earningType: 'campaign_spend',
    amount: spendAmount,
    currency: 'usd',
    transactionId: campaignId,
    sourceTable: 'advertiser_campaigns',
    metadata: {
      campaign_id: campaignId,
    },
  });
}

/**
 * Track product sale
 */
async function trackProductSale(userId, saleAmount, orderId) {
  return trackEarning({
    userId,
    earningType: 'product_sale',
    amount: saleAmount,
    currency: 'usd',
    transactionId: orderId,
    sourceTable: 'orders',
    metadata: {
      order_id: orderId,
    },
  });
}

/**
 * Track subscription payment
 */
async function trackSubscription(userId, subscriptionAmount, subscriptionId) {
  return trackEarning({
    userId,
    earningType: 'subscription',
    amount: subscriptionAmount,
    currency: 'usd',
    transactionId: subscriptionId,
    sourceTable: 'subscriptions',
    metadata: {
      subscription_id: subscriptionId,
    },
  });
}

/**
 * Track content monetization
 */
async function trackContentMonetization(userId, earnings, contentId) {
  return trackEarning({
    userId,
    earningType: 'content_monetization',
    amount: earnings,
    currency: 'usd',
    transactionId: contentId,
    sourceTable: 'content_items',
    metadata: {
      content_id: contentId,
    },
  });
}

/**
 * Track affiliate product sale
 * This is used when a sale comes from a specific affiliate link
 * (different from the user's original referrer)
 * @param {string} affiliateCode - The referral code from the affiliate link
 * @param {number} saleAmount - The sale amount in USD
 * @param {string} orderId - The order ID
 * @param {string} productId - The product ID (optional, for tracking)
 */
async function trackAffiliateProductSale(affiliateCode, saleAmount, orderId, productId = null) {
  if (!affiliateCode || !saleAmount) {
    console.warn('[Referral Tracker] Missing affiliate code or sale amount');
    return null;
  }

  try {
    // Find the affiliate user who owns this referral code
    const { supabase } = require('../lib/supabase');
    if (!supabase) {
      console.warn('[Referral Tracker] Supabase not available for affiliate tracking');
      return null;
    }

    // Look up the referral code to find the affiliate user
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id, code')
      .eq('code', affiliateCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (!codeData) {
      console.log(`[Referral Tracker] Affiliate code not found or inactive: ${affiliateCode}`);
      return null;
    }

    // Calculate commission directly for the affiliate
    const commission = await referralService.calculateCommission({
      referredUserId: null, // Not a referred user, it's an affiliate sale
      earningType: 'affiliate_product_sale',
      earningAmount: saleAmount,
      earningCurrency: 'usd',
      sourceTransactionId: orderId,
      sourceTable: 'orders',
      metadata: {
        order_id: orderId,
        product_id: productId,
        affiliate_code: affiliateCode,
        affiliate_user_id: codeData.user_id, // Explicitly specify who gets the commission
      },
      // Override: specify the affiliate user directly
      forceReferrerId: codeData.user_id,
    });

    if (commission) {
      console.log(`[Referral Tracker] Affiliate commission for code ${affiliateCode}: ${commission.commission_amount} ${commission.commission_currency}`);
    }

    return commission;
  } catch (error) {
    console.error('[Referral Tracker] Error tracking affiliate sale:', error);
    return null;
  }
}

module.exports = {
  trackEarning,
  trackDropCompletion,
  trackCampaignSpend,
  trackProductSale,
  trackAffiliateProductSale,
  trackSubscription,
  trackContentMonetization,
};
