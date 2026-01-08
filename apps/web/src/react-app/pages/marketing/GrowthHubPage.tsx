import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Sparkles, TrendingUp, Users, Star, Award, Zap, Crown, ArrowRight, CheckCircle } from 'lucide-react';

export default function GrowthHubPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Growth Hub - Level Up From Starter to Partner"
                description="Promorang Growth Hub lets you progress through tiers from Starter to Partner. Unlock higher earnings, exclusive campaigns, and revenue share. Start your journey today."
                keywords="growth hub, promorang tiers, partner program, revenue share, influencer tiers, creator levels, promo points"
                canonicalUrl="https://promorang.co/about/growth-hub"
            />
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-pink-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-8">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-bold text-purple-400">EXCLUSIVE PROGRAM</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Level Up to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Partner</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        The Growth Hub is your path from user to <strong className="text-pr-text-1">platform partner</strong>. Higher tiers mean higher earnings, exclusive opportunities, and a share of Promorang's success.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
                            Start Your Journey <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* Tier System */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-purple-500">Growth Hub</span> Tiers
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Progress through four tiers. Each unlocks new earning potential and exclusive benefits.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                tier: "Starter",
                                icon: Zap,
                                color: "text-gray-400",
                                borderColor: "border-pr-border",
                                bgColor: "bg-pr-surface-card",
                                multiplier: "1x",
                                requirements: "Sign up",
                                benefits: ["Access to all Drops", "Earn Promo Points", "Content Shares", "Basic Forecasts"]
                            },
                            {
                                tier: "Pro",
                                icon: TrendingUp,
                                color: "text-blue-400",
                                borderColor: "border-blue-500/30",
                                bgColor: "bg-pr-surface-card",
                                multiplier: "1.5x",
                                requirements: "5,000 Promo Points",
                                benefits: ["1.5x earning multiplier", "Priority Drop access", "Enhanced analytics", "Pro badge"]
                            },
                            {
                                tier: "Elite",
                                icon: Award,
                                color: "text-purple-400",
                                borderColor: "border-purple-500/30",
                                bgColor: "bg-pr-surface-card",
                                multiplier: "2x",
                                requirements: "25,000 Promo Points",
                                benefits: ["2x earning multiplier", "Early Drop access", "Exclusive campaigns", "Direct brand connections"]
                            },
                            {
                                tier: "Partner",
                                icon: Crown,
                                color: "text-yellow-400",
                                borderColor: "border-yellow-500/50",
                                bgColor: "bg-gradient-to-br from-pr-surface-card to-yellow-500/5",
                                multiplier: "3x + Revenue Share",
                                requirements: "100,000 Promo Points",
                                benefits: ["3x earning multiplier", "Platform revenue share", "VIP support", "Advisory role"]
                            }
                        ].map((tier, i) => (
                            <div key={i} className={`${tier.bgColor} border ${tier.borderColor} rounded-2xl p-8 relative`}>
                                {tier.tier === "Partner" && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">TOP TIER</div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tier.tier === "Partner" ? "bg-yellow-500/20" : "bg-pr-surface-2"}`}>
                                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                                </div>
                                <h3 className={`text-2xl font-bold ${tier.color} mb-2`}>{tier.tier}</h3>
                                <div className="text-sm text-pr-text-2 mb-4">{tier.requirements}</div>
                                <div className={`text-3xl font-extrabold ${tier.color} mb-6`}>{tier.multiplier}</div>
                                <ul className="space-y-2">
                                    {tier.benefits.map((benefit, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-pr-text-2">
                                            <CheckCircle className={`w-4 h-4 ${tier.color} flex-shrink-0 mt-0.5`} />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Partner Means */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What Does <span className="text-yellow-500">Partner</span> Mean?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-8 leading-relaxed">
                                Partner tier isn't just about higher multipliers. It's about becoming a true stakeholder in Promorang's success.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">Revenue Share</div>
                                        <div className="text-pr-text-2 text-sm">Partners earn a percentage of Promorang's platform revenue, distributed quarterly.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">Advisory Role</div>
                                        <div className="text-pr-text-2 text-sm">Your voice matters. Partners get to shape product roadmaps and feature priorities.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">VIP Access</div>
                                        <div className="text-pr-text-2 text-sm">Direct line to the Promorang team, private Slack channel, and exclusive events.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-pr-surface-card border border-yellow-500/30 rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <div className="text-sm text-pr-text-2 mb-2">Partner Revenue Share</div>
                                <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">$1,247</div>
                                <div className="text-pr-text-2 text-sm mt-2">average monthly payout</div>
                            </div>
                            <div className="border-t border-pr-border pt-6 mt-6">
                                <div className="text-sm text-pr-text-2 text-center mb-4">Current Partner Stats</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-500">47</div>
                                        <div className="text-xs text-pr-text-2">Active Partners</div>
                                    </div>
                                    <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-500">$58k</div>
                                        <div className="text-xs text-pr-text-2">Q4 Payouts</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Level Up */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Your Path to Growth</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Whether you're a Creator, Investor, or Merchant, the Growth Hub scales with you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                persona: "For Creators",
                                title: "Monetize Daily",
                                desc: "Started with Drops? Pro and Elite tiers unlock higher base pay and exclusive content share campaigns.",
                                icon: Sparkles,
                                color: "text-blue-500"
                            },
                            {
                                persona: "For Investors",
                                title: "Scale Your Capital",
                                desc: "Level up to reduce trading fees and unlock advanced forecasting tools with higher payout multipliers.",
                                icon: TrendingUp,
                                color: "text-green-500"
                            },
                            {
                                persona: "For Merchants",
                                title: "Maximize ROI",
                                desc: "Partner status gives you direct access to top-tier creators and priority support for your campaigns.",
                                icon: Store,
                                color: "text-purple-500"
                            }
                        ].map((path, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500 transition-all group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-pr-surface-2 group-hover:scale-110 transition-transform`}>
                                    <path.icon className={`w-6 h-6 ${path.color}`} />
                                </div>
                                <div className={`text-xs font-black uppercase tracking-widest mb-2 ${path.color}`}>{path.persona}</div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{path.title}</h3>
                                <p className="text-pr-text-2 text-sm leading-relaxed">{path.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Engage Daily", desc: "Consistent engagement with Drops and content earns steady Promo Points.", points: "50-200 PP/day" },
                            { icon: TrendingUp, title: "Forecast Accurately", desc: "High accuracy forecasters earn multiplied rewards.", points: "100-500 PP/prediction" },
                            { icon: Users, title: "Refer Friends", desc: "Referrals earn you ongoing percentage of their activity.", points: "5% ongoing" }
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-pr-text-2 text-sm mb-4">{item.desc}</p>
                                <div className="inline-block bg-purple-500/20 px-4 py-2 rounded-full text-purple-400 font-bold text-sm">
                                    {item.points}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Partner Story</h2>
                    </div>

                    <div className="bg-pr-surface-card border border-yellow-500/30 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">AK</div>
                            <div>
                                <div className="font-bold text-pr-text-1 text-lg">Alex Kim</div>
                                <div className="text-yellow-400 text-sm flex items-center gap-1"><Crown className="w-4 h-4" /> Partner since Month 3</div>
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-xl text-pr-text-1 text-center mb-8 leading-relaxed">
                            "I reached Partner tier in 3 months by focusing on Forecasts and referrals. Now I earn over $1,500/month from the platform — $1,200 from my regular activity and $300+ from the revenue share. Promorang is my full-time income now."
                        </blockquote>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-500">3</div>
                                <div className="text-xs text-pr-text-2">Months to Partner</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-500">$1.5k</div>
                                <div className="text-xs text-pr-text-2">Monthly Earnings</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-500">127</div>
                                <div className="text-xs text-pr-text-2">Referrals</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-500">78%</div>
                                <div className="text-xs text-pr-text-2">Forecast Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to grow with Promorang?"
                subheadline="Start your journey from Starter to Partner today."
                ctaText="Start Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Learn More", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
