import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface KycVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function KycVerificationModal({ isOpen, onClose, onSuccess }: KycVerificationModalProps) {
    const [documentType, setDocumentType] = useState<'passport' | 'license' | 'id_card'>('passport');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Basic validation
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
                setError('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please select a document to upload');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulated upload and submission
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch('/api/kyc/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    document_type: documentType,
                    document_url: 'https://example.com/mock-doc-url.jpg'
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setFile(null);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to submit verification');
            }
        } catch (err) {
            console.error(err);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="md"
            showCloseButton={false}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-pr-text-1">Identity Verification</h2>
                            <p className="text-xs text-pr-text-2 tracking-wider uppercase font-semibold">Treasury Compliance</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold">Regulatory Safety Gate</p>
                        <p className="mt-1 leading-relaxed">
                            To comply with financial regulations on the platform, we verify identities for withdrawals. Your data is encrypted and securely stored.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-pr-text-1 mb-3">
                            Document Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'passport', label: 'Passport' },
                                { id: 'license', label: 'Driver\'s License' },
                                { id: 'id_card', label: 'National ID' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setDocumentType(type.id as any)}
                                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${documentType === type.id
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                        : 'border-pr-surface-3 text-pr-text-2 hover:border-blue-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-pr-text-1 mb-3">
                            Upload Document Image
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${file ? 'border-green-400 bg-green-50' : 'border-pr-surface-3 hover:border-blue-400 hover:bg-pr-surface-2'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="font-bold text-green-700">{file.name}</p>
                                    <p className="text-xs text-green-600 mt-1 uppercase tracking-widest font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <p className="font-bold text-pr-text-1">Upload Your Document</p>
                                    <p className="text-xs text-pr-text-2 mt-2 uppercase tracking-widest">JPG, PNG or PDF • Max 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-pr-surface-3 rounded-xl text-pr-text-1 font-bold hover:bg-pr-surface-2 transition-all uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest text-xs"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Submit Rites'
                        )}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
