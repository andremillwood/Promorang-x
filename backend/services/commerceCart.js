function normalizeCartItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Choose between 1 and 50 products');
  const seen = new Set();
  return items.map(({ product_id, quantity }) => {
    if (typeof product_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(product_id) || seen.has(product_id)) throw new Error('Invalid or duplicate product');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Quantities must be whole numbers from 1 to 99');
    seen.add(product_id);
    return { product_id, quantity };
  });
}
function safeCheckoutReturnUrl(value, origin, fallback) {
  try { const url = new URL(value); if (url.origin === new URL(origin).origin) return url.href; } catch { /* Use our own origin. */ }
  return new URL(fallback, origin).href;
}
function assertCheckoutMatchesOrder(session, account, order) {
  if (!account || account !== order.stripe_connected_account_id || (order.stripe_checkout_session_id && order.stripe_checkout_session_id !== session.id)) throw new Error('Checkout does not match the merchant order');
  const expected = Math.round(Number(order.subtotal) * 100) + Number(session.total_details?.amount_tax || 0) + Number(session.total_details?.amount_shipping || 0);
  if (session.amount_total !== expected || session.currency?.toUpperCase() !== order.currency || Number(session.total_details?.amount_discount || 0) !== Math.round(Number(order.metadata?.discount_amount || 0) * 100)) throw new Error('Checkout amount does not match the reserved order');
}
module.exports = { normalizeCartItems, safeCheckoutReturnUrl, assertCheckoutMatchesOrder };
