import { useState } from 'react';
import type { ContentPieceType } from '../../shared/types';
import { X, Gift, Coins } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface TipModalProps {
  content: ContentPieceType;
  isOpen: boolean;
  onClose: () => void;
  onTip: (content: ContentPieceType, amount: number) => Promise<void>;
}

export default function TipModal({ content, isOpen, onClose, onTip }: TipModalProps) {
  const [tipAmount, setTipAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const tipOptions = [1, 5, 10, 25, 50, 100];
  const creatorDisplayName = content.creator_username || 'this creator';
  const creatorInitial = creatorDisplayName[0]?.toUpperCase() || 'U';

  const handleTip = async () => {
    if (tipAmount < 1) return;

    setLoading(true);
    try {
      await onTip(content, tipAmount);
      onClose();
      setTipAmount(1);
    } catch (error) {
      console.error('Failed to send tip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-sm font-semibold text-white">
              {creatorInitial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-pr-text-1">Tip Creator</h2>
              <p className="text-sm text-pr-text-2">
                Support {creatorDisplayName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-pr-text-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-pr-text-1">Select Tip Amount</h3>
            <p className="mb-4 text-sm text-pr-text-2">Choose how many gems you'd like to tip</p>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {tipOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`rounded-lg py-2 px-3 text-sm font-medium transition-all duration-200 ${
                    tipAmount === amount
                      ? 'bg-purple-500 text-white ring-2 ring-purple-200'
                      : 'bg-pr-surface-2 text-pr-text-1 hover:bg-pr-surface-3'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Coins className="h-4 w-4" />
                    <span>{amount}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  placeholder="Custom amount"
                />
              </div>
              <div className="flex items-center space-x-1 text-pr-text-2">
                <Coins className="h-4 w-4" />
                <span className="text-sm">gems</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-pr-surface-2 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pr-text-2">You're tipping</p>
                <p className="text-lg font-semibold text-pr-text-1">
                  <Coins className="mr-1 inline h-5 w-5 text-purple-500" />
                  {tipAmount} gems
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-pr-text-2">Creator receives</p>
                <p className="text-sm font-medium text-pr-text-1">${(tipAmount * 0.01).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-pr-surface-3 py-2 px-4 font-medium text-pr-text-1 transition-colors hover:bg-pr-surface-2"
            >
              Cancel
            </button>
            <button
              onClick={handleTip}
              disabled={loading || tipAmount < 1}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 px-4 font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="h-4 w-4" />
                  <span>Send Tip</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
