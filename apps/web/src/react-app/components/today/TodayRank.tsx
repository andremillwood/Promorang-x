/**
 * TodayRank - Premium Yesterday's Rank + Today's Progress
 * 
 * Shows:
 * - Yesterday's final rank (from leaderboard snapshot)
 * - Percentile position with visual bar
 * - Movement indicators
 * - Today's ticket progress
 */

import { Trophy, TrendingUp, TrendingDown, Minus, Ticket, ChevronRight } from 'lucide-react';
import { getStateBasedCopy, type UserState } from '@/react-app/lib/userState';

interface TodayRankProps {
    rank: number | null;
    percentile: number | null;
    change: number;
    todayProgress: {
        tickets: number;
        dynamic_points: number;
        label: string;
    };
    userState: number; // MaturityState (0-3)
}

export default function TodayRank({ rank, percentile, change, todayProgress, userState }: TodayRankProps) {
    const stateCopy = getStateBasedCopy(userState as UserState);

    // Determine movement indicator
    const getMovementIndicator = () => {
        if (change > 0) {
            return {
                icon: <TrendingUp className="w-3.5 h-3.5" />,
                text: `+${change}`,
                colors: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
            };
        } else if (change < 0) {
            return {
                icon: <TrendingDown className="w-3.5 h-3.5" />,
                text: `${change}`,
                colors: 'text-red-400 bg-red-500/20 border-red-500/30',
            };
        }
        return {
            icon: <Minus className="w-3.5 h-3.5" />,
            text: '—',
            colors: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
        };
    };

    const movement = getMovementIndicator();
    const percentileValue = percentile !== null ? Math.round(100 - percentile) : null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/10 backdrop-blur-xl border border-white/10 p-5 shadow-lg shadow-indigo-500/10">
            {/* Ambient glow */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

            {/* Header */}
            <div className="relative flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg">
                    <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {stateCopy.rank}
                </span>
            </div>

            {/* Rank Display */}
            <div className="relative">
                {rank !== null ? (
                    <>
                        {/* Rank number + movement */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-black text-white">
                                #{rank.toLocaleString()}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${movement.colors}`}>
                                {movement.icon}
                                {movement.text}
                            </span>
                        </div>

                        {/* Percentile display */}
                        {percentileValue !== null && (
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-white/50">Top {percentileValue}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${100 - percentileValue}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Day 1 Placeholder */
                    <div className="py-2">
                        <p className="text-sm text-white/50 leading-relaxed">
                            {userState === 0 ? "Rank unlocks after your first day" : "Rank is calculated at the end of each day"}
                        </p>
                    </div>
                )}
            </div>

            {/* Today's Progress */}
            <div className="relative mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Today's progress</span>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white/80 px-2.5 py-1 rounded-full border border-white/10">
                            <Ticket className="w-3.5 h-3.5 text-purple-400" />
                            {todayProgress.tickets} tickets
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                </div>
            </div>
        </div>
    );
}
