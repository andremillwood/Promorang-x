/**
 * Maturity State Controller
 * 
 * A floating debug panel for demo users to shift between maturity states.
 * Also shows upgrade option for regular users who want to access advanced features.
 */

import { useState } from 'react';
import { useMaturity, UserMaturityState } from '@/react-app/context/MaturityContext';
import { useAuth } from '@/react-app/hooks/useAuth';
import {
    ChevronUp,
    ChevronDown,
    Bug,
    X,
    Sparkles,
    TrendingUp,
    Crown,
    Zap
} from 'lucide-react';

const STATE_LABELS = [
    { state: 0, label: 'New', emoji: '🌱', description: 'First time user' },
    { state: 1, label: 'Explorer', emoji: '🔍', description: 'Active, exploring' },
    { state: 2, label: 'Member', emoji: '⭐', description: 'Rewarded user' },
    { state: 3, label: 'Insider', emoji: '💎', description: 'Power user' },
    { state: 4, label: 'Operator', emoji: '👑', description: 'Pro operator' },
];

export function MaturityStateController() {
    const { user } = useAuth();
    const {
        maturityState,
        isDemoUser,
        setMaturityStateOverride,
        isLoading
    } = useMaturity();

    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Only show for demo users
    if (!isDemoUser || !user) {
        return null;
    }

    const currentStateInfo = STATE_LABELS.find(s => s.state === maturityState) || STATE_LABELS[0];

    const handleStateChange = async (newState: number) => {
        if (newState === maturityState || isUpdating) return;

        setIsUpdating(true);
        try {
            await setMaturityStateOverride(newState as UserMaturityState);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) {
        // Collapsed mode - just show a small button
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="State Controller (Demo)"
            >
                <Bug className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 w-72 bg-pr-surface-card border border-pr-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    <span className="font-bold text-sm">State Controller</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Current State Display */}
            <div className="p-4 border-b border-pr-border">
                <div className="text-xs text-pr-text-3 uppercase font-bold mb-2">Current State</div>
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{currentStateInfo.emoji}</div>
                    <div>
                        <div className="font-bold text-pr-text-1">
                            State {maturityState}: {currentStateInfo.label}
                        </div>
                        <div className="text-xs text-pr-text-2">{currentStateInfo.description}</div>
                    </div>
                </div>
            </div>

            {/* State Shift Buttons */}
            <div className="p-4 space-y-2">
                <div className="text-xs text-pr-text-3 uppercase font-bold mb-3">Shift State</div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => handleStateChange(Math.max(0, maturityState - 1))}
                        disabled={maturityState === 0 || isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pr-surface-2 hover:bg-pr-surface-3 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors text-pr-text-1 font-medium"
                    >
                        <ChevronDown className="w-4 h-4" />
                        Lower
                    </button>
                    <button
                        onClick={() => handleStateChange(Math.min(4, maturityState + 1))}
                        disabled={maturityState === 4 || isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors text-white font-medium"
                    >
                        <ChevronUp className="w-4 h-4" />
                        Higher
                    </button>
                </div>

                {/* Quick Jump Buttons */}
                <div className="grid grid-cols-5 gap-1">
                    {STATE_LABELS.map((stateInfo) => (
                        <button
                            key={stateInfo.state}
                            onClick={() => handleStateChange(stateInfo.state)}
                            disabled={isUpdating}
                            className={`p-2 rounded-lg text-center transition-all ${stateInfo.state === maturityState
                                    ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                                    : 'bg-pr-surface-2 hover:bg-pr-surface-3 text-pr-text-1'
                                }`}
                            title={`${stateInfo.label}: ${stateInfo.description}`}
                        >
                            <div className="text-lg">{stateInfo.emoji}</div>
                            <div className="text-[10px] font-bold">{stateInfo.state}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading indicator */}
            {(isUpdating || isLoading) && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Demo Mode Badge */}
            <div className="px-4 py-2 bg-orange-500/10 border-t border-orange-500/20">
                <div className="flex items-center gap-2 text-orange-600 text-xs font-medium">
                    <Zap className="w-3 h-3" />
                    Demo Mode Active
                </div>
            </div>
        </div>
    );
}

/**
 * Upgrade to Pro Button
 * For regular users who want to unlock the full experience
 */
export function UpgradeToProButton() {
    const { user } = useAuth();
    const { maturityState, isDemoUser, setMaturityStateOverride } = useMaturity();
    const [isLoading, setIsLoading] = useState(false);

    // Don't show for demo users (they have the debug panel) or already advanced users
    if (isDemoUser || !user || maturityState >= 3) {
        return null;
    }

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // For now, just jump to state 3 (Power User)
            // In production, this would trigger a subscription flow
            await setMaturityStateOverride(UserMaturityState.POWER_USER);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
            {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
                <>
                    <Crown className="w-4 h-4" />
                    Skip to Full Experience
                </>
            )}
        </button>
    );
}

export default MaturityStateController;
