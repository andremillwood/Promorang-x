import { beforeEach, describe, expect, it } from 'vitest';
import { addCartItem, readCart, saveCart, rememberCommerceReferral, commerceReferral, type CartItem } from './commerce-cart';
const item: CartItem = { product_id: 'a', listing_id: 'product:a', merchant_id: 'store', name: 'Coffee', price: 12, currency: 'USD', quantity: 1 };
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
describe('shopping bag', () => {
  it('combines quantities and survives a reload', () => { addCartItem(item); addCartItem(item); expect(readCart()).toEqual([{ ...item, quantity: 2 }]); });
  it('prevents mixed merchant or currency checkout without discarding the bag', () => { addCartItem(item); expect(() => addCartItem({ ...item, merchant_id: 'other' })).toThrow(); expect(() => addCartItem({ ...item, currency: 'JMD' })).toThrow(); expect(readCart()).toEqual([item]); });
  it('rejects excess quantity and recovers from malformed storage', () => { saveCart([{ ...item, quantity: 99 }]); expect(() => addCartItem(item)).toThrow(); localStorage.setItem('promorang.commerce-cart.v1', '{oops'); expect(readCart()).toEqual([]); });
  it('retains attribution across store and product navigation', () => { rememberCommerceReferral('?ref=MEMBER12'); rememberCommerceReferral(''); expect(commerceReferral()).toBe('MEMBER12'); });
});
