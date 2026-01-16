import { useState, useRef, useEffect } from 'react';
import { QrCode, X, CheckCircle2, XCircle, Camera, Loader2, Keyboard } from 'lucide-react';

interface TicketScannerProps {
    eventId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TicketScanner({ eventId, onClose, onSuccess }: TicketScannerProps) {
    const [mode, setMode] = useState<'scan' | 'manual'>('manual');
    const [manualCode, setManualCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setMode('scan');
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for QR scanning. Please use manual entry instead.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setMode('manual');
    };

    const validateTicket = async (code: string) => {
        if (!code.trim()) return;

        setIsValidating(true);
        setResult(null);

        try {
            const response = await fetch(`/api/events/${eventId}/tickets/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activation_code: code.trim().toUpperCase() })
            });
            const data = await response.json();

            if (data.status === 'success') {
                setResult({ success: true, message: 'Ticket validated successfully! Guest checked in.' });
                onSuccess?.();
            } else {
                setResult({ success: false, message: data.error || 'Invalid ticket code' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Failed to validate ticket. Please try again.' });
        } finally {
            setIsValidating(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        validateTicket(manualCode);
    };

    const handleScanResult = (code: string) => {
        try {
            const data = JSON.parse(code);
            if (data.type === 'event_ticket' && data.code) {
                validateTicket(data.code);
            }
        } catch {
            validateTicket(code);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-pr-border flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500">
                    <div className="flex items-center gap-3">
                        <QrCode className="w-6 h-6 text-white" />
                        <div>
                            <h2 className="text-lg font-bold text-white">Ticket Scanner</h2>
                            <p className="text-white/80 text-xs">Validate guest tickets</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="p-4 border-b border-pr-border">
                    <div className="flex bg-pr-surface-2 rounded-xl p-1">
                        <button
                            onClick={() => { stopCamera(); setMode('manual'); }}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                mode === 'manual' ? 'bg-white shadow text-pr-text-1' : 'text-pr-text-3'
                            }`}
                        >
                            <Keyboard className="w-4 h-4" />
                            Manual Entry
                        </button>
                        <button
                            onClick={startCamera}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                mode === 'scan' ? 'bg-white shadow text-pr-text-1' : 'text-pr-text-3'
                            }`}
                        >
                            <Camera className="w-4 h-4" />
                            Scan QR
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {mode === 'manual' ? (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-pr-text-2 mb-2">
                                    Enter Activation Code
                                </label>
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., A1B2C3D4"
                                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-center text-2xl font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                                    maxLength={12}
                                    autoFocus
                                />
                                <p className="text-xs text-pr-text-3 mt-2 text-center">
                                    Enter the 8-character code from the guest's ticket
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isValidating || !manualCode.trim()}
                                className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Validate Ticket
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                                
                                {/* Scan overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-white rounded-2xl relative">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-pr-text-3 text-center">
                                Position the QR code within the frame
                            </p>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            {result.success ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            )}
                            <div>
                                <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.success ? 'Success!' : 'Validation Failed'}
                                </p>
                                <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-pr-surface-1 border-t border-pr-border">
                    <p className="text-xs text-pr-text-3 text-center">
                        Each ticket can only be validated once. Validated tickets will be marked as "used".
                    </p>
                </div>
            </div>
        </div>
    );
}
