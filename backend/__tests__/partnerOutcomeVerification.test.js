'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { OUTCOME_TYPES, ACTIVE_ADAPTERS, verifyOrderOutcome } = require('../services/partnerOutcomeVerification');
const campaign = { id: 'campaign-1', merchant_id: 'merchant-1', currency: 'JMD', active: true, rate_bps: 500, margin_cap_bps: 2500 };
const order = { id: 'order-1', buyer_id: 'buyer-1', merchant_id: 'merchant-1', currency: 'JMD', subtotal: 3500, payment_status: 'paid', fulfillment_status: 'delivered', payment_collection: 'merchant', merchant_payment_confirmed_at: '2026-11-06T00:00:00Z', merchant_payment_reference: 'bank-1', metadata: { referrer_id: 'partner-1', referral_code: 'PARTNER1' } };
const input = { order, campaign, partnerId: 'partner-1', referralCode: 'PARTNER1', approvedPartnerIds: ['partner-1'], contributionMargin: 1000 };
test('outcome types defined but only orders enabled', () => {
  assert.equal(OUTCOME_TYPES.length, 6);
  assert.deepEqual(ACTIVE_ADAPTERS, ['order_fulfilled']);
});
test('verified direct payment yields margin-safe quote', () => {
  const result = verifyOrderOutcome(input);
  assert.equal(result.verified, true);
  assert.equal(result.outcome.commissionQuote, 175);
});
test('verified online payment supported with provider reference', () => {
  const result = verifyOrderOutcome({ ...input, order: { ...order, payment_collection: 'platform', stripe_payment_intent_id: 'pi_test' } });
  assert.equal(result.verified, true);
});
for (const [name, change] of Object.entries({
  unpaid: { payment_status: 'requires_payment' },
  unfulfilled: { fulfillment_status: 'preparing' },
  refunded: { payment_status: 'refunded' },
  missingBankConfirmation: { merchant_payment_reference: null },
  missingOnlineConfirmation: { payment_collection: 'platform', stripe_payment_intent_id: null },
  wrongCurrency: { currency: 'USD' },
  selfReferral: { buyer_id: 'partner-1' },
  wrongAttribution: { metadata: { referrer_id: 'other', referral_code: 'OTHER' } },
})) test('rejects '+name, () => assert.equal(verifyOrderOutcome({ ...input, order: { ...order, ...change } }).verified, false));
test('rejects unapproved partner and missing margin', () => {
  assert.equal(verifyOrderOutcome({ ...input, approvedPartnerIds: [] }).verified, false);
  assert.equal(verifyOrderOutcome({ ...input, contributionMargin: null }).verified, false);
});
