import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { ShoppingBag, Users, DollarSign, TrendingUp, Star, Share2, Package, Repeat, Gift, Zap } from 'lucide-react';

export default function ForEcommerce() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-green-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <ShoppingBag className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-pr-text-1">E-commerce & DTC</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Scale With <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Customer Advocacy</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang turns your happiest customers into a scalable acquisition channel using <strong>Post-Purchase Drops</strong>, <strong>Referral Rewards</strong>, and <strong>Loyalty Coupons</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-green-500/20">
                            Start Free
                        </a>
                        <a href="/contact" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            Book a Demo
                        </a>
                    </div>

                    <p className="mt-6 text-sm text-pr-text-muted">No credit card required. Free tier available.</p>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-red-500">E-commerce Growth</span> Problem
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { problem: "CAC is unsustainable (paid ads keep rising)", solution: "Post-Purchase Drops trigger customers to share after buying — organic reach at a fraction of the cost.", icon: DollarSign },
                            { problem: "Low conversion on influencer campaigns", solution: "Activate real customers who genuinely love your products with Promo Points they can spend on their next order.", icon: TrendingUp },
                            { problem: "Hard to build loyalty in a crowded market", solution: "Referral Rewards create a community of advocates who earn when their friends buy.", icon: Repeat }
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="text-red-500 font-bold mb-2">The Problem</div>
                                <p className="text-pr-text-2 mb-6">{item.problem}</p>
                                <div className="text-green-500 font-bold mb-2">The Promorang Way</div>
                                <p className="text-pr-text-1 font-medium">{item.solution}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How Promorang Works */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Promorang</span> Works for E-commerce
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to reduce CAC, increase LTV, and build brand loyalty.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Package,
                                title: "Post-Purchase Drops",
                                desc: "After checkout, customers are invited to share their purchase on social for Promo Points. Automatic, frictionless UGC.",
                                example: "\"Share your unboxing, earn $10 credit!\""
                            },
                            {
                                icon: Share2,
                                title: "Referral Rewards",
                                desc: "Every customer gets a unique referral link. When a friend buys, both earn credits toward their next purchase.",
                                example: "\"Give $15, Get $15 — for every friend who orders.\""
                            },
                            {
                                icon: Gift,
                                title: "Loyalty Coupons",
                                desc: "Issue digital coupons for repeat purchases. Track redemptions and measure ROI in real time.",
                                example: "\"Thanks for your 3rd order! Here's 20% off your next.\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-green-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{tool.title}</h3>
                                <p className="text-pr-text-2 mb-6 leading-relaxed">{tool.desc}</p>
                                <div className="bg-pr-surface-2 p-4 rounded-lg text-sm text-pr-text-1 italic">
                                    {tool.example}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Works With Your Stack */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-pr-text-1 mb-12">Works With Your Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 hover:opacity-100 transition-opacity">
                        {[
                            { name: 'Shopify', color: 'text-[#95bf47]' },
                            { name: 'WooCommerce', color: 'text-[#96588a]' },
                            { name: 'Etsy', color: 'text-[#f1641e]' },
                            { name: 'BigCommerce', color: 'text-[#34313f]' }
                        ].map((p) => (
                            <div key={p.name} className="flex flex-col items-center gap-4 group">
                                <div className={`h-16 w-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                                    {p.name === 'Shopify' && '🛍️'}
                                    {p.name === 'WooCommerce' && '🛒'}
                                    {p.name === 'Etsy' && '🧶'}
                                    {p.name === 'BigCommerce' && '📦'}
                                </div>
                                <span className={`font-bold ${p.color}`}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Step-by-Step */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Get Started in 4 Steps</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: "Link Your Store", desc: "One-click connection for Shopify, WooCommerce, and more." },
                            { icon: ShoppingBag, title: "Import Products", desc: "Sync your catalog instantly with zero manual entry." },
                            { icon: Share2, title: "Launch Drops", desc: "Create a post-purchase sharing incentive." },
                            { icon: TrendingUp, title: "Track & Grow", desc: "See CAC drop and LTV rise in real time." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="text-sm text-green-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-2">{step.title}</h3>
                                <p className="text-pr-text-2 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                        ))}
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-medium text-pr-text-1 mb-8 leading-relaxed">
                        "Promorang cut our CAC by 45% and increased repeat purchases by 30%. Post-Purchase Drops are the best ROI we've seen on any marketing channel."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">AM</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">Aisha Mohammed</div>
                            <div className="text-sm text-pr-text-2">Founder, Glow Essentials</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Results That Matter</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "45%", label: "Lower CAC" },
                            { value: "30%", label: "More Repeat Purchases" },
                            { value: "8k+", label: "Customer Shares" },
                            { value: "3.5x", label: "ROI on Referrals" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to grow with your customers?"
                subheadline="Join e-commerce brands using Promorang to build sustainable growth."
                ctaText="Start Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Book a Demo", link: "/contact" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
