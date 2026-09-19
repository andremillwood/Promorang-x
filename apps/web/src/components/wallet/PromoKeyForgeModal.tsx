import React from "react";
import { KeyRound, X } from "lucide-react";

interface PromoKeyForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  currentPromoKeys: number;
  userTier?: string;
  onForgeSuccess?: (newPoints: number, newPromoKeys: number) => void;
}

/**
 * Legacy compatibility component.
 *
 * Point → PromoKey conversion is owned by the Wallet's authenticated
 * /economy/convert/points-to-promokeys flow. This component must never mint,
 * settle, or locally alter balances if an older import is re-mounted.
 */
export const PromoKeyForgeModal: React.FC<PromoKeyForgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gray-950 p-7 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <KeyRound className="h-7 w-7 text-amber-400" />
        <h2 className="mt-4 text-xl font-black">Use the Wallet conversion.</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Use Wallet to convert PromoKeys. This older control can’t change your Points or PromoKey balance.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-black hover:bg-amber-400"
        >
          Return to Wallet
        </button>
      </div>
    </div>
  );
};

export default PromoKeyForgeModal;
