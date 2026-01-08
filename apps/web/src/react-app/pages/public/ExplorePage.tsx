import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import {
    Sparkles,
    ArrowRight,
    TrendingUp,
    Target,
    ShoppingBag,
    Zap,
    Globe,
    ExternalLink,
    ChevronRight,
    Trophy
} from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';
import HeroBentoGrid from '@/react-app/components/marketing/HeroBentoGrid';

export default function ExplorePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        drops: 0,
        products: 0,
        forecasts: 0,
        content: 0
    });

    useEffect(() => {
        // Fetch snapshot of ecosystem volume
        async function fetchStats() {
            try {
                // In a real app, this would be a unified stats endpoint
                // For now, we simulate or fetch counts if available
                setStats({
                    drops: 142,
                    products: 890,
                    forecasts: 64,
                    content: 12050
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Explore the Ecosystem - Promorang"
                description="Discover live drops, premium products, and viral forecasts on the Promorang ecosystem. See how social capital is traded in real-time."
                keywords="explore promorang, discover drops, social marketplace, viral forecasts, creator rewards"
                canonicalUrl="https://promorang.co/explore"
            />
            <MarketingNav />

            {/* Sub-Header / Breadcrumb-ish */}
            <div className="bg-pr-surface-1 border-b border-pr-border py-4">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-pr-text-muted uppercase tracking-widest">
                        <Globe className="w-4 h-4" />
                        <span>Live Ecosystem Explorer</span>
                    </div>
                    {!user && (
                        <Link to="/auth" className="text-xs font-black text-blue-500 hover:text-blue-400 flex items-center gap-1">
                            SIGN UP TO PARTICIPATE <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-pr-text-1 mb-4 flex items-center gap-4">
                        Discover What's <span className="px-4 py-1 bg-blue-500 text-white rounded-xl rotate-[-2deg] inline-block">Next</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl">
                        The Promorang ecosystem is a live marketplace for social attention.
                        Browse trending drops, predict viral success, and shop with social rewards.
                    </p>
                </div>

                {/* Primary Exploration Grid */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-pr-text-1 flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Active Opportunities
                        </h2>
                        <span className="px-3 py-1 bg-pr-surface-2 border border-pr-border rounded-full text-[10px] font-bold text-pr-text-muted uppercase tracking-widest">
                            Updated Real-time
                        </span>
                    </div>
                    <HeroBentoGrid persona="creator" />
                </div>

                {/* Category Sections */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 whitespace-normal">
                    {/* Marketplace */}
                    <div className="bg-pr-surface-card border border-pr-border rounded-3xl p-8 hover:border-purple-500/50 transition-all group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-pr-text-1 mb-2">Live Shop</h3>
                        <p className="text-pr-text-muted mb-6 text-sm">
                            {stats.products}+ premium products available for redemption or direct purchase.
                        </p>
                        <Link to="/marketplace" className="inline-flex items-center gap-2 text-purple-500 font-bold hover:gap-3 transition-all">
                            Browse Products <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Forecasts */}
                    <div className="bg-pr-surface-card border border-pr-border rounded-3xl p-8 hover:border-green-500/50 transition-all group">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-pr-text-1 mb-2">Social Alpha</h3>
                        <p className="text-pr-text-muted mb-6 text-sm">
                            {stats.forecasts}+ active markets predicting the next big viral moments.
                        </p>
                        <Link to="/forecasts" className="inline-flex items-center gap-2 text-green-500 font-bold hover:gap-3 transition-all">
                            View Forecasts <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Content Shares */}
                    <div className="bg-pr-surface-card border border-pr-border rounded-3xl p-8 hover:border-blue-500/50 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-pr-text-1 mb-2">Viral Assets</h3>
                        <p className="text-pr-text-muted mb-6 text-sm">
                            {stats.content.toLocaleString()}+ pieces of social content generating real ROI.
                        </p>
                        <Link to="/content-shares" className="inline-flex items-center gap-2 text-blue-500 font-bold hover:gap-3 transition-all">
                            See Top Shares <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Stats / Proof */}
                    <div className="bg-pr-surface-card border border-pr-border rounded-3xl p-8 flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-pr-text-muted block mb-4">Network Growth</span>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-3xl font-black text-pr-text-1">$2.4M</div>
                                    <div className="text-xs font-bold text-pr-text-2 uppercase">Earned by Creators</div>
                                </div>
                                <div className="h-px bg-pr-border" />
                                <div>
                                    <div className="text-3xl font-black text-pr-text-1">500k+</div>
                                    <div className="text-xs font-bold text-pr-text-2 uppercase">Verified Shares</div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => navigate('/about')} className="mt-8 text-xs font-bold text-pr-text-muted hover:text-pr-text-1 flex items-center gap-1">
                            Learn our model <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Engagement CTA */}
                {!user && (
                    <section className="relative overflow-hidden bg-pr-text-1 text-pr-surface-background rounded-[2.5rem] p-12 md:p-20 text-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                Ready to Participate in the <span className="text-blue-500">Social Economy</span>?
                            </h2>
                            <p className="text-lg opacity-80 mb-10 text-pretty">
                                Don't just browse. Start earning social capital, predicting trends, and growing your personal brand.
                                Join 10,000+ creators and investors already in the ecosystem.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/auth?mode=signup"
                                    className="px-10 py-5 bg-white text-black rounded-2xl font-black shadow-2xl hover:scale-105 transition-all text-xl"
                                >
                                    GET STARTED FOR FREE
                                </Link>
                                <button
                                    onClick={() => navigate('/about/growth-hub')}
                                    className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black hover:bg-white/20 transition-all text-xl"
                                >
                                    SEE JOURNEY PATHS
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <MarketingFooter />
        </div>
    );
}
