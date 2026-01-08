import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { GraduationCap, Users, DollarSign, TrendingUp, Star, Megaphone, Gift, Sparkles, Share2, Zap } from 'lucide-react';

export default function ForUniversities() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8">
                        <GraduationCap className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-pr-text-1">Universities & Students</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        Activate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Campus Culture</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Promorang helps universities engage students using <strong>Campus Challenges</strong>, <strong>Referral Rewards</strong>, and <strong>Event Drops</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/contact" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20">
                            Partner With Us
                        </a>
                        <a href="/how-it-works" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            The <span className="text-red-500">Campus Engagement</span> Gap
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { problem: "Low event attendance and participation", solution: "Campus Challenges reward students with Promo Points for attending events and engaging.", icon: Megaphone },
                            { problem: "Hard to reach Gen Z with traditional marketing", solution: "Peer-to-peer amplification through Referral Rewards — students share with friends.", icon: Users },
                            { problem: "Student organizations struggle with funding", solution: "Revenue share for student-led ambassador programs. Orgs earn as they promote.", icon: DollarSign }
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
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Promorang</span> Works on Campus
                        </h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Three core tools to drive student engagement and campus buzz.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Campus Challenges",
                                desc: "Create gamified challenges for students: attend an event, post a photo, refer a friend. Earn Promo Points for each action.",
                                example: "\"Check in at the career fair, earn 100 points!\""
                            },
                            {
                                icon: Gift,
                                title: "Event Drops",
                                desc: "Promote campus events with limited-time Drops. First 50 sign-ups get a free t-shirt, etc.",
                                example: "\"RSVP to the spring concert, get $10 food voucher!\""
                            },
                            {
                                icon: Share2,
                                title: "Referral Rewards",
                                desc: "Students share a unique link with prospective students or friends. Both earn rewards when they engage.",
                                example: "\"Refer a prospective student, both get campus swag!\""
                            }
                        ].map((tool, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
                                <div className="w-16 h-16 bg-pr-surface-2 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-8 h-8 text-purple-500" />
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
                            { icon: Users, title: "Partner With Us", desc: "University admins set up the campus program." },
                            { icon: Sparkles, title: "Launch Challenges", desc: "Create Campus Challenges and Event Drops." },
                            { icon: Gift, title: "Students Engage", desc: "They complete challenges and earn Promo Points." },
                            { icon: TrendingUp, title: "Track Impact", desc: "See engagement, attendance, and ROI in real time." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-8 h-8 text-purple-500" />
                                </div>
                                <div className="text-sm text-purple-500 font-bold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
                        "Promorang helped us triple attendance at our spring career fair by incentivizing students to share the event with their networks. Campus Challenges are a game-changer."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">KW</div>
                        <div className="text-left">
                            <div className="font-bold text-pr-text-1">Karen Washington</div>
                            <div className="text-sm text-pr-text-2">Director of Student Affairs, State University</div>
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
                            { value: "3x", label: "Event Attendance" },
                            { value: "75%", label: "Student Participation" },
                            { value: "10k+", label: "Challenges Completed" },
                            { value: "2.8x", label: "ROI on Engagement" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-pr-surface-card border border-pr-border rounded-2xl">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to energize your campus?"
                subheadline="Partner with Promorang to build a thriving student community."
                ctaText="Partner With Us"
                ctaLink="/contact"
                secondaryCta={{ text: "Learn More", link: "/how-it-works" }}
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
