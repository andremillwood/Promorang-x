export type CartItem = { product_id: string; listing_id: string; merchant_id: string; name: string; price: number; currency: string; quantity: number };
const KEY = 'promorang.commerce-cart.v1';
export function readCart(): CartItem[] {
  try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value.filter((x: CartItem) => x && typeof x.product_id === 'string' && typeof x.merchant_id === 'string' && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 99).slice(0, 50) : []; } catch { return []; }
}
export function saveCart(items: CartItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event('commerce-cart-changed')); }
export function addCartItem(item: CartItem) {
  const items = readCart();
  if (items.some(x => x.merchant_id !== item.merchant_id || x.currency !== item.currency)) throw new Error('Finish or clear your current cart before shopping with another merchant.');
  const existing = items.find(x => x.product_id === item.product_id);
  if (existing && existing.quantity >= 99) throw new Error('The maximum quantity is 99.');
  if (!existing && items.length >= 50) throw new Error('Your cart is full.');
  saveCart(existing ? items.map(x => x.product_id === item.product_id ? { ...x, quantity: x.quantity + 1 } : x) : [...items, item]);
}
export function rememberCommerceReferral(search: string) {
  const ref = new URLSearchParams(search).get('ref');
  if (ref && /^[a-z0-9_-]{2,80}$/i.test(ref)) sessionStorage.setItem('promorang.commerce-referral.v1', ref);
}
export function commerceReferral() { try { return sessionStorage.getItem('promorang.commerce-referral.v1') || ''; } catch { return ''; } }
