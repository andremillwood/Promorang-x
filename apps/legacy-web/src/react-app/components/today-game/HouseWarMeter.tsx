/**
 * HouseWarMeter Component
 * 
 * The primary visual for the House War game.
 * Shows a race bar with 4 houses competing for district control.
 */

import { motion } from 'framer-motion';
import type { WarScore } from '../../types/todayGame';
import { getHouseStandings, computeHousePercentage } from '../../lib/todayGameUtils';

interface HouseWarMeterProps {
    warScores: WarScore[];
    userHouseId: string | null;
    onOpenStandings?: () => void;
    isLive?: boolean;
    className?: string;
}

export function HouseWarMeter({
    warScores,
    userHouseId,
    onOpenStandings,
    isLive = true,
    className = ''
}: HouseWarMeterProps) {
    const standings = getHouseStandings(warScores);
    const totalScore = warScores.reduce((sum, s) => sum + s.score, 0);

    return (
        <div
            className={`relative cursor-pointer group ${className}`}
            onClick={onOpenStandings}
            role="button"
            tabIndex={0}
            aria-label="View house standings"
        >
            {/* Live indicator */}
            {isLive && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1.5 bg-red-500/20 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-medium text-red-400">LIVE</span>
                </div>
            )}

            {/* Main meter container */}
            <div className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-zinc-900/40 transition-colors border border-blue-500/10">
                {/* Protocol Health Label */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Global Protocol Health</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Verification Hubs</span>
                </div>

                {/* Race bar visualization */}
                <div className="relative h-12 bg-zinc-900/50 rounded-lg overflow-hidden flex ring-1 ring-zinc-800/50">
                    {standings.map((score, index) => {
                        const percentage = computeHousePercentage(score.score, totalScore);
                        const isUserHouse = score.houseId === userHouseId;

                        return (
                            <motion.div
                                key={score.houseId}
                                className="relative h-full flex items-center justify-center overflow-hidden"
                                style={{
                                    backgroundColor: score.houseColor,
                                    minWidth: percentage > 5 ? undefined : '20px'
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{
                                    duration: 0.8,
                                    ease: 'easeInOut',
                                    delay: index * 0.1
                                }}
                            >
                                {/* User indicator */}
                                {isUserHouse && (
                                    <div className="absolute inset-0 border-2 border-white/30 rounded shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Network labels */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {standings.map((score, index) => {
                        const isUserHouse = score.houseId === userHouseId;
                        const isLeader = index === 0;

                        return (
                            <div
                                key={score.houseId}
                                className={`text-center ${isUserHouse ? 'opacity-100' : 'opacity-70'}`}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    {isLeader && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    )}
                                </div>
                                <p
                                    className="text-[10px] font-bold truncate uppercase tracking-tight"
                                    style={{ color: score.houseColor }}
                                >
                                    {score.houseName.split(' ')[0]} Hub
                                </p>
                                <p className="text-xs font-mono font-bold text-white mt-0.5">
                                    {score.score.toLocaleString()}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hint to click */}
            <p className="text-center text-[10px] text-zinc-600 mt-2 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                Network Data Stream
            </p>
        </div>
    );
}
