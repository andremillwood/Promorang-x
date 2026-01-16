import { useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { ChevronDown, ChevronRight, Zap, TrendingUp, Crown, Building2, ArrowRight } from 'lucide-react';

interface TierSection {
    title: string;
    icon: React.ReactNode;
    description: string;
    tierLabel: string;
    tierColor: string;
    links: { label: string; path: string; description?: string }[];
}

const accessTiers: TierSection[] = [
    {
        title: 'Getting Started',
        icon: <Zap className="w-5 h-5" />,
        description: 'Features available from Day 1',
        tierLabel: 'Day 1+',
        tierColor: 'bg-green-500',
        links: [
            { label: 'Explore Opportunities', path: '/explore', description: 'Browse available drops and campaigns' },
            { label: 'Promo Points', path: '/promo-points', description: 'Earn and track your platform currency' },
            { label: 'Referral Program', path: '/referral-program', description: 'Invite friends and earn bonuses' },
            { label: 'Coupons', path: '/coupons-for-shoppers', description: 'Discover deals from local merchants' },
            { label: 'How It Works', path: '/how-it-works', description: 'Understand the Access Rank system' },
        ],
    },
    {
        title: 'Unlocking More',
        icon: <TrendingUp className="w-5 h-5" />,
        description: 'Features that unlock as your Access Rank grows',
        tierLabel: 'Day 7+',
        tierColor: 'bg-blue-500',
        links: [
            { label: 'Drops', path: '/drops', description: 'Task-based earning opportunities' },
            { label: 'Content Shares', path: '/content-shares', description: 'Invest in content performance' },
            { label: 'Campaigns', path: '/campaigns-marketing', description: 'Participate in brand campaigns' },
            { label: 'Moves', path: '/moves', description: 'Platform engagement currency' },
            { label: 'Growth Hub', path: '/about/growth-hub', description: 'Tier benefits and progression' },
        ],
    },
    {
        title: 'Full Platform Access',
        icon: <Crown className="w-5 h-5" />,
        description: 'Advanced features for consistent users',
        tierLabel: 'Day 14+',
        tierColor: 'bg-purple-500',
        links: [
            { label: 'Forecasts', path: '/forecasts', description: 'Predict content success' },
            { label: 'Relays', path: '/relays', description: 'Content distribution network' },
            { label: 'Social Shield', path: '/growth-hub/social-shield', description: 'Protection against algorithm changes' },
            { label: 'Gems Staking', path: '/growth-hub/staking', description: 'Stake for enhanced rewards' },
            { label: 'Auto-Invest', path: '/growth-hub/auto-invest', description: 'Automatic portfolio building' },
            { label: 'Creator Funding', path: '/growth-hub/creator-funding', description: 'Get funded for your content' },
            { label: 'Full Platform Preview', path: '/home-legacy', description: 'See everything available' },
        ],
    },
    {
        title: 'For Businesses',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Solutions for brands, advertisers, and merchants',
        tierLabel: 'Business',
        tierColor: 'bg-orange-500',
        links: [
            { label: 'For Advertisers', path: '/advertisers', description: 'Create campaigns and reach active users' },
            { label: 'For Brands', path: '/brands', description: 'Partner with verified creators' },
            { label: 'For Merchants', path: '/merchants', description: 'Local business solutions' },
            { label: 'Drops for Advertisers', path: '/drops-for-advertisers', description: 'Create task-based campaigns' },
            { label: 'Coupons for Merchants', path: '/coupons-for-merchants', description: 'Issue and manage coupons' },
            { label: 'Advertiser Pricing', path: '/advertiser-pricing', description: 'Campaign pricing and packages' },
        ],
    },
];

// Legacy persona/industry pages for SEO - still accessible but not primary
const legacyPages = {
    personas: [
        { label: 'For Creators', path: '/creators' },
        { label: 'For Investors', path: '/investors' },
        { label: 'For Shoppers', path: '/shoppers' },
        { label: 'For Operators', path: '/for-operators' },
    ],
    industries: [
        { label: 'Tourism & Hospitality', path: '/for-tourism' },
        { label: 'Restaurants & F&B', path: '/for-restaurants' },
        { label: 'E-commerce & DTC', path: '/for-ecommerce' },
        { label: 'Events & Festivals', path: '/for-events' },
        { label: 'Corporate & Enterprise', path: '/for-enterprise' },
        { label: 'Universities & Students', path: '/for-universities' },
    ],
};

function TierCard({ tier }: { tier: TierSection }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-pr-surface-2 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${tier.tierColor}/10 flex items-center justify-center`}>
                        <span className={`${tier.tierColor.replace('bg-', 'text-')}`}>{tier.icon}</span>
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-pr-text-1">{tier.title}</h2>
                            <span className={`${tier.tierColor} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                                {tier.tierLabel}
                            </span>
                        </div>
                        <p className="text-sm text-pr-text-2">{tier.description}</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-pr-text-2" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-pr-text-2" />
                )}
            </button>

            {isOpen && (
                <div className="border-t border-pr-border p-4">
                    <div className="grid md:grid-cols-2 gap-2">
                        {tier.links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-pr-surface-2 transition-colors group"
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${tier.tierColor} mt-2 flex-shrink-0`} />
                                <div>
                                    <div className="font-medium text-pr-text-1 group-hover:text-blue-500 transition-colors text-sm">
                                        {link.label}
                                    </div>
                                    {link.description && (
                                        <div className="text-xs text-pr-text-2">{link.description}</div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CatalogPage() {
    const [showLegacy, setShowLegacy] = useState(false);

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Platform Catalog | Promorang"
                description="Explore Promorang features organized by Access Tier. See what unlocks as you build your Access Rank."
                canonicalUrl="https://promorang.co/catalog"
                keywords="promorang features, access rank, platform tiers, what unlocks"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-pr-text-1 mb-6">
                        What You'll Unlock
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
                        Your Access Rank determines what features you can use.
                        Here's what opens up as you stay consistent.
                    </p>
                </div>
            </section>

            {/* Access Tier Sections */}
            <section className="pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {accessTiers.map((tier) => (
                            <TierCard key={tier.title} tier={tier} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Start Day 1 CTA */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">Ready to Start Unlocking?</h2>
                    <p className="text-pr-text-2 mb-8">
                        Day 1 is the hardest. After that, your Access Rank grows with every visit.
                    </p>
                    <Link
                        to="/auth"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                        Start Day 1 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Legacy Pages (for SEO, collapsed by default) */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => setShowLegacy(!showLegacy)}
                        className="w-full flex items-center justify-between p-4 bg-pr-surface-card border border-pr-border rounded-xl text-left hover:bg-pr-surface-2 transition-colors"
                    >
                        <div>
                            <h3 className="font-semibold text-pr-text-1">More Pages</h3>
                            <p className="text-sm text-pr-text-muted">Legacy pages for specific audiences and industries</p>
                        </div>
                        {showLegacy ? (
                            <ChevronDown className="w-5 h-5 text-pr-text-2" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-pr-text-2" />
                        )}
                    </button>

                    {showLegacy && (
                        <div className="mt-4 grid md:grid-cols-2 gap-6">
                            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-4">
                                <h4 className="font-semibold text-pr-text-1 mb-3 text-sm uppercase tracking-wider">By Role</h4>
                                <div className="space-y-2">
                                    {legacyPages.personas.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="block text-sm text-pr-text-2 hover:text-blue-500 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-4">
                                <h4 className="font-semibold text-pr-text-1 mb-3 text-sm uppercase tracking-wider">By Industry</h4>
                                <div className="space-y-2">
                                    {legacyPages.industries.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="block text-sm text-pr-text-2 hover:text-blue-500 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
