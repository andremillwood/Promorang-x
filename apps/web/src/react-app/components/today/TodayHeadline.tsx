/**
 * TodayHeadline - Premium Reveal-First Headline Card
 */

import { useEffect, useRef } from 'react';
import { Sparkles, Gift, Zap, Star, Unlock, Megaphone, ArrowRight } from 'lucide-react';
import { getStateBasedCopy, type UserState } from '@/react-app/lib/userState';

interface HeadlineData {
    type: string;
    payload: {
        title: string;
        subtitle?: string;
        cta_text?: string;
        cta_action?: string;
        image_url?: string;
        multiplier?: number;
        extra_tickets?: number;
        reward_amount?: number;
        drop_id?: string;
    };
    drop?: { id: string };
}

interface TodayHeadlineProps {
    headline: HeadlineData | null;
    viewed: boolean;
    engaged: boolean;
    onView: () => void;
    onEngage: () => void;
    userState: number; // MaturityState (0-3)
}

// Icon mapping for headline types
const HEADLINE_ICONS: Record<string, React.ReactNode> = {
    reward: <Gift className="w-5 h-5" />,
    multiplier: <Zap className="w-5 h-5" />,
    status: <Star className="w-5 h-5" />,
    chance: <Sparkles className="w-5 h-5" />,
    access: <Unlock className="w-5 h-5" />,
    sponsored: <Megaphone className="w-5 h-5" />,
};

// Premium gradient schemes for headline types
const HEADLINE_THEMES: Record<string, {
    gradient: string;
    iconBg: string;
    badge: string;
    button: string;
    buttonText: string;
}> = {
    reward: {
        gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        button: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25',
        buttonText: 'text-white',
    },
    multiplier: {
        gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/5',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25',
        buttonText: 'text-white',
    },
    status: {
        gradient: 'from-purple-500/20 via-pink-500/10 to-fuchsia-500/5',
        iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25',
        buttonText: 'text-white',
    },
    chance: {
        gradient: 'from-blue-500/20 via-indigo-500/10 to-violet-500/5',
        iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 shadow-lg shadow-blue-500/25',
        buttonText: 'text-white',
    },
    access: {
        gradient: 'from-cyan-500/20 via-sky-500/10 to-blue-500/5',
        iconBg: 'bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-lg shadow-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        button: 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 shadow-lg shadow-cyan-500/25',
        buttonText: 'text-white',
    },
    sponsored: {
        gradient: 'from-slate-500/20 via-gray-500/10 to-zinc-500/5',
        iconBg: 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-lg shadow-slate-500/30',
        badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
        button: 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 shadow-lg shadow-slate-500/25',
        buttonText: 'text-white',
    },
};

// Human-readable type labels
const HEADLINE_LABELS: Record<string, string> = {
    reward: "TODAY'S OPPORTUNITY",
    multiplier: 'POWER-UP DAY',
    status: 'STATUS UNLOCK',
    chance: 'LUCKY DAY',
    access: 'EARLY ACCESS',
    sponsored: 'FEATURED',
};

export default function TodayHeadline({ headline, viewed, engaged, onView, onEngage, userState }: TodayHeadlineProps) {
    // Track if view has already been fired this session to prevent infinite loops
    const viewFiredRef = useRef(false);

    // Trigger view tracking on mount (only once)
    useEffect(() => {
        if (headline && !viewed && !viewFiredRef.current) {
            viewFiredRef.current = true;
            onView();
        }
    }, [headline, viewed, onView]);

    const stateCopy = getStateBasedCopy(userState as UserState);
    const type = headline?.type || 'reward';

    // Fallback/Override based on user state
    const title = (userState <= 1) ? stateCopy.headline.title : (headline?.payload.title || stateCopy.headline.title);
    const subtitle = (userState <= 1) ? stateCopy.headline.subtitle : (headline?.payload.subtitle || stateCopy.headline.subtitle);

    const theme = HEADLINE_THEMES[type] || HEADLINE_THEMES.reward;
    const icon = HEADLINE_ICONS[type] || HEADLINE_ICONS.reward;
    const label = HEADLINE_LABELS[type] || HEADLINE_LABELS.reward;

    // Placeholder if no headline
    if (!headline) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_50%)]" />
                <div className="relative flex items-center gap-3 text-gray-500 mb-4">
                    <div className="p-2 rounded-xl bg-gray-700/50">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">TODAY'S HEADLINE</span>
                </div>
                <p className="relative text-gray-400 text-center py-6">
                    Check back soon for today's featured opportunity
                </p>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} backdrop-blur-xl border border-white/10`}>
            {/* Ambient glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_50%)]" />

            {/* Header */}
            <div className="relative px-6 pt-5 pb-3 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {label}
                </span>
                {engaged && (
                    <span className="ml-auto text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                        ✓ Explored
                    </span>
                )}
            </div>

            {/* Image (if available) - Hide for state 0/1 to focus on message */}
            {userState > 1 && headline.payload.image_url && (
                <div className="relative px-6">
                    <img
                        src={headline.payload.image_url}
                        alt={title}
                        className="w-full h-40 object-cover rounded-xl border border-white/10"
                    />
                </div>
            )}

            {/* Content - Reveal First */}
            <div className="relative px-6 py-4">
                <h2 className="text-xl font-bold text-white mb-2">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-white/60 mb-4">
                        {subtitle}
                    </p>
                )}

                {/* Type-specific bonus display */}
                {type === 'reward' && headline.payload.reward_amount && (
                    <div className={`inline-flex items-center gap-2 ${theme.badge} px-3 py-1.5 rounded-full text-sm font-bold mb-4`}>
                        <Gift className="w-4 h-4" />
                        {headline.payload.reward_amount} Gems Available
                    </div>
                )}
                {type === 'multiplier' && headline.payload.multiplier && (
                    <div className={`inline-flex items-center gap-2 ${theme.badge} px-3 py-1.5 rounded-full text-sm font-bold mb-4`}>
                        <Zap className="w-4 h-4" />
                        {headline.payload.multiplier}× Points Today
                    </div>
                )}
                {type === 'chance' && headline.payload.extra_tickets && (
                    <div className={`inline-flex items-center gap-2 ${theme.badge} px-3 py-1.5 rounded-full text-sm font-bold mb-4`}>
                        <Sparkles className="w-4 h-4" />
                        +{headline.payload.extra_tickets} Bonus Ticket
                    </div>
                )}
            </div>

            {/* CTA Button */}
            <div className="relative px-6 pb-6">
                <button
                    onClick={onEngage}
                    disabled={engaged}
                    className={`btn-spring w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${engaged
                        ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                        : `${theme.button} ${theme.buttonText}`
                        }`}
                >
                    {engaged ? 'Explored ✓' : (
                        <>
                            {headline.payload.cta_text || 'Explore Opportunity'}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
