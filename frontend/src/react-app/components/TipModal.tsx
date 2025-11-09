import { useState } from 'react';
import type { ContentPieceType } from '../../shared/types';
import { X, Gift, Coins } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(content.creator_name || content.creator_username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tip Creator</h2>
              <p className="text-sm text-gray-600">Support {content.creator_name || content.creator_username || 'this creator'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Select Tip Amount</h3>
            <p className="text-sm text-gray-600 mb-4">Choose how many gems you'd like to tip</p>

            {/* Quick Select Options */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {tipOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipAmount === amount
                      ? 'bg-purple-500 text-white ring-2 ring-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Coins className="w-4 h-4" />
                    <span>{amount}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Custom amount"
                />
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Coins className="w-4 h-4" />
                <span className="text-sm">gems</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">You're tipping</p>
                <p className="text-lg font-semibold text-gray-900">
                  <Coins className="w-5 h-5 inline mr-1 text-purple-500" />
                  {tipAmount} gems
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Creator receives</p>
                <p className="text-sm font-medium text-gray-900">${(tipAmount * 0.01).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTip}
              disabled={loading || tipAmount < 1}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Send Tip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
