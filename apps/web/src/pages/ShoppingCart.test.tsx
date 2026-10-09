import { translations, type Locale, type TranslationKey } from "@/i18n/translations";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShoppingCart from './ShoppingCart';
import { saveCart, readCart } from '@/lib/commerce-cart';
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'buyer' } }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'test' } } }) } } }));
const language = vi.hoisted(() => ({ locale: "en" as Locale }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ locale: language.locale, t: (key: TranslationKey, vars: Record<string, string | number> = {}) => translations[language.locale][key].replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? name)) }) }));
const product = { product_id: 'product1', listing_id: 'product:product1', merchant_id: 'merchant', name: 'Coffee', price: 20, currency: 'USD', quantity: 2 };
function show(route = '/shop/cart') { return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[route]}><ShoppingCart /></MemoryRouter></QueryClientProvider>); }
beforeEach(() => { language.locale = "en"; localStorage.clear(); sessionStorage.clear(); saveCart([product]); });
afterEach(() => vi.unstubAllGlobals());
describe('checkout journey', () => {
  it.each(["es-419", "pt-BR"] as const)("localizes checkout labels, status and currency in %s", async locale => {
    language.locale = locale;
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes("/cart-orders/") ? { order: { payment_status: "processing" }, receipt_id: null } : { benefits: [] } })));
    show("/shop/cart?order=order1");
    expect(await screen.findByText(translations[locale]["cart.order"].replace("{{status}}", translations[locale]["cart.status.processing"]))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: translations[locale]["release.29"] })).toBeInTheDocument();
    expect(screen.getAllByText(new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(40)).length).toBeGreaterThan(0);
  });
  it('sends only item identity, quantity, claimed benefit and referral, retaining the bag on rejection', async () => {
    const fetcher = vi.fn(async (_url: string, options?: RequestInit) => ({ ok: !options?.body, json: async () => options?.body ? { error: 'Minimum spend not reached' } : { benefits: [{ id: 'benefit1', offers: { title: 'Coffee credit', terms: 'USD 50 minimum', metadata: { checkout_discount: { kind: 'fixed' } } } }] } }));
    vi.stubGlobal('fetch', fetcher); show();
    await screen.findByRole('option', { name: 'Coffee credit' });
    fireEvent.change(screen.getByLabelText('PromoCard benefit'), { target: { value: 'benefit1' } });
    fireEvent.change(screen.getByLabelText(/Referral code/), { target: { value: 'FRIEND' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to checkout' }));
    await screen.findByRole('alert');
    const call = fetcher.mock.calls.find(([, options]) => options?.body);
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ items: [{ product_id: 'product1', quantity: 2 }], issuance_id: 'benefit1', referral_code: 'FRIEND' });
    expect(readCart()).toEqual([product]);
  });
  it('does not clear a cart on an unconfirmed return', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes('/cart-orders/') ? { order: { payment_status: 'processing' }, receipt_id: null } : { benefits: [] } })));
    show('/shop/cart?order=order1');
    await screen.findByText('Order processing'); expect(readCart()).toEqual([product]);
  });
  it('removes confirmed purchased quantities once, retaining additional shopping', async () => {
    saveCart([{ ...product, quantity: 3 }]);
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes('/cart-orders/') ? { order: { payment_status: 'paid', commerce_order_items: [{ product_id: 'product1', quantity: 2 }] }, receipt_id: 'receipt1' } : { benefits: [] } })));
    show('/shop/cart?order=order1');
    expect(await screen.findByRole('link', { name: /View receipt/ })).toHaveAttribute('href', '/receipts/receipt1');
    await waitFor(() => expect(readCart()[0].quantity).toBe(1));
    expect(localStorage.getItem('promorang.cart-cleared.order1')).toBe('1');
  });
});
