/**
 * WhatsNextCard Component
 * 
 * Displays the smart "What's Next" suggestion with:
 * - Clear action label and description
 * - Visual icon and color
 * - CTA button to navigate
 * - Optional "first time" badge for new actions
 * 
 * Inspired by Duolingo's lesson suggestions and Uber's next-step prompts.
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useWhatsNext } from '@/react-app/hooks/useWhatsNext';

interface WhatsNextCardProps {
    variant?: 'default' | 'compact' | 'inline';
    className?: string;
    onActionClick?: () => void;
}

export default function WhatsNextCard({
    variant = 'default',
    className = '',
    onActionClick
}: WhatsNextCardProps) {
    const { suggestion, isLoading } = useWhatsNext();

    if (isLoading || !suggestion) {
        return null;
    }

    const Icon = suggestion.icon;

    // Compact variant for inline use
    if (variant === 'compact') {
        return (
            <Link
                to={suggestion.path}
                onClick={onActionClick}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group ${className}`}
            >
                <div className={`w-8 h-8 rounded-lg ${suggestion.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${suggestion.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pr-text-1 truncate">
                        {suggestion.label}
                    </p>
                </div>
                <ChevronRight className="w-4 h-4 text-pr-text-3 group-hover:text-orange-500 transition-colors" />
            </Link>
        );
    }

    // Inline variant for text-based hints
    if (variant === 'inline') {
        return (
            <Link
                to={suggestion.path}
                onClick={onActionClick}
                className={`inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors ${className}`}
            >
                <Icon className="w-4 h-4" />
                <span>{suggestion.label}</span>
                <ChevronRight className="w-4 h-4" />
            </Link>
        );
    }

    // Default full card variant
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10 border border-orange-500/20 ${className}`}>
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl" />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        What's Next
                    </span>
                    {suggestion.isFirstTime && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase">
                            New
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${suggestion.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${suggestion.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-pr-text-1 text-lg">
                            {suggestion.label}
                        </h3>
                        <p className="text-sm text-pr-text-2 mt-1">
                            {suggestion.description}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Link
                    to={suggestion.path}
                    onClick={onActionClick}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                    Let's Go
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}

// Smaller tooltip-style variant for contextual hints
export function WhatsNextTooltip({ className = '' }: { className?: string }) {
    const { suggestion } = useWhatsNext();

    if (!suggestion) return null;

    const Icon = suggestion.icon;

    return (
        <Link
            to={suggestion.path}
            className={`group flex items-center gap-3 px-4 py-3 bg-pr-surface-card border border-pr-border rounded-xl shadow-lg hover:shadow-xl hover:border-orange-500/30 transition-all ${className}`}
        >
            <div className={`w-10 h-10 rounded-lg ${suggestion.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${suggestion.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-orange-500 uppercase">Next</span>
                    {suggestion.isFirstTime && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    )}
                </div>
                <p className="text-sm font-medium text-pr-text-1 truncate">
                    {suggestion.label}
                </p>
            </div>
            <ChevronRight className="w-5 h-5 text-pr-text-3 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}
