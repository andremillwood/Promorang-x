import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Plane, Users, DollarSign, TrendingUp, Star, Globe, Camera, Gift, Share2, Award } from 'lucide-react';

export default function ForTourism() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <Plane className="w-5 h-5 text-cyan-500" />
                        <span className="text-sm font-medium text-pr-text-1">Tourism & Hospitality</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Turn Guests Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Brand Ambassadors</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang helps hotels, resorts, and tour operators drive bookings using <strong>Ambassador Campaigns</strong>, <strong>Referral Rewards</strong>, and <strong>UGC Drops</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20">
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
                            The <span className="text-red-500">Tourism Marketing</span> Challenge
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            OTA commissions are brutal. Ad costs keep rising. And guests trust peer recommendations 10x more than ads.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                problem: "High OTA commissions eating into margins",
                                solution: "Ambassador Campaigns let guests promote your property and earn Promo Points — driving direct bookings.",
                                icon: DollarSign
                            },
                            {
                                problem: "Reviews feel forced and inauthentic",
                                solution: "UGC Drops incentivize guests to share real vacation photos in exchange for rewards.",
                                icon: Star
                            },
                            {
                                problem: "Seasonal demand volatility",
                                solution: "Year-round Referral Rewards keep past guests engaged and bringing new travelers.",
                                icon: TrendingUp
                            }
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

            {/* How Promorang Works for Tourism */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Promorang</span> Works for Tourism
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to drive bookings, reviews, and repeat visits.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Award,
                                title: "Ambassador Campaigns",
                                desc: "Turn satisfied guests into advocates. They share their experience with friends and earn Promo Points for every referral that books.",
                                example: "\"Refer a friend, earn a free night!\""
                            },
                            {
                                icon: Camera,
                                title: "UGC Drops",
                                desc: "Create photo/video challenges. Guests share their vacation content with branded hashtags and unlock rewards.",
                                example: "\"Share your sunset photo, get $20 spa credit!\""
                            },
                            {
                                icon: Share2,
                                title: "Referral Rewards",
                                desc: "Past guests share a unique link. When a friend books, both earn credits redeemable on their next stay.",
                                example: "\"Both you and your friend get 15% off!\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-cyan-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-cyan-500" />
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
                            { icon: Users, title: "Sign Up Free", desc: "Create your property profile in under 2 minutes." },
                            { icon: Gift, title: "Launch a Campaign", desc: "Set up an Ambassador Campaign or UGC Drop." },
                            { icon: Globe, title: "Guests Participate", desc: "Guests share, refer, and earn Promo Points." },
                            { icon: TrendingUp, title: "Track & Optimize", desc: "See real-time analytics on referrals and bookings." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-cyan-500" />
                                </div>
                                <div className="text-sm text-cyan-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
                        "Promorang helped us increase direct bookings by 35% in our first season. Our guests love earning Promo Points for sharing their vacation photos."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">JM</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">Jessica Martinez</div>
                            <div className="text-sm text-pr-text-2">Marketing Director, Sunset Beach Resort</div>
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
                            { value: "35%", label: "Increase in Bookings" },
                            { value: "4.2x", label: "ROI on Marketing Spend" },
                            { value: "12k+", label: "User-Generated Posts" },
                            { value: "89%", label: "Guest Satisfaction" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to transform your guests into advocates?"
                subheadline="Join leading hotels and resorts using Promorang to drive authentic growth."
                ctaText="Start Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Book a Demo", link: "/contact" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
