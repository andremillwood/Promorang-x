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
    FlaskConical,
    X,
    User,
    Shield,
    Store,
    Megaphone,
    Zap,
    Users
} from 'lucide-react';

const STATE_LABELS = [
    { state: 0, label: 'New', emoji: '🌱', description: 'First time user' },
    { state: 1, label: 'Explorer', emoji: '🔍', description: 'Active, exploring' },
    { state: 2, label: 'Member', emoji: '⭐', description: 'Rewarded user' },
    { state: 3, label: 'Insider', emoji: '💎', description: 'Power user' },
    { state: 4, label: 'Operator', emoji: '👑', description: 'Pro operator' },
];

export function DevSandboxHub() {
    const { user, demoLogin } = useAuth();
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

    const handlePersonaSwitch = async (role: keyof typeof demoLogin) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            await (demoLogin[role] as () => Promise<any>)();
            // Refreshing the page is often cleanest for role switches
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch persona:', error);
            setIsUpdating(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-50 p-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Dev Sandbox Hub"
            >
                <FlaskConical className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 w-72 bg-pr-surface-card border border-pr-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white border-b border-pr-border">
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    <span className="font-bold text-sm tracking-tight">Dev Sandbox Hub</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Persona Switcher Section */}
            <div className="p-4 border-b border-pr-border bg-pr-surface-2/50">
                <div className="text-[10px] text-pr-text-3 uppercase font-black mb-3 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Switch Personas
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={() => handlePersonaSwitch('advertiser')}
                        className="flex items-center justify-between px-3 py-2 bg-pr-surface-card hover:bg-orange-500 hover:text-white border border-pr-border rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-orange-500 group-hover:text-white" />
                            <span className="text-sm font-semibold">Advertiser</span>
                        </div>
                        <span className="text-[10px] opacity-60">Brand</span>
                    </button>
                    <button
                        onClick={() => handlePersonaSwitch('creator')}
                        className="flex items-center justify-between px-3 py-2 bg-pr-surface-card hover:bg-pink-500 hover:text-white border border-pr-border rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-pink-500 group-hover:text-white" />
                            <span className="text-sm font-semibold">Creator</span>
                        </div>
                        <span className="text-[10px] opacity-60">Influencer</span>
                    </button>
                    <button
                        onClick={() => handlePersonaSwitch('merchant')}
                        className="flex items-center justify-between px-3 py-2 bg-pr-surface-card hover:bg-blue-500 hover:text-white border border-pr-border rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-blue-500 group-hover:text-white" />
                            <span className="text-sm font-semibold">Merchant</span>
                        </div>
                        <span className="text-[10px] opacity-60">POS/Venue</span>
                    </button>
                </div>
            </div>

            {/* Maturity Shifter - B2C Only */}
            <div className="p-4 bg-pr-surface-card">
                <div className="text-[10px] text-pr-text-3 uppercase font-black mb-3">Patron Progression (B2C)</div>
                <div className="flex items-center gap-3 mb-4 p-2 bg-pr-surface-2 rounded-xl">
                    <div className="text-2xl">{currentStateInfo.emoji}</div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-pr-text-1 truncate">
                            {currentStateInfo.label}
                        </div>
                        <div className="text-[10px] text-pr-text-2">State {maturityState}</div>
                    </div>
                </div>

                {/* Quick Jump Buttons */}
                <div className="grid grid-cols-5 gap-1">
                    {STATE_LABELS.map((stateInfo) => (
                        <button
                            key={stateInfo.state}
                            onClick={() => handleStateChange(stateInfo.state)}
                            disabled={isUpdating}
                            className={`p-2 rounded-lg text-center transition-all ${stateInfo.state === maturityState
                                ? 'bg-purple-500 text-white shadow-md'
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
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                </div>
            )}

            {/* Info Footer */}
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                    <Shield className="w-3 h-3 text-orange-500" />
                    Demo Sandbox Hook Active
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

export default DevSandboxHub;
