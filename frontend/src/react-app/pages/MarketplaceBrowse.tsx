import { useEffect, useState } from 'react';
import { Search, Filter, ShoppingCart, Star, TrendingUp, Sparkles, Store, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

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

      const productsResponse = await fetch(`/api/marketplace/products?${params}`, {
        credentials: 'include',
      });
      const productsData = await productsResponse.json();
      
      if (productsData.status === 'success') {
        setProducts(productsData.data.products);
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/marketplace/categories', {
        credentials: 'include',
      });
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
      const response = await fetch('/api/marketplace/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-1">Discover products from creators and brands</p>
            </div>
            <Button onClick={() => navigate('/merchant/dashboard')} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Store className="mr-2 h-4 w-4" />
              Sell on Promorang
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleSearch} className="md:w-auto">
              Search
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Newest</option>
              <option value="sales_count">Best Selling</option>
              <option value="rating">Top Rated</option>
              <option value="price_usd">Price: Low to High</option>
            </select>
            <span className="text-sm text-gray-600">
              {products.length} products
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
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
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.short_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.review_count})</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{product.sales_count} sold</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={product.merchant_stores.logo_url || 'https://via.placeholder.com/32'}
                      alt={product.merchant_stores.store_name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{product.merchant_stores.store_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-gray-900">
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
