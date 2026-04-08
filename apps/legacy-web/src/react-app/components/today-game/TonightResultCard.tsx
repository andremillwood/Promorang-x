/**
 * TonightResultCard Component
 * 
 * Shows draw entries, prizes, and lock time.
 */

import { Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import { useCountdown } from '../../hooks/useTodayGame';
import type { Draw } from '../../types/todayGame';

interface TonightResultCardProps {
    draw: Draw;
    lockTime: string;
    className?: string;
}

export function TonightResultCard({ draw, lockTime, className = '' }: TonightResultCardProps) {
    const { formatted: timeRemaining, isExpired } = useCountdown(lockTime);

    // Get top 3 prizes
    const topPrizes = draw.prizes.slice(0, 3);

    return (
        <div className={`bg-zinc-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-500/10 ${className}`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white uppercase tracking-tight text-sm">Settlement Window</h3>
                        <p className="text-[10px] text-zinc-500">
                            {isExpired ? 'AUDIT COMPLETE' : `FINALIZES IN ${timeRemaining.toUpperCase()}`}
                        </p>
                    </div>
                </div>

                {/* Success Records badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-blue-300">
                        {draw.entryCount}
                    </span>
                    <span className="text-[10px] text-blue-500 uppercase font-bold">
                        Records
                    </span>
                </div>
            </div>

            {/* Prizes preview */}
            <div className="p-4 space-y-2">
                {topPrizes.map((prize, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-zinc-900/50 rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prize.tier === 'grand' ? 'bg-blue-500/20 text-blue-400' :
                                prize.tier === 'major' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-zinc-700/50 text-zinc-500'
                                }`}>
                                {prize.tier === 'grand' ? 'CRITICAL' : prize.tier === 'major' ? 'STANDARD' : 'SECONDARY'}
                            </span>
                            <span className="text-xs text-zinc-300">
                                {prize.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Next entry hint */}
            {draw.nextEntryRule && !isExpired && (
                <div className="px-4 py-3 bg-zinc-950/30 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-500 uppercase tracking-tight">Active Protocol Bonus:</span>
                            <span className="text-emerald-400 font-bold">
                                {draw.nextEntryRule.replace('entry', 'record')}
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                </div>
            )}
        </div>
    );
}
