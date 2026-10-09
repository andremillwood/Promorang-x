import { commerceStatus } from "@/i18n/commerce-status";
import { useI18n } from "@/i18n/I18nContext";
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShoppingBag, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/api';
import { commerceReferral, readCart, saveCart } from '@/lib/commerce-cart';

type Benefit = { id: string; offers: { title: string; terms: string; value_amount: number; value_currency: string; metadata: { checkout_discount: { kind: string; category?: string; minimum_spend?: number } } } };
async function request(path: string, body?: unknown) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${data.session?.access_token || ''}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Could not load checkout');
  return payload;
}
export default function ShoppingCart() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [items, setItems] = useState(readCart);
  const [issuanceId, setIssuanceId] = useState('');
  const [referral, setReferral] = useState(commerceReferral);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const merchantId = items[0]?.merchant_id;
  const benefits = useQuery({ queryKey: ['cart-benefits', user?.id, merchantId], enabled: Boolean(user && merchantId), queryFn: () => request(`/commerce/cart-benefits/${merchantId}`) });
  const order = useQuery({ queryKey: ['cart-order', user?.id, orderId], enabled: Boolean(user && orderId), queryFn: () => request(`/commerce/cart-orders/${orderId}`), refetchInterval: query => query.state.data?.receipt_id || ['cancelled','failed','refunded'].includes(query.state.data?.order?.payment_status) ? false : 3000 });
  useEffect(() => {
    if (!order.data?.receipt_id) return;
    // Remove only quantities bought in this order, and only once across refreshes.
    const key = `promorang.cart-cleared.${orderId}`;
    if (localStorage.getItem(key)) return;
    const purchased = order.data.order.commerce_order_items as { product_id: string; quantity: number }[];
    const remaining = readCart().flatMap(item => { const quantity = item.quantity - (purchased.find(p => p.product_id === item.product_id)?.quantity || 0); return quantity > 0 ? [{ ...item, quantity }] : []; });
    saveCart(remaining); setItems(remaining); localStorage.setItem(key, '1');
  }, [order.data, orderId]);
  function update(productId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return;
    const next = items.flatMap(item => item.product_id === productId ? quantity ? [{ ...item, quantity }] : [] : [item]);
    saveCart(next); setItems(next); setIssuanceId('');
  }
  async function checkout() {
    setBusy(true); setError('');
    try {
      const result = await request('/stripe/commerce/checkout', { items: items.map(({ product_id, quantity }) => ({ product_id, quantity })), issuance_id: issuanceId || null, referral_code: referral || null });
      window.location.assign(result.checkoutUrl);
    } catch { setError(t("release.31")); setBusy(false); }
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const money = (amount: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: items[0]?.currency || 'USD' }).format(amount);
  return <main className="min-h-screen bg-[#080808] px-5 py-20 text-white"><div className="mx-auto max-w-6xl">
    <Link to="/shop" className="text-sm text-orange-300">{t("release.1")}</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-orange-300">{t("release.2")}</p><h1 className="mt-3 font-serif text-5xl">{t("release.3")}</h1>
    {orderId ? <section className="my-8 border border-orange-300/30 p-6" aria-live="polite">
      <h2 className="text-xl font-bold">{order.data?.receipt_id ? t("release.4") : order.isError ? t("release.5") : t("cart.order", { status: order.data?.order?.payment_status ? commerceStatus(t, order.data.order.payment_status) : t("cart.pending") })}</h2>
      {order.data?.receipt_id ? <Link className="mt-4 inline-flex min-h-11 items-center text-orange-300" to={`/receipts/${order.data.receipt_id}`}>{t("release.6")}</Link> : <><p className="mt-2 text-sm text-white/60">{t("release.7")}</p><button className="mt-3 min-h-11 text-orange-300" onClick={() => void order.refetch()}>{t("release.8")}</button></>}
      <Link className="ml-5 text-orange-300" to="/card">{t("release.9")}</Link>
    </section> : null}
    {!items.length ? <div className="mt-12 border-y border-white/10 py-12"><ShoppingBag className="h-8 w-8 text-orange-300"/><h2 className="mt-4 text-2xl">{t("release.10")}</h2><Link className="mt-5 inline-flex min-h-11 items-center text-orange-300" to="/shop">{t("release.11")}</Link></div> : <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <section aria-label={t("release.12")} className="divide-y divide-white/10">{items.map(item => <article key={item.product_id} className="py-6 first:pt-0"><Link className="font-serif text-2xl hover:text-orange-300" to={`/shop/${encodeURIComponent(item.listing_id)}`}>{item.name}</Link><p className="mt-2 text-white/60">{money(item.price)} {t("cart.each")}</p><div className="mt-4 flex items-center justify-between gap-4"><label className="text-sm">{t("release.13")} <input className="ml-3 w-20 rounded border border-white/20 bg-black p-2" type="number" min="1" max="99" value={item.quantity} onChange={e => update(item.product_id, Number(e.target.value))}/></label><button className="min-h-11 text-sm text-white/60" onClick={() => update(item.product_id, 0)}>{t("release.14")} <span className="sr-only">{item.name}</span></button><strong>{money(item.price * item.quantity)}</strong></div></article>)}</section>
      <aside className="self-start border border-orange-300/25 bg-white/[.025] p-6 sm:p-8"><Ticket className="h-7 w-7 text-orange-300"/><h2 className="mt-4 font-serif text-3xl">{t("release.15")}</h2><p className="mt-3 text-sm leading-6 text-white/60">{t("release.16")}</p>
        {benefits.isError ? <p role="alert" className="mt-4 text-amber-200">{t("release.17")} <button className="underline" onClick={() => void benefits.refetch()}>{t("release.18")}</button></p> : benefits.isLoading ? <p className="mt-4" role="status">{t("release.19")}</p> : <label className="mt-5 block text-sm">{t("release.20")}<select className="mt-2 min-h-12 w-full rounded border border-white/20 bg-black px-3" value={issuanceId} onChange={e => setIssuanceId(e.target.value)}><option value="">{t("release.21")}</option>{(benefits.data?.benefits || []).map((benefit: Benefit) => <option key={benefit.id} value={benefit.id}>{benefit.offers.title}</option>)}</select></label>}
        {issuanceId ? <p className="mt-3 text-sm text-orange-200">{benefits.data?.benefits.find((b: Benefit) => b.id === issuanceId)?.offers.terms} {t("release.22")}</p> : null}
        <Link to="/card" className="mt-3 inline-flex min-h-11 items-center text-sm text-orange-300">{t("release.23")}</Link>
        <label className="mt-4 block text-sm">{t("release.24")} <span className="text-white/40">{t("release.25")}</span><input className="mt-2 min-h-12 w-full rounded border border-white/20 bg-black px-3" value={referral} maxLength={80} onChange={e => setReferral(e.target.value)} /></label>
        <div className="mt-6 flex justify-between border-t border-white/10 pt-5"><span>{t("release.26")}</span><strong>{money(subtotal)}</strong></div><p className="mt-2 text-xs leading-5 text-white/50">{t("release.27")}</p>
        {error ? <p role="alert" className="mt-4 text-sm text-amber-200">{error}</p> : null}
        {user ? <button disabled={busy} onClick={() => void checkout()} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded bg-orange-500 px-5 font-bold text-black disabled:opacity-50">{busy ? t("release.28") : t("release.29")}<ArrowRight className="h-4 w-4"/></button> : <Link className="mt-6 flex min-h-12 items-center justify-center rounded bg-orange-500 font-bold text-black" to="/auth?mode=signup&next=%2Fshop%2Fcart">{t("release.30")}</Link>}
      </aside></div>}
  </div></main>;
}
