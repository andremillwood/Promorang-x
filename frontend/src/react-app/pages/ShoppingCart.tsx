import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/marketplace/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
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
      const response = await fetch(`/api/marketplace/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.status === 'success') {
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

  const formatPrice = (item: CartItem) => {
    const prices = [];
    if (item.price_usd) prices.push(`$${item.price_usd.toFixed(2)}`);
    if (item.price_gems) prices.push(`${item.price_gems} 💎`);
    if (item.price_gold) prices.push(`${item.price_gold} 🪙`);
    return prices.join(' or ');
  };

  const groupByStore = () => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totals = calculateTotals();
  const storeGroups = groupByStore();
  const isEmpty = !cart || !cart.cart_items || cart.cart_items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CartIcon className="h-8 w-8" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-1">
            {isEmpty ? 'Your cart is empty' : `${cart.cart_items.length} item(s) in your cart`}
          </p>
        </div>

        {isEmpty ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate('/marketplace')} className="bg-blue-600 hover:bg-blue-700">
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(storeGroups).map(([storeSlug, group]) => (
                <Card key={storeSlug} className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {group.storeName}
                  </h3>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <img
                          src={item.products.images[0] || 'https://via.placeholder.com/100'}
                          alt={item.products.name}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                        />
                        <div className="flex-1">
                          <h4
                            className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                          >
                            {item.products.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{formatPrice(item)}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={updating === item.id || item.quantity <= 1}
                                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={
                                  updating === item.id ||
                                  (!item.products.is_unlimited && item.quantity >= item.products.inventory_count)
                                }
                                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={updating === item.id}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {!item.products.is_unlimited && item.quantity >= item.products.inventory_count && (
                            <p className="text-sm text-red-600 mt-2">
                              Maximum available: {item.products.inventory_count}
                            </p>
                          )}
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.price_usd && `$${(item.price_usd * item.quantity).toFixed(2)}`}
                            {item.price_gems && `${item.price_gems * item.quantity} 💎`}
                            {item.price_gold && `${item.price_gold * item.quantity} 🪙`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
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
                    <span>Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <div className="text-right">
                      {totals.usd > 0 && <div>${totals.usd.toFixed(2)}</div>}
                      {totals.gems > 0 && <div>{totals.gems} 💎</div>}
                      {totals.gold > 0 && <div>{totals.gold} 🪙</div>}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                  className="w-full mt-3"
                >
                  Continue Shopping
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
