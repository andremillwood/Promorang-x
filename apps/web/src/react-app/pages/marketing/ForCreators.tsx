import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Sparkles, DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function ForCreators() {
    const successStories = [
        {
            name: 'Sarah J.',
            role: 'Student & Micro-Curator',
            earnings: '$450/month',
            story: 'I used to spend 3 hours a day on TikTok for free. Now I spend 20 minutes on Promorang and make $450/month. No followers needed.',
            followers: '127',
        },
        {
            name: 'Marcus T.',
            role: 'Fashion Enthusiast',
            earnings: '$2,100/month',
            story: "I've always had great taste in streetwear. Now brands pay me to curate their collections. I own equity in 5 brands I helped grow.",
            followers: '843',
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline="Monetize Your Influence"
                subheadline="Turn your passion into a profession. Connect with brands, create content you love, and get paid instantly."
                ctaText="Start Earning"
                ctaLink="/auth"
                stats={[
                    { value: '$1,247', label: 'Avg. Earnings' },
                    { value: '0', label: 'Followers Needed' },
                    { value: '2 min', label: 'Setup Time' },
                    { value: '100%', label: 'Keep First $1k' },
                ]}
                backgroundGradient="from-yellow-600/20 to-orange-600/20"
                icon={<Sparkles className="w-10 h-10 text-yellow-500" />}
            />

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-red-500">Creator Economy</span> is Rigged
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            Platforms maximize their ad revenue, not your earnings. It’s time for a change.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: "Need 10k+ followers to earn",
                                solution: "Earn from Day 1",
                            },
                            {
                                problem: "Platform takes 40-50%",
                                solution: "Keep 95% of earnings",
                            },
                            {
                                problem: "One-time payments",
                                solution: "Long-term equity & revenue share",
                            },
                            {
                                problem: "Algorithm decides your fate",
                                solution: "Your taste decides your success",
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

            {/* How Creators Earn */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">How You Earn</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Multiple income streams, one platform. Choose how you want to grow.
                        </p>
                        <p className="mt-6 text-base md:text-lg text-pr-text-2 max-w-3xl mx-auto">
                            *Earnings vary based on participation and performance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <DollarSign className="w-10 h-10 text-green-500" />,
                                title: "Instant Cash",
                                description: "Get paid immediately for completing simple tasks and challenges from brands.",
                                example: "Earn $50 for posting an Instagram story about a new coffee brand.",
                            },
                            {
                                icon: <TrendingUp className="w-10 h-10 text-blue-500" />,
                                title: "Forecasts & Predictions",
                                description: "Predict which products will succeed. When you're right, you earn bonus Promo Points.",
                                example: "Forecast a product, earn 500 Promo Points when it hits its target.",
                            },
                            {
                                icon: <Users className="w-10 h-10 text-purple-500" />,
                                title: "Referral Network",
                                description: "Earn overrides on creators you refer to the platform.",
                                example: "Get 5% of earnings from every creator who signs up with your code.",
                            },
                        ].map((stream, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {stream.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{stream.title}</h3>
                                <p className="text-pr-text-2 mb-6 leading-relaxed">{stream.description}</p>
                                <div className="bg-pr-surface-2 p-4 rounded-lg text-sm text-pr-text-2 italic">
                                    "{stream.example}"
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Success Stories</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {successStories.map((creator, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {creator.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">{creator.name}</div>
                                        <div className="text-sm text-pr-text-2">{creator.role}</div>
                                    </div>
                                </div>
                                <p className="text-pr-text-2 mb-6 leading-relaxed italic">"{creator.story}"</p>
                                <div className="flex items-center justify-between pt-6 border-t border-pr-border">
                                    <div>
                                        <div className="text-2xl font-bold text-green-500">{creator.earnings}</div>
                                        <div className="text-xs text-pr-text-2">Monthly Earnings</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-pr-text-1">{creator.followers}</div>
                                        <div className="text-xs text-pr-text-2">Followers</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Getting Started */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Getting Started is Easy</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            "Create your account in 30 seconds",
                            "Connect your social media profiles",
                            "Browse available campaigns and tasks",
                            "Create content and submit for review",
                            "Get paid instantly upon approval"
                        ].map((step, index) => (
                            <div key={index} className="flex items-center gap-4 bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="text-lg text-pr-text-1">{step}</div>
                                <CheckCircle className="w-6 h-6 text-green-500 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Start earning today"
                subheadline="Join thousands of creators who are owning their financial future."
                ctaText="Start Earning"
                ctaLink="/auth"
                secondaryCta={{ text: "How It Works", link: '/how-it-works' }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
