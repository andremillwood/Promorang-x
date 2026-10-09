const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCartItems, safeCheckoutReturnUrl, assertCheckoutMatchesOrder } = require('../services/commerceCart');
const id = '10000000-0000-0000-0000-000000000001';
test('cart rejects duplicate, fractional, negative and oversized quantities', () => {
  for (const quantity of [0, -1, 1.5, 100, '2', NaN]) assert.throws(() => normalizeCartItems([{ product_id: id, quantity }]));
  assert.throws(() => normalizeCartItems([{ product_id: id, quantity: 1 }, { product_id: id, quantity: 2 }]));
  assert.deepEqual(normalizeCartItems([{ product_id: id, quantity: 2, price: 0.01 }]), [{ product_id: id, quantity: 2 }]);
});
test('checkout return URLs cannot use lookalike domains', () => {
  assert.equal(safeCheckoutReturnUrl('https://shop.example.evil/cart', 'https://shop.example', '/shop/cart'), 'https://shop.example/shop/cart');
  assert.equal(safeCheckoutReturnUrl('https://shop.example/shop/cart?order=1', 'https://shop.example', '/shop/cart'), 'https://shop.example/shop/cart?order=1');
});
test('capture validates account, session, currency, net payment and discount', () => {
  const order = { stripe_connected_account_id: 'acct_store', stripe_checkout_session_id: 'cs_order', subtotal: 80, currency: 'USD', metadata: { discount_amount: 20 } };
  const session = { id: 'cs_order', currency: 'usd', amount_total: 9500, total_details: { amount_tax: 500, amount_shipping: 1000, amount_discount: 2000 } };
  assert.doesNotThrow(() => assertCheckoutMatchesOrder(session, 'acct_store', order));
  for (const patch of [{ id: 'cs_other' }, { amount_total: 100 }, { currency: 'jmd' }, { total_details: { ...session.total_details, amount_discount: 0 } }]) assert.throws(() => assertCheckoutMatchesOrder({ ...session, ...patch }, 'acct_store', order));
  assert.throws(() => assertCheckoutMatchesOrder(session, 'acct_other', order));
});
