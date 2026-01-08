import { X, Key, Crown, ArrowRight } from 'lucide-react';

interface KeyGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    keyCost: number;
    userKeys?: number;
    isLoggedIn: boolean;
    dropTitle: string;
}

export default function KeyGateModal({
    isOpen,
    onClose,
    keyCost,
    userKeys = 0,
    isLoggedIn,
    dropTitle
}: KeyGateModalProps) {
    if (!isOpen) return null;

    const hasEnoughKeys = userKeys >= keyCost;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-pr-surface-card border border-pr-border rounded-2xl max-w-md w-full p-8 z-10 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-pr-text-2 hover:text-pr-text-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {isLoggedIn ? (
                            <Key className="w-8 h-8 text-yellow-500" />
                        ) : (
                            <Crown className="w-8 h-8 text-purple-500" />
                        )}
                    </div>

                    {/* Content */}
                    {!isLoggedIn ? (
                        <>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-3">
                                Join Promorang to Engage
                            </h2>
                            <p className="text-pr-text-2 mb-6">
                                Create a free account to engage with "{dropTitle}" and start earning Promo Points.
                            </p>
                            <a
                                href="/auth"
                                className="w-full block px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                            >
                                Sign Up Free <ArrowRight className="w-5 h-5 inline ml-2" />
                            </a>
                            <p className="text-xs text-pr-text-muted mt-4">
                                Already have an account? <a href="/auth" className="text-blue-500 hover:underline">Log in</a>
                            </p>
                        </>
                    ) : hasEnoughKeys ? (
                        <>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-3">
                                Ready to Engage!
                            </h2>
                            <p className="text-pr-text-2 mb-6">
                                You have enough Keys to engage with this Drop.
                            </p>
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-500">{userKeys}</div>
                                    <div className="text-xs text-pr-text-2">Your Keys</div>
                                </div>
                                <div className="text-pr-text-2">→</div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-500">-{keyCost}</div>
                                    <div className="text-xs text-pr-text-2">Cost</div>
                                </div>
                            </div>
                            <button
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                            >
                                Engage Now
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-3">
                                You Need More Keys
                            </h2>
                            <p className="text-pr-text-2 mb-6">
                                This Drop requires <strong className="text-yellow-500">{keyCost} Keys</strong> to engage. You currently have <strong className="text-pr-text-1">{userKeys} Keys</strong>.
                            </p>
                            <div className="bg-pr-surface-2 rounded-xl p-4 mb-6">
                                <h3 className="font-bold text-pr-text-1 mb-2 text-sm">How to Earn Keys</h3>
                                <ul className="text-left text-sm text-pr-text-2 space-y-2">
                                    <li>• Complete daily tasks</li>
                                    <li>• Refer friends (earn 5% of their activity)</li>
                                    <li>• Make accurate Forecasts</li>
                                    <li>• Convert Promo Points to Keys</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href="/earn"
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all text-center"
                                >
                                    Earn Keys
                                </a>
                                <a
                                    href="/wallet"
                                    className="flex-1 px-6 py-4 bg-pr-surface-2 border border-pr-border text-pr-text-1 rounded-xl font-semibold hover:bg-pr-surface-3 transition-all text-center"
                                >
                                    Buy Keys
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
