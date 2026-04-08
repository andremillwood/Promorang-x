import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    CheckCircle2,
    Sparkles,
    Gift,
    ArrowRight,
    History,
    Calendar,
    UserCircle
} from 'lucide-react';

interface ParticipantFlowProps {
    onComplete: () => void;
}

export default function ParticipantFlow({ onComplete }: ParticipantFlowProps) {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            {/* Step Indicator */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
            </div>

            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-xl w-full"
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-bold mb-4">Join Your First Moment</h1>
                                <p className="text-orange-500 font-medium mb-2 italic">“This is where moments you care about don’t disappear.”</p>
                                <p className="text-zinc-400">Jump right in. No pressure, just real energy.</p>
                            </div>

                            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl hover:border-orange-500/30 transition-colors">
                                <img
                                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
                                    alt="Moment"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-8">
                                    <div className="flex items-center gap-2 text-orange-500 text-sm font-bold uppercase tracking-wider mb-2">
                                        <Sparkles className="w-4 h-4" />
                                        Trending Now
                                    </div>
                                    <h2 className="text-2xl font-bold mb-4">Sunset Yoga & Soundbath</h2>
                                    <div className="flex items-center text-zinc-400 mb-8 font-medium">
                                        <MapPin className="w-5 h-5 mr-2 text-zinc-500" />
                                        Prospect Park, Brooklyn
                                    </div>
                                    <Button
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-7 rounded-2xl shadow-xl shadow-orange-500/20"
                                        onClick={() => setStep(2)}
                                    >
                                        Join This Moment
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h1 className="text-5xl font-bold mb-4">Success!</h1>
                            <p className="text-zinc-200 text-2xl font-bold mb-4">You just joined your first moment.</p>
                            <p className="text-zinc-400 text-xl mb-12">That's it. You've entered the story.</p>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                <Button
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-6 rounded-2xl border border-zinc-700 font-semibold"
                                    onClick={() => setStep(3)}
                                >
                                    Add a photo or note
                                </Button>
                                <button
                                    className="text-zinc-500 hover:text-zinc-300 font-medium py-2 transition-colors"
                                    onClick={() => setStep(3)}
                                >
                                    Skip
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="max-w-md w-full text-center"
                        >
                            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-8">
                                <Gift className="w-4 h-4" />
                                Reward Unlocked
                            </div>
                            <h1 className="text-4xl font-bold mb-6">This moment unlocked something.</h1>

                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-purple-500/20 mb-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Sparkles className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-white/60 mb-2 uppercase tracking-tighter">Early Access Key</div>
                                    <div className="text-4xl font-black text-white mb-4 italic tracking-tight">VIP PASS</div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        You are now part of the story. <br />
                                        This moment is saved to your history forever.
                                    </p>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 text-lg font-bold py-7 rounded-2xl shadow-xl shadow-white/5"
                                onClick={() => setStep(4)}
                            >
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl w-full"
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-bold mb-4">Your Story Starts Here</h1>
                                <p className="text-zinc-400">Promorang grows with you. Every action builds your persistent identity.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                                <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center hover:border-zinc-700 transition-colors">
                                    <History className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                                    <h3 className="font-bold mb-1">My Moments</h3>
                                    <p className="text-xs text-zinc-500">Every moment you've joined</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center hover:border-zinc-700 transition-colors">
                                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                                    <h3 className="font-bold mb-1">Invitations</h3>
                                    <p className="text-xs text-zinc-500">Exclusive access waiting</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center hover:border-zinc-700 transition-colors">
                                    <UserCircle className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                                    <h3 className="font-bold mb-1">My Identity</h3>
                                    <p className="text-xs text-zinc-500">Your presence in the story</p>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl font-bold py-8 rounded-2xl shadow-xl shadow-orange-500/20"
                                onClick={onComplete}
                            >
                                Enter My Moments
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-8 text-center text-zinc-600 text-sm font-medium tracking-tight">
                Value felt in first 10 minutes: "I did something. It felt good. I want to do another."
            </footer>
        </div>
    );
}
