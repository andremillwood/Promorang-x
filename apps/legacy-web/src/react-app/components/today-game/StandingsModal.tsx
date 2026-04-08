/**
 * StandingsModal Component
 * 
 * Modal showing full house standings and contributing activations.
 */

import { X, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WarScore, Activation } from '../../types/todayGame';
import { getHouseStandings, formatDelta } from '../../lib/todayGameUtils';

interface StandingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    warScores: WarScore[];
    userHouseId: string | null;
    activations: Activation[];
    districtName: string;
}

export function StandingsModal({
    isOpen,
    onClose,
    warScores,
    userHouseId,
    activations,
    districtName
}: StandingsModalProps) {
    const standings = getHouseStandings(warScores);
    const availableActivations = (activations || []).filter(q => q.status === 'available');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
                        initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
                    >
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-700/50 overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    <h2 className="text-lg font-bold text-white">
                                        {districtName} Standings
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            {/* Standings list */}
                            <div className="p-4 space-y-2">
                                {standings.map((score, index) => {
                                    const isUserHouse = score.houseId === userHouseId;
                                    const position = index + 1;

                                    return (
                                        <motion.div
                                            key={score.houseId}
                                            className={`
                                                flex items-center justify-between p-3 rounded-xl
                                                ${isUserHouse
                                                    ? 'bg-purple-500/10 border border-purple-500/30'
                                                    : 'bg-zinc-800/50'
                                                }
                                            `}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Position */}
                                                <div className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center font-bold
                                                    ${position === 1 ? 'bg-amber-500/20 text-amber-400' :
                                                        position === 2 ? 'bg-zinc-400/20 text-zinc-300' :
                                                            position === 3 ? 'bg-amber-700/20 text-amber-600' :
                                                                'bg-zinc-700/50 text-zinc-500'}
                                                `}>
                                                    {position}
                                                </div>

                                                {/* House info */}
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-6 h-6 rounded flex items-center justify-center text-sm"
                                                        style={{ backgroundColor: `${score.houseColor}30` }}
                                                    >
                                                        {score.houseIcon}
                                                    </span>
                                                    <span
                                                        className="font-semibold"
                                                        style={{ color: score.houseColor }}
                                                    >
                                                        {score.houseName}
                                                    </span>
                                                    {isUserHouse && (
                                                        <span className="text-xs text-purple-400">(You)</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score & delta */}
                                            <div className="text-right">
                                                <p className="font-bold text-white">
                                                    {score.score.toLocaleString()}
                                                </p>
                                                <p className={`text-xs flex items-center justify-end gap-1 ${score.deltaSinceYesterday >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                    }`}>
                                                    <TrendingUp className="w-3 h-3" />
                                                    {formatDelta(score.deltaSinceYesterday)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* What counts today */}
                            <div className="p-4 border-t border-zinc-800">
                                <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" />
                                    What counts today
                                </h3>
                                <div className="space-y-1.5">
                                    {availableActivations.slice(0, 3).map(activation => (
                                        <div
                                            key={activation.id}
                                            className="flex items-center justify-between text-sm py-1.5 px-2 bg-zinc-800/50 rounded"
                                        >
                                            <span className="text-zinc-300">{activation.title}</span>
                                            <span className="text-amber-400 font-medium">
                                                +{activation.houseImpactPoints} pts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
