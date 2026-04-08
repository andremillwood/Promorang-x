import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import {
    ShieldCheck,
    Zap,
    ScanLine,
    MapPin,
    Globe,
    ShoppingBag,
    Lock,
    Sparkles,
    Diamond
} from 'lucide-react';
import SEO from '@/react-app/components/SEO';

export default function HowItWorks() {
    return (
        <div className="min-h-screen-dynamic bg-[#0A0714] font-sans">
            <SEO
                title="How Promorang Works | Preserving Moments"
                description="Promorang is where moments live on. Join moments, share what they meant, and build a history that matters."
                canonicalUrl="https://promorang.co/how-it-works"
            />
            <MarketingNav />

            {/* HERO: Preserving Moments */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[#0A0714]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1)_0%,transparent_50%)]" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-8 leading-tight">
                        How it works — for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 italic">moments that matter.</span>
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto leading-relaxed font-medium">
                        Promorang isn’t about metrics or algorithms. It’s about being there. We help you hold onto real-world experiences and turn them into a story that lasts.
                    </p>
                </div>
            </section>

            {/* PROCESS: Join. Share. Remember. (Airbnb Visual Journey) */}
            <section className="py-32 bg-[#0F0C1E] border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden md:block" />

                <div className="max-w-6xl mx-auto px-6 text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">The Moment Loop</h2>
                    <p className="text-xl text-pr-text-2 font-medium max-w-2xl mx-auto">A human path from presence to preservation. Simple, intentional, and real.</p>
                </div>

                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-24 relative">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 mb-12 shadow-2xl relative">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C1E] to-transparent" />
                                <div className="absolute top-10 left-10 w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center border border-orange-500/20 backdrop-blur-md">
                                    <ScanLine className="w-8 h-8 text-orange-400" />
                                </div>
                                <div className="absolute bottom-10 left-10">
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] mb-2 block">Step 01</span>
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Join Gently</h3>
                                </div>
                            </div>
                            <p className="text-lg text-pr-text-2 leading-relaxed font-medium">Find a moment near you or online. Scan or enter a code to let the world know you were there. No performance required.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 mb-12 shadow-2xl relative">
                                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C1E] to-transparent" />
                                <div className="absolute top-10 left-10 w-16 h-16 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center border border-rose-500/20 backdrop-blur-md">
                                    <Zap className="w-8 h-8 text-rose-400" />
                                </div>
                                <div className="absolute bottom-10 left-10">
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-2 block">Step 02</span>
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Share Meaning</h3>
                                </div>
                            </div>
                            <p className="text-lg text-pr-text-2 leading-relaxed font-medium">Attach a photo or a thought to the moment. Not for followers, but for the record of your story. Verified by presence.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 mb-12 shadow-2xl relative">
                                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C1E] to-transparent" />
                                <div className="absolute top-10 left-10 w-16 h-16 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/20 backdrop-blur-md">
                                    <Lock className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div className="absolute bottom-10 left-10">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 block">Step 03</span>
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Save Forever</h3>
                                </div>
                            </div>
                            <p className="text-lg text-pr-text-2 leading-relaxed font-medium">The moment is indexed in your private history and unlocks appreciation from those who created it. Forever yours.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MOMENT VARIETY */}
            <section className="py-24 bg-[#0A0714]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-4">A Place for Every Moment</h2>
                        <p className="text-xl text-pr-text-2 font-medium">Whether in the physical world or the digital one, Promorang brings it together.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Pop-ups & Events', icon: <MapPin className="text-blue-400" />, desc: 'Physical activations verified by your location.' },
                            { name: 'Digital Releases', icon: <Globe className="text-indigo-400" />, desc: 'Exclusive launches and drops verified by access codes.' },
                            { name: 'Community Meetups', icon: <Sparkles className="text-emerald-400" />, desc: 'Gatherings with friends and fellow creators.' },
                            { name: 'Brand Challenges', icon: <Diamond className="text-rose-400" />, desc: 'Meaningful tasks that unlock real-world perks.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-white text-xl mb-3">{item.name}</h3>
                                <p className="text-pr-text-2 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MEMORY / HISTORY (Pinterest Style Presence Depth) */}
            <section className="py-32 bg-[#0F0C1E] border-y border-white/5 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-24">
                    <div className="flex-1 text-left">
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">Your story isn’t a stream. <br /><span className="text-white/30 italic">It’s a series of moments.</span></h2>
                        <p className="text-xl text-pr-text-2 mb-12 leading-relaxed font-medium">
                            Social media moves fast. Promorang stays still. We show where you’ve been, what you’ve built, and what you’ve truly experienced.
                        </p>
                        <div className="space-y-10">
                            {[
                                { icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />, title: "No social competition", desc: "Focus on the moment, not the performative feedback loop.", color: "bg-indigo-500/10" },
                                { icon: <Lock className="w-6 h-6 text-rose-400" />, title: "Private, meaningful records", desc: "Your history is yours. Share it when it matters, keep it when it doesn't.", color: "bg-rose-500/10" },
                                { icon: <Zap className="w-6 h-6 text-emerald-400" />, title: "Appreciation for presence", desc: "Get recognized and rewarded just for being there. Real value for real time.", color: "bg-emerald-500/10" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <span className="font-bold block text-white text-xl mb-1">{item.title}</span>
                                        <span className="text-pr-text-muted font-medium leading-relaxed">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        {/* Pinterest Masonry representation of "History" */}
                        <div className="grid grid-cols-2 gap-4 -rotate-3 hover:rotate-0 transition-transform duration-700">
                            {[
                                { img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&fit=crop', size: 'h-48' },
                                { img: 'https://images.unsplash.com/photo-1514525253361-bee8718a342b?w=400&fit=crop', size: 'h-64' },
                                { img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&fit=crop', size: 'h-64' },
                                { img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&fit=crop', size: 'h-48' }
                            ].map((card, i) => (
                                <div key={i} className={`${card.size} rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group`}>
                                    <img src={card.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <ShieldCheck className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Summary Card overlap (Groupon clarity) */}
                        <div className="absolute -bottom-8 -right-8 w-64 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                            <div className="text-4xl font-black text-white mb-2 tracking-tighter">100%</div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6">Proven Presence</div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="bg-emerald-500 w-full h-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Start Your Story"
                subheadline="Join your first moment today and begin building your private history."
                ctaText="Join Promorang"
                ctaLink="/auth"
                secondaryCta={{ text: "Explore Moments", link: '/today' }}
            />

            <MarketingFooter />
        </div>
    );
}
