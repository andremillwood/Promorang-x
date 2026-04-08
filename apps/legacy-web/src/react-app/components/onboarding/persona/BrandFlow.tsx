import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Building2,
    Target,
    BarChart3,
    Zap,
    Users,
    CheckCircle2,
    ShoppingBag
} from 'lucide-react';

interface BrandFlowProps {
    onComplete: () => void;
}

export default function BrandFlow({ onComplete }: BrandFlowProps) {
    const [step, setStep] = useState(1);
    const [useCase, setUseCase] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
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
                            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-10">
                                <Building2 className="w-10 h-10 text-purple-400" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                                People don't remember campaigns.
                            </h1>
                            <p className="text-purple-500 text-2xl font-bold italic mb-8">“This is how your experiences become remembered — not just reported.”</p>
                            <p className="text-zinc-400 text-xl leading-relaxed mb-12 max-w-lg mx-auto">
                                Promorang helps you host moments people want to enter — and understand what resonated after.
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-zinc-200 text-xl font-bold px-12 py-8 rounded-2xl"
                                onClick={() => setStep(2)}
                            >
                                Let's build your first moment
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
                                <h1 className="text-3xl font-bold mb-3">Choose a First Use Case</h1>
                                <p className="text-zinc-400 text-lg">Where does your brand need the most energy?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                                {[
                                    { id: 'event', label: 'Event or activation', icon: Users, desc: 'Drive real-world foot traffic to your space.' },
                                    { id: 'instore', label: 'In-store experience', icon: ShoppingBag, desc: 'Reward people for visiting your physical locations.' },
                                    { id: 'product', label: 'Product launch', icon: Target, desc: 'Gather excitement and proof-of-purchase early.' },
                                    { id: 'community', label: 'Community moment', icon: Zap, desc: 'Create digital energy around a shared theme.' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setUseCase(item.id)}
                                        className={`p-8 rounded-[2rem] border text-left transition-all ${useCase === item.id ? 'bg-purple-500 border-purple-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50'}`}
                                    >
                                        <item.icon className={`w-8 h-8 mb-4 ${useCase === item.id ? 'text-white' : 'text-purple-400'}`} />
                                        <h3 className={`text-xl font-bold mb-2 ${useCase === item.id ? 'text-white' : 'text-zinc-200'}`}>{item.label}</h3>
                                        <p className={`text-sm ${useCase === item.id ? 'text-purple-100' : 'text-zinc-500'}`}>{item.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 text-lg font-bold py-7 rounded-2xl disabled:opacity-50"
                                onClick={() => setStep(3)}
                                disabled={!useCase}
                            >
                                Continue Strategy
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-xl w-full space-y-10"
                        >
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-zinc-500 uppercase tracking-widest text-center">Business Edition</h2>
                                <h1 className="text-4xl font-bold text-center">Describe Your Vision</h1>
                            </div>

                            <div className="space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Moment Headline</label>
                                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 italic">e.g. Early Fall Exclusive Sampling</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Reward Pool</label>
                                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400">100 Samples</div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Targeting</label>
                                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 italic">Lifestyle Focused</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4">
                                    <BarChart3 className="w-6 h-6 text-purple-400" />
                                    <div className="text-sm text-purple-200">Insights preview enabled for this moment</div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xl font-bold py-8 rounded-2xl shadow-xl shadow-purple-500/20"
                                onClick={() => setStep(4)}
                            >
                                Launch Activation
                            </Button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl w-full text-center"
                        >
                            <div className="mb-12">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-purple-500" />
                                </div>
                                <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic text-purple-500">Success!</h1>
                                <p className="text-zinc-200 text-2xl font-bold mb-4">Your activation is ready to scale.</p>
                                <p className="text-zinc-400 text-xl">Participation is starting to scale.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                                <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">124</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Entering</div>
                                    <div className="absolute top-0 right-0 p-4">
                                        <Users className="w-12 h-12 text-zinc-800" />
                                    </div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">58</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Shared Proofs</div>
                                    <div className="absolute top-0 right-0 p-4">
                                        <BarChart3 className="w-12 h-12 text-zinc-800" />
                                    </div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">92%</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sentiment</div>
                                    <div className="absolute top-0 right-0 p-4">
                                        <CheckCircle2 className="w-12 h-12 text-zinc-800" />
                                    </div>
                                </div>
                            </div>

                            <footer className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl mb-12 italic text-zinc-500 text-sm">
                                “This is tangible. We are no longer chasing attention — we are hosting it.”
                            </footer>

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
                Value felt in first 10 minutes: "This is tangible. I can see it working."
            </footer>
        </div>
    );
}
