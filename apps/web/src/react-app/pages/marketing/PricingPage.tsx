import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            price: "Free",
            description: "Perfect for new creators getting started.",
            features: [
                "Access to public campaigns",
                "Basic analytics",
                "Standard payouts",
                "Community support"
            ],
            cta: "Get Started",
            highlight: false
        },
        {
            name: "Professional",
            price: "$29",
            period: "/month",
            description: "For serious creators scaling their business.",
            features: [
                "All Starter features",
                "Access to premium campaigns",
                "Advanced analytics & insights",
                "Instant payouts",
                "Priority support",
                "Custom referral links"
            ],
            cta: "Start Free Trial",
            highlight: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For brands and agencies with large scale needs.",
            features: [
                "Unlimited campaigns",
                "Dedicated account manager",
                "API access",
                "Custom integrations",
                "White-label options",
                "SLA guarantees"
            ],
            cta: "Contact Sales",
            link: "/contact",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Header */}
            <section className="relative py-20 text-center px-4">
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
                        Start for free, upgrade as you grow. No hidden fees.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`
                                    relative flex flex-col p-8 rounded-2xl border transition-all duration-300
                                    ${plan.highlight
                                        ? 'bg-pr-surface-card border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10'
                                        : 'bg-pr-surface-1 border-pr-border hover:border-pr-text-muted'}
                                `}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-pr-text-1 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-pr-text-1">{plan.price}</span>
                                        {plan.period && <span className="text-pr-text-2">{plan.period}</span>}
                                    </div>
                                    <p className="text-pr-text-2 mt-4 text-sm">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-blue-500' : 'text-pr-text-muted'}`} />
                                            <span className="text-pr-text-2 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to={plan.link || '/auth'} className="w-full">
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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

            <CTASection
                headline="Still have questions?"
                subheadline="Our team is here to help you find the right plan for your needs."
                ctaText="Contact Support"
                ctaLink="/contact"
            />

            <MarketingFooter />
        </div>
    );
}
