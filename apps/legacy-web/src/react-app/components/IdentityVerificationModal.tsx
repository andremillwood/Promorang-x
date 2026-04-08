import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface IdentityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function IdentityVerificationModal({ isOpen, onClose, onSuccess }: IdentityVerificationModalProps) {
    const [documentType, setDocumentType] = useState<'passport' | 'license' | 'id_card'>('passport');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
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
            // In a real implementation, we would upload to S3/Storage first and get a URL
            // For this demo/mock, we'll just send a data URL or placeholder

            // Simulating upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch('/api/kyc/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    document_type: documentType,
                    document_url: 'https://example.com/mock-doc-url.jpg' // specific implementation would handle actual file upload
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
                onClose();
                setFile(null);
                setPreviewUrl(null);
            } else {
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
                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-pr-text-1">Identity Verification</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Why is this required?</p>
                        <p className="mt-1">
                            To comply with financial regulations, we verify identities for withdrawals over $500. Your data is encrypted and securely stored.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-pr-text-1 mb-2">
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
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${documentType === type.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-pr-surface-3 text-pr-text-2 hover:border-pr-surface-3'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-pr-text-1 mb-2">
                            Upload Document Image
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-pr-surface-3 hover:border-pr-surface-3'
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
                                    <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                                    <p className="font-medium text-green-700">{file.name}</p>
                                    <p className="text-sm text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="mt-3 text-xs text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center cursor-pointer">
                                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="font-medium text-pr-text-1">Click to upload or drag and drop</p>
                                    <p className="text-sm text-pr-text-2 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-pr-surface-3 rounded-lg text-pr-text-1 font-medium hover:bg-pr-surface-2 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit for Verification'
                        )}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
