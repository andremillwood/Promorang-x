import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Target, Zap, Users, ShieldCheck, Heart, Sparkles, Store } from 'lucide-react';
import SEO from '@/react-app/components/SEO';

export default function ForAdvertisers() {
    return (
        <div className="min-h-screen-dynamic bg-[#0A0714] font-sans">
            <SEO
                title="Promorang for Brands & Destinations | Moments that Matter"
                description="Host moments that drive real-world participation. Connect with your community where they already are."
                canonicalUrl="https://promorang.co/advertisers"
            />
            <MarketingNav />

            <PersonaHero
                headline="When moments matter to your business."
                subheadline="Promorang transforms your brand into a destination. Host moments that welcome people in, reward participation, and create memories that last."
                ctaText="Host Your First Moment"
                ctaLink="/advertiser/onboarding"
                stats={[
                    { value: 'Verified', label: 'Identity History' },
                    { value: 'Zero', label: 'Ad Fraud' },
                    { value: 'Permanent', label: 'Presence Record' },
                    { value: '100%', label: 'Human Resonance' },
                ]}
                backgroundGradient="from-indigo-900/40 to-[#0A0714]"
                icon={<Store className="w-12 h-12 text-indigo-400" />}
            />

            {/* The Retention Bridge: Identity vs Transaction */}
            <section className="py-24 bg-[#0A0714] border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                From <span className="text-zinc-600">Transactional Churn</span> to <span className="text-indigo-400">Verified History.</span>
                            </h2>
                            <p className="text-xl text-pr-text-2 leading-relaxed font-medium">
                                Groupon brings you bargain hunters who leave. Promorang builds your brand into the user's permanent identity canon.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">The Churn Loop (Traditional Deals)</h4>
                                        <p className="text-sm text-pr-text-2">One-time discounts attract platform-hoppers with no long-term memory of your brand.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                                        <Check className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">The Canon Loop (Promorang)</h4>
                                        <p className="text-sm text-pr-text-2">Every voucher is an official acknowledgment that lives in the user's history forever.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] opacity-20" />
                            <div className="relative bg-[#130F1E] border border-white/10 rounded-[3rem] p-8 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Issuer Perspective</div>
                                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-indigo-500" />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-white/40 uppercase">
                                            <span>Canon Entries Generated</span>
                                            <span>742 Moments</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-2xl font-black text-white">92%</p>
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Memory Retention</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-2xl font-black text-white">12x</p>
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Life Value (LTV)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Benefits - Human Focused */}
            <section className="py-24 bg-[#0A0714]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <Heart className="w-10 h-10 text-rose-400" />,
                                title: "True Community",
                                description: "Connect with real people who genuinely care about what you build. No bots, no noise, just presence.",
                            },
                            {
                                icon: <Sparkles className="w-10 h-10 text-amber-400" />,
                                title: "Verified Resonance",
                                description: "Understand what truly resonated by seeing who showed up and what they shared about the experience.",
                            },
                            {
                                icon: <ShieldCheck className="w-10 h-10 text-indigo-400" />,
                                title: "Mutual Trust",
                                description: "Build deep loyalty by rewarding intentional engagement fairly and simply, without gimmicks.",
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="text-center group">
                                <div className="mb-8 mx-auto w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4">{benefit.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed font-medium">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recognition Showcase (Groupon Premium Voucher Style) */}
            <section className="py-32 bg-[#0F0C1E] border-t border-white/5 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">The Appreciation Bridge</h2>
                            <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">Gifts, not transactions.</h3>
                            <p className="text-xl text-pr-text-2 leading-relaxed font-medium mb-10">
                                Every moment your brand hosts is an opportunity to leave a lasting impression. We turn "marketing spend" into tangible recognition that users treasure.
                            </p>
                            <div className="flex items-center gap-4 text-indigo-400 font-black uppercase tracking-[0.2em] text-sm">
                                <ShieldCheck className="w-5 h-5" />
                                Verified Presence Recognition
                            </div>
                        </div>

                        <div className="relative group">
                            {/* Visual representation of the Recognition Vouchers established in Wallet.tsx */}
                            <div className="bg-[#130F1E] border border-white/10 rounded-[3rem] p-12 relative shadow-2xl hover:border-indigo-500/30 transition-all duration-300">
                                <div className="absolute top-1/2 -left-6 w-12 h-12 rounded-full bg-[#0F0C1E] border-r border-white/10" />
                                <div className="absolute top-1/2 -right-6 w-12 h-12 rounded-full bg-[#0F0C1E] border-l border-white/10" />

                                <div className="text-center space-y-6">
                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-4">Official Brand Recognition</div>
                                    <div className="w-24 h-24 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/5 shadow-2xl mb-8">
                                        <Store className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <div className="h-[2px] w-full border-t-2 border-dashed border-white/5 my-10" />
                                    <div className="text-5xl font-black text-white tracking-tighter">PREMIUM ACCESS</div>
                                    <div className="text-sm font-black text-indigo-300 uppercase tracking-[0.3em]">Exclusive Brand Invitation</div>

                                    <div className="pt-10 flex justify-center">
                                        <div className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20">
                                            Claim Recognition
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Welcome Your Community"
                subheadline="Host your first moment and start connecting where it matters most."
                ctaText="Get Started"
                ctaLink="/advertiser/onboarding"
                secondaryCta={{ text: "See Examples", link: '/today' }}
            />

            <MarketingFooter />
        </div>
    );
}
