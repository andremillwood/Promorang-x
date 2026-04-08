/**
 * Presence Passport - Consistency & Identity Tracking
 * 
 * Aesthetic: Premium card, gold/amber accents, soft organic geometry.
 */

import { Activity, Shield, Sparkles, Trophy } from 'lucide-react';

export default function TodayRank({ percentile, todayProgress, userState }: { percentile: number | null, todayProgress: any, userState: number }) {
    const percentileValue = (typeof percentile === 'number' && !isNaN(percentile)) ? Math.round(100 - percentile) : 0;
    const integrityDepth = Math.min(Math.max(percentileValue, 0), 100);

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-amber-500/20 p-8 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 blur-[50px] rounded-full" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left: Depth Scoring */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 block leading-none mb-1">Presence Passport</span>
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Consistency Depth</h2>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black text-amber-500 tracking-tighter">
                            {integrityDepth ?? '0'}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">/ 100</span>
                            <span className="text-[10px] font-bold text-amber-500/60 uppercase">Indexed Presence</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                style={{ width: `${integrityDepth || 0}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                            <span>Initial Presence</span>
                            <span>Sovereign Identity</span>
                        </div>
                    </div>
                </div>

                {/* Right: Records & Achievements */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Journal Entries</span>
                        </div>
                        <span className="text-xs font-black text-white">{todayProgress.tickets || 0}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Identity Spark</span>
                        </div>
                        <span className="text-xs font-black text-indigo-400">+{Math.min((integrityDepth || 0) * 2, 150)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Success Standing</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Day {userState + 1}</span>
                    </div>
                </div>
            </div>

            {/* Passport Stamp Decoration */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.02] -rotate-12 pointer-events-none">
                <Trophy className="w-40 h-40" />
            </div>
        </div>
    );
}

