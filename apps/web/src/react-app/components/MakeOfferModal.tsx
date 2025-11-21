import { useEffect, useState } from 'react';
import type { ContentHolding } from '../../shared/types';
import { createShareOffer } from '@/react-app/services/sharesService';
import ModalBase from '@/react-app/components/ModalBase';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: ContentHolding | null;
  onSuccess?: () => void;
  sellerId?: string;
}

export default function MakeOfferModal({ isOpen, onClose, holding, sellerId, onSuccess }: MakeOfferModalProps) {
  const [quantity, setQuantity] = useState<number>(() => (holding ? Math.max(1, Math.ceil(holding.owned_shares * 0.25)) : 1));
  const [bidPrice, setBidPrice] = useState<number>(() => holding?.current_price || 0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (holding && isOpen) {
      setQuantity(Math.min(Math.max(1, Math.ceil(holding.owned_shares * 0.25)), holding.owned_shares));
      setBidPrice(holding.current_price);
      setMessage('');
      setError(null);
    }
  }, [holding, isOpen]);

  if (!isOpen || !holding) {
    return null;
  }

  const resetState = () => {
    setQuantity(Math.min(Math.max(1, Math.ceil(holding.owned_shares * 0.25)), holding.owned_shares));
    setBidPrice(holding.current_price);
    setMessage('');
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!holding) return;
    if (quantity <= 0 || bidPrice <= 0) {
      setError('Enter a valid quantity and offer price.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createShareOffer({
        content_id: holding.content_id,
        seller_id: sellerId,
        quantity,
        bid_price: bidPrice,
        message,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-pr-text-1">Make an Offer</h2>
            <p className="text-sm text-pr-text-2">{holding.content_title}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close make offer modal"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pr-text-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-pr-text-2">Seller holds {holding.owned_shares} shares</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-pr-text-1">Offer Price (per share)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={bidPrice}
                onChange={(event) => setBidPrice(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-pr-text-2">Current price {holding.current_price.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pr-text-1">Message (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share context or terms for your offer"
              className="mt-2 w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="bg-pr-surface-2 rounded-lg p-4 text-sm text-pr-text-2">
            <div className="flex justify-between">
              <span>Total offer value</span>
              <span className="font-medium text-pr-text-1">${(quantity * bidPrice).toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-pr-text-2 hover:text-pr-text-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
