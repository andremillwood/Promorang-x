import { useEffect, useState } from 'react';
import { ContentHolding } from '@/shared/types';
import { createShareListing } from '@/react-app/services/sharesService';

interface ListShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: ContentHolding | null;
  onSuccess?: () => void;
}

export default function ListShareModal({ isOpen, onClose, holding, onSuccess }: ListShareModalProps) {
  const [quantity, setQuantity] = useState<number>(() => (holding ? Math.min(holding.available_to_sell, holding.owned_shares) : 0));
  const [price, setPrice] = useState<number>(() => holding?.current_price || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (holding && isOpen) {
      setQuantity(Math.min(holding.available_to_sell, holding.owned_shares));
      setPrice(holding.current_price);
      setError(null);
    }
  }, [holding, isOpen]);

  if (!isOpen || !holding) {
    return null;
  }

  const resetState = () => {
    setQuantity(Math.min(holding.available_to_sell, holding.owned_shares));
    setPrice(holding.current_price);
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
    if (quantity <= 0 || price <= 0) {
      setError('Enter a valid quantity and price.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createShareListing({
        content_id: holding.content_id,
        content_title: holding.content_title,
        content_thumbnail: holding.content_thumbnail,
        quantity,
        ask_price: price,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">List Shares for Resale</h2>
            <p className="text-sm text-gray-500">{holding.content_title}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close list shares modal"
          >
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
                max={holding.available_to_sell}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Available: {holding.available_to_sell} shares
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ask Price (per share)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Market price {holding.current_price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Estimated proceeds</span>
              <span className="font-medium text-gray-900">${(quantity * price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Transaction fee (2.5%)</span>
              <span>${(quantity * price * 0.025).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2 text-green-600 font-semibold">
              <span>Net payout</span>
              <span>${(quantity * price * 0.975).toFixed(2)}</span>
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
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-orange-700 disabled:opacity-60"
            >
              {submitting ? 'Listing…' : 'List Shares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
