import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Users,
    ShoppingBag,
    Calendar,
    Megaphone,
    Store,
    Settings,
    BarChart3,
    Wallet,
    Gift,
    Trophy,
    FileText,
    HelpCircle,
    Search,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Map,
    Layers,
    Target,
    Sparkles,
    Shield,
    TrendingUp
} from 'lucide-react';

interface PageLink {
    path: string;
    name: string;
    description?: string;
}

interface PageCategory {
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    pages: PageLink[];
}

const PAGE_CATEGORIES: PageCategory[] = [
    {
        name: 'Core Experience',
        icon: Home,
        color: 'text-orange-400',
        pages: [
            { path: '/today', name: 'Today', description: 'Daily layer entry point' },
            { path: '/start', name: 'Start Page', description: 'Entry hub for new users' },
            { path: '/dashboard', name: 'Dashboard', description: 'Advanced user dashboard' },
            { path: '/access-rank', name: 'Access Rank', description: 'User journey progress' },
            { path: '/feed', name: 'Feed', description: 'Social content feed' },
        ]
    },
    {
        name: 'Entry Surfaces',
        icon: Layers,
        color: 'text-blue-400',
        pages: [
            { path: '/deals', name: 'Deals', description: 'Browse deals/drops' },
            { path: '/post', name: 'Post Proof', description: 'Share content to earn' },
            { path: '/events-entry', name: 'Events Entry', description: 'Simplified events' },
            { path: '/contribute', name: 'Contribute', description: 'Community contributions' },
        ]
    },
    {
        name: 'Economy & Earnings',
        icon: Wallet,
        color: 'text-green-400',
        pages: [
            { path: '/earn', name: 'Earn', description: 'Earning opportunities' },
            { path: '/wallet', name: 'Wallet', description: 'Balances & transactions' },
            { path: '/rewards', name: 'Rewards', description: 'Claim rewards' },
            { path: '/referrals', name: 'Referrals', description: 'Referral program' },
            { path: '/promoshare', name: 'PromoShare', description: 'Lottery system' },
            { path: '/growth-hub', name: 'Growth Hub', description: 'Financial features' },
            { path: '/leaderboard', name: 'Leaderboard', description: 'Platform rankings' },
            { path: '/matrix', name: 'Matrix', description: 'MLM dashboard' },
        ]
    },
    {
        name: 'Content & Social',
        icon: FileText,
        color: 'text-purple-400',
        pages: [
            { path: '/create', name: 'Create', description: 'Create content' },
            { path: '/invest', name: 'Invest', description: 'Content investment' },
            { path: '/market', name: 'Market', description: 'Content shares market' },
            { path: '/activity', name: 'Activity', description: 'Activity feed' },
            { path: '/sounds', name: 'Sounds', description: 'Sound discovery' },
        ]
    },
    {
        name: 'Events',
        icon: Calendar,
        color: 'text-pink-400',
        pages: [
            { path: '/events', name: 'Events', description: 'Events listing' },
            { path: '/events/create', name: 'Create Event', description: 'Create full event' },
            { path: '/events/create-simple', name: 'Create Simple', description: 'Quick event' },
            { path: '/tickets', name: 'My Tickets', description: 'User tickets' },
        ]
    },
    {
        name: 'Marketplace',
        icon: ShoppingBag,
        color: 'text-cyan-400',
        pages: [
            { path: '/marketplace', name: 'Marketplace', description: 'Browse products' },
            { path: '/cart', name: 'Cart', description: 'Shopping cart' },
            { path: '/orders', name: 'Orders', description: 'Order history' },
            { path: '/coupons', name: 'Coupons', description: 'Public coupons' },
            { path: '/my-coupons', name: 'My Coupons', description: 'Saved coupons' },
        ]
    },
    {
        name: 'Advertiser',
        icon: Megaphone,
        color: 'text-red-400',
        pages: [
            { path: '/advertiser', name: 'Advertiser Dashboard', description: 'Main hub' },
            { path: '/advertiser/onboarding', name: 'Advertiser Onboarding', description: 'Become advertiser' },
            { path: '/advertiser/sampling/create', name: 'Sampling Wizard', description: 'Create sample offer' },
            { path: '/advertiser/campaigns', name: 'Campaigns', description: 'Manage campaigns' },
            { path: '/advertiser/campaigns/new', name: 'New Campaign', description: 'Create campaign' },
            { path: '/advertiser/coupons', name: 'Coupons', description: 'Manage coupons' },
            { path: '/advertiser/coupons/bulk', name: 'Bulk Coupons', description: 'Create many' },
            { path: '/drops/create', name: 'Create Drop', description: 'Create drop' },
            { path: '/drops/manage', name: 'Manage Drops', description: 'Manage drops' },
        ]
    },
    {
        name: 'Merchant',
        icon: Store,
        color: 'text-teal-400',
        pages: [
            { path: '/merchant/dashboard', name: 'Merchant Dashboard', description: 'Main hub' },
            { path: '/merchant/validate-coupon', name: 'Validate Coupon', description: 'Scan coupons' },
            { path: '/venue-qr', name: 'Venue QR', description: 'QR codes' },
            { path: '/products/new', name: 'Add Product', description: 'New product' },
        ]
    },
    {
        name: 'Operator',
        icon: Target,
        color: 'text-indigo-400',
        pages: [
            { path: '/operator/dashboard', name: 'Operator Dashboard', description: 'Main hub' },
            { path: '/operator/forecasts', name: 'Forecasts', description: 'Manage predictions' },
            { path: '/season-hub', name: 'Season Hub', description: 'Season management' },
            { path: '/workforce', name: 'Workforce', description: 'Workforce dashboard' },
        ]
    },
    {
        name: 'Admin',
        icon: Shield,
        color: 'text-yellow-400',
        pages: [
            { path: '/admin', name: 'Admin Dashboard', description: 'Main admin hub' },
            { path: '/admin/kyc', name: 'KYC', description: 'Verification management' },
            { path: '/admin/support', name: 'Support Tickets', description: 'Ticket management' },
            { path: '/admin/settings', name: 'Admin Settings', description: 'Platform settings' },
            { path: '/admin/sitemap', name: 'Site Map', description: 'This page' },
        ]
    },
    {
        name: 'User Account',
        icon: Users,
        color: 'text-slate-400',
        pages: [
            { path: '/profile', name: 'My Profile', description: 'User profile' },
            { path: '/settings', name: 'Settings', description: 'Account settings' },
            { path: '/onboarding', name: 'Onboarding', description: 'User onboarding' },
            { path: '/auth', name: 'Auth', description: 'Login/Signup' },
        ]
    },
    {
        name: 'Marketing Pages',
        icon: TrendingUp,
        color: 'text-emerald-400',
        pages: [
            { path: '/', name: 'Home', description: 'Landing page' },
            { path: '/how-it-works', name: 'How It Works', description: 'Platform explainer' },
            { path: '/pricing', name: 'Pricing', description: 'User tiers' },
            { path: '/advertiser-pricing', name: 'Advertiser Pricing', description: 'Advertiser tiers' },
            { path: '/catalog', name: 'Catalog', description: 'Feature catalog' },
            { path: '/creators', name: 'For Creators', description: 'Creator pitch' },
            { path: '/merchants', name: 'For Merchants', description: 'Merchant pitch' },
            { path: '/brands', name: 'For Advertisers', description: 'Advertiser pitch' },
            { path: '/about', name: 'About', description: 'About Promorang' },
            { path: '/contact', name: 'Contact', description: 'Contact form' },
            { path: '/blog', name: 'Blog', description: 'Blog hub' },
        ]
    },
    {
        name: 'Legal',
        icon: FileText,
        color: 'text-gray-500',
        pages: [
            { path: '/privacy', name: 'Privacy Policy', description: 'Privacy policy' },
            { path: '/terms', name: 'Terms of Service', description: 'Terms' },
            { path: '/support', name: 'Support', description: 'Help center' },
        ]
    },
];

export default function AdminSiteMap() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(PAGE_CATEGORIES.map(c => c.name));

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const filteredCategories = PAGE_CATEGORIES.map(category => ({
        ...category,
        pages: category.pages.filter(page =>
            page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (page.description && page.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(category => category.pages.length > 0);

    const totalPages = PAGE_CATEGORIES.reduce((acc, cat) => acc + cat.pages.length, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Map className="w-8 h-8 text-orange-400" />
                        Platform Site Map
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Navigate to any page in the platform. {totalPages} pages across {PAGE_CATEGORIES.length} categories.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full md:w-64"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { path: '/today', name: 'Today', icon: Sparkles, color: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' },
                    { path: '/advertiser', name: 'Advertiser', icon: Megaphone, color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20' },
                    { path: '/merchant/dashboard', name: 'Merchant', icon: Store, color: 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' },
                    { path: '/operator/dashboard', name: 'Operator', icon: Target, color: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' },
                    { path: '/admin', name: 'Admin', icon: Shield, color: 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' },
                    { path: '/', name: 'Public Home', icon: Home, color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
                ].map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${item.color}`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* Categories */}
            <div className="space-y-4">
                {filteredCategories.map(category => (
                    <div key={category.name} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.name)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gray-700/50 ${category.color}`}>
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                                    <p className="text-sm text-gray-500">{category.pages.length} pages</p>
                                </div>
                            </div>
                            {expandedCategories.includes(category.name) ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {/* Category Pages */}
                        {expandedCategories.includes(category.name) && (
                            <div className="border-t border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
                                    {category.pages.map(page => (
                                        <Link
                                            key={page.path}
                                            to={page.path}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-white font-medium group-hover:text-orange-400 transition-colors">
                                                    {page.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{page.path}</p>
                                                {page.description && (
                                                    <p className="text-xs text-gray-600 mt-0.5">{page.description}</p>
                                                )}
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No pages found matching "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-orange-400 hover:text-orange-300 text-sm"
                    >
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
}
