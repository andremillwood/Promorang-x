'use strict';
const { calculateCommissionQuote } = require('./communityPartnerCommission');

// A read-only eligibility gate. No payment, entitlement or commission ledger writes.
// A fulfillment record must come from trusted merchant/operator systems, never
// directly from a participant-supplied screenshot.
function quoteEligiblePartnerOrder({
  orderId, buyerId, merchantId, partnerId, attributedPartnerId,
  paymentStatus, fulfillmentStatus, refundedCents = 0,
  eligibleOrderCents, contributionMarginCents, currency = 'JMD',
  attributionVerified = false, partnerApproved = false,
}) {
  const reasons = [];
  if (![orderId, buyerId, merchantId, partnerId].every(v => typeof v === 'string' && v.trim())) reasons.push('missing_identity');
  if (buyerId && (buyerId === partnerId || buyerId === merchantId)) reasons.push('self_referral');
  if (merchantId && merchantId === partnerId) reasons.push('merchant_self_referral');
  if (!attributionVerified || attributedPartnerId !== partnerId) reasons.push('unverified_attribution');
  if (!partnerApproved) reasons.push('partner_not_approved');
  if (paymentStatus !== 'paid') reasons.push('payment_not_settled');
  if (!['delivered', 'redeemed'].includes(fulfillmentStatus)) reasons.push('not_fulfilled');
  if (currency !== 'JMD') reasons.push('unsupported_currency');
  if (!Number.isSafeInteger(refundedCents) || refundedCents < 0 || refundedCents > 0) reasons.push('refunded_or_invalid');
  if (reasons.length) return { eligible: false, reasons, quote: null };
  return { eligible: true, reasons: [], quote: calculateCommissionQuote({ eligibleOrderCents, contributionMarginCents }) };
}
module.exports = { quoteEligiblePartnerOrder };
