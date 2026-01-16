import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Rocket, Sparkles, Target, Clock, BarChart3, CheckCircle, ArrowRight, Zap, Gift } from 'lucide-react';

export default function MovesPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Moves - Time-Limited Promotional Events"
                description="Moves are special promotional events with limited-time rewards. Create urgency, drive action, and reward your best users."
                keywords="moves, promotions, limited time offers, promorang moves, flash sales"
                canonicalUrl="https://promorang.co/moves"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-amber-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-8">
                        <Rocket className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-bold text-amber-400">MOVES</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Make Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Move</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Moves are <strong className="text-amber-400">time-limited</strong> promotional events that create urgency and drive action. Launch a Move and watch users engage.
                    </p>
                    <a href="/auth" className="inline-flex px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl items-center gap-2">
                        See Active Moves <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* What is a Move */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What is a <span className="text-amber-500">Move</span>?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                A Move is a special promotional event with a defined time window. Think of it as a flash sale for engagement — but better.
                            </p>
                            <p className="text-lg text-pr-text-2 mb-8">
                                Moves create urgency, reward fast action, and give brands concentrated bursts of attention.
                            </p>
                            <ul className="space-y-3">
                                {['Limited time windows (hours to days)', 'Enhanced rewards for early participants', 'Special bonuses and multipliers', 'Exclusive access for top users'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-amber-500/30 rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <Rocket className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-pr-text-1">Example Move</h3>
                            </div>
                            <div className="bg-pr-surface-2 rounded-xl p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-pr-text-1 font-bold">Summer Launch Blitz</span>
                                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
                                </div>
                                <p className="text-sm text-pr-text-2 mb-4">Complete 3 Drops in 24 hours for 5x bonus rewards!</p>
                                <div className="flex gap-4 text-xs text-pr-text-muted">
                                    <span><Clock className="w-3 h-3 inline" /> 18h left</span>
                                    <span><Gift className="w-3 h-3 inline" /> 5x multiplier</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-pr-text-2">Participants</span>
                                    <span className="text-pr-text-1">847/1,000</span>
                                </div>
                                <div className="w-full bg-pr-surface-card rounded-full h-2">
                                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Move Types */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Types of <span className="text-amber-500">Moves</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Flash Moves', desc: 'Ultra-short events (1-6 hours). Maximum urgency, maximum rewards.', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
                            { icon: Sparkles, title: 'Challenge Moves', desc: 'Multi-day challenges with tiered rewards for completing goals.', color: 'text-purple-500', bg: 'bg-purple-500/20' },
                            { icon: Gift, title: 'Bonus Moves', desc: 'Multiplier events that boost rewards on normal activities.', color: 'text-green-500', bg: 'bg-green-500/20' },
                        ].map((type, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${type.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <type.icon className={`w-7 h-7 ${type.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{type.title}</h3>
                                <p className="text-pr-text-2">{type.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Advertisers */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Create Your Own <span className="text-amber-500">Move</span>
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Advertisers can create Moves to drive concentrated engagement bursts.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: 'Set Goals', desc: 'Define what you want users to do' },
                            { icon: Clock, title: 'Set Duration', desc: 'Choose your time window' },
                            { icon: Gift, title: 'Set Rewards', desc: 'Configure bonuses and multipliers' },
                            { icon: BarChart3, title: 'Track Results', desc: 'Monitor participation in real-time' },
                        ].map((step, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                                <step.icon className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{step.title}</h3>
                                <p className="text-sm text-pr-text-2">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Users */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">How to Participate</h2>
                    <p className="text-xl text-pr-text-2 mb-12">Join active Moves to earn bonus rewards</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Find Moves', desc: 'Browse active Moves in your dashboard' },
                            { step: '2', title: 'Complete Tasks', desc: 'Finish the required actions before time runs out' },
                            { step: '3', title: 'Earn Bonuses', desc: 'Get enhanced rewards for participating' },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">{item.step}</div>
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to make your Move?"
                subheadline="Join active Moves or create your own promotional event."
                ctaText="See Active Moves"
                ctaLink="/auth"
                secondaryCta={{ text: "For Advertisers", link: "/advertisers" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
