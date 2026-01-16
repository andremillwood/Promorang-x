import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Layers, CheckCircle, Sparkles, TrendingUp, Users, Share2, Target, Coins, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GrowthChannelsPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Growth Channels - Multiple Income Streams"
                description="Promorang offers multiple income streams: content rewards, engagement bonuses, referral commissions, forecast winnings, and PromoShare dividends. Diversify your earnings."
                keywords="growth channels, multiple income, content rewards, referral commission, forecast winnings, promorang earnings"
                canonicalUrl="https://promorang.co/growth-hub/growth-channels"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-orange-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-amber-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Layers className="w-10 h-10 text-orange-500" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                            Growth Channels
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Multiple ways to earn. <strong className="text-orange-400">Diversify your income</strong> across
                        content, engagement, referrals, forecasts, and more.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
                            Start Earning <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/about/growth-hub" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all flex items-center justify-center">
                            Back to Growth Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* Income Channels */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-6">
                        Your <span className="text-orange-500">Income Streams</span>
                    </h2>
                    <p className="text-xl text-pr-text-2 text-center mb-16 max-w-2xl mx-auto">
                        Each channel offers unique earning opportunities. Most successful users leverage multiple channels.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Drop Rewards",
                                icon: Sparkles,
                                color: "text-blue-500",
                                bgColor: "bg-blue-500/20",
                                earnings: "50-500 Gems/drop",
                                desc: "Complete brand campaigns and Drops to earn Gems directly. Higher quality = higher pay."
                            },
                            {
                                title: "Content Shares",
                                icon: Share2,
                                color: "text-purple-500",
                                bgColor: "bg-purple-500/20",
                                earnings: "10% of share value",
                                desc: "Share content you believe in and earn when it performs well. Like investing in virality."
                            },
                            {
                                title: "Referral Commission",
                                icon: Users,
                                color: "text-green-500",
                                bgColor: "bg-green-500/20",
                                earnings: "5% ongoing",
                                desc: "Invite friends to Promorang and earn 5% of their activity — forever."
                            },
                            {
                                title: "Forecast Winnings",
                                icon: Target,
                                color: "text-red-500",
                                bgColor: "bg-red-500/20",
                                earnings: "Variable odds",
                                desc: "Predict content performance and win Gems when you're right. Higher accuracy = multipliers."
                            },
                            {
                                title: "Engagement Bonuses",
                                icon: TrendingUp,
                                color: "text-cyan-500",
                                bgColor: "bg-cyan-500/20",
                                earnings: "Streak rewards",
                                desc: "Daily engagement streaks unlock bonus Gems. 7-day, 30-day, and 90-day milestones."
                            },
                            {
                                title: "PromoShare Dividends",
                                icon: Coins,
                                color: "text-yellow-500",
                                bgColor: "bg-yellow-500/20",
                                earnings: "Quarterly payouts",
                                desc: "Partner-tier members receive quarterly dividends from platform revenue."
                            }
                        ].map((channel, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-orange-500/50 transition-all">
                                <div className={`w-14 h-14 ${channel.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                                    <channel.icon className={`w-7 h-7 ${channel.color}`} />
                                </div>
                                <h3 className={`text-xl font-bold ${channel.color} mb-2`}>{channel.title}</h3>
                                <div className="text-sm text-pr-text-muted mb-3">{channel.earnings}</div>
                                <p className="text-pr-text-2 text-sm">{channel.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Example Monthly Breakdown */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Example <span className="text-orange-500">Monthly Earnings</span>
                    </h2>

                    <div className="bg-pr-surface-card border border-orange-500/30 rounded-2xl p-8">
                        <div className="space-y-4 mb-8">
                            {[
                                { channel: "Drop Rewards", amount: "2,400 Gems", percent: "48%" },
                                { channel: "Content Shares", amount: "800 Gems", percent: "16%" },
                                { channel: "Referral Commission", amount: "600 Gems", percent: "12%" },
                                { channel: "Forecast Winnings", amount: "500 Gems", percent: "10%" },
                                { channel: "Engagement Bonuses", amount: "400 Gems", percent: "8%" },
                                { channel: "Staking Returns", amount: "300 Gems", percent: "6%" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-1 font-medium">{item.channel}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-pr-text-2 text-sm">{item.percent}</span>
                                        <span className="font-bold text-orange-500">{item.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-pr-border pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-pr-text-1">Total Monthly Earnings</span>
                                <span className="text-3xl font-extrabold text-orange-500">5,000 Gems</span>
                            </div>
                            <div className="text-sm text-pr-text-2 text-right mt-1">≈ $50 USD at current rates</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 text-center mb-16">
                        Maximize Your <span className="text-orange-500">Channels</span>
                    </h2>

                    <div className="space-y-6">
                        {[
                            { title: "Don't rely on one channel", desc: "Top earners use 3+ channels. Diversification protects your income." },
                            { title: "Build referral early", desc: "Referral income compounds. The earlier you start, the more you earn long-term." },
                            { title: "Engage daily", desc: "Streak bonuses add up. 30+ day streaks unlock significant multipliers." },
                            { title: "Learn forecasting", desc: "High-accuracy forecasters earn the biggest multipliers on predictions." }
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-pr-text-1">{tip.title}</div>
                                    <div className="text-pr-text-2 text-sm">{tip.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to diversify your income?"
                subheadline="Start earning across all Growth Channels today."
                ctaText="Get Started Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Back to Growth Hub", link: "/about/growth-hub" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
