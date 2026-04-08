import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeSplashProps {
    onContinue: () => void;
}

export default function WelcomeSplash({ onContinue }: WelcomeSplashProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-md mx-auto px-6 text-center">
                {/* Logo/Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30"
                >
                    <Sparkles className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-black text-white mb-4 tracking-tight"
                >
                    Welcome to Promorang
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-purple-200 mb-2"
                >
                    Capture moments. Build your Reliability Index.
                </motion.p>

                {/* Value prop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-12"
                >
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">✓</span>
                    </div>
                    <span className="text-white font-bold">Immutable Professional Record</span>
                </motion.div>

                {/* CTA */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all"
                >
                    Let's Go
                    <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 text-xs text-purple-300/60"
                >
                    Your reputation is your currency.
                </motion.p>
            </div>
        </motion.div>
    );
}
