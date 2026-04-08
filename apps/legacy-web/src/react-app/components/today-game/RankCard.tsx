/**
 * RankCard Component
 * 
 * Shows user's current rank and what unlocks next.
 */

import { Lock, Unlock, ChevronRight, Star } from 'lucide-react';

interface RankCardProps {
    currentRank: number;
    className?: string;
}

// Rank definitions
const RANKS = [
    { level: 1, name: 'Scout', unlocks: 'Basic Activations', icon: '🔍' },
    { level: 2, name: 'Navigator', unlocks: 'Crew Creation', icon: '🧭' },
    { level: 3, name: 'Pioneer', unlocks: 'Boost Slots', icon: '⚡' },
    { level: 4, name: 'Legend', unlocks: 'VIP Activations', icon: '👑' },
    { level: 5, name: 'Mythic', unlocks: 'District Council', icon: '🌟' }
];

export function RankCard({ currentRank, className = '' }: RankCardProps) {
    const currentRankData = RANKS.find(r => r.level === currentRank) || RANKS[0];
    const nextRankData = RANKS.find(r => r.level === currentRank + 1);

    return (
        <div className={`bg-zinc-900/30 backdrop-blur-sm rounded-2xl overflow-hidden ${className}`}>
            {/* Current rank */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">
                        {currentRankData.icon}
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400">Current Rank</p>
                        <p className="font-bold text-white">
                            {currentRankData.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-purple-400">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">Lv.{currentRank}</span>
                </div>
            </div>

            {/* Next rank preview */}
            {nextRankData && (
                <div className="px-4 py-3 bg-zinc-950/30 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">
                                Next:
                            </span>
                            <span className="text-sm font-medium text-white">
                                {nextRankData.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>{nextRankData.unlocks}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
