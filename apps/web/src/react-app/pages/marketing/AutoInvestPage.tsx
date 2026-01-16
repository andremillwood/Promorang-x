import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { PiggyBank, CheckCircle, Percent, TrendingUp, Shield, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AutoInvestPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="3% Auto-Invest - Subscription That Works For You"
                description="Every Promorang subscription automatically invests 3% into your Growth Hub. Build staking balance and Social Shield protection without any extra effort."
                keywords="auto invest, subscription benefits, passive growth, automatic staking, growth hub funding, promorang subscription"
                canonicalUrl="https://promorang.co/growth-hub/auto-invest"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-pink-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-rose-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <PiggyBank className="w-10 h-10 text-pink-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                            3% Auto-Invest
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Your subscription works for you. <strong className="text-pink-400">3% automatically</strong> goes into
                        your Growth Hub every month — building your staking balance and Social Shield protection.
                    </p>

                    <div className="inline-flex items-center gap-3 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl mb-10">
                        <Percent className="w-8 h-8 text-pink-500" />
                        <span className="text-lg text-pr-text-1">No extra work. No extra cost. Just automatic growth.</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/pricing" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2">
                            View Plans <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/about/growth-hub" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                            Back to Growth Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Breaks Down */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-6">
                        How <span className="text-pink-500">3%</span> Adds Up
                    </h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-2xl mx-auto">
                        Every subscription tier automatically contributes to your Growth Hub.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-pr-border">
                                    <th className="text-left py-4 px-4 text-pr-text-2 font-medium">Plan</th>
                                    <th className="text-left py-4 px-4 text-pr-text-2 font-medium">Monthly Cost</th>
                                    <th className="text-left py-4 px-4 text-pr-text-2 font-medium">Monthly Auto-Invest</th>
                                    <th className="text-left py-4 px-4 text-pr-text-2 font-medium">Yearly Total</th>
                                    <th className="text-left py-4 px-4 text-pr-text-2 font-medium">With 1.5x Stake</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { plan: "Professional", cost: "$10", monthly: "$0.30", yearly: "$3.60", staked: "$5.40" },
                                    { plan: "Power User", cost: "$30", monthly: "$0.90", yearly: "$10.80", staked: "$16.20" },
                                    { plan: "Starter Advertiser", cost: "$50", monthly: "$1.50", yearly: "$18.00", staked: "$27.00" },
                                    { plan: "Growth Advertiser", cost: "$300", monthly: "$9.00", yearly: "$108.00", staked: "$162.00" },
                                    { plan: "Premium Advertiser", cost: "$900", monthly: "$27.00", yearly: "$324.00", staked: "$486.00" }
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-pr-border hover:bg-pr-surface-2 transition-colors">
                                        <td className="py-4 px-4 font-medium text-pr-text-1">{row.plan}</td>
                                        <td className="py-4 px-4 text-pr-text-2">{row.cost}/mo</td>
                                        <td className="py-4 px-4 text-pink-500 font-bold">{row.monthly}</td>
                                        <td className="py-4 px-4 text-pr-text-1 font-medium">{row.yearly}</td>
                                        <td className="py-4 px-4 text-emerald-500 font-bold">{row.staked}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Where It Goes */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Where Your 3% Goes
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-pr-surface-card border border-emerald-500/30 rounded-2xl p-8">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-3">Social Shield Pool</h3>
                            <p className="text-pr-text-2 mb-4">
                                Half of your contribution builds your Social Shield protection buffer, ensuring you're covered
                                when content underperforms.
                            </p>
                            <Link to="/growth-hub/social-shield" className="text-emerald-400 font-medium hover:underline flex items-center gap-1">
                                Learn about Social Shield <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-pr-surface-card border border-blue-500/30 rounded-2xl p-8">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Lock className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-400 mb-3">Staking Balance</h3>
                            <p className="text-pr-text-2 mb-4">
                                The other half goes into your staking balance, automatically earning returns based on your
                                current staking multiplier.
                            </p>
                            <Link to="/growth-hub/staking" className="text-blue-400 font-medium hover:underline flex items-center gap-1">
                                Learn about Staking <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Why Auto-Invest <span className="text-pink-500">Works</span>
                    </h2>

                    <div className="space-y-6">
                        {[
                            { title: "Set it and forget it", desc: "No manual transfers. No remembering to invest. It happens automatically." },
                            { title: "Compound growth", desc: "Your auto-invested Gems earn staking returns, which compound over time." },
                            { title: "Built-in protection", desc: "Part of every contribution builds your Social Shield safety net." },
                            { title: "No additional cost", desc: "The 3% comes from your existing subscription — it's not an extra fee." },
                            { title: "Visible progress", desc: "Track your auto-invested balance and growth directly in your dashboard." }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0 mt-0.5" />
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
                headline="Start building your Growth Hub today"
                subheadline="Subscribe to any plan and your 3% auto-invest kicks in immediately."
                ctaText="View Pricing"
                ctaLink="/pricing"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
