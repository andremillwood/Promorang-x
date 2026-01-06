import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Share2, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <Share2 className="w-8 h-8 text-blue-500" />,
            title: "1. Discover & Share",
            description: "Browse high-converting content from top brands. Share what aligns with your audience using your unique link.",
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
            title: "2. Track Performance",
            description: "Watch your impact via real-time analytics. See clicks, conversions, and engagement grow.",
        },
        {
            icon: <DollarSign className="w-8 h-8 text-green-500" />,
            title: "3. Earn Rewards",
            description: "Get paid for your influence. Earn cash commissions and Promo Points for every successful referral.",
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-orange-500" />,
            title: "4. Build Equity",
            description: "Top performers earn equity in the platform. Become a true partner in the ecosystem you help build.",
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-pr-surface-background pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Turn Your Taste Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Income</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto leading-relaxed">
                        Promorang bridges the gap between brands and everyday influencers. Share what you love, earn what you deserve.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all relative group">
                                <div className="absolute -top-6 left-8 bg-pr-surface-2 w-12 h-12 rounded-xl flex items-center justify-center border border-pr-border group-hover:scale-110 transition-transform">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mt-6 mb-3">{step.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Creator vs Brand */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* For Creators */}
                        <div className="space-y-6">
                            <span className="text-blue-500 font-bold tracking-wide uppercase text-sm">For Creators</span>
                            <h2 className="text-3xl font-bold text-pr-text-1">Monetize Your Influence</h2>
                            <p className="text-lg text-pr-text-2">
                                You don't need millions of followers to be influential. Whether you're a micro-influencer or a community leader, Promorang gives you the tools to monetize your recommendations directly.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Access exclusive brand deals
                                </li>
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Real-time tracking and payouts
                                </li>
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Community-first rewards
                                </li>
                            </ul>
                        </div>

                        {/* For Brands */}
                        <div className="space-y-6">
                            <span className="text-purple-500 font-bold tracking-wide uppercase text-sm">For Brands</span>
                            <h2 className="text-3xl font-bold text-pr-text-1">Scale Authentic Word-of-Mouth</h2>
                            <p className="text-lg text-pr-text-2">
                                Stop burning budget on generic ads. Tap into a network of authentic advocates who already love your product and can speak directly to their communities.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Performance-based pricing
                                </li>
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Access niche communities
                                </li>
                                <li className="flex items-center gap-3 text-pr-text-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Automated attribution
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to start?"
                subheadline="Join thousands of creators and brands growing together."
                ctaText="Create Account"
                ctaLink="/auth"
                secondaryCta={{ text: "View Pricing", link: '/pricing' }}
            />

            <MarketingFooter />
        </div>
    );
}
