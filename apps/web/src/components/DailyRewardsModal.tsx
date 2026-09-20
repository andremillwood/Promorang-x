import React from "react";
import { Calendar, X } from "lucide-react";

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: (day: number, reward: string) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-900 p-6 text-center text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <Calendar className="h-6 w-6" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Streak state</p>
        <h2 className="mt-2 text-2xl font-black">No recorded daily reward schedule is active.</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Daily check-ins and streak rewards are shown only when a server-backed schedule, eligibility record and issuance ledger exist. This screen does not claim Gems, Points, Pieces or mystery rewards locally.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.10]"
        >
          Close
        </button>
      </div>
    </div>
  );
};
