import React, { useState } from 'react';
import { Gift, Send, Heart, X, Check, Search } from 'lucide-react';

interface DropGiftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponTitle: string;
  merchantName: string;
}

export const DropGiftingModal: React.FC<DropGiftingModalProps> = ({
  isOpen,
  onClose,
  couponTitle,
  merchantName,
}) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-slate-800/80 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-pink-600/20 border border-pink-500/40 rounded-xl text-pink-400">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-pink-400 uppercase">SnackPass Social Gifting</span>
            <h3 className="text-lg font-bold text-white">Gift a Drop to a Friend</h3>
          </div>
        </div>

        <div className="p-4 bg-pink-950/30 border border-pink-500/30 rounded-xl mb-5">
          <p className="text-xs text-pink-300 font-semibold">{merchantName}</p>
          <p className="text-sm font-bold text-white mt-0.5">{couponTitle}</p>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Friend's Username or Email:</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="@alex_promorang"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Add a Custom Note:</label>
            <textarea
              rows={2}
              placeholder="Dinner on me tonight! Enjoy the drop 🍕"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={sent}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            {sent ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Gift Sent Successfully!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Gift Drop Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
