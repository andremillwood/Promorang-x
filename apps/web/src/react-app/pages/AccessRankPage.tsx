/**
 * Access Rank Page
 * 
 * Dedicated page explaining the Access Rank system with:
 * - Current rank and progress visualization (Uber-style)
 * - Rank journey timeline (Duolingo-style)
 * - Benefits breakdown by rank
 * - How to rank up faster tips
 */

import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import {
    Check, Lock, ChevronRight, ArrowLeft, Flame, Gift, Ticket,
    TrendingUp, Users, Trophy, Star, Sparkles, Calendar, Target,
    Zap, Crown
} from 'lucide-react';
import { markCompleted, STORAGE_KEYS } from '@/react-app/hooks/useWhatsNext';

// Rank definitions with full details
const RANK_DATA = [
    {
        level: 0,
        name: 'New',
        emoji: '🌱',
        daysRequired: 0,
        color: 'from-gray-400 to-gray-500',
        borderColor: 'border-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        description: 'Welcome! You just joined Promorang.',
        unlocks: [
            { icon: Calendar, label: 'Access Today page', available: true },
            { icon: Gift, label: 'Claim deals', available: true },
            { icon: Users, label: 'RSVP to events', available: true },
        ],
    },
    {
        level: 1,
        name: 'Explorer',
        emoji: '🔍',
        daysRequired: 1,
        color: 'from-blue-400 to-blue-500',
        borderColor: 'border-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        description: 'You showed up! Keep exploring.',
        unlocks: [
            { icon: Ticket, label: 'Daily Draw entries', available: true },
            { icon: Sparkles, label: 'Post content for proof', available: true },
            { icon: Target, label: 'Multiplier bonuses', available: true },
        ],
    },
    {
        level: 2,
        name: 'Member',
        emoji: '⭐',
        daysRequired: 7,
        color: 'from-purple-400 to-purple-500',
        borderColor: 'border-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        description: 'One week of consistency. Real member status.',
        unlocks: [
            { icon: Trophy, label: 'Leaderboard access', available: true },
            { icon: Star, label: 'PromoShare lottery', available: true },
            { icon: Users, label: 'Referral rewards', available: true },
        ],
    },
    {
        level: 3,
        name: 'Insider',
        emoji: '💎',
        daysRequired: 14,
        color: 'from-amber-400 to-orange-500',
        borderColor: 'border-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        description: 'Two weeks strong. Full platform access unlocked.',
        unlocks: [
            { icon: TrendingUp, label: 'Growth Hub', available: true },
            { icon: Zap, label: 'Priority opportunities', available: true },
            { icon: Crown, label: 'Sponsor content for brands', available: true },
        ],
    },
];

const TIPS = [
    {
        icon: Calendar,
        title: 'Show up daily',
        description: 'Your rank increases each day you participate. One action per day is all it takes.',
        color: 'text-blue-500',
    },
    {
        icon: Target,
        title: 'Complete actions',
        description: 'Claim deals, attend events, submit proofs. Each completed action is verified.',
        color: 'text-purple-500',
    },
    {
        icon: Flame,
        title: 'Keep your streak',
        description: 'Consistent users get bonus multipliers. Missing days resets your streak (not your rank).',
        color: 'text-orange-500',
    },
];

export default function AccessRankPage() {
    const { user } = useAuth();
    const { maturityState } = useMaturity();
    const navigate = useNavigate();

    // Mark as viewed for What's Next tracking
    useEffect(() => {
        markCompleted(STORAGE_KEYS.viewedAccessRank);
    }, []);

    // Mock data - in real implementation, fetch from API
    const daysActive = maturityState <= 1 ? maturityState : maturityState === 2 ? 7 : 14;
    const streakDays = (user as any)?.points_streak_days || 0;
    const currentRank = maturityState;

    const currentRankData = RANK_DATA[Math.min(currentRank, RANK_DATA.length - 1)];
    const nextRankData = currentRank < RANK_DATA.length - 1 ? RANK_DATA[currentRank + 1] : null;

    // Calculate progress
    const currentThreshold = currentRankData.daysRequired;
    const nextThreshold = nextRankData?.daysRequired || currentThreshold;
    const daysUntilNext = Math.max(nextThreshold - daysActive, 0);
    const progressPercent = nextRankData
        ? Math.min(((daysActive - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
        : 100;

    return (
        <div className="min-h-screen bg-pr-surface-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-white/80 hover:text-white mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">Your Access Rank</h1>
                        <p className="text-white/80">
                            Consistency creates opportunity. Here's where you stand.
                        </p>
                    </div>

                    {/* Current Rank Display - Uber-style */}
                    <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 text-4xl mb-4">
                            {currentRankData.emoji}
                        </div>
                        <h2 className="text-2xl font-bold">{currentRankData.name}</h2>
                        <p className="text-white/70 text-sm mt-1">{currentRankData.description}</p>

                        {streakDays > 0 && (
                            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500/20 rounded-full">
                                <Flame className="w-5 h-5 text-orange-300" />
                                <span className="font-bold">{streakDays}-day streak</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-6">
                {/* Progress to Next Rank */}
                {nextRankData && (
                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-pr-text-1">Progress to {nextRankData.name}</h3>
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>

                        <div className="h-4 bg-pr-surface-3 rounded-full overflow-hidden mb-3">
                            <div
                                className={`h-full bg-gradient-to-r ${nextRankData.color} rounded-full transition-all duration-700 ease-out`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-pr-text-2">Day {daysActive}</span>
                            <span className="text-pr-text-1 font-medium">
                                {daysUntilNext === 0
                                    ? '🎉 Ready to rank up!'
                                    : `${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''} to go`
                                }
                            </span>
                            <span className="text-pr-text-2">Day {nextThreshold}</span>
                        </div>
                    </div>
                )}

                {/* The Journey - Timeline */}
                <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-pr-text-1 mb-6">The Rank Journey</h3>

                    <div className="space-y-6">
                        {RANK_DATA.map((rank, index) => {
                            const isCompleted = currentRank > rank.level;
                            const isCurrent = currentRank === rank.level;
                            const isLocked = currentRank < rank.level;

                            return (
                                <div key={rank.level} className="relative">
                                    {/* Connector Line */}
                                    {index < RANK_DATA.length - 1 && (
                                        <div className={`absolute left-5 top-12 w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-pr-border'
                                            }`} />
                                    )}

                                    <div className={`flex items-start gap-4 ${isLocked ? 'opacity-50' : ''}`}>
                                        {/* Rank Badge */}
                                        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isCompleted
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : isCurrent
                                                ? rank.bgColor
                                                : 'bg-pr-surface-3'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                rank.emoji
                                            )}
                                            {isCurrent && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                                            )}
                                        </div>

                                        {/* Rank Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-pr-text-1">{rank.name}</h4>
                                                <span className="text-xs text-pr-text-3">Day {rank.daysRequired}+</span>
                                                {isCurrent && (
                                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                                                        You are here
                                                    </span>
                                                )}
                                            </div>

                                            {/* Unlocks */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {rank.unlocks.map((unlock, i) => {
                                                    const Icon = unlock.icon;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${isLocked
                                                                ? 'bg-pr-surface-3 text-pr-text-3'
                                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                }`}
                                                        >
                                                            {isLocked ? (
                                                                <Lock className="w-3 h-3" />
                                                            ) : (
                                                                <Icon className="w-3 h-3" />
                                                            )}
                                                            <span>{unlock.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* How to Rank Up */}
                <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-pr-text-1 mb-4">How to Rank Up Faster</h3>

                    <div className="space-y-4">
                        {TIPS.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-pr-surface-2 flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                                    <tip.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-pr-text-1">{tip.title}</h4>
                                    <p className="text-sm text-pr-text-2">{tip.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                    <Link
                        to="/today"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
                    >
                        Start Today's Action
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
