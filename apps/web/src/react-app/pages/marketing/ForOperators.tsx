import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Layers, Zap, Settings, BarChart } from 'lucide-react';

export default function ForOperators() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline="Modern Infrastructure for Digital Economies"
                subheadline="We provide the plumbing. You build the empire. Seamlessly integrate compliant, high-yield digital asset rewards into your existing platform."
                ctaText="Start Integration"
                ctaLink="/auth"
                stats={[
                    { value: '10x', label: 'Engagement' },
                    { value: '30%', label: 'Retention Lift' },
                    { value: '10min', label: 'Integration' },
                    { value: '50/50', label: 'Rev Share' },
                ]}
                backgroundGradient="from-orange-600/20 to-red-600/20"
                icon={<Layers className="w-10 h-10 text-orange-500" />}
            />

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-red-500">Social Economy</span> is Broken
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            Your users are leaving value on the table. We help you capture it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: "High development cost",
                                solution: "Plug-and-play solution",
                            },
                            {
                                problem: "High user churn",
                                solution: "Gamified retention loops",
                            },
                            {
                                problem: "Hard to monetize",
                                solution: "Built-in revenue model",
                            },
                            {
                                problem: "Siloed user data",
                                solution: "Unified cross-platform analytics",
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">The Old Way</div>
                                        <div className="text-sm text-pr-text-2">{item.problem}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">The Promorang Way</div>
                                        <div className="text-sm text-pr-text-2">{item.solution}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Benefits for Operators</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-10 h-10 text-orange-500" />,
                                title: "Instant Integration",
                                description: "Drop our SDK into your app and start rewarding users in minutes.",
                            },
                            {
                                icon: <Settings className="w-10 h-10 text-gray-500" />,
                                title: "Fully Customizable",
                                description: "White-label the entire experience to match your brand identity.",
                            },
                            {
                                icon: <BarChart className="w-10 h-10 text-blue-500" />,
                                title: "New Revenue Streams",
                                description: "Unlock entirely new monetization channels with zero overhead.",
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-orange-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{benefit.title}</h3>
                                <p className="text-pr-text-2 mb-6 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to Scale?"
                subheadline="Join the top platforms powering their economy with Promorang."
                ctaText="Get Started"
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
