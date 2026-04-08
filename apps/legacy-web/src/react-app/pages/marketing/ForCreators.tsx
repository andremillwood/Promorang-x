import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import {
    Sparkles,
    Users,
    Shield,
    CheckCircle,
    Zap,
    Heart,
    Star,
    Diamond
} from 'lucide-react';
import SEO from '@/react-app/components/SEO';

export default function ForCreators() {
    const successStories = [
        {
            name: 'Sarah J.',
            role: 'Experience Curator',
            mvi: '450 MVI',
            story: 'I stopped chasing likes and started building real memories. My community feels more connected than ever because we’re actually showing up and sharing the moment together.',
            feeling: 'Genuinely Connected',
        },
        {
            name: 'Marcus T.',
            role: 'Event Host',
            mvi: '2,100 MVI',
            story: "Promorang allows me to see exactly who was there. We’ve turned my gallery launches into moments that live on, unlocking rewards for the people who truly care.",
            feeling: 'Deeply Recognized',
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-[#0A0714] font-sans">
            <SEO
                title="Promorang for Creators | Create Shared Moments"
                description="Invite your audience into real experiences. See who showed up, reward participation, and let your moments live on."
                canonicalUrl="https://promorang.co/creators"
            />
            <MarketingNav />

            <PersonaHero
                headline="Create moments people want to be part of."
                subheadline="Your audience isn’t just watching anymore. Give them a reason to show up, a way to share the feeling, and a history that belongs to them."
                ctaText="Start Your First Moment"
                ctaLink="/auth"
                stats={[
                    { value: 'True', label: 'Presence' },
                    { value: 'Warm', label: 'Recognition' },
                    { value: 'Deep', label: 'Connection' },
                    { value: 'Real', label: 'History' },
                ]}
                backgroundGradient="from-indigo-600/20 to-rose-600/20"
                icon={<Sparkles className="w-12 h-12 text-rose-400" />}
            />

            {/* Shift from Technical to Emotional */}
            <section className="py-24 bg-[#0F0C1E] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                            Beyond the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Endless Scroll.</span>
                        </h2>
                        <p className="text-xl text-pr-text-2 leading-relaxed">
                            Stop fighting algorithms for attention. Start creating experiences that stay with people long after they’ve put their phones away.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            {
                                title: "From Distant to Present",
                                body: "Don't just broadcast to a sea of handles. Invite them into the room, onto the stage, or into the experience.",
                                icon: <Users className="w-6 h-6 text-indigo-400" />
                            },
                            {
                                title: "From Metrics to Meaning",
                                body: "Likes disappear. Verified presence builds a private history for your community that they can look back on forever.",
                                icon: <Heart className="w-6 h-6 text-rose-400" />
                            },
                            {
                                title: "From One-off to Ongoing",
                                body: "A single moment can unlock a lifetime of recognition. Reward your truest supporters with perks that matter.",
                                icon: <Star className="w-6 h-6 text-amber-400" />
                            },
                            {
                                title: "From Invisible to Seen",
                                body: "Know exactly who was there. Recognition is the ultimate reward, and Promorang makes it automatic.",
                                icon: <Zap className="w-6 h-6 text-emerald-400" />
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed text-lg">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Quiet Magic for Creators */}
            <section className="py-32 bg-[#0A0714]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-10 leading-snug">
                        Your moments, <br />
                        <span className="italic text-pr-text-muted">indexed and remembered.</span>
                    </h2>
                    <div className="space-y-8 text-xl text-pr-text-2 leading-relaxed font-medium">
                        <p>We don’t turn your creativity into a competitive sport. We turn it into infrastructure for the memories you help create.</p>
                        <p className="text-white font-black hover:text-indigo-400 transition-colors cursor-default">No fake engagement. Just real people, in real moments.</p>
                        <p>It’s that simple.</p>
                    </div>
                </div>
            </section>

            {/* Success Stories - Airbnb Host Signature Style */}
            <section className="py-32 bg-[#0F0C1E] border-y border-white/5 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">Moment Leaders</h2>
                        <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Those who lead moments.</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16">
                        {successStories.map((story, index) => (
                            <div key={index} className="flex flex-col space-y-10 group">
                                {/* Airbnb-style Host Profile / Moment Preview */}
                                <div className="aspect-[16/10] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 relative shadow-2xl">
                                    <img
                                        src={index === 0 ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&fit=crop" : "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&fit=crop"}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center text-white text-3xl font-black border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                                                {story.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-white">{story.name}</div>
                                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{story.role}</div>
                                            </div>
                                        </div>
                                        {/* Groupon-style Reward Badge */}
                                        <div className="bg-emerald-500 text-black px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {story.mvi}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4">
                                    <p className="text-2xl text-white mb-8 leading-relaxed font-medium italic">"{story.story}"</p>
                                    <div className="flex items-center gap-10">
                                        <div>
                                            <div className="text-xs font-black text-pr-text-muted uppercase tracking-[0.3em] mb-2">Feeling</div>
                                            <div className="text-lg font-black text-indigo-400">{story.feeling}</div>
                                        </div>
                                        <div className="w-[1px] h-10 bg-white/5" />
                                        <div>
                                            <div className="text-xs font-black text-pr-text-muted uppercase tracking-[0.3em] mb-2">Recognition</div>
                                            <div className="text-lg font-black text-rose-400">High Resolution</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Lead a Moment"
                subheadline="Invite your people into something real. Start building your history today."
                ctaText="Create a Moment"
                ctaLink="/auth"
                secondaryCta={{ text: "See Examples", link: '/today' }}
            />

            <MarketingFooter />
        </div>
    );
}
