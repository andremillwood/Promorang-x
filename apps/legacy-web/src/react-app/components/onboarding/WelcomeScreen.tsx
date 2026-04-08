import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Compass, Rocket } from 'lucide-react';

interface WelcomeScreenProps {
    onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl w-full text-center relative z-10"
            >
                {/* Logo or Main Icon */}
                <div className="mb-12 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                    Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">Promorang</span>.
                </h1>

                <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed mb-12">
                    This is a place for moments — real ones. <br />
                    <span className="text-zinc-200">Some you join. Some you create. Some you remember.</span>
                </p>

                <div className="flex flex-col items-center gap-6">
                    <Button
                        size="lg"
                        onClick={onContinue}
                        className="bg-white text-black hover:bg-zinc-200 text-xl font-semibold px-12 py-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                    >
                        Continue
                    </Button>

                    <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase py-4">
                        Step into something real
                    </p>
                </div>
            </motion.div>

            {/* Micro-animations */}
            <div className="absolute bottom-12 flex gap-8 opacity-20">
                <div className="flex flex-col items-center gap-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-tighter">Explore</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-tighter">Connect</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-tighter">Celebrate</span>
                </div>
            </div>
        </div>
    );
}
