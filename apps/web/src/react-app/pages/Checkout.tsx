import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Coins, Crown, Check, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

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

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/marketplace/cart', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.status === 'success') {
        setCart(data.data.cart);

        if (!data.data.cart || !data.data.cart.cart_items || data.data.cart.cart_items.length === 0) {
          navigate('/cart');
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
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

        // If coupon is store-specific, verify we have items from that store
        if (coupon.store_id) {
          const storeGroup = storeGroups[coupon.store_id];
          if (!storeGroup) {
            setCouponError('This coupon applies to a store you do not have items from.');
            return;
          }

          // Re-validate minimums against specific store total
          const storeTotalUsd = storeGroup.items.reduce((sum, item) => sum + (item.price_usd || 0) * item.quantity, 0);

          if (coupon.min_purchase_usd && storeTotalUsd < coupon.min_purchase_usd) {
            setCouponError(`Minimum purchase of $${coupon.min_purchase_usd} required from ${storeGroup.storeName}.`);
            return;
          }
        }

        setCouponData(data.data);
        toast({
          title: 'Coupon applied!',
          description: `You save ${data.data.discount.usd ? '$' + data.data.discount.usd.toFixed(2) : ''} ${data.data.discount.gems ? data.data.discount.gems + ' Gems' : ''}`,
          type: 'success',
        });
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon');
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
        description: 'Please complete the highlighted fields before placing your order.',
        type: 'destructive',
      });
      return;
    }

    setFieldErrors({});

    setProcessing(true);

    try {
      const storeIds = Object.keys(storeGroups);

      // Create orders for each store
      for (const storeId of storeIds) {
        // Determine if coupon applies to this store
        let applyCouponCode = null;
        if (couponData && couponData.coupon) {
          if (couponData.coupon.store_id === storeId) {
            applyCouponCode = couponData.coupon.code;
          } else if (!couponData.coupon.store_id) {
            // Platform-wide coupon logic - risky for split orders but passing for now
            // Using logic: if max_uses_per_user > 1, or if first iteration?
            // For safety, let's only apply platform coupons to the FIRST store order to avoid errors
            if (storeIds.indexOf(storeId) === 0) {
              applyCouponCode = couponData.coupon.code;
            }
          }
        }

        const orderResponse = await fetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            store_id: storeId,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            customer_notes: '',
            coupon_code: applyCouponCode,
          }),
        });

        const orderData = await orderResponse.json();

        if (orderData.status === 'success') {
          // Process payment
          const paymentResponse = await fetch(`/api/marketplace/orders/${orderData.data.order.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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

      navigate('/orders');
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

  // Calculate final totals with discount for display
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
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-36 lg:pb-12">
        {/* Header */}
        <Button variant="outline" onClick={() => navigate('/cart')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-pr-text-1 mb-6">Checkout</h1>

        <div className="mb-10">
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isComplete = step.complete && index < currentStepIndex;

              return (
                <li
                  key={step.title}
                  className={`rounded-xl border p-4 transition-all ${isComplete
                      ? 'border-blue-600 bg-blue-50'
                      : isCurrent
                        ? 'border-blue-400 bg-pr-surface-card shadow-sm'
                        : 'border-pr-surface-3 bg-pr-surface-card'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${isComplete
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isCurrent
                            ? 'border-blue-500 text-blue-600'
                            : 'border-pr-surface-3 text-pr-text-2'
                        }`}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-pr-text-1">{step.title}</p>
                      <p className="text-xs text-pr-text-2">{step.description}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-medium">Currently editing</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-pr-surface-3'
                      }`}
                    placeholder="your@email.com"
                    required
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, street: e.target.value });
                      if (fieldErrors.street) {
                        setFieldErrors((prev) => ({ ...prev, street: '' }));
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.street ? 'border-red-500 focus:ring-red-500' : 'border-pr-surface-3'
                      }`}
                    placeholder="123 Main St"
                  />
                  {fieldErrors.street && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.street}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, city: e.target.value });
                        if (fieldErrors.city) {
                          setFieldErrors((prev) => ({ ...prev, city: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-pr-surface-3'
                        }`}
                      placeholder="New York"
                    />
                    {fieldErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, state: e.target.value });
                        if (fieldErrors.state) {
                          setFieldErrors((prev) => ({ ...prev, state: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-pr-surface-3'
                        }`}
                      placeholder="NY"
                    />
                    {fieldErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, zip: e.target.value });
                        if (fieldErrors.zip) {
                          setFieldErrors((prev) => ({ ...prev, zip: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.zip ? 'border-red-500 focus:ring-red-500' : 'border-pr-surface-3'
                        }`}
                      placeholder="10001"
                    />
                    {fieldErrors.zip && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.zip}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      Country
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {finalTotals.usd > 0 && (
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'stripe'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-pr-surface-3 hover:border-gray-400'
                      }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-blue-600' : 'border-pr-surface-3'
                      }`}>
                      {paymentMethod === 'stripe' && (
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <CreditCard className="h-6 w-6 text-pr-text-1" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-pr-text-1">Credit / Debit Card</p>
                      <p className="text-sm text-pr-text-2">Pay with Stripe</p>
                    </div>
                    <span className="font-semibold text-pr-text-1">${finalTotals.usd.toFixed(2)}</span>
                  </button>
                )}

                {finalTotals.gems > 0 && (
                  <button
                    onClick={() => setPaymentMethod('gems')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'gems'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-pr-surface-3 hover:border-gray-400'
                      }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'gems' ? 'border-purple-600' : 'border-pr-surface-3'
                      }`}>
                      {paymentMethod === 'gems' && (
                        <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      )}
                    </div>
                    <Coins className="h-6 w-6 text-purple-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-pr-text-1">Gems</p>
                      <p className="text-sm text-pr-text-2">Pay with your gems balance</p>
                    </div>
                    <span className="font-semibold text-pr-text-1">{finalTotals.gems} 💎</span>
                  </button>
                )}

                {finalTotals.gold > 0 && (
                  <button
                    onClick={() => setPaymentMethod('gold')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'gold'
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-pr-surface-3 hover:border-gray-400'
                      }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'gold' ? 'border-yellow-600' : 'border-pr-surface-3'
                      }`}>
                      {paymentMethod === 'gold' && (
                        <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                      )}
                    </div>
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-pr-text-1">Gold</p>
                      <p className="text-sm text-pr-text-2">Pay with your gold balance</p>
                    </div>
                    <span className="font-semibold text-pr-text-1">{finalTotals.gold} 🪙</span>
                  </button>
                )}

                {finalTotals.usd === 0 && finalTotals.gems === 0 && finalTotals.gold === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 font-medium">
                    Order covered by coupon! No payment required.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Order Summary</h2>

              {cart && cart.cart_items && (
                <div className="space-y-3 mb-6">
                  {cart.cart_items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.products.images[0] || 'https://via.placeholder.com/60'}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-pr-text-1 line-clamp-2">
                          {item.products.name}
                        </p>
                        <p className="text-sm text-pr-text-2">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Input */}
              <div className="mb-6 border-t pt-4 border-b pb-4">
                <label className="block text-xs font-medium text-pr-text-2 mb-2 uppercase">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={isValidatingCoupon || !!couponData}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-pr-surface-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  />
                  {couponData ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCouponData(null);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      disabled={!couponCode || isValidatingCoupon}
                      onClick={handleApplyCoupon}
                      size="sm"
                      className="bg-pr-text-1 text-pr-surface-1 hover:bg-pr-text-2"
                    >
                      {isValidatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {couponError && <p className="mt-2 text-xs text-red-500">{couponError}</p>}
                {couponData && (
                  <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Code applied successfully
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-pr-text-2">
                  <span>Subtotal</span>
                  <div className="text-right">
                    {totals.usd > 0 && <div>${totals.usd.toFixed(2)}</div>}
                    {totals.gems > 0 && <div>{totals.gems} 💎</div>}
                    {totals.gold > 0 && <div>{totals.gold} 🪙</div>}
                  </div>
                </div>

                {couponData && couponData.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <div className="text-right">
                      {couponData.discount.usd > 0 && <div>-${couponData.discount.usd.toFixed(2)}</div>}
                      {couponData.discount.gems > 0 && <div>-{couponData.discount.gems} 💎</div>}
                      {couponData.discount.gold > 0 && <div>-{couponData.discount.gold} 🪙</div>}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-pr-text-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <div className="text-right">
                    {finalTotals.usd > 0 && <div>${finalTotals.usd.toFixed(2)}</div>}
                    {finalTotals.gems > 0 && <div>{finalTotals.gems} 💎</div>}
                    {finalTotals.gold > 0 && <div>{finalTotals.gold} 🪙</div>}
                    {finalTotals.usd === 0 && finalTotals.gems === 0 && finalTotals.gold === 0 && (
                      <div>Free</div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>

              <p className="text-xs text-pr-text-2 text-center mt-4">
                Your payment information is secure and encrypted
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-pr-surface-card/95 backdrop-blur border-t border-pr-surface-3 px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-pr-text-2">Total</p>
            <div className="text-sm font-semibold text-pr-text-1 space-y-1">
              {finalTotals.usd > 0 && <div>${finalTotals.usd.toFixed(2)}</div>}
              {finalTotals.gems > 0 && <div>{finalTotals.gems} 💎</div>}
              {finalTotals.gold > 0 && <div>{finalTotals.gold} 🪙</div>}
              {finalTotals.usd === 0 && finalTotals.gems === 0 && finalTotals.gold === 0 && (
                <div>Free</div>
              )}
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {processing ? 'Processing…' : 'Place order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
