import React, { useState, useEffect } from 'react';
import { X, Users, Share2, Zap, CheckCircle2, Copy } from 'lucide-react';

interface TeamSlashModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealTitle?: string;
  originalPrice?: number;
  slashedPrice?: number;
  targetCount?: number;
}

export const TeamSlashModal: React.FC<TeamSlashModalProps> = ({
  isOpen,
  onClose,
  dealTitle = 'Exclusive Promoshare Yield Pool',
  originalPrice = 100,
  slashedPrice = 10,
  targetCount = 3,
}) => {
  const [joinedCount, setJoinedCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/slash?ref=user_squad_123` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Slash this deal with me on Promorang!`,
          text: `Join my squad on Promorang to slash ${dealTitle} down to $${slashedPrice}!`,
          url: shareUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const progressPercent = Math.min((joinedCount / targetCount) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-orange-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-400 w-fit mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>SQUAD SLASHING ACTIVE</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Slash Price with Friends!</h2>
        <p className="text-xs text-zinc-400 mb-5">
          Get {targetCount} friends to join your squad before the timer runs out to unlock maximum yield!
        </p>

        {/* Timer Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Time Remaining
            </p>
            <p className="text-2xl font-mono font-bold text-orange-400">{formattedTime}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Target Price
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              ${slashedPrice} <span className="text-xs text-zinc-500 line-through">${originalPrice}</span>
            </p>
          </div>
        </div>

        {/* Squad Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-orange-400" /> Squad Members Joined
            </span>
            <span className="text-orange-400 font-bold">
              {joinedCount} / {targetCount}
            </span>
          </div>

          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Member Slots Visual */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Array.from({ length: targetCount }).map((_, index) => {
            const isFilled = index < joinedCount;
            return (
              <div
                key={index}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-600 border-dashed'
                }`}
              >
                {isFilled ? (
                  <CheckCircle2 className="w-6 h-6 mb-1 text-orange-400" />
                ) : (
                  <Users className="w-6 h-6 mb-1 opacity-50" />
                )}
                <span className="text-[10px] font-semibold">
                  {isFilled ? (index === 0 ? 'You (Host)' : `Friend #${index}`) : 'Empty Slot'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Share Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>INVITE SQUAD TO SLASH</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Squad Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
