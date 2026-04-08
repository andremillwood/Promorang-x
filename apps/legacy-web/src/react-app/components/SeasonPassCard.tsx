import { Zap, Lock, CheckCircle2, ChevronRight } from 'lucide-react';

interface SeasonalReward {
    level: number;
    xp_required: number;
    rewards: Array<{
        type: string;
        amount: number;
        label: string;
    }>;
}

interface SeasonPassProps {
    seasonData: {
        id: string;
        name: string;
        banner_url: string;
        current_tier: number;
        completion_percentage: number;
        next_tier_xp: number;
        current_xp: number;
    };
}

export default function SeasonPassCard({ seasonData }: SeasonPassProps) {
    const { name, banner_url, current_tier, completion_percentage, current_xp, next_tier_xp } = seasonData;

    return (
        <div className="bg-pr-surface-card rounded-2xl overflow-hidden border border-pr-surface-3 shadow-sm group">
            {/* Banner / Header */}
            <div className="relative h-32 w-full overflow-hidden">
                <img
                    src={banner_url}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-0.5">Current Season</p>
                            <h3 className="text-white font-bold text-lg leading-tight">{name}</h3>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/20">
                            <span className="text-white text-xs font-bold">Tier {current_tier}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-pr-text-2 font-medium">Season Progress</span>
                        <span className="text-pr-text-1 font-bold">{current_xp.toLocaleString()} / {next_tier_xp.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full h-2.5 bg-pr-surface-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            style={{ width: `${completion_percentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Next Tier Preview */}
                <div className="p-3 bg-pr-surface-1 rounded-xl border border-dashed border-pr-surface-3 flex items-center justify-between group/tier cursor-pointer hover:bg-pr-surface-2 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-pr-text-3 font-bold uppercase tracking-wider">Next Reward</p>
                            <p className="text-sm font-semibold text-pr-text-1">Tier {current_tier + 1} Unlocks soon</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-pr-text-3 group-hover/tier:translate-x-0.5 transition-transform" />
                </div>

                {/* Call to Action */}
                <button className="w-full py-3 bg-pr-text-1 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
                    View Season Pass
                </button>
            </div>
        </div>
    );
}
