import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Gem, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { TodaySkeleton } from '@/react-app/components/ui/SkeletonShimmer';

// Types for Wallet Resources
interface WalletResource {
    id: string;
    type: 'gem' | 'key' | 'point';
    label: string;
    balance: number;
    icon: any;
    color: string;
    description: string;
}

export default function WalletPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<WalletResource[]>([]);

    useEffect(() => {
        // Mock Data for Recognition (Human-Centric)
        setTimeout(() => {
            setResources([
                {
                    id: 'res_momentum',
                    type: 'gem',
                    label: 'Presence Momentum',
                    balance: 1250,
                    icon: Gem,
                    color: 'text-purple-400',
                    description: 'The collective weight of your verified history and participation.'
                },
                {
                    id: 'res_keys',
                    type: 'key',
                    label: 'Access Keys',
                    balance: 3,
                    icon: Key,
                    color: 'text-amber-400',
                    description: 'Unlock unique moments and private district circles.'
                },
                {
                    id: 'res_points_sb',
                    type: 'point',
                    label: 'Community Appreciation',
                    balance: 450,
                    icon: Star,
                    color: 'text-rose-400',
                    description: 'Recognition earned from contributing to local coffee house moments.'
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) return <TodaySkeleton />;

    return (
        <div className="space-y-12 max-w-md mx-auto px-6 py-16 bg-[#08060a] min-h-screen pb-40">
            {/* Header: Record of Recognition - Reverent */}
            <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none italic lowercase">Recognition</h1>
                        <p className="text-[10px] text-white/20 font-black uppercase mt-3 tracking-[0.4em]">My Growing Impact</p>
                    </div>
                    <div className="w-14 h-14 bg-white/[0.02] rounded-[1.5rem] border border-white/5 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-500/60" />
                    </div>
                </div>
            </div>

            {/* Global Resources (Momentum / Keys) */}
            <div className="grid grid-cols-1 gap-6">
                {resources.filter(r => r.type !== 'point').map(resource => (
                    <div key={resource.id} className="group relative bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-zinc-800/50">
                        {/* Pinterest-style background focus */}
                        <div className="absolute -right-8 -top-8 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <resource.icon className={`w-48 h-48 ${resource.color}`} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5 ${resource.color}`}>
                                    <resource.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{resource.label}</h3>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-white tracking-tighter">{resource.balance}</span>
                                {resource.type === 'gem' && <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">Recognized</span>}
                            </div>

                            <p className="mt-6 text-sm font-medium text-white/30 italic leading-relaxed max-w-[85%]">
                                {resource.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Local Appreciation (Vouchers, Airbnb Aesthetic) */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <Sparkles className="w-4 h-4 text-rose-500/40" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Active Recognitions</h2>
                </div>
                <div className="space-y-6">
                    {resources.filter(r => r.type === 'point').map(resource => (
                        <div key={resource.id} className="relative group">
                            {/* Premium Voucher Card (Human Style) */}
                            <div className="flex flex-col bg-zinc-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl transition-all hover:border-rose-500/20 relative">
                                {/* Visual Punch-outs (Digital Ticket Feel) */}
                                <div className="absolute top-1/2 -left-6 w-12 h-12 rounded-full bg-[#08060a] border-r border-white/5 z-10" />
                                <div className="absolute top-1/2 -right-6 w-12 h-12 rounded-full bg-[#08060a] border-l border-white/5 z-10" />

                                <div className="p-10 pb-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                            <resource.icon className="w-8 h-8 text-rose-500/60" />
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-4xl font-black text-white tracking-tighter">{resource.balance}</span>
                                            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Presence</span>
                                        </div>
                                    </div>

                                    <h4 className="text-2xl font-black text-white tracking-tighter lowercase italic underline decoration-rose-500/20 underline-offset-8 mb-4">{resource.label}</h4>
                                    <p className="text-xs font-medium text-white/30 italic leading-relaxed">{resource.description}</p>
                                </div>

                                {/* Divider */}
                                <div className="px-10 flex items-center gap-2">
                                    <div className="h-[1px] w-full border-t border-dashed border-white/10" />
                                </div>

                                <div className="p-10 pt-6 flex items-center justify-between bg-white/[0.01]">
                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">A moment confirmed</p>
                                    <button className="px-8 py-3 bg-white text-[#08060a] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform">
                                        Redeem
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Presence Action */}
            <div className="bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] border border-indigo-500/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="w-12 h-12 text-indigo-500/40 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2 italic lowercase">Preserve Your Impact</h3>
                <p className="text-sm text-white/20 mb-8 max-w-xs mx-auto font-medium leading-relaxed italic">
                    Every shared moment strengthens the neighborhood and earns your place in the circle.
                </p>
                <button
                    onClick={() => navigate('/scan')}
                    className="w-full py-4 bg-white text-[#08060a] rounded-2xl font-black text-[10px] transition-all shadow-lg uppercase tracking-[0.3em]"
                >
                    Confirm Presence
                </button>
            </div>
        </div>
    );
}
