import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Zap, Target, Users, DollarSign, BarChart3, CheckCircle, ArrowRight, Megaphone, Settings, TrendingUp } from 'lucide-react';

export default function DropsForAdvertisersPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Drops for Advertisers - Engage Audiences at Scale"
                description="Create Drops to reach thousands of engaged users. Pay for performance, not impressions. Launch your first Drop in minutes."
                keywords="advertiser drops, user engagement, performance marketing, promorang advertising"
                canonicalUrl="https://promorang.co/drops-for-advertisers"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full mb-8">
                        <Megaphone className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-bold text-blue-400">FOR ADVERTISERS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Launch <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Drops</span> That Convert
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Get <strong className="text-blue-400">real engagement</strong> from <strong className="text-indigo-400">real people</strong>. Pay only for completed actions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/advertiser/onboarding" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2">
                            Create Your First Drop <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/advertiser-pricing" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>

            {/* Why Drops */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Why <span className="text-blue-500">Drops</span> Work
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Target, title: 'Performance-Based', desc: 'Pay only when users complete your task. No wasted impressions.', color: 'text-green-500', bg: 'bg-green-500/20' },
                            { icon: Users, title: 'Engaged Audience', desc: 'Reach users who actively want to engage with brands.', color: 'text-blue-500', bg: 'bg-blue-500/20' },
                            { icon: Zap, title: 'Fast Results', desc: 'Launch a Drop in minutes. See results within hours.', color: 'text-orange-500', bg: 'bg-orange-500/20' },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{item.title}</h3>
                                <p className="text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Drop Types */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6 text-center">Types of Drops</h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-3xl mx-auto">
                        Choose the Drop type that fits your marketing goals.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Social Share', desc: 'Users share your product on social media', cost: '$5-50/action' },
                            { title: 'Review', desc: 'Users try your product and write reviews', cost: '$10-75/action' },
                            { title: 'Sign-up', desc: 'Users sign up for your app or newsletter', cost: '$2-15/action' },
                            { title: 'Survey', desc: 'Users complete surveys for market research', cost: '$1-10/action' },
                        ].map((type, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <h3 className="font-bold text-pr-text-1 mb-2">{type.title}</h3>
                                <p className="text-sm text-pr-text-2 mb-4">{type.desc}</p>
                                <div className="text-blue-500 font-semibold text-sm">{type.cost}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        How to <span className="text-blue-500">Create</span> a Drop
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', icon: Settings, title: 'Configure', desc: 'Set your task, requirements, and budget' },
                            { step: '2', icon: Target, title: 'Target', desc: 'Define your ideal audience' },
                            { step: '3', icon: Zap, title: 'Launch', desc: 'Go live and reach users instantly' },
                            { step: '4', icon: BarChart3, title: 'Track', desc: 'Monitor completions and ROI' },
                        ].map((item, i) => (
                            <div key={i} className="text-center relative">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">{item.step}</div>
                                <item.icon className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-pr-text-2 mb-12">Set your budget. Pay per completed action. No hidden fees.</p>
                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { budget: '$100', actions: '10-50', cpa: '$2-10' },
                                { budget: '$500', actions: '50-250', cpa: '$2-10' },
                                { budget: '$2,000', actions: '200-1,000', cpa: '$2-10' },
                            ].map((tier, i) => (
                                <div key={i} className="p-6 bg-pr-surface-2 rounded-xl">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">{tier.budget}</div>
                                    <div className="text-pr-text-1 font-medium mb-1">{tier.actions} actions</div>
                                    <div className="text-sm text-pr-text-2">CPA: {tier.cpa}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-pr-text-muted mt-6">*Actual costs depend on Drop type and targeting</p>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to launch your first Drop?"
                subheadline="Reach engaged users and pay only for results."
                ctaText="Create a Drop"
                ctaLink="/advertiser/onboarding"
                secondaryCta={{ text: "View Pricing", link: "/advertiser-pricing" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
