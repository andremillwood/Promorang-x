import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModalBase from '@/react-app/components/ModalBase';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  isSubmitting: boolean;
}

export function AddFundsModal({ isOpen, onClose, onSubmit, isSubmitting }: AddFundsModalProps) {
  const [amount, setAmount] = useState(1000);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSubmit(amount);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-pr-text-1">Add Funds to Campaign</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-2">
              Amount (USD)
            </label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || amount <= 0}
            >
              {isSubmitting ? 'Adding...' : 'Add Funds'}
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
