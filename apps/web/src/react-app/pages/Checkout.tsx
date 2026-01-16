import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Coins, Crown, Check, ArrowLeft, Lock, ShieldCheck, Truck, Headphones, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { Sparkles } from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  products: {
    name: string;
    images: string[];
    merchant_stores: {
      id: string;
      store_name: string;
    };
  };
}

interface Cart {
  id: string;
  cart_items: CartItem[];
}

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maturityState } = useMaturity();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'gems' | 'gold'>('stripe');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    fetchCart();
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchCart = async () => {
    try {
      const response = await apiFetch('/api/marketplace/cart');
      const data = await response.json();

      if (data.status === 'success') {
        setCart(data.data.cart);

        if (!data.data.cart || !data.data.cart.cart_items || data.data.cart.cart_items.length === 0) {
          navigate('/marketplace/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    if (!cart || !cart.cart_items) {
      return { usd: 0, gems: 0, gold: 0 };
    }

    return cart.cart_items.reduce(
      (runningTotals, item) => {
        if (item.price_usd) runningTotals.usd += item.price_usd * item.quantity;
        if (item.price_gems) runningTotals.gems += item.price_gems * item.quantity;
        if (item.price_gold) runningTotals.gold += item.price_gold * item.quantity;
        return runningTotals;
      },
      { usd: 0, gems: 0, gold: 0 }
    );
  }, [cart]);

  const storeGroups = useMemo(() => {
    if (!cart || !cart.cart_items) return {};

    return cart.cart_items.reduce((groups, item) => {
      const storeId = item.products.merchant_stores.id;
      if (!groups[storeId]) {
        groups[storeId] = {
          storeName: item.products.merchant_stores.store_name,
          items: [],
        };
      }
      groups[storeId].items.push(item);
      return groups;
    }, {} as Record<string, { storeName: string; items: CartItem[] }>);
  }, [cart]);

  const contactComplete = useMemo(() => Boolean(customerInfo.email.trim()), [customerInfo.email]);
  const shippingComplete = useMemo(
    () =>
      Boolean(
        shippingAddress.street.trim() &&
        shippingAddress.city.trim() &&
        shippingAddress.state.trim() &&
        shippingAddress.zip.trim()
      ),
    [shippingAddress]
  );

  const steps = useMemo(
    () => [
      { title: 'Contact', description: 'Email and phone', complete: contactComplete },
      { title: 'Shipping', description: 'Delivery address', complete: shippingComplete },
      { title: 'Payment', description: 'Choose payment', complete: !!paymentMethod },
      { title: 'Review', description: 'Confirm order', complete: false },
    ],
    [contactComplete, paymentMethod, shippingComplete]
  );

  const currentStepIndex = useMemo(() => {
    const firstIncomplete = steps.findIndex((step) => !step.complete);
    return firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
  }, [steps]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponData(null);

    try {
      const response = await apiFetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          cart_total: {
            usd: totals.usd,
            gems: totals.gems,
            gold: totals.gold
          }
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const coupon = data.data.coupon;

        if (coupon.store_id) {
          const storeGroup = storeGroups[coupon.store_id];
          if (!storeGroup) {
            setCouponError('This coupon applies to a store you do not have items from.');
            return;
          }

          const storeTotalUsd = storeGroup.items.reduce((sum, item) => sum + (item.price_usd || 0) * item.quantity, 0);

          if (coupon.min_purchase_usd && storeTotalUsd < coupon.min_purchase_usd) {
            setCouponError(`Minimum purchase of $${coupon.min_purchase_usd} required from ${storeGroup.storeName}.`);
            return;
          }
        }

        setCouponData(data.data);
        toast({
          title: 'Coupon applied!',
          description: `You save ${data.data.discount.usd ? '$' + data.data.discount.usd.toFixed(2) : ''}`,
          type: 'success',
        });
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zip.trim()) newErrors.zip = 'ZIP code is required';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast({
        title: 'Missing information',
        description: 'Please complete all required fields.',
        type: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const storeIds = Object.keys(storeGroups);

      for (const storeId of storeIds) {
        let applyCouponCode = null;
        if (couponData && couponData.coupon) {
          if (couponData.coupon.store_id === storeId || !couponData.coupon.store_id) {
            applyCouponCode = couponData.coupon.code;
          }
        }

        // Get affiliate attribution from sessionStorage (set by ProductDetail when user arrived via affiliate link)
        let affiliateAttribution = null;
        try {
          const storedAttribution = sessionStorage.getItem('affiliate_attribution');
          if (storedAttribution) {
            affiliateAttribution = JSON.parse(storedAttribution);
          }
        } catch (e) {
          console.error('Error parsing affiliate attribution:', e);
        }

        const orderResponse = await apiFetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: storeId,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            customer_notes: '',
            coupon_code: applyCouponCode,
            // Include affiliate attribution for commission tracking
            affiliate_referral_code: affiliateAttribution?.referral_code || null,
            affiliate_product_id: affiliateAttribution?.product_id || null,
          }),
        });

        const orderData = await orderResponse.json();

        if (orderData.status === 'success') {
          const paymentResponse = await apiFetch(`/api/marketplace/orders/${orderData.data.order.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          const paymentData = await paymentResponse.json();

          if (paymentData.status !== 'success') {
            throw new Error(paymentData.message || 'Payment failed');
          }
        } else {
          throw new Error(orderData.message || 'Order creation failed');
        }
      }

      toast({
        title: 'Success!',
        description: 'Your order has been placed successfully',
        type: 'success',
      });

      navigate('/marketplace/orders');
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process order',
        type: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const finalTotals = useMemo(() => {
    if (!couponData || !couponData.discount) return totals;
    return {
      usd: Math.max(0, totals.usd - (couponData.discount.usd || 0)),
      gems: Math.max(0, totals.gems - (couponData.discount.gems || 0)),
      gold: Math.max(0, totals.gold - (couponData.discount.gold || 0)),
    };
  }, [totals, couponData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic bg-pr-surface-2">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="font-bold text-pr-text-2">Securing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2 pb-24 lg:pb-12">
      {/* Checkout Header (Focused) */}
      <div className="bg-white border-b border-pr-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace/cart')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black tracking-tight hidden md:block">Checkout</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-green-600 font-bold text-sm">
              <ShieldCheck className="h-4 w-4" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-pr-border">
              <Timer className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps Progress */}
            <div className="flex items-center justify-between px-2 mb-8 overflow-x-auto no-scrollbar gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${idx <= currentStepIndex ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-pr-border text-slate-400'
                    }`}>
                    {idx < currentStepIndex ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${idx === currentStepIndex ? 'text-blue-600' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                  {idx < steps.length - 1 && <div className="hidden sm:block w-8 h-px bg-pr-border mx-2" />}
                </div>
              ))}
            </div>

            <Card className="p-8 border-pr-border shadow-sm rounded-2xl overflow-hidden">
              {/* Contact Info */}
              <div className="mb-10">
                <h2 className="text-lg font-black text-pr-text-1 mb-6 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.email ? 'border-red-500' : 'border-pr-border'}`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-10 pt-10 border-t border-pr-border">
                <h2 className="text-lg font-black text-pr-text-1 mb-6 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.street ? 'border-red-500' : 'border-pr-border'}`}
                      placeholder="Street name and number"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.city ? 'border-red-500' : 'border-pr-border'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">State / Prov</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.state ? 'border-red-500' : 'border-pr-border'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">ZIP / Postal</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.zip ? 'border-red-500' : 'border-pr-border'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-10 border-t border-pr-border">
                <h2 className="text-lg font-black text-pr-text-1 mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Selection
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {finalTotals.usd > 0 && (
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'stripe' ? 'border-blue-600 bg-blue-50/50' : 'border-pr-border hover:border-blue-200'}`}
                    >
                      <CreditCard className={`h-6 w-6 mb-2 ${paymentMethod === 'stripe' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className="text-xs font-black uppercase tracking-tighter">Debit/Credit</p>
                      <p className="text-[10px] text-slate-500">Stripe Secure</p>
                    </button>
                  )}
                  {finalTotals.gems > 0 && (
                    <button
                      onClick={() => setPaymentMethod('gems')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'gems' ? 'border-blue-500 bg-blue-50/50' : 'border-pr-border hover:border-blue-200'}`}
                    >
                      <Coins className={`h-6 w-6 mb-2 ${paymentMethod === 'gems' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-black uppercase tracking-tighter">Gems</p>
                      <p className="text-[10px] text-slate-500">{finalTotals.gems} 💎</p>
                    </button>
                  )}
                  {finalTotals.gold > 0 && (
                    <button
                      onClick={() => setPaymentMethod('gold')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'gold' ? 'border-orange-500 bg-orange-50/50' : 'border-pr-border hover:border-orange-200'}`}
                    >
                      <Crown className={`h-6 w-6 mb-2 ${paymentMethod === 'gold' ? 'text-orange-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-black uppercase tracking-tighter">Gold</p>
                      <p className="text-[10px] text-slate-500">{finalTotals.gold} 🪙</p>
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Why Buy From Us Trust Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pr-border shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-black uppercase leading-tight tracking-widest text-slate-400">Buyer Protection Guaranteed</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pr-border shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-black uppercase leading-tight tracking-widest text-slate-400">Insured Worldwide Delivery</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pr-border shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-black uppercase leading-tight tracking-widest text-slate-400">256-bit AES Encryption</div>
              </div>
            </div>
          </div>

          {/* Sticky Side Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-28 border-pr-border shadow-xl rounded-2xl bg-white">
              <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                Order Items
                <span className="text-xs font-bold text-slate-400 ml-auto">({cart?.cart_items.length})</span>
              </h3>

              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart?.cart_items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <img
                      src={item.products.images[0] || 'https://via.placeholder.com/60'}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded-xl border border-pr-border group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-pr-text-1 line-clamp-1">{item.products.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Qty: {item.quantity}</p>
                      <p className="text-xs font-black text-blue-600 mt-1">${(item.price_usd || 0) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-8 pt-6 border-t border-pr-border">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block ml-1">Promotional Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponData}
                    className="flex-1 bg-slate-50 border border-pr-border rounded-xl px-4 text-sm font-bold uppercase"
                    placeholder="WINTER25"
                  />
                  {couponData ? (
                    <Button variant="ghost" size="sm" onClick={() => { setCouponData(null); setCouponCode(''); }} className="text-red-500">
                      Remove
                    </Button>
                  ) : (
                    <Button
                      disabled={!couponCode || isValidatingCoupon}
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 hover:bg-black text-white rounded-xl font-black"
                    >
                      {isValidatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>${totals.usd.toFixed(2)}</span>
                </div>
                {couponData && (
                  <div className="flex justify-between font-black text-green-600">
                    <span>Discount</span>
                    <span>-${couponData.discount.usd.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-black">Free</span>
                </div>
                <div className="pt-4 border-t border-pr-border flex justify-between items-baseline">
                  <span className="font-black text-xl">Total</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">${finalTotals.usd.toFixed(2)}</span>
                </div>

                {maturityState < 2 && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mt-4 mb-2">
                    <p className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1 uppercase">
                      <Sparkles className="w-3 h-3" />
                      Rank Up Reward
                    </p>
                    <p className="text-[10px] text-blue-700/80 leading-tight">
                      Did you know? Users at Rank 2+ earn back 5% in Gems on every purchase. Rank up to start earning.
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl text-lg font-black shadow-xl shadow-blue-500/30 group"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Place Secure Order
                  </div>
                )}
              </Button>

              <div className="mt-8 pt-6 border-t border-pr-border flex justify-center gap-4 grayscale opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-pr-border px-4 py-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Pay Total</p>
            <p className="text-xl font-black text-blue-600 tracking-tighter">${finalTotals.usd.toFixed(2)}</p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black"
          >
            {processing ? 'Processing...' : 'Place Secure Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
