import { useEffect, useState } from 'react';
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

  const calculateTotals = () => {
    if (!cart || !cart.cart_items) {
      return { usd: 0, gems: 0, gold: 0 };
    }

    return cart.cart_items.reduce((totals, item) => {
      if (item.price_usd) totals.usd += item.price_usd * item.quantity;
      if (item.price_gems) totals.gems += item.price_gems * item.quantity;
      if (item.price_gold) totals.gold += item.price_gold * item.quantity;
      return totals;
    }, { usd: 0, gems: 0, gold: 0 });
  };

  const groupByStore = () => {
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
  };

  const handleCheckout = async () => {
    // Validate form
    if (!customerInfo.email) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        type: 'destructive',
      });
      return;
    }

    setProcessing(true);
    
    try {
      const storeGroups = groupByStore();
      const storeIds = Object.keys(storeGroups);

      // Create orders for each store
      for (const storeId of storeIds) {
        const orderResponse = await fetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            store_id: storeId,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            customer_notes: '',
          }),
        });

        const orderData = await orderResponse.json();
        
        if (orderData.status === 'success') {
          // Process payment
          const paymentResponse = await fetch(`/api/marketplace/orders/${orderData.data.order.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Button variant="outline" onClick={() => navigate('/cart')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {totals.usd > 0 && (
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'stripe' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'stripe' && (
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <CreditCard className="h-6 w-6 text-gray-700" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-600">Pay with Stripe</p>
                    </div>
                    <span className="font-semibold text-gray-900">${totals.usd.toFixed(2)}</span>
                  </button>
                )}
                
                {totals.gems > 0 && (
                  <button
                    onClick={() => setPaymentMethod('gems')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                      paymentMethod === 'gems'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'gems' ? 'border-purple-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'gems' && (
                        <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      )}
                    </div>
                    <Coins className="h-6 w-6 text-purple-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">Gems</p>
                      <p className="text-sm text-gray-600">Pay with your gems balance</p>
                    </div>
                    <span className="font-semibold text-gray-900">{totals.gems} 💎</span>
                  </button>
                )}
                
                {totals.gold > 0 && (
                  <button
                    onClick={() => setPaymentMethod('gold')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                      paymentMethod === 'gold'
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'gold' ? 'border-yellow-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'gold' && (
                        <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                      )}
                    </div>
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">Gold</p>
                      <p className="text-sm text-gray-600">Pay with your gold balance</p>
                    </div>
                    <span className="font-semibold text-gray-900">{totals.gold} 🪙</span>
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
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
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.products.name}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <div className="text-right">
                    {totals.usd > 0 && <div>${totals.usd.toFixed(2)}</div>}
                    {totals.gems > 0 && <div>{totals.gems} 💎</div>}
                    {totals.gold > 0 && <div>{totals.gold} 🪙</div>}
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <div className="text-right">
                    {totals.usd > 0 && <div>${totals.usd.toFixed(2)}</div>}
                    {totals.gems > 0 && <div>{totals.gems} 💎</div>}
                    {totals.gold > 0 && <div>{totals.gold} 🪙</div>}
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

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment information is secure and encrypted
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
