import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import { ShoppingBag, Star, Zap, TrendingUp } from 'lucide-react';

export default function ForShoppers() {
    return (
        <div className="min-h-screen bg-pr-surface-background font-sans">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8">
                        <span className="text-sm font-medium text-blue-400">For Smart Shoppers</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Shop Smarter. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                            Save Bigger.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Discover exclusive deals from top creative brands and save money on the products you love.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/marketplace">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-900/20">
                                Browse Marketplace <ShoppingBag className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="bg-pr-surface-card p-8 rounded-2xl border border-pr-surface-3">
                            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <Star className="text-blue-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Exclusive Deals</h3>
                            <p className="text-zinc-400">Access discounts and offers you won't find anywhere else, curated directly from creators.</p>
                        </div>
                        <div className="bg-pr-surface-card p-8 rounded-2xl border border-pr-surface-3">
                            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="text-purple-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Flash Sales</h3>
                            <p className="text-zinc-400">Catch limited-time offers on trending products before they're gone.</p>
                        </div>
                        <div className="bg-pr-surface-card p-8 rounded-2xl border border-pr-surface-3">
                            <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <TrendingUp className="text-green-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Earn Rewards</h3>
                            <p className="text-zinc-400">Get rewarded for shopping and sharing your favorite finds.</p>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
