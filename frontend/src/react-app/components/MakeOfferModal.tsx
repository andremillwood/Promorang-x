import { useEffect, useState } from 'react';
import type { ContentHolding } from '../../shared/types';
import { createShareOffer } from '@/react-app/services/sharesService';

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Make an Offer</h2>
            <p className="text-sm text-gray-500">{holding.content_title}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Close make offer modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Seller holds {holding.owned_shares} shares</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer Price (per share)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={bidPrice}
                onChange={(event) => setBidPrice(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Current price {holding.current_price.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share context or terms for your offer"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total offer value</span>
              <span className="font-medium text-gray-900">${(quantity * bidPrice).toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
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
    </div>
  );
}
