import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Megaphone, Target, Users, BarChart3, CheckCircle, ArrowRight, Calendar, DollarSign } from 'lucide-react';

export default function CampaignsMarketingPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Campaigns - Reach Your Audience at Scale"
                description="Launch marketing campaigns that connect you with creators and engaged users. Set objectives, match with talent, and track ROI."
                keywords="marketing campaigns, creator campaigns, brand campaigns, promorang advertising"
                canonicalUrl="https://promorang.co/campaigns-marketing"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 px-4 py-2 rounded-full mb-8">
                        <Megaphone className="w-5 h-5 text-violet-500" />
                        <span className="text-sm font-bold text-violet-400">CAMPAIGNS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Campaigns That <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500">Perform</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Launch comprehensive marketing campaigns. Match with creators. <strong className="text-violet-400">Track every metric</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/advertiser/campaigns/new" className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl flex items-center gap-2">
                            Launch a Campaign <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/advertiser-pricing" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>

            {/* Campaign Types */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Campaign <span className="text-violet-500">Types</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: 'Awareness', desc: 'Reach new audiences and build brand recognition', objectives: ['Impressions', 'Reach', 'Brand mentions'], color: 'text-blue-500', bg: 'bg-blue-500/20' },
                            { icon: Target, title: 'Engagement', desc: 'Drive likes, comments, shares, and interactions', objectives: ['Likes & reactions', 'Comments', 'Shares'], color: 'text-green-500', bg: 'bg-green-500/20' },
                            { icon: DollarSign, title: 'Conversion', desc: 'Drive sales, sign-ups, and measurable actions', objectives: ['Sales', 'Sign-ups', 'App installs'], color: 'text-orange-500', bg: 'bg-orange-500/20' },
                        ].map((type, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${type.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <type.icon className={`w-7 h-7 ${type.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{type.title}</h3>
                                <p className="text-pr-text-2 mb-4">{type.desc}</p>
                                <div className="space-y-2">
                                    {type.objectives.map((obj, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-pr-text-muted">
                                            <CheckCircle className={`w-4 h-4 ${type.color}`} />
                                            {obj}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How Campaigns Work */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        How It <span className="text-violet-500">Works</span>
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', icon: Target, title: 'Set Objectives', desc: 'Define your goals and KPIs' },
                            { step: '2', icon: Users, title: 'Match Creators', desc: 'Find perfect creators for your brand' },
                            { step: '3', icon: Calendar, title: 'Run Campaign', desc: 'Creators produce and share content' },
                            { step: '4', icon: BarChart3, title: 'Measure Results', desc: 'Track performance and ROI' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">{item.step}</div>
                                <item.icon className="w-10 h-10 text-violet-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Creator Matching */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">
                                Smart <span className="text-violet-500">Creator Matching</span>
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                Our platform matches you with creators who align with your brand, audience, and goals.
                            </p>
                            <ul className="space-y-3">
                                {['Audience demographics matching', 'Niche and interest alignment', 'Performance history analysis', 'Budget-appropriate selection'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-violet-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-violet-500/30 rounded-2xl p-8">
                            <h3 className="font-bold text-pr-text-1 mb-6 text-center">Match Score</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Creator A', score: 95, fit: 'Excellent' },
                                    { name: 'Creator B', score: 87, fit: 'Great' },
                                    { name: 'Creator C', score: 78, fit: 'Good' },
                                ].map((creator, i) => (
                                    <div key={i} className="p-4 bg-pr-surface-2 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-pr-text-1 font-medium">{creator.name}</span>
                                            <span className="text-violet-500 font-bold">{creator.score}%</span>
                                        </div>
                                        <div className="w-full bg-pr-surface-card rounded-full h-2">
                                            <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${creator.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Analytics Preview */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Powerful Analytics</h2>
                    <p className="text-xl text-pr-text-2 mb-12">Track every aspect of your campaign performance</p>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { metric: 'Reach', value: '125K' },
                            { metric: 'Engagement', value: '8.2%' },
                            { metric: 'Conversions', value: '1,847' },
                            { metric: 'ROI', value: '340%' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="text-3xl font-bold text-violet-500 mb-2">{stat.value}</div>
                                <div className="text-sm text-pr-text-2">{stat.metric}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to launch your campaign?"
                subheadline="Connect with creators and reach your audience at scale."
                ctaText="Start a Campaign"
                ctaLink="/advertiser/campaigns/new"
                secondaryCta={{ text: "View Pricing", link: "/advertiser-pricing" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
