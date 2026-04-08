/**
 * ReflectionStrip - System-Generated Recognition
 * 
 * Shows recognition messages based on user activity.
 * No CTA, no tasks - purely reflective.
 * "The system notices first, reflects second"
 */

import { Sparkles, Heart, Mic, Flame, Star } from 'lucide-react';

interface Reflection {
    id: string;
    message: string;
    category: 'activity' | 'milestone' | 'streak' | 'community';
    icon: string;
    accent_color: string;
}

interface ReflectionStripProps {
    reflections: Reflection[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
    sparkles: <Sparkles className="w-4 h-4" />,
    heart: <Heart className="w-4 h-4" />,
    mic: <Mic className="w-4 h-4" />,
    flame: <Flame className="w-4 h-4" />,
    star: <Star className="w-4 h-4" />,
};

const COLOR_MAP: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function ReflectionStrip({ reflections }: ReflectionStripProps) {
    if (!reflections || reflections.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-pr-text-3 uppercase tracking-widest px-1">
                Noticed
            </h3>
            <div className="space-y-2">
                {reflections.map((reflection) => (
                    <div
                        key={reflection.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${COLOR_MAP[reflection.accent_color] || COLOR_MAP.blue}`}
                    >
                        <div className="flex-shrink-0">
                            {ICON_MAP[reflection.icon] || ICON_MAP.sparkles}
                        </div>
                        <p className="text-sm font-medium text-pr-text-1">
                            {reflection.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
