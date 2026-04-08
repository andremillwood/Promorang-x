/**
 * PrimaryActivationCard Component
 * 
 * The main call-to-action activation with house impact, slots, and time sensitivity.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Zap, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useCountdown } from '../../hooks/useTodayGame';
import { formatSlots } from '../../lib/todayGameUtils';
import type { Activation, Boost } from '../../types/todayGame';

interface PrimaryActivationCardProps {
    activation: Activation;
    boost?: Boost;
    onComplete: (activationId: string) => Promise<boolean>;
    className?: string;
}

export function PrimaryActivationCard({
    activation,
    boost,
    onComplete,
    className = ''
}: PrimaryActivationCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    const { formatted: timeRemaining, isExpired } = useCountdown(activation.endsAt);
    const slotsText = formatSlots(activation.slots);
    const isCompleted = activation.status === 'completed' || justCompleted;

    // Calculate total impact with boost
    const baseImpact = activation.houseImpactPoints;
    const boostedImpact = boost
        ? Math.round(baseImpact * boost.multiplier)
        : baseImpact;
    const hasBoost = boost && boost.multiplier > 1;

    const handleComplete = async () => {
        if (isCompleting || isCompleted) return;

        setIsCompleting(true);
        try {
            const success = await onComplete(activation.id);
            if (success) {
                setJustCompleted(true);
            }
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <motion.div
            className={`
                relative overflow-hidden rounded-2xl
                ${isCompleted
                    ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20'
                    : 'bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 backdrop-blur-sm ring-1 ring-zinc-800/50'
                }
                ${className}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Boost indicator */}
            {hasBoost && !isCompleted && (
                <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
                    <Zap className="w-3 h-3 inline-block mr-1" />
                    {boost.multiplier}x BOOST
                </div>
            )}

            <div className="p-5">
                {/* Activation header */}
                <div className="flex items-start gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                            backgroundColor: isCompleted
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <ShieldCheck className="w-6 h-6 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-blue-400 font-medium uppercase tracking-wide">
                                Primary Activation
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">
                            {activation.title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    {activation.description}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
                    {/* Protocol impact */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10"
                    >
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-blue-300">
                            +{boostedImpact} Protocol Weight
                        </span>
                        {hasBoost && (
                            <span className="text-zinc-500 line-through ml-1">
                                +{baseImpact}
                            </span>
                        )}
                    </div>

                    {/* Settlement Reward */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10">
                        <span className="text-emerald-400">📊</span>
                        <span className="font-semibold text-emerald-300">
                            +{activation.reward.amount} {activation.reward.type.toUpperCase()} Settlement
                        </span>
                    </div>

                    {/* Slots */}
                    {slotsText && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{slotsText}</span>
                        </div>
                    )}

                    {/* Time */}
                    {activation.endsAt && !isExpired && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Ends in {timeRemaining}</span>
                        </div>
                    )}
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleComplete}
                    disabled={isCompleting || isCompleted || isExpired}
                    className={`
                        w-full py-3.5 px-6 rounded-xl font-bold text-base
                        flex items-center justify-center gap-2
                        transition-all duration-200
                        ${isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : isCompleting
                                ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                : 'bg-gradient-to-r from-blue-500 to-emerald-600 text-white hover:from-blue-400 hover:to-emerald-500 active:scale-[0.98]'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                >
                    {isCompleting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Finalizing Audit...
                        </>
                    ) : isCompleted ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Activation Verified
                        </>
                    ) : (
                        <>
                            {activation.ctaLabel?.replace('Activation', 'Audit') || 'Initiate Activation'}
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
