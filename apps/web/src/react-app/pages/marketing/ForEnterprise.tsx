import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Building2, Users, DollarSign, TrendingUp, Star, Shield, Award, BarChart3, Share2, Zap } from 'lucide-react';

export default function ForEnterprise() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-slate-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-pr-text-1">Corporate & Enterprise</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Engage Employees. <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-blue-500">Amplify Your Brand.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang helps enterprises build employee advocacy programs using <strong>Content Drops</strong>, <strong>Referral Campaigns</strong>, and <strong>Reward Challenges</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/contact" className="px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20">
                            Request a Demo
                        </a>
                        <a href="/pricing" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-red-500">Enterprise Engagement</span> Challenge
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { problem: "Low employee advocacy participation", solution: "Reward Challenges gamify sharing — employees earn Promo Points for authentic engagement.", icon: Users },
                            { problem: "Difficulty measuring internal campaign ROI", solution: "Full attribution: see which employees drive the most reach, clicks, and conversions.", icon: BarChart3 },
                            { problem: "Brand messaging feels inauthentic externally", solution: "Content Drops give employees pre-approved content they can personalize and share.", icon: Award }
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
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-blue-500">Promorang</span> Works for Enterprises
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to activate your workforce as brand ambassadors.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Content Drops",
                                desc: "HR/Marketing creates pre-approved content. Employees claim and share to their networks, earning Promo Points.",
                                example: "\"Share our product launch post, earn 50 points!\""
                            },
                            {
                                icon: Share2,
                                title: "Referral Campaigns",
                                desc: "Employees share job openings with their networks. For every successful hire, both referrer and new hire earn rewards.",
                                example: "\"Refer an engineer, earn $1,000 bonus!\""
                            },
                            {
                                icon: Zap,
                                title: "Reward Challenges",
                                desc: "Gamified campaigns with leaderboards. Top advocates earn prizes, recognition, and Promo Points.",
                                example: "\"Top 10 sharers get a paid day off!\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-blue-500" />
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
                            { icon: Building2, title: "Onboard Your Org", desc: "HR invites employees to the advocacy program." },
                            { icon: Shield, title: "Create Content Drops", desc: "Marketing uploads pre-approved content." },
                            { icon: TrendingUp, title: "Employees Share", desc: "They share to their networks, earning points." },
                            { icon: DollarSign, title: "Measure & Reward", desc: "Track reach, engagement, and ROI. Reward top advocates." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="text-sm text-blue-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
                        "Promorang helped us increase qualified job applicants by 60% through employee referrals and Content Drops. Our employer brand has never been stronger."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">MP</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">Michael Patel</div>
                            <div className="text-sm text-pr-text-2">Chief People Officer, Nexus Corp</div>
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
                            { value: "60%", label: "More Applicants" },
                            { value: "8x", label: "Social Reach" },
                            { value: "45%", label: "Employee Participation" },
                            { value: "3.2x", label: "ROI on Advocacy" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-blue-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to unlock your workforce's potential?"
                subheadline="Join enterprises using Promorang to build authentic employee advocacy."
                ctaText="Request a Demo"
                ctaLink="/contact"
                secondaryCta={{ text: "View Pricing", link: "/pricing" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
