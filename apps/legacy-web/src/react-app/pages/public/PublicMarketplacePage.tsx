import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Search, Star, ShoppingCart, ArrowRight, Store } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    currency: string;
    images: string[];
    category: string;
    rating: number;
    review_count: number;
    stock_quantity: number;
    store?: {
        id: string;
        store_name: string;
        store_slug: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

export default function PublicMarketplacePage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/marketplace/products/public?limit=24`),
                    fetch(`${API_BASE_URL}/api/marketplace/categories/public`)
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data.data?.products || []);
                }

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    setCategories(data.data?.categories || []);
                }
            } catch (error) {
                console.error('Failed to fetch marketplace data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatPrice = (price: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Marketplace - Shop & Earn Promo Points"
                description="Browse products from verified merchants on Promorang. Earn Promo Points with every purchase and redeem exclusive coupons."
                keywords="promorang marketplace, shop and earn, promo points, rewards shopping, merchant products"
                canonicalUrl="https://promorang.co/marketplace"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="py-12 md:py-20 bg-gradient-to-b from-pr-surface-1 to-pr-surface-background border-b border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 mb-4">
                        Shop & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Earn</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto mb-8">
                        Every purchase earns Promo Points. Redeem exclusive coupons and discounts.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pr-text-2" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-pr-surface-card border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="py-6 border-b border-pr-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-pr-surface-card border border-pr-border text-pr-text-2 hover:bg-pr-surface-2'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.slug
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-pr-surface-card border border-pr-border text-pr-text-2 hover:bg-pr-surface-2'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Store className="w-16 h-16 text-pr-text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-pr-text-1 mb-2">No products found</h3>
                            <p className="text-pr-text-2">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/p/${product.id}`}
                                    className="group bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-500/50 transition-all"
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-pr-surface-2 relative overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingCart className="w-12 h-12 text-pr-text-muted" />
                                            </div>
                                        )}
                                        {product.original_price && product.original_price > product.price && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                SALE
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-pr-text-1 line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">
                                            {product.name}
                                        </h3>
                                        {product.store && (
                                            <p className="text-xs text-pr-text-muted mb-2">{product.store.store_name}</p>
                                        )}
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="text-sm text-pr-text-2">{product.rating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-xs text-pr-text-muted">({product.review_count || 0})</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-pr-text-1">
                                                {formatPrice(product.price, product.currency)}
                                            </span>
                                            {product.original_price && product.original_price > product.price && (
                                                <span className="text-sm text-pr-text-muted line-through">
                                                    {formatPrice(product.original_price, product.currency)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            {!user && (
                <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-pr-text-1 mb-4">Earn While You Shop</h2>
                        <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                            Create a free account to earn Promo Points on every purchase and unlock exclusive discounts.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                        >
                            Create Free Account <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            )}

            <MarketingFooter />
        </div>
    );
}
