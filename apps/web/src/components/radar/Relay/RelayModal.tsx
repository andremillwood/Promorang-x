import { useState, useEffect } from 'react';
import ModalBase from '../ModalBase';
import { useRelay, type RelayObjectType } from '../../hooks/useRelay';
import { Share2, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface RelayModalProps {
    isOpen: boolean;
    onClose: () => void;
    objectType: RelayObjectType;
    objectId: string;
    onSuccess?: (data: any) => void;
}

export default function RelayModal({ isOpen, onClose, objectType, objectId, onSuccess }: RelayModalProps) {
    const { createRelay, isLoading: isRelaying, error: relayError, clearError } = useRelay();
    const [step, setStep] = useState<'info' | 'success'>('info');

    useEffect(() => {
        if (isOpen) {
            setStep('info');
            clearError();
        }
    }, [isOpen]);

    const handleRelay = async () => {
        const result = await createRelay({ objectType, objectId });
        if (result.success) {
            setStep('success');
            if (onSuccess) onSuccess(result.data);
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Relay to Network" maxWidth="md">
            {step === 'info' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Pass the Signal</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Relaying propagates this to your network with your endorsement.
                                You earn <strong>Status</strong> and <strong>Points</strong> based on downstream engagement.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Placeholder stats */}
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Relay Weight</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">1.0x</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Potential Reach</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">Your Followers</div>
                        </div>
                    </div>

                    {relayError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {relayError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-semibold text-gray-700 dark:text-gray-300">
                            Cancel
                        </button>
                        <button
                            onClick={handleRelay}
                            disabled={isRelaying}
                            className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isRelaying ? 'Relaying...' : (
                                <>
                                    <Share2 className="w-4 h-4" />
                                    Confirm Relay
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Relay Successful!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        You have successfully propagated this object. Track your downstream impact in your profile.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold text-gray-700 dark:text-white"
                    >
                        Close
                    </button>
                </div>
            )}
        </ModalBase>
    );
}
