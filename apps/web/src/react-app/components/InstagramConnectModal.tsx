/**
 * InstagramConnectModal
 * 
 * Explains how to connect Instagram via ManyChat DM flow.
 * User DMs "promopoints" to @promorangco to start verification.
 */

import { useState } from 'react';
import { X, Instagram, MessageCircle, ExternalLink, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstagramConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstagramConnectModal({ isOpen, onClose }: InstagramConnectModalProps) {
    const [copied, setCopied] = useState(false);
    const TRIGGER_WORD = 'promopoints';
    const INSTAGRAM_HANDLE = '@promorangco';
    const DM_URL = 'https://ig.me/m/promorangco';

    const handleCopyKeyword = () => {
        navigator.clipboard.writeText(TRIGGER_WORD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenInstagram = () => {
        window.open(DM_URL, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-pr-surface-card rounded-2xl shadow-2xl border border-pr-border overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-5 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Instagram className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Connect Your Instagram</h2>
                            <p className="text-white/80 text-sm">Verify your account in 30 seconds</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold text-pr-text-1">Open our Instagram page</h3>
                            <p className="text-sm text-pr-text-2 mt-1">
                                Go to <span className="font-bold text-purple-600">{INSTAGRAM_HANDLE}</span> on Instagram
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold text-pr-text-1">Send us a DM</h3>
                            <p className="text-sm text-pr-text-2 mt-1">
                                Type the keyword below exactly:
                            </p>
                            <button
                                onClick={handleCopyKeyword}
                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-mono font-bold hover:opacity-90 transition-opacity"
                            >
                                <MessageCircle className="w-4 h-4" />
                                {TRIGGER_WORD}
                                {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                                ) : (
                                    <Copy className="w-4 h-4 opacity-70" />
                                )}
                            </button>
                            {copied && (
                                <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                            )}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold text-pr-text-1">Follow the prompts</h3>
                            <p className="text-sm text-pr-text-2 mt-1">
                                Our bot will guide you through verifying your account and linking it to Promorang.
                            </p>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800 dark:text-emerald-400">
                            <strong>Privacy first:</strong> We never post on your behalf. We only verify your follower count to unlock rewards.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleOpenInstagram}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white"
                    >
                        <Instagram className="w-4 h-4 mr-2" />
                        Open Instagram
                        <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
