import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Users, ShieldCheck, Heart, Sparkles, CheckCircle, ArrowRight, Zap, Star } from 'lucide-react';

export default function ReferralProgramPage() {
    return (
        <div className="min-h-screen-dynamic bg-[#0A0714] font-sans">
            <SEO
                title="Grow the Circle | Sharing the Moment"
                description="Invite others to join the circle of presence. Share the magic of Promorang and grow together."
                canonicalUrl="https://promorang.co/grow-the-circle"
            />
            <MarketingNav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[#0A0714]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1)_0%,transparent_50%)]" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-5 py-2 rounded-full mb-10">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Building the Movement</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-8 leading-tight">
                        Grow the circle of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 italic">
                            those who notice.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        Promorang is better when we’re all here. Invite the creators, brands, and people you care about to join the circle, and share in the value of every moment they create.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="/auth" className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 text-lg">
                            Send an Invitation <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/how-it-works" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-bold hover:bg-white/10 transition-all text-lg">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Core Idea: From Referral to Invitation */}
            <section className="py-24 bg-[#0F0C1E] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-4 text-center mb-20">
                    <h2 className="text-4xl font-black text-white mb-6">Shared Value, Always.</h2>
                    <p className="text-xl text-pr-text-2 max-w-3xl mx-auto font-medium">
                        This isn’t just a referral link. It’s an invitation to a different way of being online.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                step: '1',
                                icon: Heart,
                                title: 'Invite with Purpose',
                                description: 'Bring in the people who are already creating real-world value. The curators, the hosts, and the intentional participators.',
                            },
                            {
                                step: '2',
                                icon: Zap,
                                title: 'Enter Together',
                                description: 'As they join moments and build their own history, your circle grows stronger and more resonant.',
                            },
                            {
                                step: '3',
                                icon: Star,
                                title: 'Shared Appreciation',
                                description: "When your circle flourishes, you share in the acknowledgement. A mutual path toward growth and recognition.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all group">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg group-hover:rotate-6 transition-transform">
                                    {item.step}
                                </div>
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed text-lg font-medium">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievement Tiers: Reframed as Role */}
            <section className="py-24 bg-[#0A0714]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-white mb-6">Your Role in the Circle</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto font-medium">
                            The more you contribute to the movement, the deeper your impact becomes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                tier: 'Supporter',
                                icon: Sparkles,
                                color: 'border-orange-500/20 text-orange-400',
                                partners: '1-10',
                                share: '5% Appreciation',
                                perks: ['Circle access', 'Basic history'],
                            },
                            {
                                tier: 'Builder',
                                icon: Zap,
                                color: 'border-rose-500/20 text-rose-400',
                                partners: '11-50',
                                share: '5% + Bonuses',
                                perks: ['Priority recognition', 'Extended memories'],
                            },
                            {
                                tier: 'Steward',
                                icon: ShieldCheck,
                                color: 'border-indigo-500/20 text-indigo-400',
                                partners: '50+',
                                share: 'Legacy Share',
                                perks: ['Network influence', 'Direct support'],
                            },
                        ].map((tier, i) => (
                            <div key={i} className={`relative group`}>
                                {/* Groupon-style Digital Voucher Card */}
                                <div className={`bg-[#130F1E] border ${tier.color.split(' ')[0]} rounded-[3rem] p-12 relative shadow-2xl transition-all duration-300 group-hover:shadow-indigo-500/10`}>
                                    <div className="absolute top-1/2 -left-6 w-12 h-12 rounded-full bg-[#0A0714] border-r border-white/10" />
                                    <div className="absolute top-1/2 -right-6 w-12 h-12 rounded-full bg-[#0A0714] border-l border-white/10" />

                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center border border-white/5 mb-8 group-hover:scale-110 transition-transform">
                                            <tier.icon className={`w-8 h-8 ${tier.color.split(' ')[1]}`} />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{tier.tier}</h3>
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">{tier.partners} in your circle</div>

                                        <div className="h-[2px] w-full border-t-2 border-dashed border-white/5 my-10" />

                                        <div className={`text-2xl font-black ${tier.color.split(' ')[1]} mb-10`}>{tier.share}</div>

                                        <ul className="space-y-4 text-left">
                                            {tier.perks.map((perk, j) => (
                                                <li key={j} className="flex items-center gap-3 text-sm text-pr-text-2 font-bold">
                                                    <CheckCircle className={`w-4 h-4 ${tier.color.split(' ')[1]} opacity-50`} />
                                                    {perk}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Invite Someone special."
                subheadline="Life is made of moments. Share the magic with the people who make them happen."
                ctaText="Start Inviting"
                ctaLink="/auth"
                secondaryCta={{ text: "The Standard", link: "/how-it-works" }}
            />

            <MarketingFooter />
        </div>
    );
}
