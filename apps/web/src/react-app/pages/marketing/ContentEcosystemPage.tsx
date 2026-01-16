import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Film, Share2, TrendingUp, DollarSign, Users, Star, ArrowRight, Heart, BarChart3, Sparkles } from 'lucide-react';

export default function ContentEcosystemPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Content Ecosystem - Create, Share, Forecast & Sponsor"
                description="Promorang's content ecosystem lets you create content, earn shares, make forecasts, and get sponsored. Multiple ways to monetize your creativity."
                keywords="content creation, content shares, forecasts, sponsorship, promorang content"
                canonicalUrl="https://promorang.co/content-ecosystem"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-full mb-8">
                        <Film className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold text-indigo-400">THE CONTENT ECONOMY</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Create. Share.{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Earn.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Four powerful ways to earn from content: <strong className="text-indigo-400">Create</strong>, <strong className="text-green-400">Share</strong>, <strong className="text-purple-400">Forecast</strong>, and <strong className="text-yellow-400">Sponsor</strong>.
                    </p>
                    <a href="/auth" className="inline-flex px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl items-center gap-2">
                        Start Creating <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* Four Pillars */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Four Ways to <span className="text-indigo-500">Earn</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Film, title: 'Create Content', desc: 'Upload videos, posts, reviews. Earn from views and engagement.', color: 'text-indigo-500', bg: 'bg-indigo-500/20', link: '/creators' },
                            { icon: Share2, title: 'Content Shares', desc: 'Earn equity in content you engage with. When it performs, you earn.', color: 'text-green-500', bg: 'bg-green-500/20', link: '/content-shares' },
                            { icon: TrendingUp, title: 'Forecasts', desc: 'Predict which content will succeed. Right predictions earn rewards.', color: 'text-purple-500', bg: 'bg-purple-500/20', link: '/forecasts' },
                            { icon: DollarSign, title: 'Sponsorship', desc: 'Get sponsored by brands or sponsor content you believe in.', color: 'text-yellow-500', bg: 'bg-yellow-500/20', link: '/brands' },
                        ].map((pillar, i) => (
                            <a key={i} href={pillar.link} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-indigo-500/50 transition-all group">
                                <div className={`w-14 h-14 ${pillar.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
                                </div>
                                <h3 className={`text-xl font-bold ${pillar.color} mb-3`}>{pillar.title}</h3>
                                <p className="text-pr-text-2">{pillar.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Shares Deep Dive */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full mb-4">
                                <Share2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-green-400">CONTENT SHARES</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">
                                Earn <span className="text-green-500">Equity</span> in Content
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                When you engage with content — like, comment, share — you earn "shares" in that content's performance pool.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {['Engage early for maximum shares', 'Share to social for bonus rewards', 'Earn when content hits milestones'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-green-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href="/content-shares" className="text-green-500 font-semibold hover:underline">Learn more about Content Shares →</a>
                        </div>
                        <div className="bg-pr-surface-card border border-green-500/30 rounded-2xl p-8">
                            <h3 className="font-bold text-pr-text-1 mb-6 text-center">How Shares Pay Out</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Your Shares</span>
                                    <span className="font-bold text-pr-text-1">100</span>
                                </div>
                                <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Total Shares</span>
                                    <span className="font-bold text-pr-text-1">1,000</span>
                                </div>
                                <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Pool Size</span>
                                    <span className="font-bold text-pr-text-1">5,000 PP</span>
                                </div>
                                <div className="flex justify-between p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <span className="font-bold text-green-400">Your Earnings</span>
                                    <span className="font-bold text-green-400">500 PP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Forecasts Deep Dive */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 bg-pr-surface-card border border-purple-500/30 rounded-2xl p-8">
                            <h3 className="font-bold text-pr-text-1 mb-6 text-center">Make a Prediction</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-pr-surface-2 rounded-lg">
                                    <div className="text-sm text-pr-text-2 mb-1">Target</div>
                                    <div className="text-pr-text-1 font-medium">Hit 50k views in 7 days</div>
                                </div>
                                <div className="p-4 bg-pr-surface-2 rounded-lg">
                                    <div className="text-sm text-pr-text-2 mb-1">Your Stake</div>
                                    <div className="text-pr-text-1 font-medium">100 Promo Points</div>
                                </div>
                                <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                    <div className="text-sm text-purple-400 mb-1">If Correct</div>
                                    <div className="text-2xl font-bold text-purple-400">+250 PP</div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full mb-4">
                                <TrendingUp className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-purple-400">FORECASTS</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">
                                Predict the <span className="text-purple-500">Future</span>
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                Think you know what content will go viral? Put your Promo Points where your mouth is and earn big when you're right.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {['Stake PP on content predictions', 'Earn multiplied returns on correct guesses', 'Build your forecaster reputation'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <BarChart3 className="w-5 h-5 text-purple-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href="/forecasts" className="text-purple-500 font-semibold hover:underline">Learn more about Forecasts →</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sponsorship */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full mb-4">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-400">SPONSORSHIP</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                        Get <span className="text-yellow-500">Sponsored</span>
                    </h2>
                    <p className="text-xl text-pr-text-2 max-w-3xl mx-auto mb-12">
                        Brands sponsor content they believe in. Create great content and attract sponsorship deals.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { icon: Film, title: 'Create Content', desc: 'Make engaging content on the platform' },
                            { icon: Users, title: 'Attract Brands', desc: 'Brands discover your content and offer sponsorship' },
                            { icon: DollarSign, title: 'Get Paid', desc: 'Receive payment for sponsored content' },
                        ].map((step, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <step.icon className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{step.title}</h3>
                                <p className="text-sm text-pr-text-2">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Join the content economy"
                subheadline="Create, share, forecast, and earn from content you believe in."
                ctaText="Get Started"
                ctaLink="/auth"
                secondaryCta={{ text: "For Creators", link: "/creators" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
