import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const DialogAny = Dialog as any;
const DialogContentAny = DialogContent as any;

interface RankCelebrationModalProps {
    currentRank: number;
    isOpen: boolean;
    onClose: () => void;
}

const RANK_DETAILS = [
    { level: 0, name: "Pioneer", color: "from-blue-500 to-cyan-500", icon: Sparkles },
    { level: 1, name: "Contributor", color: "from-emerald-500 to-teal-500", icon: CheckCircle },
    { level: 2, name: "Advocate", color: "from-purple-500 to-pink-500", icon: TrendingUp },
    { level: 3, name: "Elite", color: "from-amber-500 to-orange-500", icon: Award },
    { level: 4, name: "Legend", color: "from-primary to-accent", icon: Star },
];

export const RankCelebrationModal: React.FC<RankCelebrationModalProps> = ({
    currentRank,
    isOpen,
    onClose,
}) => {
    const rank = RANK_DETAILS[Math.min(currentRank, RANK_DETAILS.length - 1)];
    const Icon = rank.icon;

    return (
        <DialogAny open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContentAny className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative bg-card rounded-[2.5rem] p-10 text-center shadow-soft-2xl border border-white/10"
                >
                    {/* Animated Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rank.color} opacity-10 blur-3xl`} />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Rank Icon Badge */}
                        <motion.div
                            initial={{ y: 20, rotate: -10 }}
                            animate={{ y: 0, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg mb-8`}
                        >
                            <Icon className="w-12 h-12 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                                Rank Up Achieved
                            </span>
                            <h2 className="font-serif text-3xl font-bold mb-4 tracking-tight">
                                Welcome to <span className="italic text-primary-light">{rank.name}</span>
                            </h2>
                            <p className="text-muted-foreground mb-8 text-sm leading-relaxed px-4">
                                You've reached <span className="font-bold text-foreground">Access Rank {currentRank}</span>.
                                Keep building your consistency to unlock more exclusive brand opportunities and platform features.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="w-full"
                        >
                            <Button
                                onClick={onClose}
                                className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-xs shadow-soft"
                            >
                                Let's Go
                            </Button>
                        </motion.div>
                    </div>

                    {/* Particle Effects (Simplified with Mock Elements) */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute h-2 w-2 rounded-full bg-gradient-to-br ${rank.color}`}
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{
                                x: (Math.random() - 0.5) * 300,
                                y: (Math.random() - 0.5) * 300,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        />
                    ))}
                </motion.div>
            </DialogContentAny>
        </DialogAny>
    );
};
