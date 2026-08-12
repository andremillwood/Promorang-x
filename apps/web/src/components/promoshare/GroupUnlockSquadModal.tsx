import React, { useState } from 'react';
import { Users, Share2, Copy, Check, Sparkles, X, Gift } from 'lucide-react';

interface GroupUnlockSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealTitle: string;
  squadMinSize: number;
  squadBonusDiscountPct: number;
  squadCode?: string;
}

export const GroupUnlockSquadModal: React.FC<GroupUnlockSquadModalProps> = ({
  isOpen,
  onClose,
  dealTitle,
  squadMinSize = 3,
  squadBonusDiscountPct = 15,
  squadCode = 'SQUAD-8821',
}) => {
  const [copied, setCopied] = useState(false);
  const squadLink = `https://promorang.com/squad/${squadCode}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(squadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-slate-800/80 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Form a Squad & Unlock Bonus</h3>
            <p className="text-xs text-purple-300">Share with friends to get extra rewards!</p>
          </div>
        </div>

        <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl mb-5 space-y-3">
          <p className="text-sm font-semibold text-purple-200">{dealTitle}</p>

          <div className="flex items-center justify-between p-3 bg-purple-900/40 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Users className="w-4 h-4 text-purple-400" /> Min. Squad Required:
            </span>
            <span className="font-bold text-white">{squadMinSize} Friends</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Gift className="w-4 h-4 text-emerald-400" /> Extra Squad Cashback:
            </span>
            <span className="font-bold text-emerald-400">+{squadBonusDiscountPct}% OFF</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-xs text-gray-400 font-medium">Your Unique Squad Unlock Link:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={squadLink}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-purple-200 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <Share2 className="w-4 h-4" /> Share Link via WhatsApp / SMS
        </button>
      </div>
    </div>
  );
};
