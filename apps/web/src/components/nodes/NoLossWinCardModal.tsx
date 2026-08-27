import React from 'react';
import { Trophy, Share2, Sparkles, X, Check, Copy } from 'lucide-react';
import jackpotMegaVault from '@/assets/nodes/jackpot-mega-vault.jpg';

interface NoLossWinCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
  prizeAmount: number;
  poolName: string;
  referralCode: string;
}

export const NoLossWinCardModal: React.FC<NoLossWinCardModalProps> = ({
  isOpen,
  onClose,
  winnerName,
  prizeAmount,
  poolName,
  referralCode,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://promorang.co/nodes?ref=${referralCode}`;
  const shareText = `I just won $${prizeAmount.toLocaleString()} in the Promorang Save & Win Community Pot without risking a single penny! Stash savings in a Community Vault and join the free weekly draw: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center text-white overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Win Card Graphic */}
        <div className="mt-4 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-500/30 shadow-inner relative overflow-hidden">
          <div className="relative h-44 w-full overflow-hidden">
            <img 
              src={jackpotMegaVault} 
              alt="Jackpot Mega Vault" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFICIAL DRAW WINNER</span>
            </div>
          </div>

          <div className="p-5 pt-1">
            <div className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Save &amp; Win Pot Winner!
            </div>

            <div className="text-3xl font-black text-white my-1.5">
              ${prizeAmount.toLocaleString()} USD
            </div>

          <div className="text-xs text-zinc-400">
            Awarded from <span className="text-zinc-200 font-semibold">{poolName}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Savings Kept • Zero Risk</span>
          </div>
        </div>

        {/* Action / Share Loop */}
        <div className="mt-6 space-y-3">
          <p className="text-xs text-zinc-400">
            Share your win to claim an instant <strong>+10% Bonus in Gems</strong> and boost your next month multiplier!
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Share Link Copied!' : 'Share Win & Claim +10% Bonus'}
          </button>
        </div>
      </div>
    </div>
  );
};
