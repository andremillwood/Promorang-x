import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Gift, Users, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RealmUnlockedModalProps {
    onContinue: () => void;
}

const UNLOCKED_FEATURES = [
    { icon: Gift, label: 'Success Draw', color: 'from-blue-500 to-cyan-500' },
    { icon: Trophy, label: 'Pro Rank', color: 'from-emerald-500 to-teal-500' },
    { icon: Users, label: 'My Network', color: 'from-amber-500 to-orange-500' },
];

export default function RealmUnlockedModal({ onContinue }: RealmUnlockedModalProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Grand celebration confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#f97316', '#ec4899', '#8b5cf6', '#fbbf24', '#10b981'];

        // Initial burst
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors
        });

        // Continuous shower
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors
            });
            confetti({
                particleCount: 2,
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
        const timer = setTimeout(() => setShowContent(true), 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-500/25 to-amber-500/25 rounded-full blur-[100px]"
                />
            </div>

            {showContent && (
                <div className="relative z-10 max-w-md mx-auto px-6 text-center">
                    {/* Crown icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
                        className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50"
                    >
                        <Crown className="w-16 h-16 text-white" />
                    </motion.div>

                    {/* Main headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                                Milestone Unlocked
                            </span>
                            <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                            Access Granted.
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/80 font-medium mb-8"
                    >
                        Success! You've entered the story. Welcome to the movement.
                    </motion.p>

                    {/* Unlocked features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-center gap-4 mb-10"
                    >
                        {UNLOCKED_FEATURES.map((feature, index) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + index * 0.15 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white/80">{feature.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                    >
                        <button
                            onClick={onContinue}
                            className="w-full py-4 bg-white text-pr-surface-card hover:bg-white/90 font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all group"
                        >
                            Open My Hub
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Subtle footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-6 text-xs text-purple-300/50"
                    >
                        Complete 3 more activations to unlock all features
                    </motion.p>
                </div>
            )}
        </motion.div>
    );
}
