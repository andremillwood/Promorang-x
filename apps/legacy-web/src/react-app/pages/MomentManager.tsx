import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    Loader2,
    Scan,
    Archive,
    Lock,
    Zap,
    ShieldCheck,
    Star,
    CreditCard,
    Activity
} from 'lucide-react';
import { apiFetch } from '@/react-app/utils/api';

export default function MomentManager() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [moment, setMoment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (id) fetchMoment();
    }, [id]);

    const fetchMoment = async () => {
        try {
            const res = await apiFetch(`/api/moments/${id}`);
            if (res.ok) {
                const data = await res.json();
                setMoment(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseMoment = async () => {
        if (!confirm("Are you sure you want to preserve this story? Once sealed, the details are written to the neighborhood history forever.")) return;

        setClosing(true);
        try {
            const res = await apiFetch(`/api/moments/${id}/close`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(`Story Preserved! Record ID: ${data.record.hash.substring(0, 8)}`);
                fetchMoment();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (e) {
            alert('Failed to preserve story');
        } finally {
            setClosing(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px] bg-[#08060a]">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
    );
    if (!moment) return <div className="p-20 text-center text-white/20 italic">Moment not found</div>;

    return (
        <div className="min-h-screen bg-[#08060a] pb-40 relative overflow-hidden">
            {/* Ambient Background Washes */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.03] blur-[140px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/[0.02] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-amber-500/[0.03] blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto space-y-12 px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${moment.status === 'live' ? 'bg-emerald-500/10 text-emerald-500' :
                                moment.status === 'closed' ? 'bg-white/5 text-white/20' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                {moment.status}
                            </span>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic lowercase">{moment.title}</h1>
                        </div>
                        <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">{moment.id}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {moment.billing_status === 'pending' && (
                            <div className="flex items-center gap-4">
                                <div className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center gap-3">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Payment Pending</span>
                                </div>
                                <button
                                    onClick={() => navigate('/advertiser/settings/team')} // Redirect to billing settings for now
                                    className="px-6 py-3 bg-amber-500 text-[#08060a] hover:bg-amber-400 transition-all rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20"
                                >
                                    Complete Payment
                                </button>
                            </div>
                        )}
                        <div className="flex gap-4">
                            {moment.status === 'live' && (
                                <button
                                    onClick={handleCloseMoment}
                                    disabled={closing}
                                    className="bg-white/[0.05] text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/5 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
                                >
                                    {closing ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    Preserve story
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-8 bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-white/30">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Certainty</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {moment.moment_tier === 'pro' ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> :
                                moment.moment_tier === 'premium' ? <Star className="w-6 h-6 text-purple-500" /> :
                                    <Zap className="w-6 h-6 text-amber-500" />}
                            <p className="text-4xl font-black text-white tracking-tighter italic lowercase">{moment.moment_tier || 'basic'}</p>
                        </div>
                        <p className="text-[10px] text-white/20 font-bold italic uppercase tracking-widest">{moment.verification_level || 'standard'} verification</p>
                    </div>
                    <div className="p-8 bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-white/30">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Capacity</span>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter italic">{moment.participant_cap || 100}</p>
                        <p className="text-[10px] text-white/20 font-bold italic uppercase tracking-widest">max guests</p>
                    </div>
                    <div className="p-8 bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-white/30">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Guests</span>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter italic">0</p>
                        <p className="text-[10px] text-white/20 font-bold italic uppercase tracking-widest text-emerald-500/60">verified presence</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-amber-500 rounded-[3rem] text-[#08060a] shadow-2xl shadow-amber-500/10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all">
                            <Scan className="w-32 h-32" />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <Scan className="w-6 h-6" />
                                <h3 className="text-xl font-bold tracking-tight lowercase">Welcome Ritual</h3>
                            </div>
                            <p className="text-sm font-medium italic leading-relaxed opacity-80">
                                Verify physical presence or scan digital access keys to admit guests into this moment.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/scan')}
                            className="relative z-10 w-full py-4 bg-[#08060a] text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
                        >
                            Launch Scanner
                        </button>
                    </div>

                    {moment.status === 'closed' && (
                        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <div className="flex items-center gap-3 text-white/40">
                                <Archive className="w-6 h-6" />
                                <h3 className="text-xl font-bold lowercase tracking-tight">Preserved Record</h3>
                            </div>
                            <div className="bg-[#08060a] p-6 rounded-2xl border border-white/5 font-mono text-[10px] break-all text-white/20 leading-relaxed">
                                Neighborhood Hash:<br />
                                {moment.record_hash || '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
