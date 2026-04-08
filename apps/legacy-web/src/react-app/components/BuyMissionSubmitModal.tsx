/**
 * BuyMissionSubmitModal
 * 
 * Receipt/Proof upload modal for Buy Missions.
 * This is the "ticket" that activates and funds campaigns.
 */

import { useState, useRef } from 'react';
import { X, Upload, Receipt, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/react-app/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface BuyMissionSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    dropId: string;
    dropTitle: string;
    campaignTitle?: string;
    verified_creditsReward: number;
    onSuccess?: () => void;
}

export default function BuyMissionSubmitModal({
    isOpen,
    onClose,
    dropId,
    dropTitle,
    campaignTitle,
    verified_creditsReward,
    onSuccess,
}: BuyMissionSubmitModalProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [proofImage, setProofImage] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an image (JPG, PNG, etc.)',
                type: 'destructive',
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please upload an image under 10MB',
                type: 'destructive',
            });
            return;
        }

        setProofImage(file);
        const reader = new FileReader();
        reader.onload = () => setProofPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!proofImage) {
            toast({
                title: 'Receipt required',
                description: 'Please upload a photo of your receipt or order confirmation',
                type: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // Upload image first
            const formData = new FormData();
            formData.append('file', proofImage);
            formData.append('type', 'buy_proof');

            const uploadRes = await apiFetch('/uploads', {
                method: 'POST',
                body: formData,
            });

            // Submit proof with uploaded URL
            await apiFetch(`/drops/${dropId}/submit-buy-proof`, {
                method: 'POST',
                body: JSON.stringify({
                    proof_url: uploadRes.url,
                    order_number: orderNumber.trim() || undefined,
                    notes: notes.trim() || undefined,
                }),
            });

            toast({
                title: 'Proof Submitted! 🎉',
                description: 'Your purchase proof is under review. You\'ll be notified once verified.',
                type: 'success',
            });
            onSuccess?.();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error submitting buy proof:', error);
            toast({
                title: 'Submission Failed',
                description: error.message || 'Please try again',
                type: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProofImage(null);
        setProofPreview(null);
        setOrderNumber('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={false}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 mb-1">
                            <Receipt className="h-4 w-4" />
                            <span>Buy Mission</span>
                        </div>
                        <h2 className="text-xl font-bold text-pr-text-1">{dropTitle}</h2>
                        {campaignTitle && (
                            <p className="text-sm text-pr-text-2 mt-1">Part of: {campaignTitle}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-pr-text-2">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Reward Badge */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-300">Reward on verification</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                💎 {verified_creditsReward} Verified Credits
                            </p>
                        </div>
                        <div className="text-right text-xs text-green-600 dark:text-green-400">
                            <p>≈ ${(verified_creditsReward * 0.01).toFixed(2)} USD</p>
                            <p className="opacity-70">Weight: 1.0x (highest)</p>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div>
                    <label className="block text-sm font-semibold text-pr-text-1 mb-3">
                        Upload Receipt or Order Confirmation *
                    </label>

                    {proofPreview ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-green-500">
                            <img
                                src={proofPreview}
                                alt="Proof preview"
                                className="w-full max-h-64 object-contain bg-pr-surface-2"
                            />
                            <button
                                onClick={() => {
                                    setProofImage(null);
                                    setProofPreview(null);
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
                                <Check className="inline h-4 w-4 mr-1" />
                                Receipt uploaded
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-pr-surface-3 hover:border-purple-400'
                                }`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-pr-text-1 font-medium">
                                        Drag & drop your receipt here, or
                                    </p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-purple-600 dark:text-purple-400 font-semibold hover:underline mt-1"
                                    >
                                        browse files
                                    </button>
                                </div>
                                <p className="text-xs text-pr-text-3">
                                    Supported: JPG, PNG, HEIC • Max 10MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Number (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Order Number (optional)
                    </label>
                    <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g., ORD-12345"
                        className="w-full rounded-lg border border-pr-surface-3 bg-pr-surface-1 px-4 py-3 text-pr-text-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Notes (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                        Additional Notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any extra info about your purchase..."
                        rows={2}
                        className="w-full rounded-lg border border-pr-surface-3 bg-pr-surface-1 px-4 py-3 text-pr-text-1 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">What happens next?</p>
                        <ul className="mt-1 space-y-1 text-blue-600 dark:text-blue-400">
                            <li>• Your proof will be reviewed within 24 hours</li>
                            <li>• {verified_creditsReward} Verified Credits will be credited upon verification</li>
                            <li>• Your contribution helps this campaign grow!</li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !proofImage}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Submit Proof
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </ModalBase>
    );
}
