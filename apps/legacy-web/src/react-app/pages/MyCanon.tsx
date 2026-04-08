import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Star, Heart, Camera, Share2 } from 'lucide-react';
import api from '@/react-app/lib/api';

export default function MyCanon() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [moments, setMoments] = useState<any[]>([]);

    useEffect(() => {
        const fetchCanon = async () => {
            try {
                const response = await api.get('/today'); // Reusing reflections for now
                setMoments(response.data.reflections || []);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch canon:', error);
                setLoading(false);
            }
        };

        fetchCanon();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#08060a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#08060a] text-white">
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-40">

                {/* Header: The Living History */}
                <header className="space-y-6">
                    <button
                        onClick={() => navigate('/today')}
                        className="flex items-center gap-2 text-white/20 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Journal</span>
                    </button>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-black tracking-tighter leading-none italic lowercase">My Canon</h1>
                        <p className="text-sm text-white/20 font-medium italic">A preserved history of your moments and impact.</p>
                    </div>
                </header>

                {/* Timeline Grid */}
                <div className="relative space-y-24 before:absolute before:left-[-20px] before:top-8 before:bottom-0 before:w-[1px] before:bg-white/5">
                    {moments.map((moment, idx) => (
                        <div key={moment.id} className="relative group">
                            {/* Point on timeline */}
                            <div className="absolute left-[-24px] top-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-indigo-500 transition-colors" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                {/* Date Column */}
                                <div className="md:col-span-2 space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chapter {moments.length - idx}</span>
                                    <p className="text-xs font-bold text-indigo-400/40">Recently</p>
                                </div>

                                {/* Content Card */}
                                <div className="md:col-span-10">
                                    <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 transition-all group-hover:bg-zinc-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-500/40">
                                                    {moment.category === 'streak' ? <Clock className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Moment Preserved</span>
                                                    <h3 className="text-xl font-bold lowercase italic">{moment.message}</h3>
                                                </div>
                                            </div>
                                            <button className="p-3 rounded-2xl hover:bg-white/5 text-white/20 transition-all">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {idx % 2 === 0 && (
                                            <div className="h-64 rounded-[2rem] overflow-hidden border border-white/5">
                                                <img
                                                    src={`https://images.unsplash.com/photo-${idx % 3 === 0 ? '1517457373958-b7bdd4587205' : '1522202176988-66273c2fd55f'}?w=1200&auto=format&fit=crop&q=60`}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin className="w-3.5 h-3.5" />
                                                Common Ground
                                            </div>
                                            <div className="flex items-center gap-2 text-amber-500/40 text-[10px] font-black uppercase tracking-widest">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                Recognition Gained
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {moments.length === 0 && (
                        <div className="py-32 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                            <Camera className="w-12 h-12 text-white/5 mx-auto mb-6" />
                            <p className="text-sm text-white/20 font-medium italic">Your story hasn't begun yet.<br />Join a moment to start your archive.</p>
                            <button
                                onClick={() => navigate('/today')}
                                className="mt-8 px-8 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10"
                            >
                                Step Inside
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
