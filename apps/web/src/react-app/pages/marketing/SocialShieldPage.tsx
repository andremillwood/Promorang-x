import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Shield, CheckCircle, ArrowRight, TrendingUp, Coins, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SocialShieldPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Social Shield - Content Performance Protection"
                description="Social Shield protects your earnings when content underperforms. Never worry about algorithm changes or low engagement days again. Get guaranteed minimum payouts on Promorang."
                keywords="social shield, content protection, earnings protection, promorang insurance, creator safety net, performance guarantee"
                canonicalUrl="https://promorang.co/growth-hub/social-shield"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Shield className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                            Social Shield
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Your safety net for content performance. When verified metrics don't meet expected thresholds,
                        <strong className="text-emerald-400"> Social Shield automatically covers the difference</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                            Activate Social Shield <Shield className="w-5 h-5" />
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
                        How Social Shield <span className="text-emerald-500">Protects You</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                step: "1",
                                title: "Complete a Drop",
                                desc: "Submit your content for a brand campaign with an expected Gem payout of 500 Gems."
                            },
                            {
                                step: "2",
                                title: "Content Underperforms",
                                desc: "Algorithm changes cause your post to reach fewer people than expected. You only earn 300 Gems."
                            },
                            {
                                step: "3",
                                title: "Shield Activates",
                                desc: "Social Shield automatically detects the shortfall and deposits the missing 200 Gems into your account."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 relative">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3 mt-2">{item.title}</h3>
                                <p className="text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Visual Example */}
                    <div className="max-w-xl mx-auto bg-pr-surface-card border border-emerald-500/30 rounded-2xl p-8">
                        <h3 className="text-lg font-bold text-pr-text-1 mb-6 text-center">Real Protection Example</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
                                <span className="text-pr-text-2">Expected earnings</span>
                                <span className="font-bold text-pr-text-1 text-xl">500 Gems</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400">Content underperformed</span>
                                </div>
                                <span className="font-bold text-red-400 text-xl">-200 Gems</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-400">Social Shield payout</span>
                                </div>
                                <span className="font-bold text-emerald-400 text-xl">+200 Gems</span>
                            </div>
                            <div className="border-t border-pr-border pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-pr-text-1 font-semibold">Your final earnings</span>
                                    <span className="font-extrabold text-emerald-500 text-2xl">500 Gems</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shield Levels */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-6">
                        Shield Protection Levels
                    </h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-2xl mx-auto">
                        Your protection level increases as you progress through Growth Hub tiers.
                    </p>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { tier: "Starter", coverage: "50%", color: "text-gray-400", bgColor: "bg-gray-500/20" },
                            { tier: "Pro", coverage: "70%", color: "text-blue-400", bgColor: "bg-blue-500/20" },
                            { tier: "Elite", coverage: "85%", color: "text-purple-400", bgColor: "bg-purple-500/20" },
                            { tier: "Partner", coverage: "100%", color: "text-yellow-400", bgColor: "bg-yellow-500/20" }
                        ].map((level, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-6 text-center">
                                <div className={`w-16 h-16 ${level.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <Shield className={`w-8 h-8 ${level.color}`} />
                                </div>
                                <h3 className={`text-lg font-bold ${level.color} mb-2`}>{level.tier}</h3>
                                <div className={`text-3xl font-extrabold ${level.color}`}>{level.coverage}</div>
                                <div className="text-sm text-pr-text-2 mt-2">Coverage</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Why Creators Love <span className="text-emerald-500">Social Shield</span>
                    </h2>

                    <div className="space-y-6">
                        {[
                            { title: "Algorithm-proof earnings", desc: "Platform algorithm changes won't hurt your income anymore." },
                            { title: "Automatic protection", desc: "No claims to file. Shield activates automatically when underperformance is detected." },
                            { title: "Funded by staking", desc: "Part of your staked Gems and 3% subscription contribution builds your Shield pool." },
                            { title: "Verified metrics only", desc: "Protection is based on verified engagement data — no gaming the system." },
                            { title: "Peace of mind", desc: "Focus on creating great content, not worrying about reach fluctuations." }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
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
                headline="Ready to protect your earnings?"
                subheadline="Activate Social Shield and never worry about underperformance again."
                ctaText="Get Started Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
