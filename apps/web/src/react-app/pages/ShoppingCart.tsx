import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Timer, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  products: {
    id: string;
    name: string;
    images: string[];
    inventory_count: number;
    is_unlimited: boolean;
    merchant_stores: {
      store_name: string;
      store_slug: string;
    };
  };
}

interface Cart {
  id: string;
  cart_items: CartItem[];
}

export default function ShoppingCart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchCart();
    fetchUpsells();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCart = async () => {
    try {
      const response = await apiFetch('/api/marketplace/cart');
      const data = await response.json();

      if (data.status === 'success') {
        setCart(data.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUpsells = async () => {
    try {
      const resp = await apiFetch('/api/marketplace/products?limit=4');
      const data = await resp.json();
      if (data.status === 'success') {
        setUpsellProducts(data.data.products);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    try {
      const response = await apiFetch(`/api/marketplace/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        type: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await apiFetch(`/api/marketplace/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'success') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        await fetchCart();
        toast({
          title: 'Removed',
          description: 'Item removed from cart',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        type: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (item: CartItem) => {
    const prices = [];
    if (item.price_usd) prices.push(`$${item.price_usd.toFixed(2)}`);
    if (item.price_gems) prices.push(`${item.price_gems} 💎`);
    if (item.price_gold) prices.push(`${item.price_gold} 🪙`);
    return prices.join(' or ');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      const storeSlug = item.products.merchant_stores.store_slug;
      if (!groups[storeSlug]) {
        groups[storeSlug] = {
          storeName: item.products.merchant_stores.store_name,
          items: [],
        };
      }
      groups[storeSlug].items.push(item);
      return groups;
    }, {} as Record<string, { storeName: string; items: CartItem[] }>);
  }, [cart]);

  const isEmpty = !cart || !cart.cart_items || cart.cart_items.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-pr-surface-3 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-pr-surface-card rounded-2xl" />
            </div>
            <div className="h-64 bg-pr-surface-card rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-pr-surface-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-pr-border text-slate-400">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black text-pr-text-1 mb-2">Your cart is empty</h3>
          <p className="text-pr-text-muted mb-8 max-w-md mx-auto">Don't miss out on today's special drops! Grab them before they're gone.</p>
          <Button onClick={() => navigate('/marketplace')} className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20">
            Start Shopping
          </Button>

          {/* Upsells even when empty */}
          <div className="mt-20">
            <h3 className="text-xl font-black text-left mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Recommended for You
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {upsellProducts.map(p => (
                <div key={p.id} onClick={() => navigate(`/marketplace/product/${p.id}`)} className="bg-pr-surface-card p-3 rounded-xl border border-pr-border hover:shadow-lg transition-all cursor-pointer group">
                  <div className="relative pb-[100%] rounded-lg overflow-hidden mb-3">
                    <img src={p.images[0]} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs font-bold text-pr-text-1 truncate mb-1">{p.name}</p>
                  <p className="text-sm font-black text-blue-600">${p.price_usd}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-36 lg:pb-8">
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 text-white">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <CartIcon className="h-8 w-8" />
              Shopping Cart
            </h1>
            <p className="text-blue-100 font-medium mt-1">
              Items are reserved for a limited time.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-xl border border-white/20">
            <Timer className="h-5 w-5 animate-pulse" />
            <span className="font-black text-xl tabular-nums">Expires in {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(storeGroups).map(([storeSlug, group]) => (
              <Card key={storeSlug} className="p-6 border-pr-border overflow-hidden">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-pr-border">
                  <div className="w-10 h-10 bg-pr-surface-2 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-pr-text-1">
                    {group.storeName}
                  </h3>
                </div>

                <div className="space-y-6">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-pr-border last:border-0 last:pb-0">
                      <div
                        className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-pr-border"
                        onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                      >
                        <img
                          src={item.products.images[0] || 'https://via.placeholder.com/100'}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-black text-pr-text-1 text-lg mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                        >
                          {item.products.name}
                        </h4>
                        <p className="text-sm font-bold text-blue-600 mb-4">{formatPrice(item)}</p>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center bg-pr-surface-2 rounded-xl border border-pr-border p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-black tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                updating === item.id ||
                                (!item.products.is_unlimited && item.quantity >= item.products.inventory_count)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Impulse Upsells */}
            <div className="mt-12">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                Frequently Bought Together
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {upsellProducts.map(p => (
                  <Card key={p.id} onClick={() => navigate(`/marketplace/product/${p.id}`)} className="p-3 border-pr-border hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group bg-white">
                    <div className="relative pb-[100%] rounded-xl overflow-hidden mb-3">
                      <img src={p.images[0]} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="text-xs font-bold text-pr-text-1 truncate mb-1">{p.name}</p>
                    <p className="text-sm font-black text-blue-600">${p.price_usd}</p>
                    <Button size="sm" variant="secondary" className="w-full mt-2 h-8 text-[10px] font-black uppercase tracking-tighter rounded-lg">View</Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-8 border-pr-border shadow-xl">
              <h3 className="font-black text-xl text-pr-text-1 mb-6">Order Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <div className="text-right">
                    {totals.usd > 0 && <div className="font-black text-pr-text-1">${totals.usd.toFixed(2)}</div>}
                    {totals.gems > 0 && <div className="text-blue-600 font-black">{totals.gems} 💎</div>}
                    {totals.gold > 0 && <div className="text-orange-600 font-black">{totals.gold} 🪙</div>}
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-black uppercase text-[10px] bg-green-50 px-2 py-1 rounded-md">Calculated at checkout</span>
                </div>

                <div className="border-t border-pr-border pt-4 flex justify-between items-baseline">
                  <span className="font-black text-lg">Total</span>
                  <div className="text-right">
                    {totals.usd > 0 && <div className="text-2xl font-black text-blue-600 tracking-tight">${totals.usd.toFixed(2)}</div>}
                    {totals.gems > 0 && <div className="text-xl font-black text-blue-500">{totals.gems} 💎</div>}
                    {totals.gold > 0 && <div className="text-xl font-black text-orange-500">{totals.gold} 🪙</div>}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-black shadow-lg shadow-blue-500/20 group"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => navigate('/marketplace')}
                  className="w-full font-bold text-slate-500 hover:text-blue-600"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Trust elements */}
              <div className="mt-8 pt-6 border-t border-pr-border flex justify-center gap-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-pr-border px-4 py-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] items-center gap-1 font-black uppercase text-slate-400 mb-1 flex">
              <Timer className="h-3 w-3" />
              Expires in {formatTime(timeLeft)}
            </p>
            <div className="text-lg font-black text-pr-text-1">
              {totals.usd > 0 && <div>${totals.usd.toFixed(2)}</div>}
            </div>
          </div>
          <Button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black text-sm"
          >
            Checkout Now
          </Button>
        </div>
      </div>
    </div>
  );
}
