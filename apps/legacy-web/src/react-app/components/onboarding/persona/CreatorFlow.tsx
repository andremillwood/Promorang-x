import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Zap,
    Link as LinkIcon,
    QrCode,
    ArrowRight,
    Users,
    Calendar,
    Map
} from 'lucide-react';

interface CreatorFlowProps {
    onComplete: () => void;
}

export default function CreatorFlow({ onComplete }: CreatorFlowProps) {
    const [step, setStep] = useState(1);
    const [mockMomentName, setMockMomentName] = useState('');

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-4xl w-full"
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-bold mb-4">See What Good Looks Like</h1>
                                <p className="text-orange-500 font-medium mb-2 italic">“This is where people actually show up for what you make.”</p>
                                <p className="text-zinc-400">Creators are already gathering people on Promorang.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                                    <img src="https://images.unsplash.com/photo-1540575861501-7ad0582373f1?q=80&w=1000&auto=format&fit=crop" className="w-full h-40 object-cover opacity-60" />
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg mb-1">Underground Art Show</h3>
                                        <p className="text-zinc-500 text-sm mb-4">"300 people showed up"</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                                    <img src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1000&auto=format&fit=crop" className="w-full h-40 object-cover opacity-60" />
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg mb-1">Morning Run Club</h3>
                                        <p className="text-zinc-500 text-sm mb-4">"Moments shared for days after"</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 text-lg font-bold py-7 rounded-2xl"
                                onClick={() => setStep(2)}
                            >
                                Let's create mine
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-xl w-full space-y-12"
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold">What kind of moment is this?</h2>
                                <input
                                    type="text"
                                    placeholder="e.g. My Album Launch Party"
                                    className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-orange-500 text-2xl py-4 outline-none transition-colors"
                                    value={mockMomentName}
                                    onChange={(e) => setMockMomentName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 opacity-50 cursor-not-allowed">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> When is it?
                                    </label>
                                    <div className="py-4 border-b border-zinc-800 text-lg font-medium">Coming Soon</div>
                                </div>
                                <div className="space-y-2 opacity-50 cursor-not-allowed">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Map className="w-3 h-3" /> Where?
                                    </label>
                                    <div className="py-4 border-b border-zinc-800 text-lg font-medium">To be decided</div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-8 rounded-2xl disabled:opacity-50"
                                onClick={() => setStep(3)}
                                disabled={!mockMomentName}
                            >
                                Save & Invite
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="max-w-md w-full text-center"
                        >
                            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-xs font-bold mb-8">
                                <Zap className="w-3 h-3 text-orange-400" />
                                Success!
                            </div>
                            <h1 className="text-4xl font-bold mb-4 tracking-tight">Your first moment is live.</h1>
                            <p className="text-zinc-400 text-lg mb-12">Now, gather your people.</p>

                            <div className="space-y-4 mb-12">
                                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <LinkIcon className="w-5 h-5 text-zinc-500" />
                                        <span className="font-medium">promorang.com/m/123...</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-orange-500">Copy</Button>
                                </div>
                                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <QrCode className="w-5 h-5 text-zinc-500" />
                                        <span className="font-medium">Download QR Code</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-orange-500">Get</Button>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 text-lg font-bold py-7 rounded-2xl"
                                onClick={() => setStep(4)}
                            >
                                I've shared it
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-orange-500/40"
                            >
                                <Users className="w-16 h-16 text-white" />
                            </motion.div>

                            <div className="space-y-2 mb-12">
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase">Magic happens.</h1>
                                <p className="text-orange-400 text-xl font-medium">Someone just joined your moment.</p>
                            </div>

                            <p className="text-zinc-500 max-w-sm mx-auto mb-12 italic">
                                "This is the dopamine loop of gathering. When people enter your space, you've created energy."
                            </p>

                            <Button
                                className="bg-white text-black hover:bg-zinc-200 text-xl font-bold px-12 py-8 rounded-2xl"
                                onClick={onComplete}
                            >
                                Enter My Moments
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-8 text-center text-zinc-600 text-sm font-medium tracking-tight">
                Value felt in first 10 minutes: "I can gather people here. This works."
            </footer>
        </div>
    );
}
