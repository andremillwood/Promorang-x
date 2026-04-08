/**
 * OnboardingNudgeModal
 * 
 * P0 Critical: Appears for State 0 users who haven't completed any verified actions.
 * Provides clear CTAs to guide new users to their first action.
 * 
 * Design considerations:
 * - Large, friendly icons (low-tech accessible)
 * - Simple language (no jargon)
 * - 3 clear options, not overwhelming
 * - Can be dismissed but will reappear on next visit if no action taken
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Camera, Calendar, X, Sparkles } from 'lucide-react';

interface OnboardingNudgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActionClick?: (action: string) => void;
}

// Store dismissal in localStorage with expiry
const DISMISSAL_KEY = 'promorang_onboarding_nudge_dismissed';
const DISMISSAL_EXPIRY_HOURS = 24;

export function isDismissed(): boolean {
    const dismissed = localStorage.getItem(DISMISSAL_KEY);
    if (!dismissed) return false;

    const { timestamp } = JSON.parse(dismissed);
    const expiryMs = DISMISSAL_EXPIRY_HOURS * 60 * 60 * 1000;
    return Date.now() - timestamp < expiryMs;
}

export function setDismissed(): void {
    localStorage.setItem(DISMISSAL_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export default function OnboardingNudgeModal({ isOpen, onClose, onActionClick }: OnboardingNudgeModalProps) {
    const [visible, setVisible] = useState(isOpen);

    useEffect(() => {
        setVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setDismissed();
        setVisible(false);
        onClose();
    };

    const handleActionClick = (action: string) => {
        onActionClick?.(action);
        handleClose();
    };

    if (!visible) return null;

    const actions = [
        {
            id: 'deals',
            title: 'Find a Deal',
            description: 'Browse discounts and offers near you',
            icon: Gift,
            color: 'emerald',
            path: '/deals'
        },
        {
            id: 'post',
            title: 'Share Something',
            description: 'Show off a purchase and earn rewards',
            icon: Camera,
            color: 'orange',
            path: '/post'
        },
        {
            id: 'events',
            title: "See What's Happening",
            description: 'Local events and activities',
            icon: Calendar,
            color: 'purple',
            path: '/events-entry'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-pr-surface-card rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-pr-surface-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-2">
                        Let's Get Started!
                    </h2>
                    <p className="text-pr-text-2 text-sm">
                        Pick one to begin earning rewards
                    </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.id}
                                to={action.path}
                                onClick={() => handleActionClick(action.id)}
                                className={`
                                    flex items-center gap-4 p-4 rounded-2xl border-2 
                                    bg-pr-surface-2 border-pr-border
                                    hover:border-${action.color}-500 hover:bg-${action.color}-500/10
                                    transition-all duration-200 group
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center
                                    bg-${action.color}-500/20 text-${action.color}-500
                                    group-hover:bg-${action.color}-500 group-hover:text-white
                                    transition-colors
                                `}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-pr-text-1 group-hover:text-pr-text-1">
                                        {action.title}
                                    </div>
                                    <div className="text-sm text-pr-text-2">
                                        {action.description}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Skip text */}
                <p className="text-center text-xs text-pr-text-3 mt-4">
                    You can always find these options in your menu
                </p>
            </div>
        </div>
    );
}
