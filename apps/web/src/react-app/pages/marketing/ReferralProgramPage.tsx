import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Users, Gift, TrendingUp, Award, Star, ArrowRight, CheckCircle, Crown, Zap, Target } from 'lucide-react';

export default function ReferralProgramPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Referral Program - Earn Lifetime Commissions"
                description="Join Promorang's referral program and earn 5% lifetime commissions on everyone you refer. Build a passive income stream with our multi-tier affiliate system."
                keywords="referral program, affiliate, earn commissions, passive income, promorang referrals, influencer earnings"
                canonicalUrl="https://promorang.co/referral-program"
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
                        <Users className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-bold text-purple-400">LIFETIME COMMISSIONS</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Refer Friends.{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                            Earn Forever.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Every person you bring to Promorang earns you <strong className="text-purple-400">5% of their earnings</strong> — for life.
                        Build your network, build your wealth.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
                            Get Your Referral Code <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="#how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '5%', label: 'Lifetime Commission', color: 'text-purple-500' },
                            { value: '$0', label: 'Cost to Join', color: 'text-green-500' },
                            { value: '∞', label: 'Earning Potential', color: 'text-pink-500' },
                            { value: '4', label: 'Referral Tiers', color: 'text-blue-500' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className={`text-4xl md:text-5xl font-extrabold ${stat.color} mb-2`}>{stat.value}</div>
                                <div className="text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">How Referrals Work</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three simple steps to start earning passive income from your network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Gift,
                                title: 'Share Your Code',
                                description: 'Get your unique referral code or link from your dashboard. Share it with friends, followers, or anyone interested in Promorang.',
                            },
                            {
                                step: '2',
                                icon: Users,
                                title: 'They Sign Up & Earn',
                                description: 'When someone uses your code, they become part of your referral network. Every time they earn on Promorang, you earn too.',
                            },
                            {
                                step: '3',
                                icon: TrendingUp,
                                title: 'Get Paid Forever',
                                description: "You receive 5% of their total earnings — automatically. There's no cap, no expiration. It's passive income that grows.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="w-7 h-7 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{item.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tier System */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Referral <span className="text-purple-500">Tiers</span>
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            The more people you refer, the more benefits you unlock. Level up your referral status.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                tier: 'Starter',
                                icon: Zap,
                                color: 'text-gray-400',
                                borderColor: 'border-pr-border',
                                referrals: '1-4',
                                commission: '5%',
                                perks: ['Basic commission rate', 'Standard support', 'Referral dashboard'],
                            },
                            {
                                tier: 'Advocate',
                                icon: Star,
                                color: 'text-blue-400',
                                borderColor: 'border-blue-500/30',
                                referrals: '5-19',
                                commission: '5% + Bonus',
                                perks: ['100 Promo Points/referral', 'Priority support', 'Exclusive tips'],
                            },
                            {
                                tier: 'Ambassador',
                                icon: Award,
                                color: 'text-purple-400',
                                borderColor: 'border-purple-500/30',
                                referrals: '20-49',
                                commission: '5% + Perks',
                                perks: ['250 Promo Points/referral', 'Ambassador badge', 'Early feature access'],
                            },
                            {
                                tier: 'Partner',
                                icon: Crown,
                                color: 'text-yellow-400',
                                borderColor: 'border-yellow-500/50',
                                referrals: '50+',
                                commission: '5% + Revenue Share',
                                perks: ['500 Promo Points/referral', 'Revenue share program', 'VIP advisory role'],
                                featured: true,
                            },
                        ].map((tier, i) => (
                            <div key={i} className={`bg-pr-surface-card border ${tier.borderColor} rounded-2xl p-6 relative ${tier.featured ? 'ring-2 ring-yellow-500/50' : ''}`}>
                                {tier.featured && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">TOP TIER</div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tier.featured ? 'bg-yellow-500/20' : 'bg-pr-surface-2'}`}>
                                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                                </div>
                                <h3 className={`text-xl font-bold ${tier.color} mb-1`}>{tier.tier}</h3>
                                <div className="text-xs text-pr-text-muted mb-2">{tier.referrals} referrals</div>
                                <div className={`text-lg font-bold ${tier.color} mb-4`}>{tier.commission}</div>
                                <ul className="space-y-2">
                                    {tier.perks.map((perk, j) => (
                                        <li key={j} className="flex items-start gap-2 text-xs text-pr-text-2">
                                            <CheckCircle className={`w-3 h-3 ${tier.color} flex-shrink-0 mt-0.5`} />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Earnings Calculator */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">See Your Potential</h2>
                        <p className="text-xl text-pr-text-2">
                            Here's what your earnings could look like with just a few active referrals.
                        </p>
                    </div>

                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { referrals: 10, avgEarnings: '$200/mo', yourEarnings: '$100/mo' },
                                { referrals: 50, avgEarnings: '$200/mo', yourEarnings: '$500/mo' },
                                { referrals: 100, avgEarnings: '$200/mo', yourEarnings: '$1,000/mo' },
                            ].map((scenario, i) => (
                                <div key={i} className="text-center p-6 bg-pr-surface-2 rounded-xl">
                                    <div className="text-5xl font-extrabold text-purple-500 mb-2">{scenario.referrals}</div>
                                    <div className="text-sm text-pr-text-2 mb-4">Active Referrals</div>
                                    <div className="text-xs text-pr-text-muted mb-1">Each earning {scenario.avgEarnings}</div>
                                    <div className="text-2xl font-bold text-green-500">{scenario.yourEarnings}</div>
                                    <div className="text-xs text-pr-text-2">Your Passive Income</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-pr-text-muted mt-6">
                            *Estimated earnings based on 5% commission. Actual earnings vary based on referral activity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Success Story */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Real Results</h2>
                    </div>

                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">MK</div>
                            <div>
                                <div className="font-bold text-pr-text-1 text-lg">Michelle K.</div>
                                <div className="text-pr-text-2 text-sm">Ambassador Tier, 8 months on Promorang</div>
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-xl text-pr-text-1 text-center mb-8 leading-relaxed">
                            "I started sharing Promorang with my study group. Now I have 32 active referrals and make $400/month in passive income without doing anything extra. It literally pays my rent."
                        </blockquote>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-purple-500">32</div>
                                <div className="text-xs text-pr-text-2">Active Referrals</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">$400/mo</div>
                                <div className="text-xs text-pr-text-2">Passive Income</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-pink-500">8 mo</div>
                                <div className="text-xs text-pr-text-2">Time on Platform</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: "How do I get my referral code?", a: "Sign up for Promorang and go to your Referral Dashboard. Your unique code and shareable link will be there, ready to share." },
                            { q: "Is there a limit to how many people I can refer?", a: "No limit! Refer as many people as you want. The more you refer, the more you earn — and the higher your tier." },
                            { q: "How long do I earn commissions for?", a: "Forever. As long as your referrals are active on Promorang, you earn 5% of their earnings. There's no expiration." },
                            { q: "When do I get paid?", a: "Referral earnings are added to your wallet balance in real-time. You can withdraw once you hit the minimum threshold." },
                            { q: "Can my referrals also refer people?", a: "Absolutely! They get their own referral code and earn from their network. However, your commission is only for direct referrals at this time." },
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
                headline="Ready to earn from your network?"
                subheadline="Get your referral code today and start building passive income."
                ctaText="Get Your Code"
                ctaLink="/auth"
                secondaryCta={{ text: "Learn More", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
