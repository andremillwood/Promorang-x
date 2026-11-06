'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { quoteEligiblePartnerOrder } = require('../services/communityPartnerEligibility');
const base = {
  orderId: 'order-1', buyerId: 'buyer-1', merchantId: 'merchant-1', partnerId: 'partner-1',
  attributedPartnerId: 'partner-1', attributionVerified: true, partnerApproved: true,
  paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'JMD',
  eligibleOrderCents: 350000, contributionMarginCents: 100000, refundedCents: 0,
};
test('quotes a verified, fulfilled order only', () => {
  const result = quoteEligiblePartnerOrder(base);
  assert.equal(result.eligible, true);
  assert.equal(result.quote.commissionCents, 17500);
});
for (const [label, override] of Object.entries({
  unpaid: { paymentStatus: 'requires_payment' },
  unfulfilled: { fulfillmentStatus: 'unfulfilled' },
  refunded: { refundedCents: 100 },
  selfReferral: { buyerId: 'partner-1' },
  attributionMissing: { attributionVerified: false },
  attributionMismatch: { attributedPartnerId: 'someone-else' },
  unapproved: { partnerApproved: false },
  wrongCurrency: { currency: 'USD' },
})) test('blocks '+label, () => {
  const result = quoteEligiblePartnerOrder({ ...base, ...override });
  assert.equal(result.eligible, false);
  assert.equal(result.quote, null);
});
