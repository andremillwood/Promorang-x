'use strict';

// Shared commercial outcome validation. No financial writes or payouts.
// Only adapters backed by authoritative evidence can mark an outcome verified.
const OUTCOME_TYPES = Object.freeze([
  'order_fulfilled', 'event_checked_in', 'lead_qualified',
  'sale_closed', 'subscription_paid', 'shipment_completed',
]);
const ACTIVE_ADAPTERS = Object.freeze(['order_fulfilled']);
function verifyOrderOutcome({ order, campaign, partnerId, referralCode, approvedPartnerIds, contributionMargin }) {
  const errors = [];
  if (!order || !campaign) return { verified: false, errors: ['missing_order_or_campaign'] };
  if (campaign.active !== true) errors.push('inactive_campaign');
  if (order.merchant_id !== campaign.merchant_id) errors.push('merchant_mismatch');
  if (order.currency !== campaign.currency) errors.push('currency_mismatch');
  if (order.payment_status !== 'paid') errors.push('unpaid');
  if (!['delivered', 'redeemed'].includes(order.fulfillment_status)) errors.push('not_fulfilled');
  if (!['merchant', 'platform'].includes(order.payment_collection)) errors.push('unknown_payment_method');
  if (order.payment_collection === 'merchant' && (!order.merchant_payment_confirmed_at || !order.merchant_payment_reference)) errors.push('unconfirmed_direct_payment');
  if (order.payment_collection === 'platform' && !order.stripe_payment_intent_id) errors.push('unconfirmed_online_payment');
  if (!partnerId || partnerId === order.buyer_id || partnerId === order.merchant_id) errors.push('invalid_partner');
  if (!Array.isArray(approvedPartnerIds) || !approvedPartnerIds.includes(partnerId)) errors.push('unapproved_partner');
  if (order.metadata?.referrer_id !== partnerId || !referralCode || order.metadata?.referral_code?.toUpperCase() !== referralCode.toUpperCase()) errors.push('attribution_mismatch');
  if (!Number.isFinite(Number(order.subtotal)) || Number(order.subtotal) <= 0) errors.push('invalid_order_value');
  if (typeof contributionMargin !== 'number' || !Number.isFinite(contributionMargin) || contributionMargin < 0 || contributionMargin > Number(order.subtotal)) errors.push('invalid_margin');
  if (errors.length) return { verified: false, errors };
  const amount = Number(order.subtotal);
  const rate = Number(campaign.rate_bps);
  const cap = Number(campaign.margin_cap_bps);
  if (![rate, cap].every(Number.isInteger) || rate < 0 || rate > 1000 || cap < 0 || cap > 10000) return { verified: false, errors: ['invalid_campaign_policy'] };
  return {
    verified: true,
    errors: [],
    outcome: {
      type: 'order_fulfilled', sourceSystem: 'commerce_orders', sourceId: order.id,
      partnerId, campaignId: campaign.id, currency: order.currency, eligibleAmount: amount,
      verifiedMargin: contributionMargin,
      commissionQuote: Math.min(Math.round(amount * rate / 100) / 100, Math.round(contributionMargin * cap / 100) / 100),
      status: 'verified',
    },
  };
}
module.exports = { OUTCOME_TYPES, ACTIVE_ADAPTERS, verifyOrderOutcome };
