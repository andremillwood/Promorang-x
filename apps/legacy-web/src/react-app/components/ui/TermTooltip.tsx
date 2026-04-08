/**
 * TermTooltip
 * 
 * P1: Inline term explanations for platform-specific jargon.
 * Shows tooltips on hover/tap for terms like "Drops", "Verified Credits", "Keys".
 * 
 * Addresses: Low-tech user confusion about platform terminology.
 * Uses localStorage to track if user has seen explanation before.
 */

import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

export type PlatformTerm = 'drops' | 'verified_credits' | 'keys' | 'moves' | 'promoshare' | 'maturity' | 'streak' | 'access_rank';

interface TermDefinition {
    term: string;
    short: string;
    full: string;
}

const TERM_DEFINITIONS: Record<PlatformTerm, TermDefinition> = {
    drops: {
        term: 'Drops',
        short: 'Missions you complete to earn rewards',
        full: 'Drops are tasks or missions posted by brands. Complete them (like submitting a purchase photo) to earn Verified Credits.',
    },
    verified_credits: {
        term: 'Verified Credits',
        short: 'Platform currency worth $1 each',
        full: 'Verified Credits are Promorang\'s currency. 1 Gem = $1 USD. Earn them by completing Drops and withdraw when you reach 50+.',
    },
    keys: {
        term: 'Keys',
        short: 'Unlock special access and features',
        full: 'Keys are loyalty tokens. Earn them through daily activity. They unlock premium features and exclusive drops.',
    },
    moves: {
        term: 'Moves',
        short: 'Advertiser budget units',
        full: 'Moves are budget units advertisers use to distribute their campaigns. More moves = more reach.',
    },
    promoshare: {
        term: 'PromoShare',
        short: 'Weekly prize lottery',
        full: 'PromoShare is our weekly lottery. Your activity earns you tickets. Every Sunday, prizes are drawn from the pool.',
    },
    maturity: {
        term: 'Campaign Maturity',
        short: 'Campaign lifecycle stage',
        full: 'Campaigns progress through stages: Seed → Activated → Funded → Dominant. Higher maturity = bigger rewards.',
    },
    streak: {
        term: 'Streak',
        short: 'Consecutive days of activity',
        full: 'Your streak counts how many days in a row you\'ve been active. Longer streaks unlock multipliers and bonuses.',
    },
    access_rank: {
        term: 'Access Rank',
        short: 'Your priority level based on consistency',
        full: 'Access Rank determines your priority for new opportunities. Day 1-6 users see basic drops. Day 14+ users see premium campaigns.',
    },
};

interface TermTooltipProps {
    term: PlatformTerm;
    children?: React.ReactNode;
    showIcon?: boolean;
    className?: string;
}

export default function TermTooltip({ term, children, showIcon = true, className = '' }: TermTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [hasSeenTerm, setHasSeenTerm] = useState(false);

    const definition = TERM_DEFINITIONS[term];
    const storageKey = `promorang_term_seen_${term}`;

    useEffect(() => {
        const seen = localStorage.getItem(storageKey);
        setHasSeenTerm(seen === 'true');
    }, [storageKey]);

    const handleTooltipOpen = () => {
        setShowTooltip(true);
        if (!hasSeenTerm) {
            localStorage.setItem(storageKey, 'true');
            setHasSeenTerm(true);
        }
    };

    const handleTooltipClose = () => setShowTooltip(false);

    return (
        <span className={`relative inline-flex items-center gap-0.5 ${className}`}>
            {children || <span className="font-medium text-pr-text-1">{definition.term}</span>}

            {showIcon && (
                <button
                    onClick={handleTooltipOpen}
                    onMouseEnter={handleTooltipOpen}
                    onMouseLeave={handleTooltipClose}
                    className={`p-0.5 rounded-full transition-colors ${hasSeenTerm
                            ? 'text-pr-text-3 hover:text-pr-text-2'
                            : 'text-orange-500 hover:text-orange-600 animate-pulse'
                        }`}
                    aria-label={`What is ${definition.term}?`}
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute z-50 w-64 p-3 bg-pr-surface-card border border-pr-border rounded-xl shadow-lg 
                               bottom-full left-1/2 -translate-x-1/2 mb-2 animate-in fade-in zoom-in-95 duration-150"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={handleTooltipClose}
                >
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                    border-l-8 border-r-8 border-t-8 
                                    border-l-transparent border-r-transparent border-t-pr-border" />

                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-semibold text-pr-text-1 text-sm">{definition.term}</h4>
                            <p className="text-xs text-pr-text-2 mt-1">{definition.full}</p>
                        </div>
                        <button
                            onClick={handleTooltipClose}
                            className="p-1 rounded-full hover:bg-pr-surface-2 text-pr-text-3"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </span>
    );
}

/**
 * Hook to check if user has seen a term explanation
 */
export function useTermSeen(term: PlatformTerm): boolean {
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const storageKey = `promorang_term_seen_${term}`;
        setSeen(localStorage.getItem(storageKey) === 'true');
    }, [term]);

    return seen;
}

/**
 * Utility to get term definition without rendering
 */
export function getTermDefinition(term: PlatformTerm): TermDefinition {
    return TERM_DEFINITIONS[term];
}
