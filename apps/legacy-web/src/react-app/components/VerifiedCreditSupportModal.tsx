import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/react-app/lib/api';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientId: string;
    contentId?: string;
}

export default function VerifiedCreditSupportModal({
    isOpen,
    onClose,
    recipientName,
    recipientId,
    contentId
}: SupportModalProps) {
    const [amount, setAmount] = useState<number>(5);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            await api.post('/content/tip', {
                recipient_id: recipientId,
                content_id: contentId,
                amount: amount,
                currency_type: 'MVI'
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to send support:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <Card className="p-6 relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 text-pr-text-3 hover:text-pr-text-1">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-black tracking-tight text-pr-text-1">Send Recognition</h3>
                            <p className="text-sm text-pr-text-2">To {recipientName}</p>
                        </div>

                        {!success ? (
                            <>
                                <div className="grid grid-cols-3 gap-2 py-4">
                                    {[5, 10, 20].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`py-2 rounded-xl font-bold transition-all ${amount === val
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handleSend}
                                        disabled={loading}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black"
                                    >
                                        {loading ? 'Sending...' : `Send ${amount} MVI`}
                                    </Button>
                                    <p className="text-[10px] text-pr-text-3 font-medium uppercase tracking-widest leading-relaxed px-4">
                                        MVI signals the value of verified participation
                                    </p>
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-8"
                            >
                                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-2 animate-bounce" />
                                <p className="font-bold text-pr-text-1">Support Sent!</p>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
