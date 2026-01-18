import { useState } from 'react';
import { Lock, Shield, CheckCircle, ExternalLink, RefreshCw, Copy, Sparkles } from 'lucide-react';
import ModalBase from './ModalBase';
import { buildAuthHeaders } from '@/react-app/utils/api';
import { API_BASE_URL } from '../config';

interface ClaimContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: {
        id: string | number;
        title: string;
        platform: string;
        media_url?: string;
    };
    onSuccess: () => void;
}

export default function ClaimContentModal({ isOpen, onClose, content, onSuccess }: ClaimContentModalProps) {
    const [step, setStep] = useState<'intro' | 'verify' | 'success'>('intro');
    const [loading, setLoading] = useState(false);
    const [bioCode, setBioCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/generate-bio-code`, {
                method: 'POST',
                headers: buildAuthHeaders(),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setBioCode(data.code);
                setStep('verify');
            } else {
                setError(data.error || 'Failed to generate code');
            }
        } catch (err) {
            console.error('Code generation error:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitClaim = async (type: string, evidence: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${content.id}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...buildAuthHeaders()
                },
                credentials: 'include',
                body: JSON.stringify({
                    verificationType: type,
                    evidence: evidence
                })
            });
            const data = await response.json();
            if (data.success) {
                setStep('success');
            } else {
                setError(data.error || 'Verification failed. Please check your proof.');
            }
        } catch (err) {
            console.error('Claim submission error:', err);
            setError('Verification error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Claim Creator Ownership">
            <div className="space-y-6">
                {step === 'intro' && (
                    <div className="space-y-4">
                        <div className="bg-pr-surface-2 p-4 rounded-xl flex items-center space-x-4 border border-pr-surface-3">
                            <img
                                src={content.media_url || 'https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png'}
                                alt=""
                                className="w-16 h-16 rounded-lg object-cover bg-pr-surface-3"
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-pr-text-1 line-clamp-1">{content.title}</h4>
                                <p className="text-sm text-pr-text-2 capitalize">{content.platform} Content</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-bold text-pr-text-1">Verify Ownership to Claim Equity</h3>
                            </div>
                            <p className="text-pr-text-2 text-sm leading-relaxed">
                                As the original creator, you can claim the <strong>75% equity</strong> held in escrow for this content.
                                Prove ownership to merge this content with your Promorang profile and unlock earnings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            <button
                                onClick={generateCode}
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
                            >
                                {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                <span>Start Verification</span>
                            </button>
                        </div>

                        <p className="text-center text-xs text-pr-text-2">
                            Verified creators receive priority in searches and higher yield attribution.
                        </p>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                To verify ownership of this <strong>{content.platform}</strong> account, paste the following code into your profile bio:
                            </p>
                            <div className="mt-3 flex items-center space-x-2">
                                <code className="flex-1 bg-white dark:bg-[#1a1a1a] border border-blue-200 dark:border-blue-800 p-3 rounded-lg font-mono font-bold text-lg text-blue-900 dark:text-blue-300 text-center tracking-widest leading-none block">
                                    {bioCode}
                                </code>
                                <button
                                    onClick={() => {
                                        if (bioCode) {
                                            navigator.clipboard.writeText(bioCode);
                                            alert('Copied to clipboard!');
                                        }
                                    }}
                                    className="p-3 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-100 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-pr-text-1 text-sm uppercase tracking-wider">Instructions</h4>
                            <ol className="space-y-4 text-sm text-pr-text-2">
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-pr-surface-3 rounded-full flex items-center justify-center text-xs font-bold text-pr-text-1">1</span>
                                    <span>Open your <strong>{content.platform}</strong> profile settings in a new tab.</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-pr-surface-3 rounded-full flex items-center justify-center text-xs font-bold text-pr-text-1">2</span>
                                    <span>Paste the <strong>PROMO-</strong> code anywhere in your public bio or website field.</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-pr-surface-3 rounded-full flex items-center justify-center text-xs font-bold text-pr-text-1">3</span>
                                    <span>Click "Verify My Bio" below. Our crawler will check it instantly!</span>
                                </li>
                            </ol>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center space-x-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={() => submitClaim('bio_code', bioCode || '')}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
                        >
                            {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                            <span>Verify My Bio</span>
                        </button>

                        <button
                            onClick={() => setStep('intro')}
                            disabled={loading}
                            className="w-full text-pr-text-2 text-sm hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center space-y-4 py-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500 border-dashed">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-pr-text-1">Ownership Verified!</h3>
                        <p className="text-pr-text-2">
                            Congratulations! This content has been successfully claimed.
                            The <strong>75% creator escrow</strong> has been released to your wallet.
                        </p>
                        <div className="p-4 bg-pr-surface-2 rounded-xl border border-pr-surface-3 text-sm text-pr-text-1">
                            You now have full control over this content piece's visibility and sponsorship details.
                        </div>
                        <button
                            onClick={() => {
                                onSuccess();
                                onClose();
                            }}
                            className="w-full bg-pr-text-1 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                        >
                            Finish & Refresh
                        </button>
                    </div>
                )}
            </div>
        </ModalBase>
    );
}
