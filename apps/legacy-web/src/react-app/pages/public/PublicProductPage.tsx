import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Star, ShoppingCart, ArrowRight, Store, Tag, Shield, Truck, ArrowLeft, Lock } from 'lucide-react';
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
        rating: number;
    };
    created_at: string;
}

export default function PublicProductPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/marketplace/products/${id}/public`);
                if (!response.ok) {
                    throw new Error('Product not found');
                }
                const data = await response.json();
                setProduct(data.data?.product || null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const formatPrice = (price: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/auth?redirect=/marketplace');
            return;
        }
        // Redirect to app view for authenticated cart action
        navigate(`/marketplace/product/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background">
                <MarketingNav />
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold text-pr-text-1 mb-4">Product Not Found</h1>
                    <p className="text-pr-text-2 mb-8">This product may have been removed or is no longer available.</p>
                    <Link to="/marketplace" className="text-blue-500 hover:underline">← Back to Marketplace</Link>
                </div>
                <MarketingFooter />
            </div>
        );
    }

    const ogImage = product.images?.[0] || 'https://promorang.co/promorang-logo.png';
    const discount = product.original_price && product.original_price > product.price
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${product.name} | Promorang Marketplace`}
                description={product.description?.slice(0, 160) || `Shop ${product.name} on Promorang and earn Promo Points!`}
                ogImage={ogImage}
                ogType="product"
                canonicalUrl={`https://promorang.co/p/${product.id}`}
                keywords={`buy ${product.name}, ${product.category}, promorang marketplace`}
            />
            <MarketingNav />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <Link to="/marketplace" className="text-pr-text-2 hover:text-blue-500 flex items-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                    </Link>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div>
                        <div className="aspect-square bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden mb-4">
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="w-24 h-24 text-pr-text-muted" />
                                </div>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-blue-500' : 'border-pr-border'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        {/* Store */}
                        {product.store && (
                            <Link
                                to={`/marketplace/store/${product.store.store_slug}`}
                                className="inline-flex items-center gap-2 text-sm text-pr-text-2 hover:text-blue-500 mb-4"
                            >
                                <Store className="w-4 h-4" />
                                {product.store.store_name}
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    {product.store.rating?.toFixed(1)}
                                </span>
                            </Link>
                        )}

                        <h1 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= Math.round(product.rating || 0)
                                                ? 'text-yellow-500 fill-current'
                                                : 'text-pr-text-muted'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-pr-text-1 font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-pr-text-muted">({product.review_count || 0} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-extrabold text-pr-text-1">
                                {formatPrice(product.price, product.currency)}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                                <>
                                    <span className="text-xl text-pr-text-muted line-through">
                                        {formatPrice(product.original_price, product.currency)}
                                    </span>
                                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-pr-text-2 leading-relaxed mb-8">{product.description}</p>

                        {/* Stock */}
                        {product.stock_quantity !== undefined && (
                            <p className={`text-sm mb-6 ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                            </p>
                        )}

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock_quantity === 0}
                                className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${product.stock_quantity === 0
                                        ? 'bg-pr-surface-2 text-pr-text-muted cursor-not-allowed'
                                        : user
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                                    }`}
                            >
                                {product.stock_quantity === 0 ? (
                                    'Out of Stock'
                                ) : user ? (
                                    <>
                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" /> Sign In to Purchase
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-pr-surface-card border border-pr-border rounded-lg">
                                <Tag className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                <div className="text-xs text-pr-text-2">Earn Promo Points</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-card border border-pr-border rounded-lg">
                                <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <div className="text-xs text-pr-text-2">Buyer Protection</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-card border border-pr-border rounded-lg">
                                <Truck className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                <div className="text-xs text-pr-text-2">Fast Shipping</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA for non-logged in users */}
            {!user && (
                <section className="py-16 bg-pr-surface-1 border-y border-pr-border mt-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-pr-text-1 mb-4">Create an Account to Purchase</h2>
                        <p className="text-pr-text-2 mb-8">
                            Sign up for free to add items to your cart, checkout, and earn Promo Points on every purchase.
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
