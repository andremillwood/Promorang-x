const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const coupons = [], sessions = [];
const sandbox = { module: { exports: {} }, process: { env: { STRIPE_SECRET_KEY: 'test_fixture' } }, console, require(name) {
  if (name === 'stripe') return class { constructor() { this.products = { create: async () => ({ id: 'prod_coffee' }) }; this.coupons = { create: async (...args) => { coupons.push(args); return { id: 'coupon_order' }; } }; this.checkout = { sessions: { create: async (...args) => { sessions.push(args); return { id: 'cs_order' }; } } }; } };
  if (name === '../lib/supabase') return { supabase: null };
  throw new Error(`Unexpected dependency ${name}`);
} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../services/stripeService.js'),'utf8'),sandbox);
const { createConnectedCheckoutSession } = sandbox.module.exports;
const input = { connectedAccountId: 'acct_store', order: { id: 'order1', currency: 'USD', platform_fee: 10, merchant_id: 'store', buyer_id: 'buyer', metadata: { discount_amount: 20, discount_product_ids: ['a'] } }, items: [{ product_id: 'a', product_name: 'Coffee', unit_price: 50, quantity: 2 }], successUrl: 'https://example.com/shop/cart', cancelUrl: 'https://example.com/shop/cart' };
beforeEach(() => { coupons.length=0; sessions.length=0; });
test('merchant checkout applies the reserved benefit and idempotency keys', async () => {
  await createConnectedCheckoutSession(input);
  assert.equal(coupons[0][0].applies_to.products[0],'prod_coffee'); assert.equal(sessions[0][0].line_items[0].price_data.product,'prod_coffee'); assert.equal(coupons[0][0].amount_off,2000); assert.equal(coupons[0][1].stripeAccount,'acct_store'); assert.equal(coupons[0][1].idempotencyKey,'promocard-discount:order1');
  assert.equal(sessions[0][0].discounts[0].coupon,'coupon_order'); assert.equal(sessions[0][0].line_items[0].quantity,2); assert.equal(sessions[0][0].line_items[0].price_data.unit_amount,5000); assert.equal(sessions[0][1].idempotencyKey,'merchant-direct-checkout:order1');
  assert.equal(sessions[0][0].payment_intent_data.application_fee_amount,1000);
  assert.ok(sessions[0][0].expires_at > Date.now()/1000+1700);
});
test('undiscounted checkout creates no coupon', async () => {
  await createConnectedCheckoutSession({ ...input, order: { ...input.order, metadata: {} } });
  assert.equal(coupons.length,0); assert.equal(sessions[0][0].discounts,undefined);
});
