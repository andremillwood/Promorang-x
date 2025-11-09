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

module.exports = {
  trackEarning,
  trackDropCompletion,
  trackCampaignSpend,
  trackProductSale,
  trackSubscription,
  trackContentMonetization,
};
