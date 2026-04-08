import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export const CheckInCelebration = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
            <div className="relative">
                {/* Animated Particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{
                            scale: [0, 1, 0],
                            x: (Math.random() - 0.5) * 400,
                            y: (Math.random() - 0.5) * 400
                        }}
                        transition={{ duration: 2, ease: "easeOut", delay: i * 0.1 }}
                        className="absolute rounded-full bg-primary"
                        style={{
                            width: Math.random() * 12 + 4,
                            height: Math.random() * 12 + 4,
                            left: "50%",
                            top: "50%"
                        }}
                    />
                ))}

                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)]"
                >
                    <Check className="w-16 h-16 text-white" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-8"
                >
                    <h2 className="text-3xl font-serif font-bold text-foreground flex items-center justify-center gap-2">
                        Verified <Sparkles className="text-primary w-6 h-6" />
                    </h2>
                    <p className="text-muted-foreground mt-2 font-medium">Your rewards are on the way!</p>
                </motion.div>
            </div>
        </motion.div>
    );
};
