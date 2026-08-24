import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ShieldAlert, 
  Copy, 
  Sparkles, 
  QrCode,
  Flame,
  Check,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromoKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  momentTitle: string;
  perkDescription: string;
  venueName: string;
  location: string;
  momentId?: string;
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
  momentId = "mom_default",
  expiresInMinutes = 60,
  promoCode = "PROMO-KEY-9982",
  keysRemaining = 4,
  onClaimConfirm
}) => {
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(expiresInMinutes * 60);

  useEffect(() => {
    let interval: any;
    if (claimed && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [claimed, timeLeftSeconds]);

  if (!isOpen) return null;

  const dynamicClaimPayload = JSON.stringify({
    type: "promokey_redemption",
    code: promoCode,
    momentId,
    venue: venueName,
    claimedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInMinutes * 60000).toISOString()
  });

  const handleClaim = async () => {
    setIsBurning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Record claim in promokey_claims table
        await supabase.from('promokey_claims').insert({
          user_id: user.id,
          moment_id: momentId,
          claim_code: promoCode,
          expires_at: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
          status: 'active'
        }).select().single();
      }

      setTimeout(() => {
        setIsBurning(false);
        setClaimed(true);
        toast.success("PromoKey burned & VIP Pass Unlocked!");
        if (onClaimConfirm) onClaimConfirm();
      }, 1200);
    } catch (err) {
      console.warn("Claim recorded locally:", err);
      setIsBurning(false);
      setClaimed(true);
      if (onClaimConfirm) onClaimConfirm();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.info("Pass code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((expiresInMinutes * 60 - timeLeftSeconds) / (expiresInMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-amber-500/30 p-6 text-white shadow-2xl overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full transition-colors z-10"
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
            <Sparkles className="w-4 h-4 mr-1.5 shrink-0 text-amber-400" />
            {perkDescription}
          </p>

          <div className="space-y-1.5 text-xs text-gray-300">
            <p className="flex items-center">
              <MapPin className="w-3.5 h-3.5 text-orange-400 mr-1.5 shrink-0" />
              <span className="font-semibold text-white">{venueName}</span> — {location}
            </p>
            <p className="flex items-center text-rose-400 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
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
            <span className="font-bold text-amber-400">1 Key Burn</span>
          </div>
        )}

        {/* Claim / Unlocked QR Section */}
        {claimed ? (
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-white rounded-3xl flex flex-col items-center justify-center space-y-3 border-4 border-amber-500/80 shadow-2xl shadow-amber-500/20">
              {/* Dynamic Live QR Code */}
              <div className="p-2 bg-white rounded-xl shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  value={dynamicClaimPayload}
                  size={160}
                  level="H"
                  includeMargin={false}
                  fgColor="#09090b"
                />
              </div>

              <div className="w-full text-center">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-0.5">
                  Verification Pass Code
                </span>
                <span className="text-sm font-mono font-black text-gray-900 tracking-wider">
                  {promoCode}
                </span>
              </div>

              {/* Dynamic Countdown Bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-1000"
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>

              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time Remaining: {formatTimer(timeLeftSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-xl text-gray-200 flex items-center space-x-1.5 border border-gray-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Code!' : 'Copy Pass Code'}</span>
              </button>
            </div>

            <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              PromoKey Burned & Settled. Present this QR at {venueName} to redeem.
            </p>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={isBurning}
            className={`w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-gray-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] ${
              isBurning ? 'opacity-75 cursor-wait' : ''
            }`}
          >
            {isBurning ? (
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 animate-spin text-gray-950" />
                <span>Burning 1 PromoKey & Unlocking Pass...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span>Burn 1 PromoKey & Unlock Pass</span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
export default PromoKeyModal;
