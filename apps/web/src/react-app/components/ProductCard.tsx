import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Sparkles, Store } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '@/react-app/utils/api';
import type { ProductType } from '../../shared/types';

interface ProductCardProps {
    product: ProductType;
    viewMode?: 'grid' | 'list';
    compact?: boolean;
}

export default function ProductCard({ product, viewMode = 'grid', compact = false }: ProductCardProps) {
    const navigate = useNavigate();
    const { toast } = useToast();

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

    const formatPrice = (product: ProductType) => {
        const prices = [];
        if (product.price_usd) prices.push(`$${product.price_usd.toFixed(2)}`);
        if (product.price_gems) prices.push(`${product.price_gems} 💎`);
        if (product.price_gold) prices.push(`${product.price_gold} 🪙`);
        return prices.join(' or ');
    };

    // Dynamic Badges
    const renderBadges = () => {
        const badges = [];
        if (product.is_featured) {
            badges.push(
                <span key="featured" className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black bg-yellow-400 text-black uppercase tracking-tighter shadow-sm border border-yellow-500">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    Featured
                </span>
            );
        }
        if (product.sales_count > 50) {
            badges.push(
                <span key="bestseller" className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black bg-orange-600 text-white uppercase tracking-tighter shadow-sm">
                    Bestseller
                </span>
            );
        } else if (product.rating >= 4.5 && product.review_count > 10) {
            badges.push(
                <span key="trending" className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black bg-purple-600 text-white uppercase tracking-tighter shadow-sm">
                    Trending
                </span>
            );
        }
        return badges;
    };

    if (compact) {
        return (
            <div
                className="w-full flex gap-4 p-5 bg-pr-surface-card transition-all duration-300 hover:bg-pr-surface-2 group cursor-pointer border-b border-pr-border last:border-0"
                onClick={() => navigate(`/marketplace/product/${product.id}`)}
            >
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-pr-surface-2 relative shadow-inner">
                    <img
                        src={product.images[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-pr-text-1 truncate group-hover:text-blue-500 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Store className="w-3 h-3" />
                        <span>{product.merchant_stores.store_name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="font-black text-sm text-pr-text-1">
                            {formatPrice(product)}
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 rounded-full shadow-md bg-white hover:bg-white hover:scale-110"
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product.id);
                            }}
                        >
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-pr-surface-card border-pr-border rounded-2xl ${viewMode === 'list' ? 'flex flex-row' : ''
                }`}
            onClick={() => navigate(`/marketplace/product/${product.id}`)}
        >
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {renderBadges()}
            </div>

            <div className={viewMode === 'list' ? 'w-56 flex-shrink-0 h-full' : 'relative pb-[100%] overflow-hidden'}>
                <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className={viewMode === 'list'
                        ? 'w-full h-full object-cover'
                        : 'absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'}
                />

                {/* Quick Add Overlay */}
                {viewMode === 'grid' && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product.id);
                            }}
                            className="bg-white/95 backdrop-blur text-black hover:bg-white hover:scale-105 rounded-full font-bold px-6 py-2 shadow-2xl border-none"
                        >
                            + Quick Add
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-pr-text-1 text-lg leading-tight line-clamp-2 transition-colors group-hover:text-blue-500">
                                {product.name}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center text-orange-500 font-black text-sm">
                            <Star className="h-3.5 w-3.5 fill-current mr-1" />
                            {product.rating.toFixed(1)}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">({product.review_count})</span>
                        <div className="w-1 h-1 rounded-full bg-pr-border" />
                        <span className="text-[10px] text-orange-600 font-black uppercase tracking-tighter bg-orange-100 px-1.5 py-0.5 rounded">
                            {product.sales_count >= 100 ? '🔥 100+ Sold' : `${product.sales_count} Sold`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-pr-surface-2 border border-pr-border group-hover:bg-pr-surface-3 transition-colors">
                        <img
                            src={product.merchant_stores.logo_url || 'https://via.placeholder.com/32'}
                            alt={product.merchant_stores.store_name}
                            className="h-6 w-6 rounded-full border border-pr-border shadow-sm"
                        />
                        <span className="text-xs font-bold text-pr-text-2 truncate">{product.merchant_stores.store_name}</span>
                        <Store className="h-3 w-3 ml-auto text-pr-text-muted" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-pr-border">
                    <div className="flex flex-col">
                        <div className="font-black text-xl text-pr-text-1 tracking-tight">
                            {formatPrice(product)}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 px-4 h-11 transition-all hover:scale-105 active:scale-95"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>
            </div>
        </Card>
    );
}
