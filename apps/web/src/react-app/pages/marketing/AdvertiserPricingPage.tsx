import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Check, Zap, Sparkles, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdvertiserPricingPage() {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            description: 'Education and sandbox testing.',
            icon: <Zap className="w-6 h-6 text-orange-500" />,
            moves: { amount: 50, period: 'month' },
            inventory: { proofDrops: 5, paidDrops: 0 },
            features: [
                '50 Moves / month',
                '5 Proof Drops',
                'Basic analytics',
            ],
            restrictions: ['No PromoShare', 'No leaderboard placement'],
            cta: 'Get Started Free',
            highlight: false,
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '$50',
            period: '/month',
            description: 'Micro-activation for small campaigns.',
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            moves: { amount: 100, period: 'month' },
            inventory: { proofDrops: 8, paidDrops: 2 },
            features: [
                '100 Moves / month',
                '8 Proof Drops',
                '2 Paid Drops',
            ],
            restrictions: ['No PromoShare', 'No leaderboard placement'],
            cta: 'Start Starter',
            highlight: false,
        },
        {
            id: 'growth',
            name: 'Growth',
            price: '$300',
            period: '/month',
            description: 'Repeatable engagement at scale.',
            icon: <Sparkles className="w-6 h-6 text-purple-500" />,
            moves: { amount: 200, period: 'week' },
            inventory: { proofDrops: 15, paidDrops: 8 },
            features: [
                '200 Moves / week',
                '15 Proof Drops',
                '8 Paid Drops',
                'Advanced analytics',
                'Audience targeting tools',
                'PromoShare enabled',
            ],
            restrictions: [],
            cta: 'Go Growth',
            highlight: true,
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$900',
            period: '/month',
            description: 'Attention dominance for serious brands.',
            icon: <Crown className="w-6 h-6 text-yellow-500" />,
            moves: { amount: 500, period: 'week' },
            inventory: { proofDrops: 25, paidDrops: 15 },
            features: [
                '500 Moves / week',
                '25 Proof Drops',
                '15 Paid Drops',
                'Premium analytics + reporting',
                'Dedicated success manager',
                'Priority PromoKey distribution',
                'Leaderboard incentive targeting',
            ],
            restrictions: [],
            cta: 'Go Premium',
            highlight: false,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            description: 'Ecosystem anchoring for partnerships.',
            icon: <Building2 className="w-6 h-6 text-gray-500" />,
            moves: { amount: null, period: 'custom' },
            inventory: { proofDrops: null, paidDrops: null },
            features: [
                'Custom-defined Move pools',
                'Custom Drop limits',
                'Dedicated account team',
                'Custom integrations',
                'API access',
                'White-label options',
            ],
            restrictions: [],
            cta: 'Contact Sales',
            link: '/contact',
            highlight: false,
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Header */}
            <section className="relative py-20 text-center px-4">
                <div className="absolute inset-0 bg-orange-600/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                        FOR ADVERTISERS
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Move-Based Pricing
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
                        Every user action you request consumes a Move. Choose the plan that matches your campaign velocity.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`
                                    relative flex flex-col p-6 rounded-2xl border transition-all duration-300
                                    ${plan.highlight
                                        ? 'bg-pr-surface-card border-purple-500 shadow-2xl shadow-purple-500/10 scale-105 z-10'
                                        : 'bg-pr-surface-1 border-pr-border hover:border-pr-text-muted'}
                                `}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                                        <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    {plan.icon}
                                    <h3 className="text-lg font-bold text-pr-text-1">{plan.name}</h3>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-pr-text-1">{plan.price}</span>
                                        {plan.period && <span className="text-pr-text-2">{plan.period}</span>}
                                    </div>
                                    <p className="text-pr-text-2 mt-2 text-sm">{plan.description}</p>
                                </div>

                                {/* Moves Display */}
                                {plan.moves.amount && (
                                    <div className="bg-pr-surface-2 rounded-lg p-3 mb-4 text-center">
                                        <div className="text-2xl font-bold text-pr-text-1">
                                            {plan.moves.amount}
                                        </div>
                                        <div className="text-xs text-pr-text-2 uppercase tracking-wider">
                                            Moves / {plan.moves.period}
                                        </div>
                                    </div>
                                )}

                                <ul className="space-y-2 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-purple-500' : 'text-green-500'}`} />
                                            <span className="text-pr-text-2 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to={plan.link || '/auth'} className="w-full mt-auto">
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                        variant={plan.highlight ? 'primary' : 'outline'}
                                        size="lg"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Move Enforcement Notice */}
            <section className="py-12 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">How Moves Work</h2>
                    <p className="text-pr-text-2 mb-6">
                        A <strong>Move</strong> is consumed each time you request a user action — content engagement,
                        content creation, Proof Drops, or Paid Drops. When your Moves reach zero, campaign actions
                        pause until your next billing cycle or upgrade.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-bold text-pr-text-1">Real-Time Tracking</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                Monitor your remaining Moves in your dashboard.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">🔒</div>
                            <h3 className="font-bold text-pr-text-1">Gem Escrow</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                All Drops require Gem escrow to protect creators.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">✅</div>
                            <h3 className="font-bold text-pr-text-1">3-5 Day Verification</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                Verify participation within the window or Promorang auto-releases.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to launch your first campaign?"
                subheadline="Start free and scale as you grow. No hidden fees."
                ctaText="Create Free Account"
                ctaLink="/auth"
            />

            <MarketingFooter />
        </div>
    );
}
