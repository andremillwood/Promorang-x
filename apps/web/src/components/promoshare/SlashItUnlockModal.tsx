import React, { useState } from 'react';
import { Scissors, Share2, Check, Sparkles, X, Users, ArrowRight } from 'lucide-react';
import { SlashItDeal } from '../../types/viralPlaybooks';

interface SlashItUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  slashDeal: SlashItDeal;
}

export const SlashItUnlockModal: React.FC<SlashItUnlockModalProps> = ({
  isOpen,
  onClose,
  slashDeal,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const percentage = Math.round((slashDeal.slashesCompleted / slashDeal.slashesNeeded) * 100);
  const remaining = slashDeal.slashesNeeded - slashDeal.slashesCompleted;
  const shareUrl = `https://promorang.com/slash/${slashDeal.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-slate-800/80 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-600/20 border border-rose-500/40 rounded-xl text-rose-400">
            <Scissors className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">Pinduoduo Social Slash</span>
            <h3 className="text-lg font-bold text-white">Slash Price with Friends!</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-rose-500/30 rounded-xl mb-5">
          <p className="text-sm font-semibold text-rose-200 mb-2">{slashDeal.dealTitle}</p>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs text-gray-400 line-through">${slashDeal.originalPrice.toFixed(2)}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-rose-400">${slashDeal.currentPrice.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-emerald-400">${slashDeal.targetPrice.toFixed(2)} Target</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2 border border-gray-700">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-rose-300">
            <span>{slashDeal.slashesCompleted} Slashes Done</span>
            <span>{remaining} More Needed!</span>
          </div>
        </div>

        {/* Contributors List */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-rose-400" /> Friend Slash Helpers:
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {slashDeal.contributors.map((helper, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs">
                <span className="text-gray-200 font-medium">{helper.helperName}</span>
                <span className="text-emerald-400 font-bold">-${helper.amountSaved.toFixed(2)} Slashed!</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <Share2 className="w-4 h-4" /> {copied ? 'Link Copied!' : 'Share Link & Ask Friends to Slash'}
        </button>
      </div>
    </div>
  );
};
