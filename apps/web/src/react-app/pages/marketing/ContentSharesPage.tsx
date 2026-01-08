import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Share2, Users, TrendingUp, Star, Gift, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function ContentSharesPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Content Shares - Earn Equity in Content You Engage With"
                description="Promorang Content Shares let you earn a stake in viral content. Engage with drops, earn shares, and get paid when content performs. No content creation required."
                keywords="content shares, earn from content, viral content earnings, promo points, engagement rewards, content equity"
                canonicalUrl="https://promorang.co/content-shares"
            />
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full mb-8">
                        <Share2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-bold text-green-400">UNIQUE TO PROMORANG</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Shares</span> in Content You Believe In
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        When you engage with content on Promorang, you don't just support creators — you earn <strong className="text-pr-text-1">equity in that content's success</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2">
                            Start Earning Shares <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* What Are Content Shares */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                                What Are <span className="text-green-500">Content Shares</span>?
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-8 leading-relaxed">
                                Think of it like owning a piece of a viral video. When you engage with creator content — liking, commenting, sharing — you earn "shares" in that content's performance pool.
                            </p>
                            <p className="text-lg text-pr-text-2 mb-8 leading-relaxed">
                                When the content hits its engagement targets, the performance pool pays out to all shareholders based on how many shares they hold.
                            </p>
                            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="text-sm font-bold text-pr-text-1 mb-3">Example:</div>
                                <p className="text-pr-text-2 text-sm">
                                    You engage with a creator's Drop early. You earn 10 shares. The Drop goes viral and hits 100k views. The performance pool of 5,000 Promo Points is distributed — you earn 50 Promo Points for your 10 shares.
                                </p>
                            </div>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">10%</div>
                                <div className="text-pr-text-2 text-sm mt-2">Your Share of the Pool</div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Your Shares</span>
                                    <span className="font-bold text-pr-text-1">100</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Total Shares</span>
                                    <span className="font-bold text-pr-text-1">1,000</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Pool Size</span>
                                    <span className="font-bold text-pr-text-1">5,000 PP</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <span className="font-bold text-green-400">Your Earnings</span>
                                    <span className="font-bold text-green-400">500 Promo Points</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Earn */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">How to Earn Content Shares</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Multiple ways to accumulate shares in the content you believe in.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Gift, title: "Engage Early", desc: "Like, comment, or share content within the first 24 hours for maximum shares." },
                            { icon: Share2, title: "Amplify", desc: "Share content to your social networks. More reach = more shares." },
                            { icon: Users, title: "Refer Friends", desc: "Bring new users to engage with the same content. Earn bonus shares." },
                            { icon: TrendingUp, title: "Consistent Activity", desc: "Regular engagement builds your share earning rate over time." }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-pr-text-2 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Real Results</h2>
                    </div>

                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">JT</div>
                            <div>
                                <div className="font-bold text-pr-text-1 text-lg">Jordan Taylor</div>
                                <div className="text-pr-text-2 text-sm">Early Adopter, 6 months on Promorang</div>
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-xl text-pr-text-1 text-center mb-8 leading-relaxed">
                            "I engaged with 50 Drops in my first month. 12 of them went viral. I earned over 3,000 Promo Points just from Content Shares — and I didn't have to create a single piece of content myself."
                        </blockquote>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">50</div>
                                <div className="text-xs text-pr-text-2">Drops Engaged</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">12</div>
                                <div className="text-xs text-pr-text-2">Went Viral</div>
                            </div>
                            <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">3,000+</div>
                                <div className="text-xs text-pr-text-2">Promo Points Earned</div>
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
                            { q: "How many shares can I earn per content?", a: "It depends on your engagement level and timing. Early engagers can earn up to 100 shares per piece of content. The share pool is distributed based on total engagement." },
                            { q: "When do I get paid out?", a: "Payouts happen when content hits its performance milestones (e.g., 10k views, 50k views, 100k views). Each milestone triggers a payout to all shareholders." },
                            { q: "Can I lose my shares?", a: "No. Once you've earned shares, they're yours. You can only gain more, never lose them." },
                            { q: "Is this like NFTs?", a: "Not exactly. Content Shares are simpler — you earn a percentage of the performance pool, not a unique token. There's no trading or speculation involved." }
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
                headline="Ready to earn from content you believe in?"
                subheadline="Start building your Content Shares portfolio today."
                ctaText="Get Started Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Learn More", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
