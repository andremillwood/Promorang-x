import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Bookmark, Lock, ArrowRight } from 'lucide-react';
import ActiveMomentView from '@/react-app/components/today/ActiveMomentView';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import ShareMomentButton from '@/react-app/components/ShareMomentButton';

export default function MomentEntryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [moment, setMoment] = useState<any>(null);
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        const fetchMoment = async () => {
            try {
                // Mocking data for now as we don't have a specific GET /drops/:id for participants yet
                setTimeout(() => {
                    setMoment({
                        id,
                        title: "The Midnight Coffee Ritual",
                        hostName: "Common Ground Cafe",
                        hostAvatar: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&auto=format&fit=crop&q=60",
                        description: "A moment of shared warmth and quiet focus. We gather to appreciate the craft of the bean and the pulse of the neighborhood.",
                        meaning: "Participation here supports local growers and strengthens the social fabric of our district.",
                        outcome: "You will receive a small batch brew and a unique 'Midnight Brewer' badge in your canon.",
                        reward: "Small Batch Brew",
                        vitality: 50,
                        time: "Tonight, 10:00 PM",
                        location: "Downtown District",
                        image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=60"
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Failed to fetch moment:', error);
                setLoading(false);
            }
        };

        fetchMoment();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#08060a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
    );

    if (!moment) return (
        <div className="min-h-screen bg-[#08060a] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-black text-white/40 mb-4">This moment has faded.</h1>
            <button onClick={() => navigate('/today')} className="text-amber-500 font-bold uppercase tracking-widest text-xs">Return to Journal</button>
        </div>
    );

    // Initial SEO for social sharing
    const seoTitle = `Invitation: ${moment.title}`;
    const seoDesc = `Join ${moment.hostName} for a unique moment. ${moment.meaning}`;

    // Joined View (Authenticated & Active)
    if (isJoined) {
        return (
            <div className="min-h-screen bg-[#08060a] text-white p-6 md:p-12 space-y-12 max-w-4xl mx-auto">
                <SEO title={moment.title} description={moment.description} />
                <button onClick={() => setIsJoined(false)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Back to Details</span>
                </button>
                <ActiveMomentView
                    moment={{
                        title: moment.title,
                        hostName: moment.hostName,
                        status: 'joined'
                    }}
                    onAction={() => alert('Checked in!')}
                />
            </div>
        );
    }

    // Public / Preview View
    const handleJoin = () => {
        if (!user) {
            // Redirect to auth with return url
            navigate('/auth?returnTo=/moments/' + id);
            return;
        }
        setIsJoined(true);
    };

    return (
        <div className="min-h-screen bg-[#08060a] text-white">
            <SEO
                title={seoTitle}
                description={seoDesc}
                ogImage={moment.image}
                twitterCard="summary_large_image"
            />

            {/* Hero Image */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img src={moment.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08060a] via-transparent to-transparent" />
                <button
                    onClick={() => navigate('/today')}
                    className="absolute top-8 left-8 w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {!user && (
                    <div className="absolute top-8 right-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Public Preview</span>
                    </div>
                )}
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 -mt-32 pb-32 space-y-12">
                {/* Host Card */}
                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={moment.hostAvatar} className="w-16 h-16 rounded-full border-2 border-amber-500/20" />
                        <div>
                            <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.4em] block mb-1">Invitation From</span>
                            <h2 className="text-xl font-bold italic lowercase">{moment.hostName}</h2>
                        </div>
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter leading-none italic lowercase">{moment.title}</h1>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{moment.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <Star className="w-4 h-4 text-amber-500/60" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{moment.reward}</span>
                        </div>
                    </div>
                </div>

                {/* Intentionality Sections */}
                <div className="space-y-12 px-2">
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Why this matters</h3>
                        <p className="text-xl text-white/80 font-medium italic leading-relaxed">
                            {moment.meaning}
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">What happens if you join</h3>
                        <p className="text-lg text-white/50 leading-relaxed font-medium">
                            {moment.outcome}
                        </p>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-2">
                            <h4 className="text-[8px] font-black uppercase tracking-widest text-white/20">Recognition</h4>
                            <p className="text-2xl font-black text-amber-500/60 lowercase italic">Unique Discovery</p>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-2">
                            <h4 className="text-[8px] font-black uppercase tracking-widest text-white/20">Vitality Growth</h4>
                            <p className="text-2xl font-black text-indigo-500/60 lowercase italic">+{moment.vitality}</p>
                        </div>
                    </div>
                </div>

                {/* Primary Action */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#08060a] to-transparent pointer-events-none">
                    <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                        <button
                            onClick={handleJoin}
                            className={`flex-1 py-5 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${user ? 'bg-white text-[#08060a]' : 'bg-amber-500 text-[#08060a]'
                                }`}
                        >
                            {!user && <Lock className="w-4 h-4 opacity-50" />}
                            {user ? 'Join Moment' : 'Unlock Access'}
                            {!user && <ArrowRight className="w-4 h-4 opacity-50" />}
                        </button>
                        <button className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all">
                            <Bookmark className="w-6 h-6 text-white/40" />
                        </button>
                        <ShareMomentButton title={moment.title} />
                    </div>
                </div>
            </div>
        </div>
    );
}
