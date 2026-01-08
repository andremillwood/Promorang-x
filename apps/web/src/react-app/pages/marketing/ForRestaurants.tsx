import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Utensils, Users, DollarSign, TrendingUp, Star, Camera, Repeat, Award, Gift, Share2, Zap } from 'lucide-react';

export default function ForRestaurants() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-orange-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <Utensils className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-pr-text-1">Restaurants & F&B</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Fill Tables With <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Loyal Customers</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang helps restaurants turn diners into advocates using <strong>Drops</strong>, <strong>Coupons</strong>, and <strong>Referral Rewards</strong> — all from one platform.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-orange-500/20">
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
                            The <span className="text-red-500">Restaurant Marketing</span> Struggle
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Delivery apps take 30%. Social ads are expensive. And traditional loyalty programs are forgettable.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { problem: "Third-party delivery fees eating margins", solution: "Drops let you reward direct orders — customers claim in-app, you keep 100% of the sale.", icon: DollarSign },
                            { problem: "Struggling to get authentic reviews", solution: "Incentivize real diner stories and photos with Promo Points they can spend on their next visit.", icon: Star },
                            { problem: "Low repeat customer rate", solution: "Referral Rewards give your diners a reason to bring friends — and get rewarded when they do.", icon: Repeat }
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

            {/* How Promorang Works for Restaurants */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Promorang</span> Works for Restaurants
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to drive foot traffic, loyalty, and word-of-mouth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Gift,
                                title: "Drops",
                                desc: "Create time-limited offers (free appetizer, 20% off) that customers claim via the app. Drive urgency and foot traffic.",
                                example: "\"Free dessert with any entrée — today only!\""
                            },
                            {
                                icon: Zap,
                                title: "Coupons",
                                desc: "Issue digital coupons that customers redeem at checkout. Track every redemption and measure ROI.",
                                example: "\"$5 off your next order — valid 7 days.\""
                            },
                            {
                                icon: Share2,
                                title: "Referral Rewards",
                                desc: "Diners share a unique link with friends. When a friend visits, both earn Promo Points redeemable for your menu items.",
                                example: "\"Refer a friend, both get a free drink!\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-orange-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-orange-500" />
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

            {/* Step-by-Step */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Get Started in 4 Steps</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Users, title: "Sign Up Free", desc: "Create your restaurant profile in under 2 minutes." },
                            { icon: Gift, title: "Create a Drop", desc: "Set up your first offer — a discount, freebie, or exclusive deal." },
                            { icon: Camera, title: "Customers Claim", desc: "Diners see your Drop in the app and claim it to redeem in-store." },
                            { icon: TrendingUp, title: "Track & Grow", desc: "See real-time analytics on claims, visits, and referrals." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="text-sm text-orange-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
                        "We reduced our delivery app dependency by 40% by driving direct orders through Promorang Drops. Our regulars love earning Promo Points for referrals."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">DL</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">David Lee</div>
                            <div className="text-sm text-pr-text-2">Owner, The Spice Kitchen</div>
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
                            { value: "40%", label: "Fewer Delivery Fees" },
                            { value: "2.5x", label: "More Reviews" },
                            { value: "28%", label: "Repeat Visit Increase" },
                            { value: "5k+", label: "Food Photos Shared" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Start free. Upgrade as you grow. No hidden fees.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 text-left">
                            <div className="text-2xl font-bold text-pr-text-1 mb-2">Starter</div>
                            <div className="text-4xl font-extrabold text-pr-text-1 mb-4">Free</div>
                            <ul className="space-y-3 text-pr-text-2 text-sm mb-6">
                                <li>✓ Up to 3 active Drops</li>
                                <li>✓ Basic analytics</li>
                                <li>✓ Referral tracking</li>
                                <li>✓ Community support</li>
                            </ul>
                            <a href="/auth" className="block w-full py-3 text-center bg-pr-surface-2 hover:bg-pr-surface-3 text-pr-text-1 rounded-lg font-semibold transition-colors">
                                Get Started Free
                            </a>
                        </div>
                        <div className="bg-pr-surface-card border-2 border-orange-500 rounded-2xl p-8 text-left relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                            <div className="text-2xl font-bold text-pr-text-1 mb-2">Professional</div>
                            <div className="text-4xl font-extrabold text-pr-text-1 mb-4">$29<span className="text-lg text-pr-text-2">/mo</span></div>
                            <ul className="space-y-3 text-pr-text-2 text-sm mb-6">
                                <li>✓ Unlimited Drops</li>
                                <li>✓ Advanced analytics</li>
                                <li>✓ Priority support</li>
                                <li>✓ Custom branding</li>
                            </ul>
                            <a href="/auth" className="block w-full py-3 text-center bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all">
                                Start Free Trial
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to turn diners into advocates?"
                subheadline="Join restaurants using Promorang to grow their customer base organically."
                ctaText="Start Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Book a Demo", link: "/contact" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
