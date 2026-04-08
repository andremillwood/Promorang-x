/**
 * WorldHeader Component
 * 
 * Top section showing district, season, timer, and leader info.
 */

import { Clock, Zap } from 'lucide-react';
import { useCountdown } from '../../hooks/useTodayGame';
import { formatDelta } from '../../lib/todayGameUtils';
import type { District, Season, WarWindow, WarScore } from '../../types/todayGame';

interface WorldHeaderProps {
    district: District;
    season: Season;
    warWindow: WarWindow;
    leaderHouseName: string;
    leaderHouseColor: string;
    leadMargin: number;
    deltaSinceYesterday?: number;
    className?: string;
}

export function WorldHeader({
    district,
    season,
    warWindow,
    leaderHouseName,
    leaderHouseColor,
    leadMargin,
    deltaSinceYesterday,
    className = ''
}: WorldHeaderProps) {
    const { formatted: timeRemaining, isExpired } = useCountdown(warWindow.endsAt);

    return (
        <div className={`space-y-3 ${className}`}>
            {/* District & Season */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{district.icon || '🏟️'}</span>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {district.name}
                        </h1>
                        <p className="text-xs text-zinc-400">
                            {season.name}
                        </p>
                    </div>
                </div>

                {/* Timer */}
                <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    ${isExpired
                        ? 'bg-zinc-700/50 text-zinc-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }
                `}>
                    <Clock className="w-4 h-4" />
                    <div className="text-right">
                        <p className="text-xs opacity-75">
                            {isExpired ? 'Locked' : 'Locks in'}
                        </p>
                        <p className="text-sm font-bold">
                            {timeRemaining}
                        </p>
                    </div>
                </div>
            </div>

            {/* Leader & Delta */}
            <div className="flex items-center justify-between bg-zinc-800/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: leaderHouseColor }}
                    />
                    <span className="text-sm text-zinc-300">
                        <span
                            className="font-semibold"
                            style={{ color: leaderHouseColor }}
                        >
                            {leaderHouseName}
                        </span>
                        {' '}leads by{' '}
                        <span className="font-bold text-white">
                            {leadMargin.toLocaleString()}
                        </span>
                    </span>
                </div>

                {deltaSinceYesterday !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className={deltaSinceYesterday >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatDelta(deltaSinceYesterday)} since yesterday
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
