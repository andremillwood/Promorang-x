import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import {
    ArrowRight,
    Activity,
    Lock,
    Clock,
    AlertCircle,
    Eye,
    Zap,
    TrendingUp,
    Sparkles,
    ShoppingBag,
    ShieldCheck,
    Globe,
    Compass,
    Crown
} from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

// Example opportunities - showing what the platform enables
// These are demos to illustrate the access system
const exampleOpportunities = [
    {
        id: 'ex-1',
        type: 'buy',
        title: 'Review New Tech Gadget',
        brand: 'Sample Tech Brand',
        status: 'AVAILABLE',
        minRank: 1,
        aiVerified: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-2',
        type: 'activation',
        title: 'Luminous City Sourcing',
        brand: 'Aether Brands',
        status: 'LOCKED',
        minRank: 7,
        kycRequired: true,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-3',
        type: 'buy',
        title: 'Specialty Coffee Review',
        brand: 'Sample Restaurant',
        status: 'COUNTDOWN',
        minRank: 3,
        opensIn: '4h 22m',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-4',
        type: 'activation',
        title: 'Alpha Tester: Fitness',
        brand: 'Sample Fitness',
        status: 'LOCKED',
        minRank: 14,
        kycRequired: true,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-5',
        type: 'activation',
        title: 'Travel Experience Share',
        brand: 'Sample Travel',
        status: 'MISSED',
        endedDate: 'Jan 12',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-6',
        type: 'activation',
        title: 'Street Style Capture',
        brand: 'Sample Coffee',
        status: 'AVAILABLE',
        minRank: 1,
        aiVerified: true,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=250&fit=crop'
    },
];

function OpportunityCard({ opportunity, navigate }: { opportunity: typeof exampleOpportunities[0]; navigate: (path: string) => void }) {
    const statusConfig = {
        AVAILABLE: {
            badgeColor: 'bg-indigo-600',
            badgeText: 'Live Recognition',
            icon: <Zap className="w-4 h-4" />,
            imageClass: 'group-hover:scale-110 duration-700',
            cta: 'Claim Recognition'
        },
        LOCKED: {
            badgeColor: 'bg-zinc-800',
            badgeText: `Consistent Presence Required`,
            icon: <Lock className="w-4 h-4" />,
            imageClass: 'blur-md opacity-60',
            cta: 'Build Consistency to Unlock'
        },
        COUNTDOWN: {
            badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
            badgeText: `Unlocking in ${opportunity.opensIn}`,
            icon: <Clock className="w-4 h-4" />,
            imageClass: 'opacity-70',
            cta: 'Set Reminder'
        },
        MISSED: {
            badgeColor: 'bg-zinc-900 text-zinc-500',
            badgeText: `Opportunity Closed ${opportunity.endedDate}`,
            icon: <AlertCircle className="w-4 h-4" />,
            imageClass: 'grayscale opacity-50',
            cta: "View Details"
        }
    };

    const config = statusConfig[opportunity.status as keyof typeof statusConfig];

    return (
        <div className="group relative flex flex-col bg-[#130F1E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30">
            {/* Pinterest-style Visual Card */}
            <div className="aspect-[4/5] relative overflow-hidden">
                <img
                    src={opportunity.image}
                    alt=""
                    className={`w-full h-full object-cover transition-transform ${config.imageClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#130F1E] via-[#130F1E]/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-6 left-6">
                    <div className={`${config.badgeColor} text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md`}>
                        {config.icon}
                        {config.badgeText}
                    </div>
                </div>

                {/* Example Overlay (Ghosted) */}
                <div className="absolute top-6 right-6">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 border border-white/10 px-2 py-1 rounded-lg">
                        Prototype
                    </span>
                </div>
            </div>

            {/* Voucher Aesthetics (The Bridge) */}
            <div className="relative p-8 pt-0">
                {/* Groupon-style Punch-outs */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-pr-surface-background rounded-full border-r border-white/10" />
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-pr-surface-background rounded-full border-l border-white/10" />

                {/* Dashed Line Separator */}
                <div className="border-t-2 border-dashed border-white/5 mb-8" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{opportunity.brand}</p>
                        <ShieldCheck className="w-4 h-4 text-indigo-500/50" />
                    </div>

                    <h3 className="text-2xl font-black text-white tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
                        {opportunity.title}
                    </h3>

                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span>Identity Credit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>Community Impact</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/auth')}
                        className={`w-full mt-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${opportunity.status === 'AVAILABLE'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20'
                            : 'bg-white/5 text-pr-text-2 hover:bg-white/10'
                            }`}
                    >
                        {config.cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ExplorePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Explore Opportunities - Promorang"
                description="Browse available opportunities on Promorang. Your Access Rank determines what you can see and when."
                keywords="explore promorang, opportunities, access rank, drops"
                canonicalUrl="https://promorang.co/explore"
            />
            <MarketingNav />

            {/* Header */}
            <div className="bg-pr-surface-1 border-b border-pr-border py-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-3">
                                <Sparkles className="w-3 h-3" />
                                Value Velocity
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-3">Gateway of Recognition</h1>
                            <p className="text-pr-text-2 font-medium">
                                Discovery Hub • High-impact opportunities from the Network.
                                <Link to="/how-it-works" className="text-indigo-400 font-bold hover:underline ml-2">How to Participate →</Link>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-all text-sm"
                            >
                                Start Day 1 <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/advertisers"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all text-sm"
                            >
                                For Businesses
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Access Rank Info Box (for non-logged-in users) */}
            {!user && (
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-pr-text-1">Your Presence Level: 0</h3>
                                <p className="text-sm text-pr-text-2">Building consistency unlocks high-tier opportunities & participation rewards.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-green-500">
                                <Eye className="w-4 h-4" />
                                <span>2 Available</span>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Lock className="w-4 h-4" />
                                <span>4 Locked</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Opportunities Grid */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-16 space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-white/20">
                        Historical Prototypes • Value Signatures
                    </p>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto opacity-30" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exampleOpportunities.map((opportunity) => (
                        <OpportunityCard
                            key={opportunity.id}
                            opportunity={opportunity}
                            navigate={navigate}
                        />
                    ))}
                </div>

                {/* Narrative Districts Section */}
                <div className="mt-20">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-500 text-xs font-semibold mb-3">
                            <Compass className="w-3 h-3" />
                            Explore the network
                        </div>
                        <h2 className="text-3xl font-bold text-pr-text-1">Geographic Districts</h2>
                        <p className="text-pr-text-2 mt-2">Activations are concentrated in narrative hubs where brands and creators overlap.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Apex Plaza', desc: 'High-end retail and global brand showrooms.', icon: <Crown className="text-yellow-500" />, color: 'border-yellow-500/20' },
                            { name: 'Dazzle District', desc: 'Lifestyle, cafes, and personal care outposts.', icon: <Sparkles className="text-blue-400" />, color: 'border-blue-500/20' },
                            { name: 'Echo Hollow', desc: 'Digital products, software, and remote sourcing.', icon: <Globe className="text-green-400" />, color: 'border-green-500/20' },
                            { name: 'The Grid', desc: 'Electronics, gear, and gaming activationlines.', icon: <Zap className="text-purple-400" />, color: 'border-purple-500/20' }
                        ].map((district, i) => (
                            <div key={i} className={`bg-pr-surface-card border ${district.color} rounded-xl p-6 transition-transform hover:-translate-y-1`}>
                                <div className="p-3 bg-pr-surface-2 rounded-xl w-fit mb-4">
                                    {district.icon}
                                </div>
                                <h3 className="font-bold text-pr-text-1 mb-1">{district.name}</h3>
                                <p className="text-xs text-pr-text-2 leading-relaxed">{district.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dual CTA */}
                <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                        <TrendingUp className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-pr-text-1 mb-2">Want opportunities like these?</h3>
                        <p className="text-sm text-pr-text-2 mb-4">
                            Create an account and start building your Presence.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-all"
                        >
                            Start Day 1 <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
                        <Zap className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-pr-text-1 mb-2">Want to create opportunities?</h3>
                        <p className="text-sm text-pr-text-2 mb-4">
                            Reach verified, active users with your campaigns.
                        </p>
                        <Link
                            to="/advertisers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all"
                        >
                            For Businesses <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Access Principle Footer */}
            <section className="py-16 bg-pr-surface-1 border-t border-pr-border">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">Recognition Principles</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Consistency increases your <strong>Presence Level</strong>.
                        Higher levels grant deeper access, lower fees, and priority in the lottery pools.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-green-500 font-bold mb-2">Level 1-6</div>
                            <p className="text-sm text-pr-text-2">Access to Buy Missions & basic activations</p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-blue-500 font-bold mb-2">Level 7-13</div>
                            <p className="text-sm text-pr-text-2">Unlock Fast Gem Credits & premium rewards</p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-purple-500 font-bold mb-2">Level 14+</div>
                            <p className="text-sm text-pr-text-2">Identity-Locked Activations & Priority Discovery</p>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
