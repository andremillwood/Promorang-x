import { useEffect, useState } from 'react';
import type { ContentHolding } from '../../shared/types';
import { createShareListing } from '@/react-app/services/sharesService';
import ModalBase from '@/react-app/components/ModalBase';

interface ListShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: ContentHolding | null;
  onSuccess?: () => void;
}

export default function ListShareModal({ isOpen, onClose, holding, onSuccess }: ListShareModalProps) {
  const initialQuantity = holding ? Math.min(holding.available_to_sell ?? 0, holding.owned_shares ?? 0) : 0;
  const initialPrice = holding?.current_price ?? 0;

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [price, setPrice] = useState<number>(initialPrice);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (holding && isOpen) {
      setQuantity(Math.min(holding.available_to_sell ?? 0, holding.owned_shares ?? 0));
      setPrice(holding.current_price ?? 0);
      setError(null);
    }
  }, [holding, isOpen]);

  if (!isOpen || !holding) {
    return null;
  }

  const resetState = () => {
    if (!holding) return;
    setQuantity(Math.min(holding.available_to_sell ?? 0, holding.owned_shares ?? 0));
    setPrice(holding.current_price ?? 0);
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
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card shadow-xl">
        <div className="flex items-center justify-between border-b border-pr-surface-3 px-6 py-6">
          <div>
            <h2 className="text-xl font-semibold text-pr-text-1">List Shares for Resale</h2>
            <p className="text-sm text-pr-text-2">{holding.content_title}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close list shares modal"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pr-text-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={holding.available_to_sell}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-pr-text-2">
                Available: {holding.available_to_sell} shares
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-pr-text-1">Ask Price (per share)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-pr-surface-3 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-pr-text-2">
                Market price {holding.current_price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-pr-surface-2 rounded-lg p-4 text-sm text-pr-text-2">
            <div className="flex justify-between">
              <span>Estimated proceeds</span>
              <span className="font-medium text-pr-text-1">${(quantity * price).toFixed(2)}</span>
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
              className="px-4 py-2 text-sm font-medium text-pr-text-2 hover:text-pr-text-1"
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
    </ModalBase>
  );
}
