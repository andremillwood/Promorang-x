import { forwardRef } from 'react';
import { QrCode as QrIcon, Sparkles, Star } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface VenueQRPrintableProps {
    venueName: string;
    venueType: string;
    referralCode: string;
    customMessage?: string;
    callToAction?: string;
    primaryColor?: string;
}

export const VenueQRPrintable = forwardRef<HTMLDivElement, VenueQRPrintableProps>(({
    venueName,
    venueType,
    referralCode,
    customMessage,
    callToAction = 'Join Promorang & earn rewards!',
    primaryColor = '#8B5CF6'
}, ref) => {
    const scanUrl = `${window.location.origin}/signup?ref=${referralCode}&source=venue_qr`;

    return (
        <div
            ref={ref}
            className="venue-qr-printable w-[210mm] h-[297mm] bg-white p-12 flex flex-col items-center justify-between text-center select-none print:m-0 print:shadow-none"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            {/* Header Decoration */}
            <div className="w-full flex justify-between items-center opacity-20">
                <Sparkles size={40} style={{ color: primaryColor }} />
                <div className="text-sm font-bold tracking-widest uppercase">PROMORANG x {venueName}</div>
                <Sparkles size={40} style={{ color: primaryColor }} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12">
                {/* Logo/Icon */}
                <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    <QrIcon size={48} />
                </div>

                {/* Venue Info */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">{venueType || 'Official Partner'}</h2>
                    <h1 className="text-7xl font-black text-gray-900 leading-tight">{venueName}</h1>
                </div>

                {/* CTA */}
                <div className="max-w-2xl px-8 py-10 rounded-[3rem] border-8" style={{ borderColor: `${primaryColor}20` }}>
                    <p className="text-4xl font-extrabold text-gray-800 mb-6 leading-relaxed">
                        {customMessage || "Support us and win! Every share helps us grow, and every new joiner gets exclusive rewards."}
                    </p>
                    <div className="inline-block px-10 py-5 rounded-2xl bg-gray-50 text-3xl font-bold text-gray-900 border-2 border-gray-100">
                        {callToAction}
                    </div>
                </div>

                {/* The QR Placeholder */}
                <div className="relative p-10 bg-white rounded-[4rem] shadow-2xl border-2 border-gray-50">
                    <div className="w-80 h-80 bg-white rounded-3xl flex flex-col items-center justify-center space-y-4">
                        <QRCodeCanvas
                            value={scanUrl}
                            size={280}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    {/* Floating badge */}
                    <div
                        className="absolute -top-4 -right-4 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl rotate-12"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Star fill="white" size={24} />
                        <span className="text-xs font-black uppercase">BONUS</span>
                    </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                    <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Or enter code at signup</p>
                    <div className="text-5xl font-mono font-black tracking-[0.2em] text-gray-900 bg-gray-50 px-8 py-4 rounded-3xl border-2 border-dashed border-gray-200">
                        {referralCode}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full border-t-4 pt-8 flex items-end justify-between" style={{ borderTopColor: `${primaryColor}10` }}>
                <div className="text-left space-y-1">
                    <p className="text-2xl font-black text-gray-900">PROMORANG</p>
                    <p className="text-sm font-bold text-gray-400">The Content Liquidity Engine</p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-gray-400">Join the movement</p>
                    <p className="text-xl font-bold text-gray-900">www.promorang.co</p>
                </div>
            </div>
        </div>
    );
});

VenueQRPrintable.displayName = 'VenueQRPrintable';
