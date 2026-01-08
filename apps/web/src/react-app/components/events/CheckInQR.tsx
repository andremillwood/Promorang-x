import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Info } from 'lucide-react';

interface CheckInQRProps {
    checkInCode: string;
    eventName: string;
    isVirtual?: boolean;
}

export default function CheckInQR({ checkInCode, eventName, isVirtual }: CheckInQRProps) {
    // Generate a secure payload or clear text code
    const qrValue = JSON.stringify({
        type: 'event_check_in',
        code: checkInCode,
        event: eventName
    });

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-pr-border">
            <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-900">Your Entry Pass</h3>
                <p className="text-sm text-gray-500">Show this to the organizer at the venue</p>
            </div>

            <div className="p-4 bg-white border-4 border-purple-500 rounded-2xl shadow-inner mb-4">
                <QRCodeSVG
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                        src: "/favicon.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }}
                />
            </div>

            <div className="w-full space-y-3">
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl text-purple-700 text-xs">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>This code is personal and linked to your account.</span>
                </div>

                {isVirtual && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>For virtual events, check-in is usually automatic upon joining.</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    ID: {checkInCode.slice(0, 8)}...
                </span>
            </div>
        </div>
    );
}
