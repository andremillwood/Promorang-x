import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Coins, 
    Flame, 
    QrCode, 
    Plus, 
    Sparkles, 
    ShieldCheck, 
    TrendingUp, 
    ArrowUpRight,
    Compass,
    Building2
} from 'lucide-react';

interface ExecutiveHeroProps {
    activeMode: 'creator' | 'organizer';
    onModeChange: (mode: 'creator' | 'organizer') => void;
    user: any;
    data: any;
}

export const ExecutiveHero: React.FC<ExecutiveHeroProps> = ({
    activeMode,
    onModeChange,
    user,
    data
}) => {
    const navigate = useNavigate();

    const gemBalance = user?.verified_credits_balance ?? (data?.today_progress?.dynamic_points ? data.today_progress.dynamic_points : 125);
    const multiplier = data?.multiplier?.value || 1.5;
    const streakDays = data?.today_progress?.streak_days || 4;
    const displayName = user?.display_name || user?.username || 'Explorer';

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#16141a] to-[#0d0b10] border border-white/10 p-6 sm:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5500]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Top Row: Greeting, Status & Role Switcher */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                            Live Pulse
                        </span>
                        <span className="text-xs text-white/40 font-medium">Daily Operations</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{displayName}</span>
                    </h1>
                </div>

                {/* Role Switcher Pill */}
                <div className="flex items-center p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => onModeChange('creator')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeMode === 'creator'
                                ? 'bg-gradient-to-r from-[#FF5500] to-[#E04400] text-white shadow-lg shadow-[#FF5500]/25 scale-[1.02]'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Explorer / Creator</span>
                    </button>
                    <button
                        onClick={() => onModeChange('organizer')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeMode === 'organizer'
                                ? 'bg-gradient-to-r from-[#FF5500] to-[#E04400] text-white shadow-lg shadow-[#FF5500]/25 scale-[1.02]'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Organizer / Merchant</span>
                    </button>
                </div>
            </div>

            {/* Middle Row: Financial & Pulse Telemetry */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                {/* Gem Capital Balance */}
                <div className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-400" />
                            Gem Balance
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">1 Gem = $1.00 USD</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white tracking-tight font-mono">{gemBalance}</span>
                        <span className="text-xs text-white/40 font-semibold">Gems</span>
                    </div>
                    <div className="mt-2 text-[11px] text-white/40 flex items-center justify-between">
                        <span>Secured in Vault</span>
                        <span className="text-white/80 font-mono font-semibold">${gemBalance}.00</span>
                    </div>
                </div>

                {/* Energy Multiplier & Streak */}
                <div className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-[#FF5500]" />
                            Daily Multiplier
                        </span>
                        <span className="text-[10px] text-[#FF5500] font-mono font-bold">{streakDays} Day Streak</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#FF5500] tracking-tight font-mono">{multiplier.toFixed(1)}x</span>
                        <span className="text-xs text-white/60 font-semibold">Reward Boost</span>
                    </div>
                    <div className="mt-2 text-[11px] text-white/40 flex items-center justify-between">
                        <span>Status</span>
                        <span className="text-amber-400 font-medium">Active High Integrity</span>
                    </div>
                </div>

                {/* Rank & Priority */}
                <div className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                            Reliability Score
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold">Top 15%</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white tracking-tight font-mono">PRI 98</span>
                        <span className="text-xs text-white/40 font-semibold">Verified</span>
                    </div>
                    <div className="mt-2 text-[11px] text-white/40 flex items-center justify-between">
                        <span>Access Tier</span>
                        <span className="text-indigo-300 font-medium">Priority Drop Access</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: 1-Tap Action Shortcuts */}
            <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-white/60 font-medium">
                    {activeMode === 'creator' ? (
                        <span>🎯 Quick Action: Check into live scenes to activate bonus Gem multipliers</span>
                    ) : (
                        <span>💼 Quick Action: Validate customer passes or launch an immediate flash drop</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {activeMode === 'creator' ? (
                        <>
                            <button
                                onClick={() => navigate('/scan')}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 active:scale-95"
                            >
                                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                                Scan Venue QR
                            </button>
                            <button
                                onClick={() => navigate('/moments')}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF5500]/20 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Explore Opportunities
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/scan')}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 active:scale-95"
                            >
                                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                                Validate Customer QR
                            </button>
                            <button
                                onClick={() => navigate('/drops/create')}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF5500]/20 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create Drop / Event
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExecutiveHero;
