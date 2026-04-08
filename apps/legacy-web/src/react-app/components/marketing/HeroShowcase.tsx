import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Sparkles, Zap, ArrowRight, Star } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface ShowcaseData {
    type: 'drop' | 'product' | 'content' | 'forecast';
    id: string;
    title: string;
    image: string;
    meta: string;
    badge?: string;
    link: string;
}

export default function HeroShowcase() {
    const [items, setItems] = useState<ShowcaseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        async function fetchShowcaseData() {
            try {
                // Fetch a mix of data from public endpoints
                const [dropsRes, productsRes, contentRes, forecastsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/drops?limit=1`),
                    fetch(`${API_BASE_URL}/api/marketplace/products/public?limit=1`),
                    fetch(`${API_BASE_URL}/api/content/public?limit=1`),
                    fetch(`${API_BASE_URL}/api/social-forecasts/public?limit=1`)
                ]);

                const showcaseItems: ShowcaseData[] = [];

                if (dropsRes.ok) {
                    const drops = await dropsRes.json();
                    if (drops[0]) {
                        showcaseItems.push({
                            type: 'drop',
                            id: drops[0].id,
                            title: drops[0].title,
                            image: drops[0].preview_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
                            meta: `+${drops[0].promo_points_reward} Points`,
                            badge: 'Hot Drop',
                            link: `/d/${drops[0].id}`
                        });
                    }
                }

                if (productsRes.ok) {
                    const products = await productsRes.json();
                    const p = products.data?.products?.[0];
                    if (p) {
                        showcaseItems.push({
                            type: 'product',
                            id: p.id,
                            title: p.name,
                            image: p.images?.[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
                            meta: `$${p.price}`,
                            badge: 'Staff Pick',
                            link: `/p/${p.id}`
                        });
                    }
                }

                if (contentRes.ok) {
                    const content = await contentRes.json();
                    if (content[0]) {
                        showcaseItems.push({
                            type: 'content',
                            id: content[0].id,
                            title: content[0].title,
                            image: content[0].media_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
                            meta: `${(content[0].engagement_rate * 100).toFixed(1)}% Engagement`,
                            badge: 'Trending',
                            link: `/c/${content[0].id}`
                        });
                    }
                }

                if (forecastsRes.ok) {
                    const forecasts = await forecastsRes.json();
                    if (forecasts[0]) {
                        showcaseItems.push({
                            type: 'forecast',
                            id: forecasts[0].id,
                            title: forecasts[0].content_title,
                            image: forecasts[0].media_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
                            meta: `${forecasts[0].odds}x Odds`,
                            badge: 'Live Forecast',
                            link: `/f/${forecasts[0].id}`
                        });
                    }
                }

                setItems(showcaseItems);
            } catch (error) {
                console.error('Showcase fetch failed:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchShowcaseData();
    }, []);

    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items]);

    if (loading) {
        return (
            <div className="w-full h-[400px] bg-pr-surface-2 rounded-2xl animate-pulse flex items-center justify-center">
                <Zap className="w-12 h-12 text-pr-text-muted opacity-20" />
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {items.map((item, idx) => (
                <Link
                    key={`${item.type}-${item.id}`}
                    to={item.link}
                    className={`absolute inset-0 transition-all duration-1000 transform ${idx === activeIndex
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-8 pointer-events-none'
                        }`}
                >
                    <div className="relative h-full bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden shadow-2xl group">
                        {/* Background Image with blur effect */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover scale-110 blur-xl opacity-20 transform group-hover:scale-125 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-pr-surface-card/60" />
                        </div>

                        <div className="relative h-full p-8 flex flex-col items-center justify-center text-center">
                            {/* Type Icon */}
                            <div className="mb-6 p-4 rounded-full bg-pr-surface-2 border border-pr-border shadow-inner">
                                {item.type === 'drop' && <Sparkles className="w-8 h-8 text-yellow-500" />}
                                {item.type === 'product' && <ShoppingBag className="w-8 h-8 text-purple-500" />}
                                {item.type === 'content' && <Zap className="w-8 h-8 text-blue-500" />}
                                {item.type === 'forecast' && <TrendingUp className="w-8 h-8 text-green-500" />}
                            </div>

                            {item.badge && (
                                <span className="mb-4 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                                    {item.badge}
                                </span>
                            )}

                            <h3 className="text-2xl font-bold text-pr-text-1 mb-2 line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-lg font-medium text-pr-text-2 mb-8">
                                {item.meta}
                            </p>

                            <div className="flex items-center gap-2 text-blue-500 font-bold group-hover:gap-3 transition-all">
                                View Now <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Pagination dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {items.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-pr-border'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
