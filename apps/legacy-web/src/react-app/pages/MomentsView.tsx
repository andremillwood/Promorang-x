import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { TodaySkeleton } from '@/react-app/components/ui/SkeletonShimmer';
import MomentCard from '@/react-app/components/today/MomentCard';

export default function MomentsView() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
    const [moments, setMoments] = useState<any[]>([]);

    useEffect(() => {
        // Mock Data for Humanized Discovery
        setTimeout(() => {
            setMoments([
                {
                    id: 'm1',
                    title: 'The Midnight Coffee Ritual',
                    hostName: 'Common Ground',
                    type: 'physical_event',
                    starts_at: new Date().toISOString(),
                    location_label: 'Downtown District',
                    status: 'live',
                    reward: 'Small Batch Brew',
                    presencePoints: 50,
                    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60'
                },
                {
                    id: 'm2',
                    title: 'Founders Digital Oasis',
                    hostName: 'Tech Collective',
                    type: 'digital_drop',
                    starts_at: new Date(Date.now() + 3600000).toISOString(),
                    location_label: 'Ethereal Space',
                    status: 'upcoming',
                    reward: 'Genesis Key',
                    presencePoints: 100,
                    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60'
                },
                {
                    id: 'm3',
                    title: 'Vintage Market Gather',
                    hostName: 'Brooklyn Flea',
                    type: 'retail_activation',
                    starts_at: new Date().toISOString(),
                    location_label: 'Greenpoint',
                    status: 'live',
                    reward: 'Curated Token',
                    presencePoints: 75,
                    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60'
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const filteredMoments = moments.filter(m => {
        if (filter === 'all') return true;
        return m.status === filter;
    });

    if (loading) return <TodaySkeleton />;

    return (
        <div className="space-y-12 px-6 py-12 bg-[#08060a] min-h-screen">
            {/* Header / Filter */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic lowercase">Around you</h1>
                        <p className="text-[10px] text-white/20 font-black uppercase mt-2 tracking-[0.4em]">Live invitations in your district</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['all', 'live', 'upcoming'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${filter === f
                                ? 'bg-white text-[#08060a] scale-105 shadow-xl shadow-white/5'
                                : 'bg-white/[0.03] text-white/20 hover:bg-white/[0.07] hover:text-white/40'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 gap-6 space-y-6 pb-40">
                {filteredMoments.map(moment => (
                    <div
                        key={moment.id}
                        onClick={() => navigate(`/moments/${moment.id}`)}
                        className="break-inside-avoid block cursor-pointer transition-transform active:scale-95"
                    >
                        <MomentCard
                            title={moment.title}
                            hostName={moment.hostName}
                            subtitle={moment.location_label}
                            reward={moment.reward}
                            presencePoints={moment.presencePoints}
                            image={moment.image}
                        />
                    </div>
                ))}

                {/* Empty State */}
                {filteredMoments.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 space-y-6">
                        <Sparkles className="w-12 h-12 text-white/5 mx-auto" />
                        <p className="text-sm text-white/20 font-medium italic">The district is quiet for now.<br />Check back soon for new invitations.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
