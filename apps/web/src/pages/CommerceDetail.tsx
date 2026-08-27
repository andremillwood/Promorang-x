import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, CalendarClock, MapPin, ShieldCheck, ShoppingBag, Store, CreditCard, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_BASE_URL } from '@/lib/api';
import { useCommerceActions } from '@/hooks/useCommerceActions';
import { commerceCategorySlug, isSampleCommerceListing } from '@/lib/commerce-provenance';
import { KINGSTON_EXPERIENCE_LISTINGS } from '@/pages/Marketplace';
import { useI18n } from '@/i18n/I18nContext';
import { SplitTenderCheckoutModal, PromoAcceptanceBadge } from '@/components/promocard';

export default function CommerceDetail() {
  const { t, locale, formatNumber } = useI18n();
  const { listingId } = useParams();
  const actions = useCommerceActions();
  const queryClient = useQueryClient();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [merchantPayOpen, setMerchantPayOpen] = useState(false);
  const [selectedMerchantMethod, setSelectedMerchantMethod] = useState('');
  const [reservationMessage, setReservationMessage] = useState('');
  const [gemCheckoutBusy, setGemCheckoutBusy] = useState(false);
  const [splitTenderOpen, setSplitTenderOpen] = useState(false);

  const q = useQuery({
    queryKey: ['commerce-detail', listingId],
    queryFn: async () => {
      const decodedId = decodeURIComponent(listingId || '');
      const { data, error } = await supabase
        .from('view_public_commerce_directory')
        .select('*')
        .eq('listing_id', decodedId)
        .maybeSingle();

      if (data) return data;

      // Fallback 1: Lookup in curated Kingston Experience & Dining Listings
      const curatedMatch = KINGSTON_EXPERIENCE_LISTINGS.find(
        item => item.listing_id === decodedId || item.source_id === decodedId
      );
      if (curatedMatch) return curatedMatch;

      // Fallback 2: Check products table directly
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq.${decodedId},title.ilike.%${decodedId.replace(/-/g, ' ')}%`)
        .maybeSingle();

      if (productData) {
        return {
          listing_id: productData.id,
          source_id: productData.id,
          source_table: 'products',
          listing_kind: 'product',
          name: productData.title,
          description: productData.description,
          category: productData.category || 'Experience',
          price: productData.price,
          currency: productData.currency || 'USD',
          points_cost: productData.points_cost || 200,
          is_redeemable_with_points: true,
          image_url: productData.image_url,
          venue_name: productData.venue_name || 'Kingston Venue',
          location: productData.location || 'Kingston, Jamaica',
          is_active: true,
          created_at: productData.created_at,
        };
      }

      if (error && error.code !== 'PGRST116') throw error;
      return null;
    },
  });

  const sourceId = String(q.data?.source_id || '');
  const merchantMethods = useQuery({
    queryKey: ['merchant-payment-options', sourceId],
    enabled: Boolean(sourceId),
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/commerce/merchant-payment-options/${encodeURIComponent(sourceId)}`, {
        headers: { Authorization: `Bearer ${session.data.session?.access_token || ''}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not load merchant payment options');
      return payload as { methods: Array<{ id: string; display_name: string; instructions?: string; payment_link?: string }>; disclaimer: string };
    },
  });

  if (q.isLoading) return <div className="mx-auto max-w-6xl p-8">{t("commerce.loading")}</div>;
  const x = q.data;
  if (!x) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="text-3xl font-black">{t("commerce.unavailable")}</h1>
        <Button asChild className="mt-5"><Link to="/shop">{t("commerce.back")}</Link></Button>
      </div>
    );
  }

  const amount = Number(x.price || 0);
  const currency = x.currency || 'USD';
  const price = amount > 0
    ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
    : t("commerce.askMerchant");
  const canCheckout = amount > 0 && currency.toUpperCase() === 'USD';
  const isSample = isSampleCommerceListing(x);
  const reserveForMerchantPayment = async () => {
    if (!selectedMerchantMethod) return;
    setCheckoutBusy(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/commerce/merchant-payment-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.data.session?.access_token || ''}` },
        body: JSON.stringify({ product_id: sourceId, quantity: 1, payment_method_id: selectedMerchantMethod }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not reserve this item');
      setReservationMessage(`Reserved until ${new Date(payload.order.reservation_expires_at).toLocaleTimeString()}. Follow the merchant’s instructions below.`);
      void queryClient.invalidateQueries({ queryKey: ['commerce-detail', listingId] });
    } catch (error) {
      setReservationMessage(error instanceof Error ? error.message : 'Could not create reservation');
    } finally { setCheckoutBusy(false); }
  };

  const beginMerchantCheckout = async () => {
    setCheckoutBusy(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Please sign in again to continue');
      const response = await fetch(`${API_BASE_URL}/stripe/commerce/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: sourceId,
          quantity: 1,
          success_url: `${window.location.origin}/shop/${encodeURIComponent(sourceId)}?checkout=success`,
          cancel_url: `${window.location.origin}/shop/${encodeURIComponent(sourceId)}?checkout=cancelled`,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || 'Checkout could not start');
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      console.error(error);
      setCheckoutOpen(true);
    } finally {
      setCheckoutBusy(false);
    }
  };

  const payWithGems = async () => {
    setGemCheckoutBusy(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Please sign in again to continue');
      const response = await fetch(`${API_BASE_URL}/commerce/gem-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: sourceId, quantity: 1 }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Gem payment could not be completed');
      window.location.assign(`/receipts/${payload.receipt_id}`);
    } catch (error) {
      setReservationMessage(error instanceof Error ? error.message : 'Gem payment could not be completed');
    } finally {
      setGemCheckoutBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />{t("commerce.shop")}
      </Link>
      {x.category ? <Link to={`/shop/category/${commerceCategorySlug(x.category)}`} className="ml-3 text-sm text-primary">{x.category}</Link> : null}
      {isSample ? <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-5 py-4 text-sm text-amber-100"><strong>{t("commerce.sampleTitle")}</strong> {t("commerce.sampleCopy")}</div> : null}
      <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c0c] text-white lg:grid lg:grid-cols-2">
        <div className="relative min-h-[420px] bg-white/5">
          {x.image_url ? <img src={x.image_url} alt={x.name || ''} className="absolute inset-0 h-full w-full object-cover" /> : <ShoppingBag className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/20" />}
          <button
            aria-label={t("commerce.save")}
            onClick={() => actions.toggleSave({ type: x.discount_value ? 'offer' : 'product', id: sourceId, title: x.name || 'Product', subtitle: x.merchant_name || undefined, image: x.image_url || undefined })}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/65"
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col justify-between p-7 sm:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {x.merchant_user_id ? (
                <Link to={`/storefront/${x.merchant_user_id}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-primary">
                  <Store className="h-4 w-4" />{x.merchant_name || 'Promorang merchant'}
                </Link>
              ) : null}
              <Badge variant="secondary" className="capitalize">{x.fulfillment_mode || 'merchant fulfillment'}</Badge>
              {x.service_duration_minutes ? <Badge variant="outline" className="border-white/15 text-white"><CalendarClock className="mr-1 h-3 w-3" />{x.service_duration_minutes} min</Badge> : null}
            </div>
            <h1 className="mt-5 text-5xl font-black tracking-[-.055em]">{x.name}</h1>
            <p className="mt-5 text-base leading-7 text-white/60">{x.description || t("commerce.fallback")}</p>
            {x.venue_name ? <p className="mt-5 flex items-center gap-2 text-sm text-white/50"><MapPin className="h-4 w-4 text-primary" />{x.venue_name}{x.location ? ` · ${x.location}` : ''}</p> : null}
          </div>
          <div className="mt-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-black">{price}</p>
                <p className="mt-1 text-xs text-white/40">{x.booking_url ? t("commerce.bookable") : t("commerce.fulfillment")}</p>
              </div>
              {x.discount_value ? <span className="rounded-full bg-primary px-4 py-2 text-xs font-black text-black">{x.discount_value}{x.discount_type === 'percentage' ? '%' : ''} OFFER</span> : null}
            </div>
            <div className="mt-4">
              <PromoAcceptanceBadge allowanceAmount={15} minSpend={25} />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button
                size="lg"
                onClick={() => setSplitTenderOpen(true)}
                className="sm:col-span-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-12 rounded-xl text-sm shadow-lg shadow-amber-500/20 gap-2"
              >
                <CreditCard className="h-5 w-5 fill-black" />
                <span>Pay with Promorang Card (Split-Tender)</span>
              </Button>
              <Button size="lg" disabled={isSample || !!actions.busy} onClick={() => actions.purchase(sourceId, amount, 'reservation')}>
                {isSample ? t("commerce.sampleOnly") : actions.busy ? t("commerce.working") : x.discount_value ? t("commerce.reserveOffer") : t("commerce.reserve")}
              </Button>
              <Button size="lg" variant="outline" disabled={!canCheckout || isSample || checkoutBusy} onClick={beginMerchantCheckout} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                {checkoutBusy ? t("commerce.cardOpening") : t("commerce.card")}
              </Button>
              <Button size="lg" variant="secondary" disabled={isSample || !merchantMethods.data?.methods.length} onClick={() => setMerchantPayOpen(true)} className="sm:col-span-2">
                {t("commerce.direct")}
              </Button>
              <Button size="lg" variant="secondary" disabled={!canCheckout || isSample || gemCheckoutBusy} onClick={payWithGems} className="sm:col-span-2">
                {gemCheckoutBusy ? t("commerce.gemsBusy") : t("commerce.gems", { count: formatNumber(amount) })}
              </Button>
            </div>
            {reservationMessage ? <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">{reservationMessage}</p> : null}
            {x.booking_url && !isSample ? <Button asChild variant="ghost" className="mt-2 w-full text-white/70 hover:text-white"><a href={x.booking_url} target="_blank" rel="noreferrer">{t("commerce.bookingPage")}</a></Button> : null}
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40"><ShieldCheck className="h-4 w-4" />Sold and fulfilled by {x.merchant_name || 'the merchant'}. Tax and delivery are shown by Stripe before payment.</p>
          </div>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay for {x.name}</DialogTitle>
            <DialogDescription>Stripe confirms the payment before Promorang creates the purchase receipt.</DialogDescription>
          </DialogHeader>
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            Checkout could not open. The merchant may still need to finish Stripe onboarding or configure shipping.
          </p>
        </DialogContent>
      </Dialog>
      <Dialog open={merchantPayOpen} onOpenChange={setMerchantPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve and pay {x.merchant_name || 'the merchant'}</DialogTitle>
            <DialogDescription>Payment is collected directly by the merchant. Promorang does not receive or guarantee this payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(merchantMethods.data?.methods || []).map((method) => (
              <label key={method.id} className="flex cursor-pointer gap-3 rounded-xl border p-4">
                <input type="radio" name="merchant-method" value={method.id} checked={selectedMerchantMethod === method.id} onChange={() => setSelectedMerchantMethod(method.id)} />
                <span><strong>{method.display_name}</strong>{method.instructions ? <span className="mt-1 block text-sm text-muted-foreground">{method.instructions}</span> : null}</span>
              </label>
            ))}
            {reservationMessage ? <p className="rounded-xl bg-muted p-3 text-sm">{reservationMessage}</p> : null}
            <Button className="w-full" disabled={!selectedMerchantMethod || checkoutBusy} onClick={reserveForMerchantPayment}>
              {checkoutBusy ? 'Reserving…' : 'Reserve for 30 minutes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SplitTenderCheckoutModal
        isOpen={splitTenderOpen}
        onClose={() => setSplitTenderOpen(false)}
        merchantId={x.merchant_user_id || `merchant_${sourceId}`}
        merchantName={x.merchant_name || 'Promorang Partner Merchant'}
        itemTitle={x.name || 'Experience Order'}
        grossAmount={Number(amount) || 45.0}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['commerce-detail'] });
        }}
      />
    </main>
  );
}
