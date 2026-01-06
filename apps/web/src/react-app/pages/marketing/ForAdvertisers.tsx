import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Target, Zap, Users, TrendingUp } from 'lucide-react';

export default function ForAdvertisers() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline="High-Conversion Campaigns for Modern Brands"
                subheadline="Reach engaged audiences through vetted creators. Pay for performance, not potential."
                ctaText="Start Campaign"
                ctaLink="/auth"
                stats={[
                    { value: '3.5x', label: 'ROI' },
                    { value: '100%', label: 'Verified Creators' },
                    { value: '0', label: 'Upfront Fees' },
                    { value: '24h', label: 'Launch Time' },
                ]}
                backgroundGradient="from-purple-600/20 to-pink-600/20"
                icon={<Target className="w-10 h-10 text-purple-500" />}
            />

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Traditional <span className="text-red-500">Ad Networks</span> are Failing
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            Stop wasting budget on bots and banner blindness.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: "Ad blindness & blocking",
                                solution: "Authentic creator content",
                            },
                            {
                                problem: "Unpredictable CAC",
                                solution: "Performance-based pricing",
                            },
                            {
                                problem: "Low consumer trust",
                                solution: "High-trust community",
                            },
                            {
                                problem: "Complex attribution",
                                solution: "Direct ROI tracking",
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
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Benefits for Brands</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Scale your marketing efforts without scaling your team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="w-10 h-10 text-blue-500" />,
                                title: "Vetted Creators",
                                description: "Access a network of high-quality creators pre-vetted for authenticity and engagement.",
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                                title: "Instant Scale",
                                description: "Launch campaigns to hundreds of creators simultaneously with a few clicks.",
                            },
                            {
                                icon: <TrendingUp className="w-10 h-10 text-green-500" />,
                                title: "Equity Aligned",
                                description: "Option to compensate with equity, aligning creator incentives with your long-term growth.",
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-purple-500/50 transition-all">
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
                headline="Start Your Campaign"
                subheadline="Join forward-thinking brands driving growth with Promorang."
                ctaText="Get Started"
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
