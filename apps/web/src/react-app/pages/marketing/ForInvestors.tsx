import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { TrendingUp, ShieldCheck, PieChart, Users } from 'lucide-react';

export default function ForInvestors() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline="The Future of Asset Ownership is Here"
                subheadline="Invest in the world's first equity-aligned creator economy. Back the brands and creators poised for exponential growth."
                ctaText="Start Investing"
                ctaLink="/auth"
                stats={[
                    { value: '$250M+', label: 'Volume' },
                    { value: '15%', label: 'Avg. Yield' },
                    { value: '24/7', label: 'Liquidity' },
                    { value: 'Web3', label: 'Powered' },
                ]}
                backgroundGradient="from-emerald-600/20 to-blue-600/20"
                icon={<TrendingUp className="w-10 h-10 text-emerald-500" />}
            />

            {/* Why Invest */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Beyond <span className="text-blue-500">Speculation</span>
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            We're bridging the gap between social capital and financial equity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: "Fragmented creator options",
                                solution: "Unified investment layer",
                            },
                            {
                                problem: "Limited liquidity",
                                solution: "On-chain marketplace secondary sales",
                            },
                            {
                                problem: "Zero transparency",
                                solution: "Real-time performance analytics",
                            },
                            {
                                problem: "High barrier to entry",
                                solution: "Fractionalized brand ownership",
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Old Markets</div>
                                        <div className="text-sm text-pr-text-2">{item.problem}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Promorang Markets</div>
                                        <div className="text-sm text-pr-text-2">{item.solution}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Investor Benefits */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Investor Benefits</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Institutional-grade tools for a new asset class.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
                                title: "Risk Mitigation",
                                description: "Every brand and creator is vetted through our multi-step protocol before listing.",
                            },
                            {
                                icon: <PieChart className="w-10 h-10 text-blue-500" />,
                                title: "Portfolio Diversification",
                                description: "Build a basket of high-growth digital assets across multiple niches and cohorts.",
                            },
                            {
                                icon: <Users className="w-10 h-10 text-purple-500" />,
                                title: "Incentive Alignment",
                                description: "Our equity-reward model ensures creators and brands are motivated for long-term value.",
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
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
                headline="Build Your Future Portfolio"
                subheadline="Join a global network of investors backing the next generation of commerce."
                ctaText="Get Started"
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
