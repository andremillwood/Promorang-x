import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { BarChart3, CheckCircle, Coins, Lock, Shield, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlatformEconomyPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Platform Economy - The Promorang Ecosystem"
                description="Understand the Promorang economy: how Gems flow through earning, staking, protection, and withdrawal. Be part of a circular ecosystem where everyone benefits."
                keywords="platform economy, promorang ecosystem, gems economy, circular economy, token economics, creator economy"
                canonicalUrl="https://promorang.co/growth-hub/economy"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <BarChart3 className="w-10 h-10 text-cyan-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                            Platform Economy
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        A <strong className="text-cyan-400">circular ecosystem</strong> where Gems flow through earning,
                        staking, protection, and withdrawal. Everyone benefits when the economy grows.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2">
                            Join the Economy <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/about/growth-hub" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                            Back to Growth Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* The Cycle */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-6">
                        The <span className="text-cyan-500">Gem Cycle</span>
                    </h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-2xl mx-auto">
                        Gems flow through the platform in a continuous cycle, creating value at every step.
                    </p>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connection arrows */}
                        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-500 via-blue-500 via-emerald-500 to-purple-500" />

                        {[
                            { step: "1", title: "Earn", icon: Coins, color: "text-green-500", bgColor: "bg-green-500", desc: "Complete Drops, shares, referrals, and forecasts to earn Gems." },
                            { step: "2", title: "Stake", icon: Lock, color: "text-blue-500", bgColor: "bg-blue-500", desc: "Lock Gems for multiplied returns and grow your balance passively." },
                            { step: "3", title: "Protect", icon: Shield, color: "text-emerald-500", bgColor: "bg-emerald-500", desc: "Social Shield covers underperformance, funded by the staking pool." },
                            { step: "4", title: "Withdraw", icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500", desc: "Convert Gems to real money anytime through instant withdrawals." }
                        ].map((stage, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 text-center relative z-10">
                                <div className={`w-14 h-14 ${stage.bgColor} text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4`}>
                                    {stage.step}
                                </div>
                                <stage.icon className={`w-10 h-10 ${stage.color} mx-auto mb-4`} />
                                <h3 className={`text-xl font-bold ${stage.color} mb-3`}>{stage.title}</h3>
                                <p className="text-pr-text-2 text-sm">{stage.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 px-6 py-3 rounded-full">
                            <RefreshCw className="w-5 h-5 text-cyan-500" />
                            <span className="text-cyan-400 font-medium">The cycle repeats — growing with every iteration</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Where Gems Come From */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Where <span className="text-cyan-500">Gems Come From</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-pr-text-1 mb-6">Gem Sources</h3>
                            <div className="space-y-4">
                                {[
                                    { source: "Brand campaigns", percent: "45%" },
                                    { source: "User subscriptions", percent: "25%" },
                                    { source: "Platform operations", percent: "20%" },
                                    { source: "Partner contributions", percent: "10%" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-pr-surface-2 rounded-lg">
                                        <span className="text-pr-text-2">{item.source}</span>
                                        <span className="font-bold text-cyan-500">{item.percent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-pr-text-1 mb-6">Where Gems Go</h3>
                            <div className="space-y-4">
                                {[
                                    { destination: "Creator payouts", percent: "60%" },
                                    { destination: "Shield pool", percent: "15%" },
                                    { destination: "Staking rewards", percent: "15%" },
                                    { destination: "Platform reserve", percent: "10%" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-pr-surface-2 rounded-lg">
                                        <span className="text-pr-text-2">{item.destination}</span>
                                        <span className="font-bold text-cyan-500">{item.percent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why This Works */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Why The Economy <span className="text-cyan-500">Works</span>
                    </h2>

                    <div className="space-y-6">
                        {[
                            { title: "Real value backing", desc: "Every Gem is backed by actual campaign spend and subscription revenue — not speculation." },
                            { title: "Sustainable growth", desc: "The economy grows with platform adoption. More users = more value = higher Gem value." },
                            { title: "Built-in stability", desc: "Shield pools and staking locks reduce volatility and ensure consistent payouts." },
                            { title: "Transparent flow", desc: "All Gem flows are tracked and visible. You can see where value moves in real-time." },
                            { title: "Everyone benefits", desc: "Creators earn, brands get results, investors gain returns — aligned incentives." }
                        ].map((point, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-pr-text-1">{point.title}</div>
                                    <div className="text-pr-text-2 text-sm">{point.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Economy <span className="text-cyan-500">Stats</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { stat: "$2.5M+", label: "Gems in circulation" },
                            { stat: "15,420", label: "Active participants" },
                            { stat: "$125k", label: "Monthly payouts" },
                            { stat: "98.5%", label: "Payout reliability" }
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                                <div className="text-3xl font-extrabold text-cyan-500 mb-2">{item.stat}</div>
                                <div className="text-sm text-pr-text-2">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Join the Promorang economy"
                subheadline="Be part of a growing ecosystem where everyone benefits."
                ctaText="Get Started Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
