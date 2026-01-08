import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { TrendingUp, Target, BarChart3, Star, Zap, Award, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForecastsPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Forecasts - Predict Content Performance & Earn Rewards"
                description="Promorang Forecasts let you predict which content will go viral. Earn Promo Points when your predictions are right. Turn your taste into income."
                keywords="content forecasts, predict viral content, earn from predictions, promo points, content predictions, forecasting rewards"
                canonicalUrl="https://promorang.co/forecasts"
            />
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full mb-8">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-bold text-blue-400">UNIQUE TO PROMORANG</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Predict Content. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Earn Rewards.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Your taste is valuable. Forecast which content will perform well, and <strong className="text-pr-text-1">earn Promo Points when you're right</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                            Start Forecasting <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* What Are Forecasts */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What Are <span className="text-blue-500">Forecasts</span>?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-8 leading-relaxed">
                                Forecasts let you predict which creator content will hit specific engagement targets. If your prediction is correct, you earn bonus Promo Points.
                            </p>
                            <p className="text-lg text-pr-text-2 mb-8 leading-relaxed">
                                Unlike betting or speculation, Forecasts are about recognizing quality content early. The better your taste, the more you earn.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-pr-text-1">No Risk</div>
                                        <div className="text-pr-text-2 text-sm">You don't stake anything. Wrong predictions just mean no bonus.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-pr-text-1">Skill-Based</div>
                                        <div className="text-pr-text-2 text-sm">Your accuracy rating improves over time, unlocking higher rewards.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-pr-text-1">Daily Opportunities</div>
                                        <div className="text-pr-text-2 text-sm">New content to forecast every day. More predictions = more chances to earn.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <div className="text-sm text-pr-text-2 mb-2">Your Forecast Accuracy</div>
                                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">73%</div>
                                <div className="text-blue-400 text-sm mt-2">Top 15% of Forecasters</div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Forecasts Made</span>
                                    <span className="font-bold text-pr-text-1">142</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Correct Predictions</span>
                                    <span className="font-bold text-pr-text-1">104</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Streak</span>
                                    <span className="font-bold text-pr-text-1">7 in a row 🔥</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                    <span className="font-bold text-blue-400">Total Earned</span>
                                    <span className="font-bold text-blue-400">2,340 Promo Points</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">How Forecasting Works</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: "Browse Content", desc: "See upcoming Drops and content from creators before they're fully launched." },
                            { icon: Target, title: "Make Predictions", desc: "Predict if content will hit 10k, 50k, or 100k engagement targets." },
                            { icon: BarChart3, title: "Track Performance", desc: "Watch the content's real-time performance against your prediction." },
                            { icon: Award, title: "Earn Rewards", desc: "Correct predictions earn Promo Points. Build streaks for bonus multipliers." }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="text-sm text-blue-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-pr-text-2 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reward Tiers */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Forecast Reward Tiers</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            The more accurate you are, the more you earn per prediction.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { tier: "Starter", accuracy: "0-50%", multiplier: "1x", color: "text-pr-text-2", bg: "bg-pr-surface-card" },
                            { tier: "Analyst", accuracy: "50-65%", multiplier: "1.5x", color: "text-blue-400", bg: "bg-pr-surface-card" },
                            { tier: "Expert", accuracy: "65-80%", multiplier: "2x", color: "text-purple-400", bg: "bg-pr-surface-card border-purple-500/30" },
                            { tier: "Oracle", accuracy: "80%+", multiplier: "3x", color: "text-yellow-400", bg: "bg-pr-surface-card border-yellow-500/30" }
                        ].map((tier, i) => (
                            <div key={i} className={`${tier.bg} border border-pr-border rounded-2xl p-8 text-center`}>
                                <div className={`text-2xl font-bold ${tier.color} mb-2`}>{tier.tier}</div>
                                <div className="text-pr-text-2 text-sm mb-4">{tier.accuracy} accuracy</div>
                                <div className={`text-4xl font-extrabold ${tier.color}`}>{tier.multiplier}</div>
                                <div className="text-pr-text-2 text-xs mt-2">reward multiplier</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Real Forecaster Story</h2>
                    </div>

                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">MR</div>
                            <div>
                                <div className="font-bold text-pr-text-1 text-lg">Maya Rodriguez</div>
                                <div className="text-pr-text-2 text-sm">Oracle-tier Forecaster</div>
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-xl text-pr-text-1 text-center mb-8 leading-relaxed">
                            "I've always had a good eye for what content will resonate. Now I get paid for it. My 82% accuracy rate means I'm earning 3x on every correct prediction. Last month I made over 4,000 Promo Points just from Forecasts."
                        </blockquote>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-blue-500">82%</div>
                                <div className="text-xs text-pr-text-2">Accuracy</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-blue-500">Oracle</div>
                                <div className="text-xs text-pr-text-2">Tier</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-blue-500">4,000+</div>
                                <div className="text-xs text-pr-text-2">Monthly PP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to prove your taste?"
                subheadline="Start forecasting content and earn for being right."
                ctaText="Start Forecasting"
                ctaLink="/auth"
                secondaryCta={{ text: "Learn More", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
