import { useEffect, useState } from 'react';
import {
    Link
} from 'react-router-dom';
import {
    TrendingUp,
    ArrowRight,
    ArrowUpRight,
    Target,
    ShoppingBag,
    Trophy,
    Sparkles,
    Store,
    Gift
} from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

import type { PersonaType } from './PersonaSwitcher';

interface BentoData {
    drops?: any;
    forecasts?: any;
    content?: any;
    products?: any;
    coupons?: any;
    milestones?: any;
}

interface HeroBentoGridProps {
    persona: PersonaType;
}

export default function HeroBentoGrid({ persona }: HeroBentoGridProps) {
    const [data, setData] = useState<BentoData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBentoData() {
            try {
                const [dropsRes, forecastsRes, contentRes, productsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/drops/public?limit=1`),
                    fetch(`${API_BASE_URL}/api/social-forecasts/public?limit=1`),
                    fetch(`${API_BASE_URL}/api/content/public?limit=1`),
                    fetch(`${API_BASE_URL}/api/marketplace/products/public?limit=1`)
                ]);

                const results: BentoData = {};
                if (dropsRes.ok) results.drops = (await dropsRes.json())[0];
                if (forecastsRes.ok) results.forecasts = (await forecastsRes.json())[0];
                if (contentRes.ok) results.content = (await contentRes.json())[0];
                if (productsRes.ok) {
                    const pData = await productsRes.json();
                    results.products = pData.data?.products?.[0];
                }

                setData(results);
            } catch (error) {
                console.error('Bento data fetch failed:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBentoData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-6 grid-rows-6 gap-4 h-[600px] w-full animate-pulse">
                <div className="col-span-4 row-span-4 bg-pr-surface-2 rounded-2xl" />
                <div className="col-span-2 row-span-2 bg-pr-surface-2 rounded-2xl" />
                <div className="col-span-2 row-span-2 bg-pr-surface-2 rounded-2xl" />
                <div className="col-span-2 row-span-2 bg-pr-surface-2 rounded-2xl" />
                <div className="col-span-4 row-span-2 bg-pr-surface-2 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-6 gap-4 min-h-[600px] w-full group/bento transition-all duration-500">

            {/* 1. Primary Feature: Adaptive based on Persona */}
            <Link
                to={
                    persona === 'merchant' ? '/for-merchants' :
                        persona === 'investor' ? '/portfolio' :
                            data.drops ? `/d/${data.drops.id}` : '/drops'
                }
                className="md:col-span-4 md:row-span-4 bg-pr-surface-card border border-pr-border rounded-3xl overflow-hidden relative group/item hover:border-blue-500/50 transition-all shadow-xl flex flex-col"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img
                    src={
                        persona === 'merchant' ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' :
                            persona === 'investor' ? 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800' :
                                data.drops?.preview_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'
                    }
                    className="absolute inset-0 w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700"
                    alt=""
                />
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        {persona === 'merchant' ? <Store className="w-3 h-3" /> : persona === 'investor' ? <TrendingUp className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {persona === 'merchant' ? 'Brand Growth' : persona === 'investor' ? 'Social Alpha' : 'Featured Drop'}
                    </span>
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {persona === 'merchant' ? 'Partner Portal' : 'Live Ecosystem'}
                    </span>
                </div>
                <div className="mt-auto p-8 relative z-20">
                    <h3 className="text-3xl font-black text-white mb-2 leading-tight">
                        {persona === 'merchant' ? "Scale Your Brand Influence" :
                            persona === 'investor' ? "Trade Social Capital" :
                                data.drops?.title || "Exclusive Tech Drop"}
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-md line-clamp-2">
                        {persona === 'merchant' ? "Deploy high-impact campaigns and track ROI in real-time." :
                            persona === 'investor' ? "Buy shares in viral content and predict performance for top returns." :
                                `Participate and earn up to ${data.drops?.promo_points_reward || 1000} Promo Points!`}
                    </p>
                    <div className="flex items-center gap-2 text-white font-bold group-hover/item:gap-4 transition-all">
                        {persona === 'merchant' ? 'Start Campaign' : persona === 'investor' ? 'Explore Market' : 'Join the Drop'} <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </Link>

            {/* 2. Forecast Odds (Wide/Medium) - Stays consistent but adapts theme */}
            <Link
                to={data.forecasts ? `/f/${data.forecasts.id}` : '/forecasts'}
                className={`md:col-span-2 md:row-span-3 border border-pr-border rounded-3xl p-6 transition-all group/forecast relative overflow-hidden ${persona === 'investor' ? 'bg-green-500/20 border-green-500/50' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-500/50'
                    }`}
            >
                <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover/forecast:opacity-20 transition-opacity">
                    <TrendingUp className="w-32 h-32 text-green-500" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg text-white">
                        <Target className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest">
                        {persona === 'investor' ? 'High Yield Alpha' : 'Active Forecast'}
                    </span>
                </div>
                <h4 className="text-lg font-bold text-pr-text-1 mb-2 line-clamp-2 leading-snug">
                    {data.forecasts?.content_title || "Will Tech Channel hit 1M views?"}
                </h4>
                <div className="mt-4 p-4 bg-pr-surface-card/60 backdrop-blur-md border border-pr-border rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-pr-text-1">
                        {data.forecasts?.odds || '2.5'}x
                    </span>
                    <span className="text-[10px] text-pr-text-muted uppercase font-bold tracking-widest mt-1">
                        Potential Payout
                    </span>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-bold text-pr-text-2">
                    <span>{data.forecasts?.participants || 24} Participants</span>
                    <ArrowUpRight className="w-4 h-4 text-green-500 group-hover/forecast:translate-x-1 group-hover/forecast:-translate-y-1 transition-transform" />
                </div>
            </Link>

            {/* 3. Marketplace Teaser (Small) - Focus on Coupons for Shoppers */}
            <Link
                to={data.products ? `/p/${data.products.id}` : '/marketplace'}
                className={`md:col-span-2 md:row-span-3 bg-pr-surface-card border border-pr-border rounded-3xl p-6 hover:border-purple-500/50 transition-all flex flex-col ${persona === 'shopper' ? 'border-yellow-500/30' : ''
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
                        {persona === 'shopper' ? 'Exclusive Deal' : 'Hot Product'}
                    </span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="w-full aspect-square bg-pr-surface-background rounded-xl mb-4 overflow-hidden relative">
                        <img
                            src={data.products?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">
                            {persona === 'shopper' ? '30% OFF' : `$${data.products?.price || '49.99'}`}
                        </div>
                    </div>
                    <h4 className="font-bold text-pr-text-1 text-sm line-clamp-1 truncate">{data.products?.name || "Premium Headphones"}</h4>
                    <p className="text-[10px] text-pr-text-muted mt-1 uppercase tracking-wider font-medium">
                        {persona === 'shopper' ? 'Claim with Points' : 'Redeem with Points'}
                    </p>
                </div>
            </Link>

            {/* 4. Growth Hub: Road to Platinum (Wide) */}
            <Link
                to="/about/growth-hub"
                className="md:col-span-3 md:row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 hover:opacity-95 transition-all text-white relative overflow-hidden group/growth"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover/growth:scale-125 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest block">Growth Hub</span>
                        <h4 className="text-xl font-black">Road to Elite</h4>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white rounded-full" />
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">Tier: Gold</span>
                </div>
                <div className="mt-4 text-xs font-medium text-blue-100 flex items-center gap-2">
                    Daily Task: Share 3 Drops <span className="px-1.5 py-0.5 bg-green-400 text-black rounded text-[9px] font-black uppercase">Earn 50 PP</span>
                </div>
            </Link>

            {/* 5. Coupons & Savings (Small) */}
            <Link
                to="/about/growth-hub"
                className="md:col-span-3 md:row-span-2 bg-pr-surface-card border border-pr-border rounded-3xl p-6 hover:border-yellow-500/50 transition-all flex items-center gap-6"
            >
                <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                    <Gift className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block mb-1">Redeem Rewards</span>
                    <h4 className="text-xl font-bold text-pr-text-1">Claim Coupons</h4>
                    <p className="text-sm text-pr-text-2">Unlock discounts at 50+ partners</p>
                </div>
                <div className="ml-auto p-2 rounded-full bg-pr-surface-2 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </div>
            </Link>

        </div>
    );
}
