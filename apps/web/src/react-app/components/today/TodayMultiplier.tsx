/**
 * TodayMultiplier - Premium Daily Multiplier Display
 * 
 * Shows the user's current daily multiplier with:
 * - Animated gradient background
 * - Dark mode optimized
 * - Glowing effects for active multipliers
 */

import { Zap, Flame, Gift, Sunrise, Star, Sparkles } from 'lucide-react';
import { getStateBasedCopy, type UserState } from '@/react-app/lib/userState';

interface TodayMultiplierProps {
    type: string;
    value: number;
    reason: string | null;
    userState: number; // MaturityState (0-3)
}

// Premium gradient themes for multiplier types
const MULTIPLIER_THEMES: Record<string, {
    gradient: string;
    iconGradient: string;
    glow: string;
    valueColor: string;
}> = {
    base: {
        gradient: 'from-gray-800/80 to-gray-900/80',
        iconGradient: 'from-gray-400 to-gray-500',
        glow: '',
        valueColor: 'text-gray-300',
    },
    streak_bonus: {
        gradient: 'from-orange-600/30 via-amber-600/20 to-yellow-600/10',
        iconGradient: 'from-orange-400 to-amber-500',
        glow: 'shadow-lg shadow-orange-500/20',
        valueColor: 'text-orange-400',
    },
    catchup_boost: {
        gradient: 'from-emerald-600/30 via-teal-600/20 to-cyan-600/10',
        iconGradient: 'from-emerald-400 to-teal-500',
        glow: 'shadow-lg shadow-emerald-500/20',
        valueColor: 'text-emerald-400',
    },
    weekend_wave: {
        gradient: 'from-purple-600/30 via-pink-600/20 to-fuchsia-600/10',
        iconGradient: 'from-purple-400 to-pink-500',
        glow: 'shadow-lg shadow-purple-500/20',
        valueColor: 'text-purple-400',
    },
    welcome_boost: {
        gradient: 'from-blue-600/30 via-indigo-600/20 to-violet-600/10',
        iconGradient: 'from-blue-400 to-indigo-500',
        glow: 'shadow-lg shadow-blue-500/20',
        valueColor: 'text-blue-400',
    },
    milestone: {
        gradient: 'from-yellow-600/30 via-amber-600/20 to-orange-600/10',
        iconGradient: 'from-yellow-400 to-amber-500',
        glow: 'shadow-lg shadow-yellow-500/20',
        valueColor: 'text-yellow-400',
    },
    sponsored: {
        gradient: 'from-cyan-600/30 via-sky-600/20 to-blue-600/10',
        iconGradient: 'from-cyan-400 to-sky-500',
        glow: 'shadow-lg shadow-cyan-500/20',
        valueColor: 'text-cyan-400',
    },
};

// Icon mapping
const MULTIPLIER_ICONS: Record<string, React.ReactNode> = {
    base: <Zap className="w-5 h-5" />,
    streak_bonus: <Flame className="w-5 h-5" />,
    catchup_boost: <Gift className="w-5 h-5" />,
    weekend_wave: <Sunrise className="w-5 h-5" />,
    welcome_boost: <Star className="w-5 h-5" />,
    milestone: <Sparkles className="w-5 h-5" />,
    sponsored: <Zap className="w-5 h-5" />,
};

export default function TodayMultiplier({ type, value, reason, userState }: TodayMultiplierProps) {
    const stateCopy = getStateBasedCopy(userState as UserState);
    const theme = MULTIPLIER_THEMES[type] || MULTIPLIER_THEMES.base;
    const icon = MULTIPLIER_ICONS[type] || MULTIPLIER_ICONS.base;
    const isActive = value > 1;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} backdrop-blur-xl border border-white/10 p-5 ${theme.glow}`}>
            {/* Ambient glow */}
            {isActive && (
                <>
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                </>
            )}

            {/* Header */}
            <div className="relative flex items-center gap-2.5 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.iconGradient} text-white shadow-lg`}>
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {stateCopy.multiplier}
                </span>
            </div>

            {/* Value */}
            <div className="relative">
                <div className={`text-4xl font-black ${theme.valueColor} ${isActive ? '' : 'opacity-50'}`}>
                    {value.toFixed(1)}×
                </div>

                {/* Reason */}
                {reason ? (
                    <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">
                        {reason}
                    </p>
                ) : (
                    <p className="text-xs text-white/30 mt-2">
                        {userState === 0 ? "Your first action earns extra" : "Base rate"}
                    </p>
                )}
            </div>

            {/* Active pulse indicator */}
            {isActive && (
                <div className="absolute top-4 right-4">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-gradient-to-r ${theme.iconGradient}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${theme.iconGradient}`}></span>
                    </span>
                </div>
            )}
        </div>
    );
}
