import { Sparkles, Zap } from 'lucide-react';

interface SeasonalBannerProps {
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

export default function SeasonalBanner({ seasonData }: SeasonalBannerProps) {
    const { name, current_tier, completion_percentage } = seasonData;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/90 to-red-600/90 p-5 shadow-lg shadow-orange-500/20 border border-white/10 group cursor-pointer hover:shadow-orange-500/30 transition-all">
            {/* Ambient background effects */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl" />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] leading-none">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-bold uppercase tracking-wider">
                                Tier {current_tier}
                            </span>
                            <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">
                                {completion_percentage}% to next level
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-white/50">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            Active Pass
                        </span>
                    </div>
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] transition-all duration-1000"
                            style={{ width: `${completion_percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
