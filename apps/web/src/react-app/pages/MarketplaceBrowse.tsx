import { useEffect, useState } from 'react';
import { Search, Filter, ShoppingCart, Star, Sparkles, Store, Grid, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  images: string[];
  rating: number;
  review_count: number;
  sales_count: number;
  is_featured: boolean;
  merchant_stores: {
    store_name: string;
    store_slug: string;
    logo_url: string;
  };
  product_categories: {
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function MarketplaceBrowse() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const params = new URLSearchParams({
        status: 'active',
        sort_by: sortBy,
        limit: '50',
      });
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const productsResponse = await apiFetch(`/api/marketplace/products?${params.toString()}`);
      const productsData = await productsResponse.json();
      
      if (productsData.status === 'success') {
        setProducts(productsData.data.products);
      }

      // Fetch categories
      const categoriesResponse = await apiFetch('/api/marketplace/categories');
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.status === 'success') {
        setCategories(categoriesData.data.categories);
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await apiFetch('/api/marketplace/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: 'Added to cart',
          description: 'Product added to your cart',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        type: 'destructive',
      });
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
      <div className="min-h-screen-dynamic bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="h-24 rounded-2xl bg-gradient-to-r from-purple-200/80 via-white to-blue-200/60 animate-pulse" />

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="h-12 rounded-lg bg-pr-surface-card/70 border border-purple-100 animate-pulse flex-1" />
              <div className="h-12 w-32 rounded-lg bg-pr-surface-card/70 border border-purple-100 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`category-skeleton-${index}`} className="h-10 w-28 rounded-lg bg-pr-surface-card/70 border border-purple-100 animate-pulse" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`card-skeleton-${index}`} className="rounded-xl border border-pr-surface-3 bg-pr-surface-card/80 p-4 space-y-4 animate-pulse">
                <div className="relative pb-[100%] bg-pr-surface-3/60 rounded-lg" />
                <div className="h-5 bg-pr-surface-3/70 rounded w-3/4" />
                <div className="h-4 bg-pr-surface-3/60 rounded w-full" />
                <div className="h-4 bg-pr-surface-3/50 rounded w-2/3" />
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-pr-surface-3/70 rounded" />
                  <div className="h-9 w-20 bg-pr-surface-3/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-pr-text-1">Marketplace</h1>
              <p className="text-pr-text-2 mt-1">Discover products from creators and brands</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsFilterOpen(true)}
                className="bg-pr-surface-card text-pr-text-1 border border-pr-surface-3 hover:bg-pr-surface-2 md:hidden"
                variant="ghost"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={() => navigate('/merchant/dashboard')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Store className="mr-2 h-4 w-4" />
                Sell on Promorang
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3 bg-pr-surface-1 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-pr-text-1 placeholder:text-gray-400"
              />
            </div>
            <Button onClick={handleSearch} className="md:w-auto">
              Search
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-pr-surface-card text-pr-text-1 hover:bg-pr-surface-2 border border-pr-surface-3'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-pr-surface-card text-pr-text-1 hover:bg-pr-surface-2 border border-pr-surface-3'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Newest</option>
              <option value="sales_count">Best Selling</option>
              <option value="rating">Top Rated</option>
              <option value="price_usd">Price: Low to High</option>
            </select>
            <span className="text-sm text-pr-text-2">
              {products.length} products
            </span>
          </div>
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

        {/* Mobile Drawer */}
        {isFilterOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsFilterOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-pr-surface-card shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-pr-text-1">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-full bg-pr-surface-2 text-pr-text-2 hover:text-pr-text-1"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-pr-text-1 mb-3">Sort by</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at">Newest</option>
                    <option value="sales_count">Best Selling</option>
                    <option value="rating">Top Rated</option>
                    <option value="price_usd">Price: Low to High</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-pr-text-1 mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-blue-600 text-white'
                          : 'bg-pr-surface-card text-pr-text-1 hover:bg-pr-surface-2 border border-pr-surface-3'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-pr-surface-card text-pr-text-1 hover:bg-pr-surface-2 border border-pr-surface-3'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                  Apply filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Store className="mx-auto h-16 w-16 text-purple-400" />
            <h3 className="mt-4 text-xl font-semibold text-pr-text-1">No products match your filters</h3>
            <p className="mt-2 text-sm text-pr-text-2 max-w-md mx-auto">
              Try adjusting your filters or browse featured collections to discover creators and brands.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setSelectedCategory('')} className="bg-blue-600 hover:bg-blue-700">
                View all products
              </Button>
              <Button variant="outline" onClick={() => navigate('/marketplace')}
                className="border-purple-500 text-purple-600 hover:bg-purple-50">
                Explore featured picks
              </Button>
            </div>
          </div>
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
                {product.is_featured && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  </div>
                )}
                
                <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'relative pb-[100%]'}>
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className={viewMode === 'list' ? 'w-full h-full object-cover' : 'absolute inset-0 w-full h-full object-cover'}
                  />
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-pr-text-1 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-pr-text-2 mt-1 line-clamp-2">{product.short_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-pr-text-2">({product.review_count})</span>
                    <span className="text-sm text-pr-text-2">•</span>
                    <span className="text-sm text-pr-text-2">{product.sales_count} sold</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={product.merchant_stores.logo_url || 'https://via.placeholder.com/32'}
                      alt={product.merchant_stores.store_name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-pr-text-2">{product.merchant_stores.store_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-pr-text-1">
                      {formatPrice(product)}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
