import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { CalendarDays, Users, DollarSign, TrendingUp, Star, Share2, Ticket, Megaphone, Gift, Zap } from 'lucide-react';

export default function ForEvents() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-pink-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-rose-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <CalendarDays className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium text-pr-text-1">Events & Festivals</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Sell Out Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Next Event</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang helps event organizers drive ticket sales using <strong>Referral Campaigns</strong>, <strong>Early Bird Drops</strong>, and <strong>Ambassador Rewards</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-pink-500/20">
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
                            The <span className="text-red-500">Event Promotion</span> Struggle
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { problem: "Paid ads are noisy and expensive", solution: "Referral Campaigns let attendees promote for you — pay only when tickets sell.", icon: DollarSign },
                            { problem: "Hard to create pre-event buzz", solution: "Early Bird Drops create urgency with limited-time offers that spread virally.", icon: Megaphone },
                            { problem: "Lost tickets and low conversions", solution: "Track every share and attribute every sale with Promorang analytics.", icon: Ticket }
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
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Promorang</span> Works for Events
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to sell out your event and build hype.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Share2,
                                title: "Referral Campaigns",
                                desc: "Ticket buyers get a unique referral link. For every friend who buys, they earn Promo Points or ticket credits.",
                                example: "\"Refer 3 friends, get VIP upgrade free!\""
                            },
                            {
                                icon: Gift,
                                title: "Early Bird Drops",
                                desc: "Create limited-time ticket offers that attendees can claim and share. First 100 get 50% off, etc.",
                                example: "\"Flash sale: First 50 tickets at $25!\""
                            },
                            {
                                icon: Zap,
                                title: "Ambassador Rewards",
                                desc: "Recruit superfans as ambassadors. They earn Promo Points for every ticket sold through their link.",
                                example: "\"Top ambassadors get backstage passes!\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-pink-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-pink-500" />
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
                            { icon: Users, title: "Sign Up Free", desc: "Create your event profile in minutes." },
                            { icon: Ticket, title: "Launch a Campaign", desc: "Set up referral rewards or an Early Bird Drop." },
                            { icon: Share2, title: "Attendees Share", desc: "They spread the word, their friends buy tickets." },
                            { icon: TrendingUp, title: "Track & Sell Out", desc: "Watch ticket sales climb in real time." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-pink-500" />
                                </div>
                                <div className="text-sm text-pink-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
                        "Our festival sold out 3 weeks early thanks to Promorang Referral Campaigns. Attendees earned free merch for sharing, and we saved thousands on ad spend."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold">RT</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">Ryan Thompson</div>
                            <div className="text-sm text-pr-text-2">Founder, SoundWave Festival</div>
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
                            { value: "3 Weeks", label: "Early Sellout" },
                            { value: "60%", label: "Lower Ad Spend" },
                            { value: "15k+", label: "Shares Generated" },
                            { value: "4.1x", label: "ROI on Referrals" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to sell out your next event?"
                subheadline="Join event organizers using Promorang to drive ticket sales through community."
                ctaText="Start Free"
                ctaLink="/auth"
                secondaryCta={{ text: "Book a Demo", link: "/contact" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
