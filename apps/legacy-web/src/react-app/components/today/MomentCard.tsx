import type { ReactNode } from 'react';
import { ArrowRight, Sparkles, MapPin, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MomentCardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    image?: string;
    hostName?: string;
    hostAvatar?: string;
    reward?: string;
    presencePoints?: number;
    accentColor?: string;
    ctaText?: string;
    onClick?: () => void;
    completed?: boolean;
    type?: 'invitation' | 'participation' | 'story' | 'featured';
    children?: ReactNode;
}

export default function MomentCard({
    title,
    subtitle,
    icon: Icon,
    image,
    hostName,
    hostAvatar,
    reward,
    presencePoints,
    accentColor = 'indigo',
    ctaText,
    onClick,
    completed,
    type = 'participation',
    children
}: MomentCardProps) {
    const colorMap: Record<string, string> = {
        indigo: 'border-indigo-500/20 text-indigo-400 shadow-indigo-500/10',
        emerald: 'border-emerald-500/20 text-emerald-400 shadow-emerald-500/10',
        blue: 'border-blue-500/20 text-blue-400 shadow-blue-500/10',
        orange: 'border-orange-500/20 text-orange-400 shadow-orange-500/10',
        rose: 'border-rose-500/20 text-rose-400 shadow-rose-500/10',
        purple: 'border-purple-500/20 text-purple-400 shadow-purple-500/10',
        gold: 'border-amber-500/30 text-amber-400 shadow-amber-500/20',
    };

    const activeColorStyles = colorMap[accentColor] || colorMap.indigo;

    return (
        <div
            onClick={onClick}
            className={`
                group relative overflow-hidden rounded-[2.5rem] border bg-zinc-900/40 backdrop-blur-sm transition-all duration-500
                ${activeColorStyles}
                ${onClick ? 'cursor-pointer hover:border-white/30 hover:scale-[1.02] hover:shadow-2xl' : ''}
                ${completed ? 'opacity-70 grayscale-[0.3]' : ''}
                ${type === 'invitation' ? 'aspect-[4/5] md:aspect-square flex flex-col justify-end p-8' : 'p-6'}
            `}
        >
            {/* Full-Bleed Background Image (Airbnb/Pinterest Style) */}
            {image ? (
                <div className="absolute inset-0 z-0">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50" />
            )}

            {/* Content Layer */}
            <div className="relative z-10 space-y-4">
                {/* Human Style Header: Neighbor/Context */}
                {(hostName || hostAvatar || type === 'invitation') && (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-zinc-900 shadow-xl">
                            {hostAvatar ? (
                                <img src={hostAvatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                                    <MapPin className="w-5 h-5 text-indigo-400/40" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] leading-none mb-1">From the Neighborhood</span>
                            <span className="text-xs font-bold text-white/80 lowercase italic">{hostName || 'A Kind Neighbor'}</span>
                        </div>
                    </div>
                )}

                {/* Recognition & Vitality (Human rewards) */}
                <div className="flex flex-wrap gap-2">
                    {reward && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tighter rounded-full border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-500" />
                            Discovery Found
                        </div>
                    )}
                    {presencePoints && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/5">
                            <Sparkles className="w-3 h-3" />
                            Vitality Growth
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className={`font-black tracking-tight leading-tight lowercase first-letter:uppercase ${type === 'invitation' ? 'text-4xl text-white' : 'text-xl text-white/90 italic'}`}>
                        {title}
                    </h3>
                    {subtitle && (
                        <p className={`font-medium leading-relaxed ${type === 'invitation' ? 'text-lg text-white/40' : 'text-sm text-white/30 italic'}`}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {ctaText && !completed && (
                    <div className="pt-2 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-white/40 group-hover:text-white group-hover:gap-4 transition-all">
                        {ctaText} <ArrowRight className="w-4 h-4" />
                    </div>
                )}

                {completed && (
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 lowercase italic">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        A moment preserved.
                    </div>
                )}
            </div>

            {/* Pure Organic Decoration (Airbnb/Pinterest aesthetic) */}
            {Icon && !image && (
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 -rotate-12 group-hover:rotate-0">
                    <Icon className="w-48 h-48" />
                </div>
            )}

            {children && <div className="mt-4 relative z-20">{children}</div>}
        </div>
    );
}

