import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface Product {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    currency: string;
    images: string[];
    rating: number;
    store?: {
        store_name: string;
    };
}

export default function MarketplacePreviewSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/marketplace/products/public?limit=6`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.data?.products?.slice(0, 6) || []);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                // Use demo data if fetch fails
                setProducts([
                    { id: '1', name: 'Premium Wireless Earbuds', price: 79.99, original_price: 129.99, currency: 'USD', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'], rating: 4.8, store: { store_name: 'TechShop' } },
                    { id: '2', name: 'Organic Skincare Set', price: 45.00, currency: 'USD', images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'], rating: 4.9, store: { store_name: 'BeautyHub' } },
                    { id: '3', name: 'Fitness Tracker Pro', price: 149.99, original_price: 199.99, currency: 'USD', images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'], rating: 4.6, store: { store_name: 'FitGear' } },
                    { id: '4', name: 'Artisan Coffee Blend', price: 24.99, currency: 'USD', images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'], rating: 4.7, store: { store_name: 'CoffeeRoasters' } },
                    { id: '5', name: 'Minimalist Watch', price: 189.00, original_price: 249.00, currency: 'USD', images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400'], rating: 4.5, store: { store_name: 'TimeStyle' } },
                    { id: '6', name: 'Plant-Based Protein', price: 39.99, currency: 'USD', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400'], rating: 4.4, store: { store_name: 'NutriFit' } }
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const formatPrice = (price: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    if (loading) {
        return (
            <section className="py-16 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-pr-surface-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-bold text-purple-500 uppercase tracking-wider">Marketplace</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                            Shop & Earn Points
                        </h2>
                    </div>
                    <Link
                        to="/marketplace"
                        className="hidden sm:flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        Browse All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/p/${product.id}`}
                            className="group bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden hover:shadow-lg hover:border-purple-500/50 transition-all"
                        >
                            <div className="aspect-square bg-pr-surface-2 relative overflow-hidden">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="w-10 h-10 text-pr-text-muted" />
                                    </div>
                                )}
                                {product.original_price && product.original_price > product.price && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                        SALE
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-medium text-pr-text-1 text-sm line-clamp-2 mb-1 group-hover:text-purple-500 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 mb-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-pr-text-2">{product.rating?.toFixed(1)}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-bold text-pr-text-1 text-sm">
                                        {formatPrice(product.price, product.currency)}
                                    </span>
                                    {product.original_price && product.original_price > product.price && (
                                        <span className="text-xs text-pr-text-muted line-through">
                                            {formatPrice(product.original_price, product.currency)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 sm:hidden text-center">
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        Browse All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
