import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Zap, Gift, DollarSign, Clock, Target, CheckCircle, Star, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function DropsPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Drops - Earn Money by Engaging with Brands"
                description="Discover Promorang Drops — quick tasks from brands that pay you instantly."
                keywords="drops, earn money, brand challenges, promorang tasks"
                canonicalUrl="https://promorang.co/drops"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-orange-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full mb-8">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-bold text-orange-400">INSTANT EARNINGS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Catch <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Drops</span>. Get Paid.
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Drops are quick tasks from brands. Complete them in <strong className="text-orange-400">minutes</strong> and earn <strong className="text-green-400">real money</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
                            Browse Drops <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* What Are Drops */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What Are <span className="text-orange-500">Drops</span>?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-8">Drops are micro-tasks from brands:</p>
                            <ul className="space-y-4">
                                {['Share a product on social media', 'Write a quick review', 'Try a product and give feedback', 'Complete a survey or quiz'].map((task, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-orange-500" />
                                        <span className="text-pr-text-1">{task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-pr-text-1">Example Drop</h3>
                            </div>
                            <div className="bg-pr-surface-2 rounded-xl p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-pr-text-2">Reward</span>
                                    <span className="text-2xl font-bold text-green-500">$15</span>
                                </div>
                                <div className="text-pr-text-1 font-medium mb-2">Share Our New Coffee Blend</div>
                                <p className="text-sm text-pr-text-2 mb-4">Post a photo on Instagram with #MorningBrew</p>
                                <div className="flex gap-4 text-xs text-pr-text-muted">
                                    <span><Clock className="w-3 h-3 inline" /> 5 min</span>
                                    <span><Target className="w-3 h-3 inline" /> 47/100 spots</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Drop Types */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">Types of Drops</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Sparkles, title: 'Social Drops', desc: 'Share branded content on social media', reward: '$5-$50', color: 'text-pink-500', bg: 'bg-pink-500/20' },
                            { icon: Gift, title: 'Review Drops', desc: 'Try products and share your opinion', reward: '$10-$75', color: 'text-purple-500', bg: 'bg-purple-500/20' },
                            { icon: TrendingUp, title: 'Action Drops', desc: 'Sign up, download, or attend events', reward: '$2-$25', color: 'text-blue-500', bg: 'bg-blue-500/20' },
                        ].map((type, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${type.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <type.icon className={`w-7 h-7 ${type.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{type.title}</h3>
                                <p className="text-pr-text-2 mb-6">{type.desc}</p>
                                <div className="p-3 bg-pr-surface-2 rounded-lg flex justify-between">
                                    <span className="text-sm text-pr-text-2">Reward</span>
                                    <span className={`font-bold ${type.color}`}>{type.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Maximize Your <span className="text-orange-500">Earnings</span>
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { title: 'Act Fast', desc: 'Drops have limited spots. Enable notifications.', icon: Clock },
                            { title: 'Build Profile', desc: 'Complete profile for higher-paying Drops.', icon: Star },
                            { title: 'Quality First', desc: 'High-quality submissions unlock premium Drops.', icon: Target },
                            { title: 'Stay Active', desc: 'Regular activity builds reputation.', icon: TrendingUp },
                        ].map((tip, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                                <tip.icon className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{tip.title}</h3>
                                <p className="text-sm text-pr-text-2">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-pr-text-1 mb-12 text-center">FAQ</h2>
                    <div className="space-y-6">
                        {[
                            { q: "Do I need followers?", a: "No! Most Drops are open to everyone." },
                            { q: "How quickly do I get paid?", a: "Once approved (24-48 hours), rewards go to your wallet immediately." },
                            { q: "How many Drops can I do?", a: "Unlimited! The more you complete, the more you earn." },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.q}</h3>
                                <p className="text-pr-text-2 text-sm">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to start earning?"
                subheadline="Browse available Drops and complete your first task today."
                ctaText="Browse Drops"
                ctaLink="/auth"
                secondaryCta={{ text: "For Advertisers", link: "/drops-for-advertisers" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
