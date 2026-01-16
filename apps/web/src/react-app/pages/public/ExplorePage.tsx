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
    Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

// Example opportunities - showing what the platform enables
// These are demos to illustrate the access system
const exampleOpportunities = [
    {
        id: 'ex-1',
        type: 'drop',
        title: 'Review New Tech Gadget',
        brand: 'Sample Tech Brand',
        status: 'AVAILABLE',
        minRank: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-2',
        type: 'drop',
        title: 'Your Campaign Here',
        brand: 'Your Brand',
        status: 'LOCKED',
        minRank: 7,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-3',
        type: 'drop',
        title: 'Restaurant Opening Promo',
        brand: 'Sample Restaurant',
        status: 'COUNTDOWN',
        minRank: 3,
        opensIn: '4h 22m',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-4',
        type: 'drop',
        title: 'Fitness Product Launch',
        brand: 'Sample Fitness',
        status: 'LOCKED',
        minRank: 14,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-5',
        type: 'drop',
        title: 'Travel Experience Share',
        brand: 'Sample Travel',
        status: 'MISSED',
        endedDate: 'Jan 12',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
    },
    {
        id: 'ex-6',
        type: 'drop',
        title: 'Coffee Brand Ambassador',
        brand: 'Sample Coffee',
        status: 'AVAILABLE',
        minRank: 1,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=250&fit=crop'
    },
];

function OpportunityCard({ opportunity, navigate }: { opportunity: typeof exampleOpportunities[0]; navigate: (path: string) => void }) {
    const statusConfig = {
        AVAILABLE: {
            badgeColor: 'bg-green-500',
            badgeText: 'Available Now',
            icon: <Eye className="w-4 h-4" />,
            imageClass: '',
            cta: 'View Opportunity'
        },
        LOCKED: {
            badgeColor: 'bg-yellow-500',
            badgeText: `Day ${opportunity.minRank}+ Required`,
            icon: <Lock className="w-4 h-4" />,
            imageClass: 'blur-sm opacity-60',
            cta: 'Start Day 1 to Unlock'
        },
        COUNTDOWN: {
            badgeColor: 'bg-blue-500',
            badgeText: `Opens in ${opportunity.opensIn}`,
            icon: <Clock className="w-4 h-4" />,
            imageClass: 'opacity-70',
            cta: 'Get Notified'
        },
        MISSED: {
            badgeColor: 'bg-red-500',
            badgeText: `Ended ${opportunity.endedDate}`,
            icon: <AlertCircle className="w-4 h-4" />,
            imageClass: 'grayscale opacity-50',
            cta: "Don't Miss the Next One"
        }
    };

    const config = statusConfig[opportunity.status as keyof typeof statusConfig];

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden hover:border-blue-500/30 transition-all relative">
            {/* Example badge */}
            <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pr-text-muted bg-pr-surface-2/90 backdrop-blur-sm px-2 py-1 rounded">
                    Example
                </span>
            </div>

            {/* Image with status overlay */}
            <div className="aspect-[16/10] relative">
                <img
                    src={opportunity.image}
                    alt=""
                    className={`w-full h-full object-cover ${config.imageClass}`}
                />
                <div className="absolute top-3 left-3">
                    <div className={`${config.badgeColor} text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold`}>
                        {config.icon}
                        {config.badgeText}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="text-xs text-pr-text-muted mb-1">{opportunity.brand}</div>
                <h3 className="font-bold text-pr-text-1 mb-3">{opportunity.title}</h3>

                <button
                    onClick={() => navigate('/auth')}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${opportunity.status === 'AVAILABLE'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                        }`}
                >
                    {opportunity.status === 'AVAILABLE' ? 'Start Day 1 to Access' : config.cta}
                </button>
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
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-500 text-xs font-semibold mb-3">
                                <Sparkles className="w-3 h-3" />
                                Demo Preview
                            </div>
                            <h1 className="text-3xl font-bold text-pr-text-1 mb-2">How Opportunities Work</h1>
                            <p className="text-pr-text-2">
                                These examples show how Access Rank determines what you see.
                                <Link to="/how-it-works" className="text-blue-500 hover:underline ml-1">Learn more →</Link>
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
                                <h3 className="font-bold text-pr-text-1">Your Access Rank: Day 0</h3>
                                <p className="text-sm text-pr-text-2">Start participating to unlock more opportunities</p>
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
                <div className="text-center mb-8">
                    <p className="text-sm text-pr-text-muted">
                        Below are <strong>example opportunities</strong> showing how Access Rank controls visibility.
                        Real opportunities are created by brands and businesses.
                    </p>
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

                {/* Dual CTA */}
                <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                        <TrendingUp className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-pr-text-1 mb-2">Want opportunities like these?</h3>
                        <p className="text-sm text-pr-text-2 mb-4">
                            Create an account and start building your Access Rank.
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
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">How Access Works</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Every day you participate, your Access Rank increases.
                        Higher rank means earlier access to new opportunities and more visibility across the platform.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-green-500 font-bold mb-2">Day 1-6</div>
                            <p className="text-sm text-pr-text-2">Access to basic opportunities</p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-blue-500 font-bold mb-2">Day 7-13</div>
                            <p className="text-sm text-pr-text-2">Unlock premium opportunities</p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
                            <div className="text-purple-500 font-bold mb-2">Day 14+</div>
                            <p className="text-sm text-pr-text-2">Priority access to everything</p>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
