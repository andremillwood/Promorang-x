import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Sparkles, X } from "lucide-react";
import { TactileButton } from "./TactileButton";

interface RewardCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  gemsEarned: number;
  bonusMultiplier?: string;
}

export function RewardCelebration({
  isOpen,
  onClose,
  title = "Vault Unlocked!",
  subtitle = "You earned culture rewards for checking into this scene moment.",
  gemsEarned,
  bonusMultiplier = "2x Combo",
}: RewardCelebrationProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with 1-tap dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Celebration Modal Content */}
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#1E140F] to-[#0D0B0A] p-6 text-center shadow-[0_0_50px_rgba(255,85,0,0.35)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Glowing Gem Burst Animation */}
            <div className="relative mx-auto my-6 flex size-28 items-center justify-center">
              {/* Spinning background rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,#ff5500_360deg)] opacity-40 blur-md"
              />

              <div className="relative z-10 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_8px_0_0_#9a3412,0_0_30px_rgba(245,158,11,0.6)]">
                <Gem className="size-12 text-white fill-white/30 animate-pulse" />
              </div>
            </div>

            {/* Multiplier Badge */}
            {bonusMultiplier && (
              <div className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-400 border border-orange-500/40 mb-3">
                <Sparkles className="size-3" />
                {bonusMultiplier}
              </div>
            )}

            {/* Title & Subtitle */}
            <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/70 max-w-xs mx-auto">{subtitle}</p>

            {/* Gem Reward Amount Display */}
            <div className="my-6 flex items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 py-4">
              <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                +{gemsEarned}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-amber-300/80">
                GEMS UNLOCKED
              </span>
            </div>

            {/* Tactile Action Button */}
            <TactileButton
              variant="vault"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              Collect Rewards
            </TactileButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
