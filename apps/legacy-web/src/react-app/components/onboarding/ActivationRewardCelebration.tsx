import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Wallet, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivationRewardCelebrationProps {
    verifiedCreditsEarned: number;
    onSeeWallet: () => void;
    onNextActivation: () => void;
}

export default function ActivationRewardCelebration({
    verifiedCreditsEarned,
    onSeeWallet,
    onNextActivation
}: ActivationRewardCelebrationProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const colors = ['#f97316', '#ec4899', '#8b5cf6', '#fbbf24'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();

        // Show content after brief delay
        const timer = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-full blur-[100px]"
                />
            </div>

            {showContent && (
                <div className="relative z-10 max-w-md mx-auto px-6 text-center">
                    {/* Success icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40"
                    >
                        <ShieldCheck className="w-14 h-14 text-white" />
                    </motion.div>

                    {/* Amount */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-2"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 uppercase tracking-tight">
                                +{verifiedCreditsEarned} SCORE
                            </span>
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                        </div>
                    </motion.div>

                    {/* Value */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-black text-white mb-2 tracking-tight"
                    >
                        Moment Logged
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-purple-200/80 mb-10 font-medium"
                    >
                        You've entered the story.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-col gap-3"
                    >
                        <button
                            onClick={onNextActivation}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all"
                        >
                            Next Activation
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onSeeWallet}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Wallet className="w-5 h-5" />
                            See My Wallet
                        </button>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
