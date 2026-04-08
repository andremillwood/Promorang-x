import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { X, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import { apiFetch } from '@/react-app/utils/api';

interface TicketScannerProps {
    eventId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TicketScanner({ eventId, onClose, onSuccess }: TicketScannerProps) {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [status, setStatus] = useState<'scanning' | 'verifying' | 'success' | 'error'>('scanning');
    const [message, setMessage] = useState('');

    const handleScan = async (result: any) => {
        if (!result || status !== 'scanning') return;

        const data = result?.text || result;
        if (!data) return;

        setScannedData(data);
        setStatus('verifying');
        setMessage('Verifying ticket...');

        try {
            // Parse data: Expecting JSON { "ticket_id": "..." } or just raw ID
            let ticketId = data;
            try {
                const parsed = JSON.parse(data);
                if (parsed.ticket_id) ticketId = parsed.ticket_id;
            } catch (e) {
                // Not JSON, treat as raw ID
            }

            const response = await apiFetch(`/api/moments/${eventId}/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticket_id: ticketId,
                    verified_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                setStatus('success');
                setMessage('Access Granted');
                // Play Success Sound (optional)
                setTimeout(() => {
                    onSuccess();
                    // Reset to scan next
                    setScannedData(null);
                    setStatus('scanning');
                    setMessage('');
                }, 1500);
            } else {
                const err = await response.json();
                setStatus('error');
                setMessage(err.error || 'Access Denied');
                // Play Error Sound
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('Network Error');
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        // Don't show critical error to user immediately, just keep trying
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white/20"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Ticket Scanner</h2>
                    <p className="text-gray-400 text-sm">Align the QR code within the frame</p>
                </div>

                <div className="relative aspect-square bg-gray-900 border-y border-gray-800">
                    {status === 'scanning' ? (
                        <div className="relative w-full h-full">
                            <QrReader
                                onResult={(result, error) => {
                                    if (!!result) handleScan(result);
                                    if (!!error) handleError(error);
                                }}
                                constraints={{ facingMode: 'environment' }}
                                containerStyle={{ width: '100%', height: '100%' }}
                                videoStyle={{ objectFit: 'cover' }}
                            />
                            {/* Overlay Frame */}
                            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none">
                                <div className="absolute inset-[20%] border-2 border-green-500/50 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center justify-center h-full ${status === 'success' ? 'bg-green-600' :
                                status === 'error' ? 'bg-red-600' : 'bg-gray-800'
                            } transition-colors duration-300`}>
                            {status === 'success' && <CheckCircle className="w-24 h-24 text-white mb-4 animate-bounce" />}
                            {status === 'error' && <AlertCircle className="w-24 h-24 text-white mb-4 animate-shake" />}
                            {status === 'verifying' && <Scan className="w-16 h-16 text-blue-400 animate-spin" />}

                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{message}</h3>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-900">
                    <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                        <span>CAMERA: ACTIVE</span>
                        <span>{status.toUpperCase()}</span>
                    </div>
                    {scannedData && (
                        <div className="mt-2 p-2 bg-black rounded border border-gray-800 text-center font-mono text-xs text-gray-400 truncate">
                            {scannedData}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
