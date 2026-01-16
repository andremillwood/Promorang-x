import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Activity, TrendingUp, Unlock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
    const steps = [
        {
            number: '1',
            icon: <Activity className="w-8 h-8 text-blue-500" />,
            title: 'Show Up',
            description: 'Your Access Rank increases every time you participate. Daily engagement, completing tasks, and being active all contribute to your rank.',
            color: 'blue',
        },
        {
            number: '2',
            icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
            title: 'Higher Rank → Earlier Access',
            description: 'Users with higher Access Ranks get priority when new opportunities appear. The more consistent you are, the earlier you see them.',
            color: 'purple',
        },
        {
            number: '3',
            icon: <Unlock className="w-8 h-8 text-green-500" />,
            title: 'Access → Opportunities',
            description: "Opportunities are time-limited and rank-gated. Active users get in first. Inactive users miss out. It's that simple.",
            color: 'green',
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-pr-surface-background pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Consistency Creates <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Access</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto leading-relaxed">
                        Promorang rewards users who show up. Your Access Rank determines what opportunities you see and when you see them.
                    </p>
                </div>
            </section>

            {/* Steps - Simplified 3-step flow */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 relative">
                                {/* Step number */}
                                <div className={`absolute -top-4 left-8 w-8 h-8 rounded-full bg-${step.color}-500 flex items-center justify-center text-white font-bold text-sm`}>
                                    {step.number}
                                </div>

                                <div className="flex items-start gap-6 pt-2">
                                    <div className={`w-16 h-16 rounded-2xl bg-${step.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{step.title}</h3>
                                        <p className="text-pr-text-2 leading-relaxed text-lg">{step.description}</p>
                                    </div>
                                </div>

                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-12 bottom-0 w-0.5 h-8 bg-pr-border translate-y-full" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Access Principle */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-pr-text-1 mb-6">The Access Principle</h2>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="text-red-500 font-bold mb-4">❌ Low Access Rank</div>
                            <ul className="space-y-3 text-pr-text-2">
                                <li>• See opportunities after active users</li>
                                <li>• Often find opportunities already claimed</li>
                                <li>• Miss time-sensitive drops</li>
                                <li>• Limited visibility into what's available</li>
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-green-500/30 rounded-2xl p-8">
                            <div className="text-green-500 font-bold mb-4">✓ High Access Rank</div>
                            <ul className="space-y-3 text-pr-text-2">
                                <li>• First to see new opportunities</li>
                                <li>• Priority access before they fill up</li>
                                <li>• Early notification of drops</li>
                                <li>• Full visibility into the platform</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Business Section */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-purple-500 font-bold tracking-wide uppercase text-sm">For Businesses</span>
                        <h2 className="text-3xl font-bold text-pr-text-1 mt-4">Guaranteed Actions from Verified Users</h2>
                        <p className="text-lg text-pr-text-2 mt-4 max-w-2xl mx-auto">
                            When you create an opportunity on Promorang, you're not paying for impressions.
                            You're paying for verified actions from users who have proven they complete what they start.
                        </p>
                    </div>

                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-pr-text-1 mb-4">Action Windows</h3>
                        <p className="text-pr-text-2 mb-6">
                            Set a time window for users to complete your action. Only users who have demonstrated
                            reliability (high Access Rank) can participate. No bots. No ghost accounts. Real people, real actions.
                        </p>
                        <Link
                            to="/advertisers"
                            className="inline-flex items-center gap-2 text-purple-500 font-semibold hover:underline"
                        >
                            Learn more about advertising <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Start Building Your Access Rank"
                subheadline="The sooner you start, the higher you climb."
                ctaText="Create Account"
                ctaLink="/auth"
                secondaryCta={{ text: "Explore Opportunities", link: '/explore' }}
            />

            <MarketingFooter />
        </div>
    );
}
