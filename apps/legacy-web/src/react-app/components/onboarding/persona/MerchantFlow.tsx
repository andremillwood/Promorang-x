import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Store,
    MapPin,
    Smartphone,
    ArrowRight,
    Users,
    QrCode,
    Activity,
    ScanLine
} from 'lucide-react';

interface MerchantFlowProps {
    onComplete: () => void;
}

export default function MerchantFlow({ onComplete }: MerchantFlowProps) {
    const [step, setStep] = useState(1);
    const [mockAddress, setMockAddress] = useState('');

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
                            className="max-w-2xl w-full text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-10">
                                <Store className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                Claim your space.
                            </h1>
                            <p className="text-emerald-500 text-2xl font-bold italic mb-8">“This is how foot traffic turns into loyalty.”</p>
                            <p className="text-zinc-400 text-xl leading-relaxed mb-12 max-w-lg mx-auto">
                                Register your location as a place where real moments happen.
                            </p>

                            <div className="mb-12 relative max-w-md mx-auto">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Enter your business address"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-6 pl-12 pr-6 outline-none focus:border-emerald-500 transition-colors text-lg"
                                    value={mockAddress}
                                    onChange={(e) => setMockAddress(e.target.value)}
                                />
                            </div>

                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-zinc-200 text-xl font-bold px-12 py-8 rounded-2xl disabled:opacity-50"
                                onClick={() => setStep(2)}
                                disabled={!mockAddress}
                            >
                                Register Location
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl w-full"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-3xl font-bold mb-3">Simple Tools.</h1>
                                <p className="text-zinc-400 text-lg">Your dashboard looks like a POS, not a spreadsheet.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-center group">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <ScanLine className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Check-in</h3>
                                    <p className="text-zinc-500 text-sm">Welcome guests on arrival.</p>
                                </div>
                                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-center group">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <QrCode className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Redeem</h3>
                                    <p className="text-zinc-500 text-sm">Reward your visitors.</p>
                                </div>
                                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-center group">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <Activity className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">See activity</h3>
                                    <p className="text-zinc-500 text-sm">Monitor real-time traffic.</p>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-7 rounded-2xl"
                                onClick={() => setStep(3)}
                            >
                                Let's go live
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-xl w-full text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="w-40 h-40 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl relative"
                            >
                                <Smartphone className="w-16 h-16 text-zinc-400" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-zinc-950"
                                >
                                    <Users className="w-6 h-6 text-white" />
                                </motion.div>
                            </motion.div>

                            <div className="space-y-4 mb-12">
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase italic text-emerald-400">Moment Live.</h1>
                                <p className="text-zinc-200 text-2xl font-bold mb-4">Your location is now a place where moments happen.</p>
                                <p className="text-zinc-400 text-xl font-medium">Someone just checked in at your location.</p>
                            </div>

                            <p className="text-zinc-500 max-w-sm mx-auto mb-12 italic leading-relaxed">
                                “This creates buy-in. When a digital action becomes physical foot traffic, the value is undeniable.”
                            </p>

                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 text-xl font-bold py-8 rounded-2xl"
                                onClick={onComplete}
                            >
                                Enter My Moments
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-8 text-center text-zinc-600 text-sm font-medium tracking-tight">
                Value felt in first 10 minutes: "This isn't abstract. It's foot traffic."
            </footer>
        </div>
    );
}
