import React, { useState } from 'react';
import { Key, X, Clock, MapPin, CheckCircle, ShieldAlert, Copy, Sparkles } from 'lucide-react';

export interface PromoKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  momentTitle: string;
  perkDescription: string;
  venueName: string;
  location: string;
  expiresInMinutes?: number;
  promoCode?: string;
  keysRemaining?: number;
  onClaimConfirm?: () => void;
}

export const PromoKeyModal: React.FC<PromoKeyModalProps> = ({
  isOpen,
  onClose,
  momentTitle,
  perkDescription,
  venueName,
  location,
  expiresInMinutes = 60,
  promoCode = "PROMO-KEY-9982",
  keysRemaining = 4,
  onClaimConfirm
}) => {
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    setClaimed(true);
    if (onClaimConfirm) onClaimConfirm();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-amber-500/30 p-6 text-white shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Exclusive PromoKey Unlock
            </span>
            <h2 className="text-lg font-bold text-white leading-tight">
              {momentTitle}
            </h2>
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/60 mb-5">
          <p className="text-amber-300 font-bold text-sm mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5" />
            {perkDescription}
          </p>

          <div className="space-y-1.5 text-xs text-gray-300">
            <p className="flex items-center">
              <MapPin className="w-3.5 h-3.5 text-orange-400 mr-1.5" />
              <span className="font-semibold text-white">{venueName}</span> — {location}
            </p>
            <p className="flex items-center text-rose-400 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Pass expires in {expiresInMinutes} mins upon activation
            </p>
          </div>
        </div>

        {/* Scarcity Trigger */}
        {!claimed && (
          <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl mb-5 text-amber-300 font-medium">
            <span className="flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-400" />
              Strict Scarcity: Only {keysRemaining} Keys available
            </span>
            <span className="font-bold text-amber-400">Claim Now</span>
          </div>
        )}

        {/* Claim / Unlocked QR Section */}
        {claimed ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2 border-4 border-emerald-500">
              {/* Dummy QR Code mockup */}
              <div className="w-36 h-36 bg-gray-900 p-2 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1.5 w-full h-full p-2 bg-white rounded-lg">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        (i * 7) % 3 === 0 ? 'bg-gray-950' : 'bg-gray-200'
                      } rounded-sm`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-gray-900 tracking-wider">
                {promoCode}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-xl text-gray-200 flex items-center space-x-1.5 border border-gray-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              PromoKey Unlocked! Present this QR code at {venueName} to redeem.
            </p>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Key className="w-4 h-4" />
            <span>Confirm & Unlock PromoKey</span>
          </button>
        )}
      </div>
    </div>
  );
};
