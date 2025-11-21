import { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign } from 'lucide-react';
import type { ContentPieceType, WalletType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface BuySharesModalProps {
  content: ContentPieceType;
  wallet: WalletType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (content: ContentPieceType, sharesCount: number) => Promise<void>;
}

export default function BuySharesModal({ content, wallet, isOpen, onClose, onPurchase }: BuySharesModalProps) {
  const [sharesCount, setSharesCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const pricePerShare = content.share_price ?? 0;
  const availableShares = content.available_shares;
  const walletBalance = wallet?.balance ?? 0;

  const availableMax = typeof availableShares === 'number' && availableShares >= 0 ? availableShares : Number.POSITIVE_INFINITY;
  const walletMax = pricePerShare > 0 ? Math.floor(walletBalance / pricePerShare) : Number.POSITIVE_INFINITY;
  const rawMax = Math.min(availableMax, walletMax);
  const hasFiniteMax = Number.isFinite(rawMax) && rawMax > 0;
  const maxShares = hasFiniteMax ? Math.max(1, Math.floor(rawMax)) : null;

  const clampShares = (value: number) => {
    if (maxShares !== null) {
      return Math.max(1, Math.min(maxShares, value));
    }
    return Math.max(1, value);
  };

  useEffect(() => {
    setSharesCount((current) => clampShares(current));
  }, [isOpen, maxShares]);

  const totalCost = sharesCount * pricePerShare;
  const hasAvailableShares = availableShares === undefined || availableShares > 0;
  const canPurchase = pricePerShare > 0 && hasAvailableShares && (maxShares === null || maxShares > 0);
  const canAfford = canPurchase && walletBalance >= totalCost;
  const disableDecrease = sharesCount <= 1;
  const disableIncrease = maxShares !== null && sharesCount >= maxShares;

  const handlePurchase = async () => {
    if (!canPurchase || !canAfford || sharesCount < 1) return;
    
    setLoading(true);
    try {
      await onPurchase(content, sharesCount);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
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
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-pr-surface-3 px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-pr-text-1">Buy Content Shares</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close buy shares modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-2">
          <div className="rounded-lg bg-pr-surface-2 p-4">
            <h3 className="mb-2 font-semibold text-pr-text-1">{content.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-pr-text-2">Platform:</span>
              <span className="font-medium capitalize">{content.platform}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-pr-text-2">Price per share:</span>
              <span className="font-bold text-green-600">{pricePerShare > 0 ? `$${pricePerShare.toFixed(2)}` : 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-pr-text-2">Available:</span>
              <span className="font-medium">{typeof availableShares === 'number' ? `${availableShares} shares` : 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-pr-text-1">Number of shares</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSharesCount(clampShares(sharesCount - 1))}
                disabled={disableDecrease}
                className="h-8 w-8 rounded bg-pr-surface-3 font-bold text-pr-text-1 transition-colors hover:bg-pr-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                value={sharesCount}
                onChange={(e) => setSharesCount(clampShares(parseInt(e.target.value, 10) || 1))}
                min="1"
                max={maxShares ?? undefined}
                className="flex-1 rounded-lg border border-pr-surface-3 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setSharesCount(clampShares(sharesCount + 1))}
                disabled={disableIncrease}
                className="h-8 w-8 rounded bg-pr-surface-3 font-bold text-pr-text-1 transition-colors hover:bg-pr-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-xs text-pr-text-2">
              {maxShares !== null ? `Max: ${maxShares} shares` : 'Limited by your available balance'}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Your Balance:</span>
              </div>
              <span className="font-bold text-blue-900">${(wallet?.balance || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-pr-text-1">Total Cost:</span>
              </div>
              <span className="font-bold text-pr-text-1">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {!canPurchase && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-700">This content is currently unavailable for purchase.</p>
            </div>
          )}

          {canPurchase && !canAfford && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">Insufficient balance to purchase {sharesCount} shares</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-pr-surface-3 px-4 py-2 font-medium text-pr-text-1 transition-colors hover:bg-pr-surface-2"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!canPurchase || !canAfford || loading || sharesCount < 1}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Buy ${sharesCount} Share${sharesCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
