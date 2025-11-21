import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, Star, MapPin, Mail, Phone, ExternalLink, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  rating: number;
  review_count: number;
  total_sales: number;
  total_orders: number;
  total_products: number;
  contact_email: string;
  contact_phone: string;
  social_links: Record<string, string>;
  users: {
    username: string;
    display_name: string;
  };
}

interface Product {
  id: string;
  name: string;
  short_description: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  images: string[];
  rating: number;
  sales_count: number;
}

export default function StorePage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (storeSlug) {
      fetchStore();
      fetchProducts();
    }
  }, [storeSlug]);

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/marketplace/stores/${storeSlug}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setStore(data.data.store);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/marketplace/stores/${storeSlug}/products`, {
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

  const formatPrice = (product: Product) => {
    const prices = [];
    if (product.price_usd) prices.push(`$${product.price_usd.toFixed(2)}`);
    if (product.price_gems) prices.push(`${product.price_gems} 💎`);
    if (product.price_gold) prices.push(`${product.price_gold} 🪙`);
    return prices.join(' or ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pr-text-1">Store not found</h2>
          <Button onClick={() => navigate('/marketplace')} className="mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      {/* Banner */}
      {store.banner_url && (
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          <img
            src={store.banner_url}
            alt={store.store_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header */}
        <div className="relative -mt-16 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={store.logo_url || 'https://via.placeholder.com/120'}
                alt={store.store_name}
                className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-pr-text-1 mb-2">{store.store_name}</h1>
                    <p className="text-pr-text-2 mb-3">{store.description}</p>
                    <div className="flex items-center gap-4 text-sm text-pr-text-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{store.rating.toFixed(1)}</span>
                        <span className="ml-1">({store.review_count} reviews)</span>
                      </div>
                      <span>•</span>
                      <span>{store.total_products} products</span>
                      <span>•</span>
                      <span>{store.total_orders} orders</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {store.contact_email && (
                    <a
                      href={`mailto:${store.contact_email}`}
                      className="inline-flex items-center px-3 py-1.5 bg-pr-surface-2 text-pr-text-1 rounded-lg hover:bg-pr-surface-3 text-sm"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </a>
                  )}
                  {Object.entries(store.social_links || {}).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-pr-surface-2 text-pr-text-1 rounded-lg hover:bg-pr-surface-3 text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Products */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-pr-text-1">Products</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-pr-text-2 hover:bg-pr-surface-2'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-pr-text-2 hover:bg-pr-surface-2'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-pr-text-1 mb-2">No products yet</h3>
              <p className="text-pr-text-2">This store hasn't listed any products</p>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                >
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'relative pb-[100%]'}>
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className={viewMode === 'list' ? 'w-full h-full object-cover' : 'absolute inset-0 w-full h-full object-cover'}
                    />
                  </div>

                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-pr-text-1 line-clamp-2 mb-2">{product.name}</h3>
                    <p className="text-sm text-pr-text-2 line-clamp-2 mb-3">{product.short_description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-pr-text-2">•</span>
                      <span className="text-sm text-pr-text-2">{product.sales_count} sold</span>
                    </div>

                    <div className="font-bold text-lg text-pr-text-1">
                      {formatPrice(product)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
