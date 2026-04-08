import { X, AlertTriangle } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface WithdrawalModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WithdrawalModal({ user, isOpen, onClose }: WithdrawalModalProps) {
  if (!isOpen || !user) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <h2 className="text-xl font-bold text-pr-text-1">Withdraw Verified Credits</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close withdrawal modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Service Disabled Message */}
        <div className="py-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-pr-text-1 mb-3">Withdrawals Frozen</h3>
          <p className="max-w-md mx-auto text-pr-text-2 mb-8">
            As part of our transition to a **Brand-Funded Activation** model, all direct platform withdrawals have been frozen.
          </p>

          <div className="bg-pr-surface-2 rounded-xl p-6 max-w-lg mx-auto border border-pr-surface-3 mb-8">
            <h4 className="font-semibold text-pr-text-1 mb-3 text-left">Why is this happening?</h4>
            <ul className="text-sm text-pr-text-2 text-left space-y-3">
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                <span>Promorang is moving away from the "consumer rewards" model toward execution-verified activation.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                <span>Existing Gem balances are being audited. We are working on a transition path for verified earned balances.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                <span>Future rewards will be campaign-specific and funded in escrow by brands.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={onClose}
              className="w-full px-8 py-3 rounded-lg bg-pr-text-1 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
            <a
              href="mailto:support@promorang.co"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Contact Support for Balance Inquiries
            </a>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
