/**
 * Access Rank Explainer Component
 * 
 * Duolingo-inspired compact widget explaining Access Rank to new users.
 * Shows current rank, progress bar, and next unlock.
 * 
 * Used on Today page for State 0/1 users.
 */

import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Trophy, Users, Ticket, TrendingUp, Gift, Flame } from 'lucide-react';

// Rank definitions with benefits
const RANK_DATA = [
    {
        level: 0,
        name: 'New',
        emoji: '🌱',
        daysRequired: 0,
        color: 'from-gray-400 to-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        unlocks: ['Access to Today page', 'Entry to deals & events'],
    },
    {
        level: 1,
        name: 'Explorer',
        emoji: '🔍',
        daysRequired: 1,
        color: 'from-blue-400 to-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        unlocks: ['Daily Draw entries', 'Post content for proof'],
    },
    {
        level: 2,
        name: 'Member',
        emoji: '⭐',
        daysRequired: 7,
        color: 'from-purple-400 to-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        unlocks: ['Leaderboard access', 'PromoShare lottery', 'Referral rewards'],
    },
    {
        level: 3,
        name: 'Insider',
        emoji: '💎',
        daysRequired: 14,
        color: 'from-amber-400 to-orange-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        unlocks: ['Growth Hub', 'Priority opportunities', 'Full platform access'],
    },
];

interface AccessRankExplainerProps {
    currentRank: number;
    daysActive?: number;
    streakDays?: number;
}

export default function AccessRankExplainer({
    currentRank,
    daysActive = 0,
    streakDays = 0
}: AccessRankExplainerProps) {
    const currentRankData = RANK_DATA[Math.min(currentRank, RANK_DATA.length - 1)];
    const nextRankData = currentRank < RANK_DATA.length - 1 ? RANK_DATA[currentRank + 1] : null;

    // Calculate progress to next rank
    const currentThreshold = currentRankData.daysRequired;
    const nextThreshold = nextRankData?.daysRequired || currentThreshold;
    const daysIntoCurrentRank = daysActive - currentThreshold;
    const daysNeededForNext = nextThreshold - currentThreshold;
    const progressPercent = nextRankData
        ? Math.min(Math.max((daysIntoCurrentRank / daysNeededForNext) * 100, 0), 100)
        : 100;
    const daysUntilNext = Math.max(nextThreshold - daysActive, 0);

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentRankData.bgColor} flex items-center justify-center text-2xl`}>
                        {currentRankData.emoji}
                    </div>
                    <div>
                        <h3 className="font-bold text-pr-text-1 text-lg">
                            Access Rank: {currentRankData.name}
                        </h3>
                        <p className="text-sm text-pr-text-2">
                            Day {daysActive} on Promorang
                        </p>
                    </div>
                </div>
                {streakDays > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streakDays}</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {nextRankData && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-pr-text-2">Progress to {nextRankData.name}</span>
                        <span className="font-medium text-pr-text-1">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3 bg-pr-surface-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${nextRankData.color} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-pr-text-3">
                        {daysUntilNext === 0
                            ? 'Complete an action to rank up!'
                            : `${daysUntilNext} more day${daysUntilNext !== 1 ? 's' : ''} to reach ${nextRankData.name}`
                        }
                    </p>
                </div>
            )}

            {/* Next Unlock Preview */}
            {nextRankData && (
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-pr-border/50">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${nextRankData.color} flex items-center justify-center text-white text-sm`}>
                        {nextRankData.emoji}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-pr-text-1">
                            Unlocking at {nextRankData.name}
                        </p>
                        <p className="text-xs text-pr-text-2">
                            {nextRankData.unlocks[0]}
                        </p>
                    </div>
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                </div>
            )}

            {/* Why It Matters - Collapsed */}
            <details className="group">
                <summary className="flex items-center gap-2 text-sm font-medium text-pr-text-2 cursor-pointer hover:text-pr-text-1 transition-colors">
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                    Why does Access Rank matter?
                </summary>
                <div className="mt-3 space-y-2 pl-6 text-sm text-pr-text-2">
                    <div className="flex items-start gap-2">
                        <Gift className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Higher rank = earlier access to limited opportunities</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Ticket className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Unlock the daily draw and PromoShare lottery</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Access Growth Hub to multiply your earnings</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Earn from referrals when you reach Member rank</span>
                    </div>
                </div>
            </details>

            {/* CTA Link */}
            <Link
                to="/access-rank"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
                View Full Progress
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
