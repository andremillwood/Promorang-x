/**
 * TodayMultiplier - Reliability Index (PRI) Display
 * 
 * Shows the user's current reliability metric based on verified campaign signals.
 */

import { ShieldCheck, Activity, Shield } from 'lucide-react';

interface TodayMultiplierProps {
    type: string;
    value: number;
    reason: string | null;
    userState: number; // MaturityState (0-3)
}

// Industrial themes for PRI layers
const PRI_THEMES: Record<string, {
    gradient: string;
    iconGradient: string;
    valueColor: string;
}> = {
    base: {
        gradient: 'from-zinc-800 to-zinc-900',
        iconGradient: 'from-zinc-500 to-zinc-600',
        valueColor: 'text-zinc-300',
    },
    verified: {
        gradient: 'from-blue-900/40 to-indigo-900/20',
        iconGradient: 'from-blue-500 to-indigo-600',
        valueColor: 'text-blue-400',
    },
    high_integrity: {
        gradient: 'from-emerald-900/40 to-teal-900/20',
        iconGradient: 'from-emerald-500 to-teal-600',
        valueColor: 'text-emerald-400',
    },
};

const PRI_ICONS: Record<string, React.ReactNode> = {
    base: <Activity className="w-5 h-5" />,
    verified: <ShieldCheck className="w-5 h-5" />,
    high_integrity: <Shield className="w-5 h-5" />,
};

export default function TodayMultiplier({ type, value, reason, userState }: TodayMultiplierProps) {
    const theme = PRI_THEMES[type] || PRI_THEMES.base;
    const icon = PRI_ICONS[type] || PRI_ICONS.base;
    const isElevated = value > 1.0;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} border border-white/5 p-5 shadow-lg`}>
            {/* Header */}
            <div className="relative flex items-center gap-2.5 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.iconGradient} text-white`}>
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Trust Reputation
                </span>
            </div>

            {/* Value */}
            <div className="relative">
                <div className={`text-4xl font-black ${theme.valueColor} tracking-tighter`}>
                    {value.toFixed(2)}
                </div>

                {/* Status Logic */}
                {reason ? (
                    <p className="text-xs font-medium text-white/50 mt-3 leading-relaxed">
                        {reason}
                    </p>
                ) : (
                    <p className="text-xs font-medium text-white/40 mt-3">
                        {userState === 0 ? "Establish your reputation with your first success" : "Standard Professional Standing"}
                    </p>
                )}
            </div>

            {/* Active protocol indicator */}
            {isElevated && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Optimized Access</span>
                </div>
            )}
        </div>
    );
}
