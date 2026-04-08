import { ShieldCheck, Target, Activity, FileText, Heart, Sparkles, Zap } from 'lucide-react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';

const SuccessStandard = () => {
    return (
        <div className="min-h-screen bg-[#0A0714] font-sans">
            <SEO
                title="The Presence Standard | Promorang"
                description="Our standard for what it means to be present. A framework for preservation, recognition, and meaning."
                canonicalUrl="https://promorang.co/success-standard"
            />
            <MarketingNav />

            <div className="max-w-4xl mx-auto px-4 pt-32 pb-24">
                {/* Header */}
                <div className="mb-20 border-b border-white/5 pb-20 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400/80">The Presence Standard v3.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">Preserving <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 italic">your story.</span></h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 leading-relaxed max-w-2xl font-medium">
                        Promorang is built on the belief that where you go and what you do matters. Our standard ensures that your experiences are preserved with dignity, acknowledged with gratitude, and remembered forever.
                    </p>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group">
                        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 mb-8 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                            <Activity className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Proven Presence</h3>
                        <p className="text-lg text-pr-text-2 leading-relaxed">
                            It’s not about tracking movements. It’s about honoring the moments where you were truly there. Every record is a verified line in your personal history.
                        </p>
                    </div>

                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group">
                        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 mb-8 border border-rose-500/10 group-hover:scale-110 transition-transform">
                            <Heart className="w-7 h-7 text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Quiet Recognition</h3>
                        <p className="text-lg text-pr-text-2 leading-relaxed">
                            We’ve removed the noise of social competition. Recognition on Promorang is about the direct connection between you and the creators you support.
                        </p>
                    </div>
                </div>

                {/* The Guidance */}
                <div className="space-y-24">
                    <section>
                        <h2 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                            <Sparkles className="w-8 h-8 text-amber-400" />
                            How We Measure Meaning
                        </h2>
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            <p className="text-xl text-pr-text-2 mb-12 leading-relaxed font-medium">
                                Traditionally, value is measured by attention. On Promorang, value is measured by presence. Here is how we ensure your moments count:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                                    <h4 className="font-bold text-white text-lg mb-3">Authenticity</h4>
                                    <p className="text-sm text-pr-text-muted leading-relaxed">Moments are verified through location, time, and unique access codes to ensure they’re real.</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                                    <h4 className="font-bold text-white text-lg mb-3">Reciprocity</h4>
                                    <p className="text-sm text-pr-text-muted leading-relaxed">When you show up, brands and creators acknowledge your presence with real-world appreciation.</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                                    <h4 className="font-bold text-white text-lg mb-3">Longevity</h4>
                                    <p className="text-sm text-pr-text-muted leading-relaxed">Unlike a feed, your history doesn’t disappear. It builds depth and value over time.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-[#100C24] to-[#0A0714] border border-white/10 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Zap className="w-64 h-64 text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">The Professional Commitment</h2>
                            <p className="text-pr-text-2 text-lg mb-12 max-w-xl leading-relaxed font-medium">
                                We are committed to a results-oriented environment where integrity is the only currency. No social noise, no fake incentives — just real value for real people.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-10 border-t border-white/5">
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">0%</div>
                                    <div className="text-xs uppercase font-bold text-pr-text-muted tracking-[0.3em]">Performative Noise</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">100%</div>
                                    <div className="text-xs uppercase font-bold text-pr-text-muted tracking-[0.3em]">Verified History</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">VITAL</div>
                                    <div className="text-xs uppercase font-bold text-pr-text-muted tracking-[0.3em]">Mutual Flourishing</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <MarketingFooter />
        </div>
    );
};

export default SuccessStandard;
