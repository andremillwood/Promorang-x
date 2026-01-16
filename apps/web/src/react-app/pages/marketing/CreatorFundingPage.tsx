import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Users, CheckCircle, TrendingUp, Star, Coins, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatorFundingPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Creator Funding - Invest in Rising Creators"
                description="Fund promising creators on Promorang and earn returns when they succeed. Build a portfolio of creator investments and grow together."
                keywords="creator funding, creator investment, support creators, creator portfolio, promorang funding, creator success"
                canonicalUrl="https://promorang.co/growth-hub/creator-funding"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Users className="w-10 h-10 text-purple-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-500">
                            Creator Funding
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Invest in rising creators and <strong className="text-purple-400">earn returns when they succeed</strong>.
                        Build a portfolio of talent and grow alongside them.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
                            Start Funding <Heart className="w-5 h-5" />
                        </Link>
                        <Link to="/about/growth-hub" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                            Back to Growth Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        How Creator Funding <span className="text-purple-500">Works</span>
                    </h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Browse Creators", desc: "Explore rising creators with strong engagement and growth potential." },
                            { step: "2", title: "Stake Gems", desc: "Invest your Gems in creators you believe in. Minimum 100 Gems per investment." },
                            { step: "3", title: "They Grow", desc: "As creators earn on the platform, your investment grows proportionally." },
                            { step: "4", title: "Earn Returns", desc: "Collect yield from your creator portfolio. Withdraw anytime after 30 days." }
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 relative text-center">
                                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-pr-text-2 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Example Portfolio */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Example <span className="text-purple-500">Portfolio</span>
                    </h2>

                    <div className="bg-pr-surface-card border border-purple-500/30 rounded-2xl p-8">
                        <div className="space-y-4 mb-8">
                            {[
                                { name: "Alex Chen", category: "Tech Reviews", invested: "500 Gems", return: "+125 Gems", growth: "+25%" },
                                { name: "Maya Rodriguez", category: "Lifestyle", invested: "300 Gems", return: "+90 Gems", growth: "+30%" },
                                { name: "Jordan Park", category: "Gaming", invested: "200 Gems", return: "+40 Gems", growth: "+20%" }
                            ].map((creator, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {creator.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-pr-text-1">{creator.name}</div>
                                            <div className="text-sm text-pr-text-2">{creator.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-pr-text-2">Invested: {creator.invested}</div>
                                        <div className="font-bold text-emerald-500">{creator.return} ({creator.growth})</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-pr-border pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-pr-text-2">Total Invested</div>
                                    <div className="text-2xl font-bold text-pr-text-1">1,000 Gems</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-pr-text-2">Total Returns</div>
                                    <div className="text-2xl font-bold text-emerald-500">+255 Gems (+25.5%)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Why Fund <span className="text-purple-500">Creators</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: "Diversified returns", desc: "Spread your Gems across multiple creators to reduce risk." },
                            { title: "Support talent", desc: "Help promising creators get the boost they need to succeed." },
                            { title: "Passive income", desc: "Earn returns without creating content yourself." },
                            { title: "Early access", desc: "Funded creators may give you early access to campaigns and content." },
                            { title: "Build relationships", desc: "Connect with creators you invest in for potential collaborations." },
                            { title: "Track performance", desc: "Real-time analytics on your portfolio growth and creator performance." }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-pr-text-1">{benefit.title}</div>
                                    <div className="text-pr-text-2 text-sm">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to invest in creators?"
                subheadline="Build your creator portfolio and earn returns on their success."
                ctaText="Start Funding"
                ctaLink="/auth"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
