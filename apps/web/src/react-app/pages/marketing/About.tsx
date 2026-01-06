import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Sparkles, Target, Users, TrendingUp } from 'lucide-react';

export default function About() {
    const values = [
        {
            icon: <Sparkles className="w-8 h-8 text-blue-500" />,
            title: "Taste Over Followers",
            description: "We believe influence is about quality, not just quantity. A curated recommendation is worth more than a generic shoutout.",
        },
        {
            icon: <Target className="w-8 h-8 text-purple-500" />,
            title: "Equity for All",
            description: "Creators build the value of platforms. They should share in the upside. That's why we offer equity-based rewards.",
        },
        {
            icon: <Users className="w-8 h-8 text-green-500" />,
            title: "Transparency First",
            description: "No hidden fees, no opaque algorithms. Just clear terms and direct relationships between brands and creators.",
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
            title: "Long-Term Thinking",
            description: "Short-term gains are easy. We're building infrastructure for the next decade of the creator economy.",
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-pr-surface-background">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Curator Economy</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto leading-relaxed">
                        We're on a mission to democratize influence and help anyone monetize their taste.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Our Mission</h2>
                        <p className="text-xl text-pr-text-2 leading-relaxed">
                            To empower individuals to own their audience and their income.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-pr-text-1 mb-4">The Problem</h3>
                            <p className="text-lg text-pr-text-2 mb-6 leading-relaxed">
                                The current social media landscape is extractive. Users create value, platforms capture it.
                            </p>
                            <p className="text-lg text-pr-text-2 leading-relaxed">
                                We're flipping the script by aligning incentives between creators, brands, and platforms.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Traditional Platforms</div>
                                        <div className="text-sm text-pr-text-2">You are the product.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Promorang</div>
                                        <div className="text-sm text-pr-text-2">You are the partner.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Our Values</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            The principles that guide every decision we make.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{value.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-8 text-center">Our Story</h2>
                    <div className="prose prose-lg max-w-none text-pr-text-2">
                        <p className="text-xl leading-relaxed mb-6">
                            Promorang started with a simple observation: everyone is influential to someone.
                        </p>
                        <p className="text-lg leading-relaxed mb-6">
                            Whether you have 100 followers or 100,000, your recommendation matters. But traditional influencer marketing only valued the top 1%.
                        </p>
                        <p className="text-lg leading-relaxed mb-6">
                            We built Promorang to unlock the value of the other 99%. By creating a marketplace where brands can tap into micro-communities, we're building a more authentic and effective way to market.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Join us as we redefine what it means to be a creator.
                        </p>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Join the movement"
                subheadline="Be part of the future of the creator economy."
                ctaText="Get Started"
                ctaLink="/auth"
                secondaryCta={{ text: "How It Works", link: '/how-it-works' }}
            />

            <MarketingFooter />
        </div>
    );
}
