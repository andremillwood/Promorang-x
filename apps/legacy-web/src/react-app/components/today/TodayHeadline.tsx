/**
 * TodayHeadline - Premium Reveal-Activation Card
 */

import { useEffect, useRef } from 'react';
import { Target, ShieldCheck, Activity, Shield, Lock, Megaphone, ArrowRight } from 'lucide-react';

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
}

// Icon mapping for industrial types
const HEADLINE_ICONS: Record<string, React.ReactNode> = {
    reward: <ShieldCheck className="w-5 h-5" />,
    multiplier: <Activity className="w-5 h-5" />,
    status: <Shield className="w-5 h-5" />,
    chance: <Target className="w-5 h-5" />,
    access: <Lock className="w-5 h-5" />,
    sponsored: <Megaphone className="w-5 h-5" />,
};

// Industrial gradient schemes
const HEADLINE_THEMES: Record<string, {
    gradient: string;
    iconBg: string;
    badge: string;
    button: string;
    buttonText: string;
}> = {
    reward: {
        gradient: 'from-emerald-900/20 via-blue-900/10 to-zinc-900/5',
        iconBg: 'bg-emerald-600 text-white shadow-lg',
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        button: 'bg-emerald-600 hover:bg-emerald-700 shadow-lg',
        buttonText: 'text-white',
    },
    multiplier: {
        gradient: 'from-blue-900/20 via-zinc-900/10 to-zinc-900/5',
        iconBg: 'bg-blue-600 text-white shadow-lg',
        badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-lg',
        buttonText: 'text-white',
    },
    status: {
        gradient: 'from-zinc-800 via-zinc-900 to-black',
        iconBg: 'bg-zinc-700 text-white shadow-lg',
        badge: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600',
        button: 'bg-zinc-700 hover:bg-zinc-650 shadow-lg',
        buttonText: 'text-white',
    },
    chance: {
        gradient: 'from-indigo-900/20 via-blue-900/10 to-zinc-900/5',
        iconBg: 'bg-indigo-600 text-white shadow-lg',
        badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        button: 'bg-indigo-600 hover:bg-indigo-700 shadow-lg',
        buttonText: 'text-white',
    },
    access: {
        gradient: 'from-slate-800/20 to-zinc-900/5',
        iconBg: 'bg-slate-700 text-white shadow-lg',
        badge: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
        button: 'bg-slate-700 hover:bg-slate-600 shadow-lg',
        buttonText: 'text-white',
    },
    sponsored: {
        gradient: 'from-zinc-800/20 via-slate-900/10 to-zinc-900/5',
        iconBg: 'bg-zinc-600 text-white shadow-lg',
        badge: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
        button: 'bg-zinc-600 hover:bg-zinc-500 shadow-lg',
        buttonText: 'text-white',
    },
};

const HEADLINE_LABELS: Record<string, string> = {
    reward: "NEW OBJECTIVE",
    multiplier: "PROFILE OPTIMIZATION",
    status: "PROFESSIONAL UPGRADE",
    chance: "EXCLUSIVE OPPORTUNITY",
    access: "EARLY ACCESS",
    sponsored: "SYSTEM HIGHLIGHT",
};

export default function TodayHeadline({ headline, viewed, engaged, onView, onEngage }: TodayHeadlineProps) {
    const viewFiredRef = useRef(false);

    useEffect(() => {
        if (headline && !viewed && !viewFiredRef.current) {
            viewFiredRef.current = true;
            onView();
        }
    }, [headline, viewed, onView]);

    const type = headline?.type || 'reward';
    const theme = HEADLINE_THEMES[type] || HEADLINE_THEMES.reward;
    const icon = HEADLINE_ICONS[type] || HEADLINE_ICONS.reward;
    const label = HEADLINE_LABELS[type] || HEADLINE_LABELS.reward;

    if (!headline) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 shadow-lg">
                <div className="relative flex items-center gap-3 text-zinc-400 mb-4">
                    <div className="p-2 rounded-xl bg-zinc-800 shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Awaiting New Opportunities</span>
                </div>
                <p className="relative text-zinc-500 text-center py-6 text-sm font-medium">
                    Review your professional history for upcoming invitations.
                </p>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} border border-white/5 shadow-xl`}>
            {/* Header */}
            <div className="relative px-6 pt-5 pb-3 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${theme.iconBg} shadow-md`}>
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    {label}
                </span>
                {engaged && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                        ✓ Recorded
                    </span>
                )}
            </div>

            {/* Content Section */}
            <div className="relative px-6 py-5">
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                    {headline.payload.title}
                </h2>
                {headline.payload.subtitle && (
                    <p className="text-sm font-medium text-white/50 mb-6 leading-relaxed">
                        {headline.payload.subtitle}
                    </p>
                )}

                {/* Industrial Credit Indicators -> Pro History */}
                {type === 'reward' && headline.payload.reward_amount && (
                    <div className={`inline-flex items-center gap-2.5 ${theme.badge} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md`}>
                        <ShieldCheck className="w-4 h-4" />
                        {headline.payload.reward_amount} Verified Credits Available
                    </div>
                )}
                {type === 'multiplier' && headline.payload.multiplier && (
                    <div className={`inline-flex items-center gap-2.5 ${theme.badge} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md`}>
                        <Activity className="w-4 h-4" />
                        {headline.payload.multiplier}× Reputation Boost
                    </div>
                )}
                {type === 'chance' && headline.payload.extra_tickets && (
                    <div className={`inline-flex items-center gap-2.5 ${theme.badge} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md`}>
                        <Target className="w-4 h-4" />
                        +{headline.payload.extra_tickets} Success Records
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="relative px-6 pb-6">
                <button
                    onClick={onEngage}
                    disabled={engaged}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${engaged
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                        : `${theme.button} ${theme.buttonText}`
                        }`}
                >
                    {engaged ? 'STORY RECORDED' : (
                        <>
                            {headline.payload.cta_text || 'VIEW OBJECTIVE'}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
