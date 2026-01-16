import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Lock, CheckCircle, Coins, TrendingUp, Clock, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GemsStakingPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Gems Staking - Lock & Multiply Your Earnings"
                description="Stake your Gems on Promorang for multiplied returns. Lock for 30, 60, or 90 days and earn up to 2x staking multiplier. Build passive income while you sleep."
                keywords="gem staking, crypto staking, promorang staking, multiply earnings, passive income, lock gems, staking rewards"
                canonicalUrl="https://promorang.co/growth-hub/staking"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Lock className="w-10 h-10 text-blue-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                            Gems Staking
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Lock your Gems and watch them grow. Earn <strong className="text-blue-400">up to 2x multiplier</strong> on
                        your staked balance with our flexible staking periods.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                            Start Staking <Lock className="w-5 h-5" />
                        </Link>
                        <Link to="/about/growth-hub" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                            Back to Growth Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* Staking Tiers */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-6">
                        Choose Your <span className="text-blue-500">Staking Period</span>
                    </h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-2xl mx-auto">
                        Longer lock periods mean higher multipliers. Choose what works for your goals.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                period: "30 Days",
                                multiplier: "1.2x",
                                apr: "~24% APR",
                                color: "text-blue-400",
                                borderColor: "border-blue-500/30",
                                features: ["Flexible withdrawal", "Standard rewards", "Good for beginners"]
                            },
                            {
                                period: "60 Days",
                                multiplier: "1.5x",
                                apr: "~30% APR",
                                color: "text-purple-400",
                                borderColor: "border-purple-500/30",
                                popular: true,
                                features: ["Higher returns", "Mid-term commitment", "Most popular choice"]
                            },
                            {
                                period: "90 Days",
                                multiplier: "2.0x",
                                apr: "~40% APR",
                                color: "text-yellow-400",
                                borderColor: "border-yellow-500/30",
                                features: ["Maximum returns", "Long-term growth", "Best for serious stakers"]
                            }
                        ].map((tier, i) => (
                            <div key={i} className={`bg-pr-surface-card border ${tier.borderColor} rounded-2xl p-8 relative ${tier.popular ? 'ring-2 ring-purple-500/50' : ''}`}>
                                {tier.popular && (
                                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">POPULAR</div>
                                )}
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Clock className={`w-6 h-6 ${tier.color}`} />
                                    <span className={`text-2xl font-bold ${tier.color}`}>{tier.period}</span>
                                </div>
                                <div className={`text-5xl font-extrabold ${tier.color} text-center mb-2`}>{tier.multiplier}</div>
                                <div className="text-center text-pr-text-2 mb-6">{tier.apr}</div>
                                <ul className="space-y-3">
                                    {tier.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-pr-text-2">
                                            <CheckCircle className={`w-4 h-4 ${tier.color}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Calculator Example */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        See Your <span className="text-blue-500">Potential Earnings</span>
                    </h2>

                    <div className="bg-pr-surface-card border border-blue-500/30 rounded-2xl p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-pr-text-1 mb-4">Example: 1,000 Gems Staked</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                        <span className="text-pr-text-2">30-day stake (1.2x)</span>
                                        <span className="font-bold text-blue-400">1,200 Gems</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                        <span className="text-pr-text-2">60-day stake (1.5x)</span>
                                        <span className="font-bold text-purple-400">1,500 Gems</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                        <span className="text-pr-text-2">90-day stake (2.0x)</span>
                                        <span className="font-bold text-yellow-400">2,000 Gems</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-center p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                    <Coins className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                    <div className="text-sm text-pr-text-2 mb-2">Maximum return on 1,000 Gems</div>
                                    <div className="text-4xl font-extrabold text-blue-500">+1,000 Gems</div>
                                    <div className="text-sm text-pr-text-2 mt-2">with 90-day stake</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        How Staking Works
                    </h2>

                    <div className="space-y-6">
                        {[
                            { step: "1", title: "Choose your amount", desc: "Select how many Gems you want to stake from your available balance." },
                            { step: "2", title: "Pick a lock period", desc: "Choose 30, 60, or 90 days based on your commitment level and desired returns." },
                            { step: "3", title: "Confirm your stake", desc: "Your Gems are locked and immediately start earning at your chosen multiplier." },
                            { step: "4", title: "Collect your rewards", desc: "When the lock period ends, your original Gems plus earnings are released to your wallet." }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-6 p-4">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <div className="font-bold text-pr-text-1 text-lg">{item.title}</div>
                                    <div className="text-pr-text-2">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to multiply your Gems?"
                subheadline="Start staking today and watch your earnings grow."
                ctaText="Start Staking"
                ctaLink="/auth"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
