import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, DollarSign, ShoppingBag, Plus, TrendingUp, Users, Star, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import PlatformConnector from '@/react-app/components/merchant/PlatformConnector';
import ProductImporter from '@/react-app/components/merchant/ProductImporter';
import { Settings2 } from 'lucide-react';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  total_sales: number;
  total_orders: number;
  total_products: number;
  rating: number;
  review_count: number;
}

interface Product {
  id: string;
  name: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  inventory_count: number;
  sales_count: number;
  status: string;
  images: string[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_usd: number;
  total_gems: number;
  total_gold: number;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    store_name: '',
    description: '',
    contact_email: '',
  });

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      // Check if user has a store
      const storeResponse = await fetch('/api/marketplace/my-store', {
        credentials: 'include',
      });
      const storeData = await storeResponse.json();

      if (storeData.status === 'success' && storeData.data.store) {
        setStore(storeData.data.store);
        fetchProducts(storeData.data.store.id);
        fetchOrders(storeData.data.store.id);
      } else {
        setShowCreateStore(true);
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (storeId: string) => {
    try {
      const response = await fetch(`/api/marketplace/stores/${storeId}/products`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.status === 'success') {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async (storeId: string) => {
    try {
      const response = await fetch(`/api/marketplace/stores/${storeId}/orders`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.status === 'success') {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/marketplace/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(storeForm),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success!',
          description: 'Your store has been created',
          type: 'success',
        });
        setStore(data.data.store);
        setShowCreateStore(false);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'Error',
        description: 'Failed to create store',
        type: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showCreateStore) {
    return (
      <div className="min-h-screen-dynamic bg-pr-surface-2 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <Store className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-pr-text-1 mb-2">Create Your Store</h1>
            <p className="text-pr-text-2">Start selling on Promorang marketplace</p>
          </div>

          <form onSubmit={handleCreateStore} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                value={storeForm.store_name}
                onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
                className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Awesome Store"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Description
              </label>
              <textarea
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell customers about your store..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pr-text-1 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={storeForm.contact_email}
                onChange={(e) => setStoreForm({ ...storeForm, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="store@example.com"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              Create Store
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-pr-text-1">{store.store_name}</h1>
              <p className="text-pr-text-2 mt-1">Manage your store and products</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/merchant/validate-coupon')}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Validate Coupon
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/marketplace/store/${store.store_slug}`)}
              >
                <Store className="mr-2 h-4 w-4" />
                View Store
              </Button>
              <Button
                onClick={() => navigate('/merchant/products/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Total Sales</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">
                  ${store.total_sales.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Total Orders</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{store.total_orders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Products</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{store.total_products}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pr-text-2">Store Rating</p>
                <p className="text-2xl font-bold text-pr-text-1 mt-2">{store.rating.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-pr-text-1 mb-2">No products yet</h3>
                <p className="text-pr-text-2 mb-6">Start by adding your first product</p>
                <Button
                  onClick={() => navigate('/merchant/products/new')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative pb-[75%]">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-pr-surface-2 text-pr-text-1'
                        }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-pr-text-1 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between text-sm text-pr-text-2 mb-3">
                        <span>Stock: {product.inventory_count}</span>
                        <span>{product.sales_count} sold</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/merchant/products/${product.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/marketplace/product/${product.id}`)}
                          >
                            View
                          </Button>
                        </div>
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="sm"
                          onClick={() => navigate('/advertiser/sampling/create', {
                            state: { productId: product.id, productName: product.name }
                          })}
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Promote
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-pr-text-1 mb-2">No orders yet</h3>
                <p className="text-pr-text-2">Orders will appear here when customers make purchases</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-pr-text-1">Order #{order.order_number}</h3>
                        <p className="text-sm text-pr-text-2 mt-1">
                          {order.users.display_name || order.users.username}
                        </p>
                        <p className="text-sm text-pr-text-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-pr-text-1">
                          {order.total_usd > 0 && `$${order.total_usd.toFixed(2)}`}
                          {order.total_gems > 0 && `${order.total_gems} 💎`}
                          {order.total_gold > 0 && `${order.total_gold} 🪙`}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <div className="space-y-8">
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                  <Settings2 className="h-5 w-5" /> External Connections
                </h2>
                <PlatformConnector onConnected={() => fetchMerchantData()} />
              </div>

              {store && (
                <div className="pt-8 border-t border-pr-border">
                  <h2 className="text-xl font-bold text-pr-text-1 mb-4">Import Products</h2>
                  <p className="text-pr-text-2 mb-6 text-sm">
                    Select products from your connected e-commerce platforms to import them into the Promorang marketplace.
                  </p>
                  <ProductImporter />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
