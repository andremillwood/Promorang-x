import { Link } from 'react-router-dom';
import { FileCheck, ChevronRight, Activity, ShieldCheck } from 'lucide-react';
import type { LastNightRecap as LastNightRecapType } from '../../types/todayGame';

interface LastNightRecapProps {
    recap: LastNightRecapType;
    className?: string;
}

export function LastNightRecap({ recap, className = '' }: LastNightRecapProps) {
    const placementLabels = ['Lead', 'Primary', 'Standard', 'Secondary'];

    return (
        <Link
            to="/last-night"
            className={`
                block bg-zinc-900/30 backdrop-blur-sm rounded-2xl px-4 py-3
                hover:bg-zinc-900/50 transition-colors cursor-pointer
                border border-blue-500/10
                ${className}
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Audit icon */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/10"
                    >
                        <FileCheck className="w-4 h-4 text-blue-400" />
                    </div>

                    {/* History line */}
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5 font-bold">
                            Previous Settlement
                        </p>
                        <p className="text-xs text-zinc-300 font-medium">
                            {recap.historyLine.replace('House', 'Hub')}
                        </p>
                    </div>
                </div>

                {/* Hub placement */}
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">Hub Profile</p>
                        <p className="text-xs font-bold text-white">
                            {placementLabels[recap.userHousePlacement - 1] || 'Standard'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settlement distribution (if any) */}
            {recap.userWonPrize && (
                <div className="mt-2 pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-300">
                            Protocol Disbursement: {recap.userWonPrize.amount} {recap.userWonPrize.type.toUpperCase()}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
            )}
        </Link>
    );
}
