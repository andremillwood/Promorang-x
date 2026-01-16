import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Share2, Link, Users, Gift, TrendingUp, ArrowRight, Zap, BarChart3, Network } from 'lucide-react';

export default function RelaysPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Relays - Earn from Everything You Share"
                description="Relay content, Drops, coupons, and more. When someone engages through your Relay, you earn. Track your impact across the network."
                keywords="relays, content sharing, viral sharing, promorang relays, earn from sharing"
                canonicalUrl="https://promorang.co/relays"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 px-4 py-2 rounded-full mb-8">
                        <Network className="w-5 h-5 text-teal-500" />
                        <span className="text-sm font-bold text-teal-400">RELAY SYSTEM</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Share. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Relay.</span> Earn.
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Every time you share something on Promorang, you create a <strong className="text-teal-400">Relay</strong>. When people engage through your Relay, you earn rewards.
                    </p>
                    <a href="/auth" className="inline-flex px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl items-center gap-2">
                        Start Relaying <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* What is a Relay */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What is a <span className="text-teal-500">Relay</span>?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                A Relay is a tracked share. When you share content, a Drop, a coupon, or anything else on Promorang, the system tracks that share as a Relay.
                            </p>
                            <p className="text-lg text-pr-text-2 mb-8">
                                Unlike regular shares, Relays create a <strong className="text-teal-400">lineage</strong> — a chain of attribution that ensures everyone who helped spread something gets credit.
                            </p>
                            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <h3 className="font-bold text-pr-text-1 mb-3">Relays ≠ Referrals</h3>
                                <p className="text-sm text-pr-text-2">
                                    Referrals bring <em>new users</em> to Promorang. Relays track how <em>content spreads</em> through the network. You can earn from both!
                                </p>
                            </div>
                        </div>
                        <div className="bg-pr-surface-card border border-teal-500/30 rounded-2xl p-8">
                            <h3 className="font-bold text-pr-text-1 mb-6 text-center">Relay Chain Example</h3>
                            <div className="space-y-4">
                                {[
                                    { user: 'Brand', action: 'Creates Drop', reward: '—' },
                                    { user: 'You', action: 'Relay to friends', reward: '+10 PP' },
                                    { user: 'Friend A', action: 'Completes Drop', reward: '+5 PP (relay bonus)' },
                                    { user: 'Friend A', action: 'Relays further', reward: '+2 PP (2nd level)' },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-pr-surface-2 rounded-lg">
                                        <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-500 font-bold text-sm">{i + 1}</div>
                                        <div className="flex-1">
                                            <div className="text-pr-text-1 font-medium text-sm">{step.user}</div>
                                            <div className="text-pr-text-2 text-xs">{step.action}</div>
                                        </div>
                                        <div className="text-teal-500 font-semibold text-sm">{step.reward}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Can Be Relayed */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        What Can Be <span className="text-teal-500">Relayed</span>?
                    </h2>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                            { icon: Share2, title: 'Content', desc: 'Videos, posts, articles' },
                            { icon: Zap, title: 'Drops', desc: 'Brand tasks and challenges' },
                            { icon: Gift, title: 'Coupons', desc: 'Discount codes and deals' },
                            { icon: TrendingUp, title: 'Forecasts', desc: 'Prediction opportunities' },
                            { icon: Users, title: 'Events', desc: 'Virtual and in-person events' },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
                                <item.icon className="w-10 h-10 text-teal-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-1">{item.title}</h3>
                                <p className="text-xs text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Relay Benefits */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Why <span className="text-teal-500">Relay</span>?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Gift, title: 'Earn Rewards', desc: 'Get Promo Points every time someone engages through your Relay.', color: 'text-green-500', bg: 'bg-green-500/20' },
                            { icon: BarChart3, title: 'Track Your Impact', desc: 'See exactly how far your shares reach and how much value you create.', color: 'text-blue-500', bg: 'bg-blue-500/20' },
                            { icon: Link, title: 'Build Lineage', desc: 'Create lasting attribution chains. Your contribution is never forgotten.', color: 'text-purple-500', bg: 'bg-purple-500/20' },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{item.title}</h3>
                                <p className="text-pr-text-2">{item.desc}</p>
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
                            { q: "How do I create a Relay?", a: "Just share! Every share button on Promorang creates a Relay automatically." },
                            { q: "How deep does Relay tracking go?", a: "Relays track multiple levels of sharing, so even indirect engagement can reward you." },
                            { q: "Do Relays expire?", a: "No. Once you create a Relay, it's tracked permanently." },
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
                headline="Start building your Relay network"
                subheadline="Every share creates value. Make yours count."
                ctaText="Get Started"
                ctaLink="/auth"
                secondaryCta={{ text: "How It Works", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
