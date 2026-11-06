'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { preparePartnerOrderOutcome } = require('../services/partnerOrderAdapter');
const fixtures = {
  partner_campaigns: [{ id: 'campaign-1', merchant_id: 'merchant-1', currency: 'JMD', rate_bps: 500, margin_cap_bps: 2500, active: true }],
  commerce_orders: [{ id: 'order-1', buyer_id: 'buyer-1', merchant_id: 'merchant-1', currency: 'JMD', subtotal: 3500, payment_status: 'paid', fulfillment_status: 'delivered', payment_collection: 'merchant', merchant_payment_confirmed_at: '2026-11-06T00:00:00Z', merchant_payment_reference: 'receipt', metadata: { referrer_id: 'partner-1', referral_code: 'REF1' } }],
  partner_campaign_members: [{ campaign_id: 'campaign-1', partner_id: 'partner-1' }],
  referral_codes: [{ user_id: 'partner-1', code: 'REF1', is_active: true, expires_at: null }],
};
function dbFor(data) {
  return { from(table) {
    let rows = data[table] || [];
    const q = {
      select() { return q; },
      eq(key, value) { rows = rows.filter(row => row[key] === value); return q; },
      async single() { return { data: rows[0] || null, error: rows.length ? null : new Error('Not found') }; },
      then(resolve, reject) { return Promise.resolve({ data: rows, error: null }).then(resolve, reject); },
    };
    return q;
  } };
}
test('reads authoritative records and prepares verified direct-payment outcome', async () => {
  const r = await preparePartnerOrderOutcome({ db: dbFor(fixtures), campaignId: 'campaign-1', orderId: 'order-1', contributionMargin: 1000 });
  assert.equal(r.verified, true);
  assert.equal(r.outcome.commissionQuote, 175);
  assert.equal(r.persisted, false);
});
test('rejects revoked referral', async () => {
  const r = await preparePartnerOrderOutcome({ db: dbFor({ ...fixtures, referral_codes: [{ ...fixtures.referral_codes[0], is_active: false }] }), campaignId: 'campaign-1', orderId: 'order-1', contributionMargin: 1000 });
  assert.equal(r.verified, false);
});
test('rejects unapproved partner', async () => {
  const r = await preparePartnerOrderOutcome({ db: dbFor({ ...fixtures, partner_campaign_members: [] }), campaignId: 'campaign-1', orderId: 'order-1', contributionMargin: 1000 });
  assert.equal(r.verified, false);
});
