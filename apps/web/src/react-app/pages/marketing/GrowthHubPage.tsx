import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Link } from 'react-router-dom';
import {
    Shield, Sparkles, TrendingUp, Users, Star, Award, Zap, Crown, ArrowRight,
    CheckCircle, Store, Coins, Lock, PiggyBank, BarChart3, Layers, Percent
} from 'lucide-react';

export default function GrowthHubPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Growth Hub - Social Shield, Staking & Creator Funding"
                description="Promorang Growth Hub: Protect your earnings with Social Shield, stake Gems for multiplied returns, fund rising creators, and automatically grow your balance with 3% subscription contribution."
                keywords="growth hub, social shield, gem staking, creator funding, promorang tiers, platform economy, passive income, creator protection"
                canonicalUrl="https://promorang.co/about/growth-hub"
            />
            <MarketingNav />

            {/* Hero Section - Social Shield Focus */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full mb-6">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-400">PROTECT & GROW</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                                Secure Your Success with{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
                                    Social Shield
                                </span>
                            </h1>

                            <p className="text-xl text-pr-text-2 mb-6 leading-relaxed">
                                The Growth Hub is your financial safety net on Promorang. <strong className="text-emerald-400">Social Shield</strong> protects
                                your earnings when content underperforms — plus <strong className="text-blue-400">3% of your subscription</strong> automatically
                                builds your staking balance.
                            </p>

                            <div className="flex items-center gap-3 mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                <Percent className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <div className="font-bold text-pr-text-1">3% Auto-Contribution</div>
                                    <div className="text-sm text-pr-text-2">Every subscription automatically funds your Growth Hub — no extra work required</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    Activate Social Shield <Shield className="w-5 h-5" />
                                </a>
                                <a href="#how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                                    Learn How It Works
                                </a>
                            </div>
                        </div>

                        {/* Social Shield Visual Card */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-2">Social Shield Protection</h3>
                                <p className="text-pr-text-2">When your content underperforms, Social Shield pays the difference</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-3 bg-pr-surface-card rounded-lg border border-pr-border">
                                    <span className="text-pr-text-2">Expected earnings</span>
                                    <span className="font-bold text-pr-text-1">500 Gems</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                    <span className="text-red-400">Content underperformed</span>
                                    <span className="font-bold text-red-400">-200 Gems</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                    <span className="text-emerald-400">Social Shield payout</span>
                                    <span className="font-bold text-emerald-400">+200 Gems</span>
                                </div>
                            </div>

                            <div className="text-center p-4 bg-pr-surface-2 rounded-xl">
                                <div className="text-3xl font-extrabold text-emerald-500">500 Gems</div>
                                <div className="text-sm text-pr-text-2">Protected earnings — always</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Growth Hub Pillars */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Six Pillars of <span className="text-emerald-500">Growth</span>
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            The Growth Hub combines protection, passive income, and community investment into one powerful system. <strong className="text-pr-text-1">Click any pillar to learn more.</strong>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Social Shield",
                                icon: Shield,
                                color: "text-emerald-500",
                                bgColor: "bg-emerald-500/20",
                                borderColor: "border-emerald-500/30",
                                desc: "Insurance for your content performance. When verified metrics don't meet thresholds, Social Shield covers the gap.",
                                highlight: true,
                                link: "/growth-hub/social-shield"
                            },
                            {
                                title: "Gems Staking",
                                icon: Lock,
                                color: "text-blue-500",
                                bgColor: "bg-blue-500/20",
                                borderColor: "border-blue-500/30",
                                desc: "Lock your Gems for 30/60/90 days to earn multiplied returns. Up to 2x staking multiplier for long-term holders.",
                                link: "/growth-hub/staking"
                            },
                            {
                                title: "3% Auto-Invest",
                                icon: PiggyBank,
                                color: "text-pink-500",
                                bgColor: "bg-pink-500/20",
                                borderColor: "border-pink-500/30",
                                desc: "3% of your monthly subscription automatically funds your staking balance and Social Shield protection.",
                                link: "/growth-hub/auto-invest"
                            },
                            {
                                title: "Creator Funding",
                                icon: Users,
                                color: "text-purple-500",
                                bgColor: "bg-purple-500/20",
                                borderColor: "border-purple-500/30",
                                desc: "Invest in rising creators. Stake Gems on promising talent and earn yield when they succeed.",
                                link: "/growth-hub/creator-funding"
                            },
                            {
                                title: "Growth Channels",
                                icon: Layers,
                                color: "text-orange-500",
                                bgColor: "bg-orange-500/20",
                                borderColor: "border-orange-500/30",
                                desc: "Multiple income streams: Content rewards, engagement bonuses, referral commissions, and forecast winnings.",
                                link: "/growth-hub/growth-channels"
                            },
                            {
                                title: "Platform Economy",
                                icon: BarChart3,
                                color: "text-cyan-500",
                                bgColor: "bg-cyan-500/20",
                                borderColor: "border-cyan-500/30",
                                desc: "Be part of Promorang's circular economy. Gems flow through earning, staking, rewards, and withdrawals.",
                                link: "/growth-hub/economy"
                            }
                        ].map((pillar, i) => (
                            <Link
                                key={i}
                                to={pillar.link}
                                className={`block bg-pr-surface-card border ${pillar.highlight ? pillar.borderColor : 'border-pr-border'} rounded-2xl p-8 ${pillar.highlight ? 'ring-2 ring-emerald-500/50' : ''} hover:shadow-xl hover:scale-[1.02] hover:border-opacity-80 transition-all duration-300 group cursor-pointer`}
                            >
                                {pillar.highlight && (
                                    <div className="inline-block bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-4">FEATURED</div>
                                )}
                                <div className={`w-14 h-14 ${pillar.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className={`text-xl font-bold ${pillar.color}`}>{pillar.title}</h3>
                                    <ArrowRight className={`w-5 h-5 ${pillar.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                </div>
                                <p className="text-pr-text-2 text-sm leading-relaxed">{pillar.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3% Subscription Contribution Explainer */}
            <section id="how-it-works" className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 px-4 py-2 rounded-full mb-6">
                                <PiggyBank className="w-5 h-5 text-pink-500" />
                                <span className="text-sm font-bold text-pink-400">AUTOMATIC GROWTH</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                Your Subscription <span className="text-pink-500">Works For You</span>
                            </h2>

                            <p className="text-xl text-pr-text-2 mb-8 leading-relaxed">
                                Every month, <strong className="text-pink-400">3% of your subscription</strong> is automatically deposited
                                into your Growth Hub. This funds your Gem staking balance and Social Shield protection —
                                without any extra effort on your part.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { plan: "Professional ($10/mo)", contribution: "$0.30/mo", yearly: "$3.60/yr" },
                                    { plan: "Power User ($30/mo)", contribution: "$0.90/mo", yearly: "$10.80/yr" },
                                    { plan: "Starter Advertiser ($50/mo)", contribution: "$1.50/mo", yearly: "$18/yr" },
                                    { plan: "Growth Advertiser ($300/mo)", contribution: "$9.00/mo", yearly: "$108/yr" },
                                    { plan: "Premium Advertiser ($900/mo)", contribution: "$27.00/mo", yearly: "$324/yr" }
                                ].map((tier, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-pr-surface-card border border-pr-border rounded-lg">
                                        <span className="text-pr-text-2 text-sm">{tier.plan}</span>
                                        <div className="text-right">
                                            <div className="font-bold text-pink-500">{tier.contribution}</div>
                                            <div className="text-xs text-pr-text-muted">{tier.yearly}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-pr-text-1 mb-6 text-center">12-Month Compound Growth</h3>

                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="text-sm text-pr-text-2 mb-2">Professional Plan Example</div>
                                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                                        $3.60 → $4.32
                                    </div>
                                    <div className="text-sm text-pr-text-2 mt-2">with 1.2x staking multiplier</div>
                                </div>

                                <div className="border-t border-pr-border pt-6">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-pr-surface-2 rounded-lg">
                                            <div className="text-lg font-bold text-pink-500">$3.60</div>
                                            <div className="text-xs text-pr-text-2">Auto-invested</div>
                                        </div>
                                        <div className="p-3 bg-pr-surface-2 rounded-lg">
                                            <div className="text-lg font-bold text-emerald-500">+20%</div>
                                            <div className="text-xs text-pr-text-2">Stake yield</div>
                                        </div>
                                        <div className="p-3 bg-pr-surface-2 rounded-lg">
                                            <div className="text-lg font-bold text-blue-500">Protected</div>
                                            <div className="text-xs text-pr-text-2">by Shield</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <div className="font-bold text-pr-text-1">No extra work required</div>
                                    <div className="text-sm text-pr-text-2">It happens automatically with every subscription</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tier System */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Level Up to <span className="text-yellow-500">Partner</span>
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Progress through four tiers. Each unlocks higher multipliers, better protection, and exclusive benefits.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                tier: "Starter",
                                icon: Zap,
                                color: "text-gray-400",
                                borderColor: "border-pr-border",
                                multiplier: "1x",
                                shield: "Basic",
                                requirements: "Sign up",
                                benefits: ["Access to all Drops", "Basic Social Shield", "Standard staking rates"]
                            },
                            {
                                tier: "Pro",
                                icon: TrendingUp,
                                color: "text-blue-400",
                                borderColor: "border-blue-500/30",
                                multiplier: "1.5x",
                                shield: "Enhanced",
                                requirements: "5,000 PP",
                                benefits: ["1.5x earning multiplier", "Enhanced Social Shield", "Priority Drop access"]
                            },
                            {
                                tier: "Elite",
                                icon: Award,
                                color: "text-purple-400",
                                borderColor: "border-purple-500/30",
                                multiplier: "2x",
                                shield: "Premium",
                                requirements: "25,000 PP",
                                benefits: ["2x earning multiplier", "Premium Social Shield", "Creator funding access"]
                            },
                            {
                                tier: "Partner",
                                icon: Crown,
                                color: "text-yellow-400",
                                borderColor: "border-yellow-500/50",
                                multiplier: "3x + Revenue",
                                shield: "Ultimate",
                                requirements: "100,000 PP",
                                benefits: ["3x multiplier + revenue share", "Ultimate Social Shield", "VIP advisory role"]
                            }
                        ].map((tier, i) => (
                            <div key={i} className={`bg-pr-surface-card border ${tier.borderColor} rounded-2xl p-6 relative ${tier.tier === 'Partner' ? 'ring-2 ring-yellow-500/50' : ''}`}>
                                {tier.tier === "Partner" && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">TOP TIER</div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tier.tier === 'Partner' ? 'bg-yellow-500/20' : 'bg-pr-surface-2'}`}>
                                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                                </div>
                                <h3 className={`text-xl font-bold ${tier.color} mb-1`}>{tier.tier}</h3>
                                <div className="text-xs text-pr-text-muted mb-2">{tier.requirements}</div>
                                <div className={`text-2xl font-extrabold ${tier.color} mb-1`}>{tier.multiplier}</div>
                                <div className="text-xs text-emerald-400 mb-4">🛡️ {tier.shield} Shield</div>
                                <ul className="space-y-2">
                                    {tier.benefits.map((benefit, j) => (
                                        <li key={j} className="flex items-start gap-2 text-xs text-pr-text-2">
                                            <CheckCircle className={`w-3 h-3 ${tier.color} flex-shrink-0 mt-0.5`} />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Economy Flow */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">The Promorang Economy</h2>
                    <p className="text-xl text-pr-text-2 mb-12 max-w-2xl mx-auto">
                        Gems flow through a circular economy where everyone benefits. Earn, stake, protect, and withdraw.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Earn", desc: "Complete Drops & content shares", icon: Coins, color: "text-green-500" },
                            { step: "2", title: "Stake", desc: "Lock Gems for multiplied returns", icon: Lock, color: "text-blue-500" },
                            { step: "3", title: "Protect", desc: "Social Shield covers shortfalls", icon: Shield, color: "text-emerald-500" },
                            { step: "4", title: "Withdraw", desc: "Convert Gems to real money", icon: TrendingUp, color: "text-purple-500" }
                        ].map((step, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6 relative">
                                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${step.color.replace('text-', 'bg-')}`}>
                                    {step.step}
                                </div>
                                <step.icon className={`w-10 h-10 ${step.color} mx-auto mb-4`} />
                                <h3 className="font-bold text-pr-text-1 mb-2">{step.title}</h3>
                                <p className="text-xs text-pr-text-2">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to protect & grow your earnings?"
                subheadline="Activate Social Shield and start building your Growth Hub today."
                ctaText="Get Started Free"
                ctaLink="/auth"
                secondaryCta={{ text: "View Pricing", link: "/pricing" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
