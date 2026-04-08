/**
 * YourPosition Component
 * 
 * Shows user's house, contribution, and flip estimate.
 */

import { Users, Target, TrendingUp } from 'lucide-react';
import type { TodayUserState, Crew, TodayComputedState } from '../../types/todayGame';

interface YourPositionProps {
    user: TodayUserState;
    crew?: Crew;
    computed: TodayComputedState;
    className?: string;
}

export function YourPosition({
    user,
    crew,
    computed,
    className = ''
}: YourPositionProps) {
    const { userHouseRank, flipEstimate, inactivityConsequenceText, userHouseScore } = computed;

    // Determine position badge color
    const positionColors: Record<number, string> = {
        1: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        2: 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30',
        3: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
        4: 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
    };

    const positionLabels = ['1st', '2nd', '3rd', '4th'];

    return (
        <div className={`bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* House badge */}
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${user.houseColor}20` }}
                    >
                        {user.houseIcon || '🏠'}
                    </div>
                    <div>
                        <p
                            className="font-semibold"
                            style={{ color: user.houseColor }}
                        >
                            {user.houseName || 'Your House'}
                        </p>
                        <p className="text-xs text-zinc-400">
                            {userHouseScore.toLocaleString()} points today
                        </p>
                    </div>
                </div>

                {/* Position badge */}
                <div className={`px-3 py-1.5 rounded-lg border ${positionColors[userHouseRank] || positionColors[4]}`}>
                    <span className="text-sm font-bold">
                        {positionLabels[userHouseRank - 1] || '4th'}
                    </span>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Your contribution */}
                <div className="bg-zinc-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <Target className="w-3.5 h-3.5" />
                        <span className="text-xs">Your Points</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                        {user.contributionToday.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {user.activationsCompletedToday} activation{user.activationsCompletedToday !== 1 ? 's' : ''} today
                    </p>
                </div>

                {/* Crew contribution (if exists) */}
                {crew ? (
                    <div className="bg-zinc-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs">Crew Points</span>
                        </div>
                        <p className="text-lg font-bold text-white">
                            {crew.contributionToday.toLocaleString()}
                        </p>
                        <p
                            className="text-xs truncate"
                            style={{ color: user.houseColor }}
                        >
                            {crew.name}
                        </p>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-dashed border-zinc-700">
                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs">No Crew</span>
                        </div>
                        <p className="text-sm text-zinc-600">
                            Join a crew for bonus multipliers
                        </p>
                    </div>
                )}
            </div>

            {/* Consequence callout */}
            <div className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg
                ${flipEstimate && flipEstimate <= 3
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : userHouseRank === 1
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : 'bg-zinc-700/30 border border-zinc-600/30'
                }
            `}>
                <TrendingUp className={`
                    w-4 h-4 
                    ${flipEstimate && flipEstimate <= 3
                        ? 'text-emerald-400'
                        : userHouseRank === 1
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                    }
                `} />
                <p className={`
                    text-sm font-medium
                    ${flipEstimate && flipEstimate <= 3
                        ? 'text-emerald-300'
                        : userHouseRank === 1
                            ? 'text-amber-300'
                            : 'text-zinc-300'
                    }
                `}>
                    {inactivityConsequenceText}
                </p>
            </div>
        </div>
    );
}
