/**
 * BoostCard Component
 * 
 * Shows active multiplier with countdown.
 */

import { Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountdown } from '../../hooks/useTodayGame';
import type { Boost } from '../../types/todayGame';

interface BoostCardProps {
    boost: Boost;
    className?: string;
}

export function BoostCard({ boost, className = '' }: BoostCardProps) {
    const { formatted: timeRemaining, isExpired } = useCountdown(boost.endsAt);

    if (isExpired) return null;

    return (
        <motion.div
            className={`
                relative overflow-hidden rounded-2xl
                bg-gradient-to-r from-amber-500/10 to-orange-500/10
                ring-1 ring-amber-500/20
                ${className}
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-pulse" />

            <div className="relative p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Boost icon */}
                    <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-400" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-amber-400">
                                {boost.multiplier}x
                            </span>
                            <span className="text-sm font-medium text-white">
                                {boost.reason}
                            </span>
                        </div>
                        <p className="text-xs text-amber-400/70">
                            All activation points boosted
                        </p>
                    </div>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">
                        {timeRemaining}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
