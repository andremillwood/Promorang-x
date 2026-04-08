import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, X, Search, AlertCircle, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/react-app/lib/api';
import MomentAnchor from '@/react-app/components/MomentAnchor';

export default function ScanPage() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'context' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [anchor, setAnchor] = useState<string | null>(null);
    const [momentContext, setMomentContext] = useState<{ title: string; host: string; description: string } | null>(null);
    const [showLinkage, setShowLinkage] = useState(false);

    // Linkage Step States
    const [expressionUrl] = useState('');
    const [reflection, setReflection] = useState('');
    const [isSavingLink, setIsSavingLink] = useState(false);

    // Manual Input Submit
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        verifyCode(code);
    };

    const verifyCode = async (_inputCode: string) => {
        setStatus('verifying');
        setErrorMessage('');

        try {
            // Mock fetching context first
            setTimeout(() => {
                setMomentContext({
                    title: "Morning Coffee Moment",
                    host: "Espresso Lab",
                    description: "Recording your presence at Espresso Lab to index your daily participation."
                });
                setStatus('context');
            }, 800);

        } catch (err: any) {
            console.error('Check-in failed:', err);
            setStatus('error');
            setErrorMessage(err.response?.data?.error || 'Invalid code or Access Denied.');
        }
    };

    const confirmPresence = async () => {
        setStatus('verifying');
        try {
            const response = await api.post('/moments/check-in', { ticketId: code });
            setAnchor(response.data.anchor);
            setStatus('success');

            // Wait 1.5s then show linkage options
            setTimeout(() => {
                setShowLinkage(true);
            }, 1500);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage('Final verification failed. Please try again.');
        }
    };

    const handleSkipLinkage = () => {
        navigate('/today', { state: { success: true, message: 'Moment Verified' } });
    };

    const handleSaveLinkage = async () => {
        if (!expressionUrl && !reflection) return handleSkipLinkage();

        setIsSavingLink(true);
        try {
            // Note: This endpoint will be added next
            // await api.post('/moments/link-presence', { anchor, expressionUrl, reflection });

            // Mocking success for now as we transition
            setTimeout(() => {
                navigate('/today', { state: { success: true, message: 'Record Enhanced' } });
            }, 1000);
        } catch (err) {
            console.error('Failed to link presence:', err);
            handleSkipLinkage(); // Fail gracefully to Today
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-white z-50 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 backdrop-blur rounded-full border border-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Journal Link Active</span>
                </div>
                <button
                    onClick={() => navigate('/today')}
                    className="p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 mb-20">
                <div className="relative z-10 w-full max-w-sm text-center">
                    <AnimatePresence mode="wait">
                        {status === 'context' && momentContext ? (
                            <motion.div
                                key="context"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="p-10 bg-[#130F1E] border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                    {/* Airbnb-style header */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600" />

                                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8 px-1">Invitation Context</h2>
                                    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight">{momentContext.title}</h3>
                                    <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-10">
                                        {momentContext.description}
                                    </p>

                                    {/* Groupon-style clarity box */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left mb-10 relative">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Presence standard</p>
                                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">By confirming, you record this unique encounter. This action is immutable and adds to your verified history.</p>
                                    </div>

                                    <button
                                        onClick={confirmPresence}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-[#08060a] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-500/20 uppercase tracking-[0.2em] text-sm active:scale-95"
                                    >
                                        Confirm Presence
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors py-4"
                                >
                                    Abort Threshold
                                </button>
                            </motion.div>
                        ) : status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="space-y-6"
                            >
                                {!showLinkage ? (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 backdrop-blur">
                                        <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                                            <CheckCircle className="w-8 h-8 text-[#08060a]" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-amber-400 mb-2">Presence Verified</h2>
                                        <p className="text-amber-200/80 text-sm italic">"Reputational Insurance Indexed."</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Optional Reflection</h2>
                                        <p className="text-zinc-500 text-xs -mt-4 mb-6">"How did this moment feel?"</p>

                                        {anchor && <MomentAnchor anchor={anchor} />}

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                                <textarea
                                                    placeholder="A human reflection on the moment..."
                                                    value={reflection}
                                                    onChange={(e) => setReflection(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 h-28 resize-none"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSaveLinkage}
                                                disabled={isSavingLink}
                                                className="w-full bg-pr-text-1 hover:bg-white/90 disabled:opacity-50 text-pr-surface-1 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
                                            >
                                                {isSavingLink ? 'Indexing...' : 'Record Presence Proof'}
                                                {!isSavingLink && <ArrowRight className="w-4 h-4" />}
                                            </button>

                                            <button
                                                onClick={handleSkipLinkage}
                                                className="w-full text-zinc-500 text-[10px] font-bold uppercase tracking-widest py-2 hover:text-white transition-colors"
                                            >
                                                Skip Expression
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="scan" className="space-y-8">
                                <h1 className="text-3xl font-black tracking-tight text-white/90 uppercase tracking-[0.2em]">
                                    Moment Threshold
                                </h1>

                                {/* Viewfinder UI */}
                                <div className="relative aspect-square max-w-[280px] mx-auto border border-white/20 rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm">
                                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br-lg" />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <QrCode className="w-16 h-16 text-white/10" />
                                    </div>
                                </div>

                                {/* Manual Threshold Key (Pinterest Intentionality) */}
                                <form onSubmit={handleManualSubmit} className="relative group">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter Threshold Key"
                                        className="w-full bg-[#130F1E] border border-white/10 rounded-2xl px-4 py-5 pl-12 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-[#1A142A] transition-all font-mono text-center tracking-[0.4em] uppercase text-lg"
                                    />
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />

                                    {status === 'verifying' && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </form>

                                {status === 'error' && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorMessage}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="p-6 text-center z-10 bottom-0 left-0 right-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
                    Moment Infrastructure • For the moments that matter.
                </p>
            </div>
        </div >
    );
}

// Add keyframes for scan animation in global css or tailwind config usually, 
// but since we can't edit config easily, rely on opacity pulse or similar if scan animation fails.
