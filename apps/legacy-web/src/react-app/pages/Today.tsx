import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import {
    QrCode,
    Zap,
    MapPin,
    History,
    LogOut,
    Sparkles,
    Heart,
    Plus
} from 'lucide-react';
import { TodaySkeleton } from '@/react-app/components/ui/SkeletonShimmer';
import api from '@/react-app/lib/api';
import MomentCard from '@/react-app/components/today/MomentCard';
import TodayRank from '@/react-app/components/today/TodayRank';

export default function Today() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchTodayData = async () => {
            try {
                const response = await api.get('/today');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch today data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayData();
    }, []);

    if (loading) {
        return <TodaySkeleton />;
    }

    // Curated high-quality imagery for the "Warmth" experience
    const getPlaceholderImage = (index: number, type: string) => {
        const invitationImages = [
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=60', // Cafe/Social
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=60', // Collaboration
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=60', // Celebration
        ];
        const participationImages = [
            'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=60', // People/Street
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=60', // Library/Quiet
            'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=60', // Team/Office
        ];

        if (type === 'invitation') return invitationImages[index % invitationImages.length];
        return participationImages[index % participationImages.length];
    };

    const invitation = data?.headline || {
        type: 'reward',
        payload: {
            title: "Your Story Begins Here",
            subtitle: "Every moment you preserve builds your presence. Accept your first invitation to join the community story.",
            cta_text: "Join the Story",
            cta_action: '/moments'
        }
    };

    const participatoryMoments = data?.featured_content || [];
    const reflections = data?.reflections || [];

    return (
        <div className="relative min-h-screen bg-[#08060a] text-white selection:bg-amber-500/30">
            {/* Soft Ambient Washes (Warmth) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.08] blur-[140px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/[0.05] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] bg-amber-500/[0.08] blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-16 pb-40">

                {/* 1. Meaning: The High Invitation */}
                <header className="space-y-8">
                    <div className="flex items-center justify-between px-1">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black tracking-tighter leading-none italic lowercase">Journal</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">The Present Moment</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/scan')}
                            className="w-14 h-14 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 active:scale-95 group"
                        >
                            <QrCode className="w-6 h-6 text-white/40 group-hover:text-amber-500 transition-colors" />
                        </button>
                    </div>

                    <MomentCard
                        type="invitation"
                        title={invitation.payload.title}
                        subtitle={invitation.payload.subtitle}
                        image={getPlaceholderImage(0, 'invitation')}
                        reward={invitation.type === 'multiplier' ? `Vitality Boost` : 'Special Access'}
                        presencePoints={20}
                        hostName="Common Ground"
                        ctaText={invitation.payload.cta_text || "Step Inside"}
                        onClick={() => navigate(invitation.payload.cta_action || '/moments')}
                    />
                </header>

                {/* Presence Passport (Airbnb/Premium influence) */}
                <div className="px-1">
                    <TodayRank
                        percentile={data?.yesterday_rank?.percentile}
                        todayProgress={data?.today_progress || { tickets: 0 }}
                        userState={user?.onboarding_completed ? 1 : 0}
                    />
                </div>

                {/* 2. Action: Ways to Participate (Pinterest Masonry Influence) */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4 px-1">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400/60">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight lowercase">Moments around you</h2>
                            <p className="text-xs text-white/20 font-medium">Relevant invitations and local happenings.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {participatoryMoments.map((moment: any, idx: number) => (
                            <MomentCard
                                key={moment.id}
                                title={moment.title}
                                subtitle={moment.preview}
                                image={getPlaceholderImage(idx + 1, 'participation')}
                                hostName={moment.host_name || 'Anonymous Host'}
                                accentColor={moment.accent_color || 'indigo'}
                                reward={idx === 0 ? 'Limited Deal' : undefined}
                                presencePoints={10}
                                ctaText="View Invitation"
                                onClick={() => navigate(moment.drop_id ? `/moments/${moment.drop_id}` : '/moments')}
                            />
                        ))}
                        {participatoryMoments.length === 0 && (
                            <div className="col-span-full py-20 px-8 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] text-center space-y-4">
                                <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto">
                                    <Sparkles className="w-8 h-8 text-white/10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white/40 lowercase">The neighborhood is quiet.</p>
                                    <p className="text-sm text-white/20 font-medium leading-relaxed max-w-xs mx-auto italic">New moments are taking shape. Check back soon for the next chapter.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/moments')}
                                    className="px-8 py-3 bg-white/[0.02] hover:bg-white/5 text-white/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    Find a Moment
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Identity: Your Growing Story (Scrapbook Influence) */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400/60">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight lowercase">Your growing archive</h2>
                                <p className="text-xs text-white/20 font-medium">A visual timeline of your presence and impact.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/canon')}
                            className="bg-white/[0.02] hover:bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-white/30 uppercase tracking-widest transition-all"
                        >
                            Open Archive
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reflections.map((reflection: any) => (
                            <MomentCard
                                key={reflection.id}
                                type="story"
                                title={reflection.message}
                                subtitle={reflection.category === 'streak' ? 'Consistency Record' : 'Activity Record'}
                                icon={reflection.icon === 'flame' ? Zap : Heart}
                                accentColor={reflection.accent_color || 'purple'}
                                completed={true}
                            />
                        ))}
                        {reflections.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white/[0.02] rounded-[3rem] border border-white/5">
                                <p className="text-sm text-white/30 italic font-medium leading-relaxed">"Chapter 1: The Beginning"<br />Preserving your first moments starts with your first action.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. The Bridge: Your Hosting Story */}
                <section className="space-y-8 bg-zinc-900/40 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <Plus className="w-48 h-48 text-white" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tighter italic lowercase">Begin your Hosting Journey</h2>
                            <p className="text-sm text-white/30 font-medium italic">Create rituals and build your legacy in the neighborhood.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/advertiser/dashboard')}
                                className="px-10 py-4 bg-white text-[#08060a] rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Zap className="w-3 h-3" />
                                Open Hosting Center
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer: Human Connection */}
                <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-12">
                    <div className="flex flex-col items-center gap-8">
                        <button
                            onClick={async () => {
                                await signOut();
                                navigate('/auth');
                            }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-rose-500/60 transition-all group"
                        >
                            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Close Journal
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}


