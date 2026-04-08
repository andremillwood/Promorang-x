import { useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Check, Zap, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdvertiserPricingPage() {
    const plans = [
        {
            id: 'standard',
            name: 'Standard Close-out',
            price: '$500',
            period: '/campaign',
            description: 'The definitive record for standard digital and field activations.',
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            signals: 'Up to 500 verified entries',
            features: [
                'Total signal verification',
                'Geo-fenced execution audit',
                'Basic settlement report',
                'Immutable ledger backup',
            ],
            cta: 'Initiate Close-out',
            highlight: false,
        },
        {
            id: 'institutional',
            name: 'Institutional Audit',
            price: '$2,000',
            period: '/campaign',
            description: 'Audit-ready defense for high-stakes, multi-week activations.',
            icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
            signals: 'Unlimited verified entries',
            features: [
                'Advanced fraud detection',
                'Deep-dive performance audit',
                'Finance-ready PDF report',
                'Dedicated compliance lead',
                'API Data export',
            ],
            cta: 'Secure Audit',
            highlight: true,
        },
        {
            id: 'enterprise',
            name: 'Managed Rails',
            price: 'Custom',
            description: 'Organization-wide standardization and compliance infrastructure.',
            icon: <Building2 className="w-6 h-6 text-gray-500" />,
            features: [
                'Custom verification protocols',
                'Organization-wide audit logs',
                'SSO & Advanced Security',
                'White-label reporting',
            ],
            cta: 'Contact Strategy',
            link: '/contact',
            highlight: false,
        },
    ];

    const [pricingType, setPricingType] = useState<'individual' | 'business'>('business');

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Header */}
            <section className="relative py-20 text-center px-4">
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                        Campaign Reputation Insurance
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Close-out Models
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto mb-10">
                        Convert activation liability into defensible assets. The easy part of your campaign wrap-up.
                    </p>

                    {/* Pricing Toggle */}
                    <div className="flex items-center justify-center p-1 bg-pr-surface-2 rounded-xl w-fit mx-auto mb-12 border border-pr-border">
                        <Link
                            to="/pricing"
                            className="px-6 py-2 rounded-lg text-sm font-bold text-pr-text-2 hover:text-pr-text-1 transition-all text-muted"
                        >
                            Individuals
                        </Link>
                        <button
                            onClick={() => setPricingType('business')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${pricingType === 'business'
                                ? 'bg-pr-surface-card text-pr-text-1 shadow-sm'
                                : 'text-pr-text-2 hover:text-pr-text-1'
                                }`}
                        >
                            Agencies & Brands
                        </button>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

                                {plan.signals && (
                                    <div className="bg-pr-surface-2 rounded-lg p-3 mb-4 text-center">
                                        <div className="text-xl font-bold text-pr-text-1">
                                            {plan.signals}
                                        </div>
                                    </div>
                                )}

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-blue-500' : 'text-emerald-500'}`} />
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

            <section className="py-12 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">How Verification Works</h2>
                    <p className="text-pr-text-2 mb-6">
                        A <strong>Signal</strong> is recorded each time a verified user action is submitted — content engagement,
                        field verification, or documented proof. Our standard ensures every signal is audit-grade.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-bold text-pr-text-1">Audit Stream</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                Monitor your verified signal intake in real-time.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">🔒</div>
                            <h3 className="font-bold text-pr-text-1">Settlement Fund</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                All activations require credit escrow to protect integrity.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                            <div className="text-3xl mb-2">✅</div>
                            <h3 className="font-bold text-pr-text-1">Verification Window</h3>
                            <p className="text-sm text-pr-text-2 mt-2">
                                Review signals within the standard 5-day audit window.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Initiate your first campaign close-out"
                subheadline="Clean, defensible, and audit-ready results starting at $500."
                ctaText="Start Reputational Insurance"
                ctaLink="/auth"
            />

            <MarketingFooter />
        </div>
    );
}
