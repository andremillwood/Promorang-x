import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Gem, Sparkles, X, Fingerprint } from "lucide-react";
import { TactileButton } from "./TactileButton";
import { cn } from "@/lib/utils";
import { hapticAudio } from "@/lib/hapticAudio";

interface VaultCrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  gemsReward: number;
  onSuccessClaim?: () => void;
}

export function VaultCrackingModal({
  isOpen,
  onClose,
  title = "Encrypted Scene Vault",
  subtitle = "Hold the biometric trigger to crack the vault and release your Gems.",
  gemsReward,
  onSuccessClaim,
}: VaultCrackingModalProps) {
  const [holdProgress, setHoldProgress] = React.useState(0);
  const [isCracked, setIsCracked] = React.useState(false);
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Reset state on open/close
  React.useEffect(() => {
    if (!isOpen) {
      setHoldProgress(0);
      setIsCracked(false);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    }
  }, [isOpen]);

  const startHold = () => {
    if (isCracked) return;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    const stepMs = 20;
    const totalMs = 700;
    const increment = (stepMs / totalMs) * 100;

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev + increment >= 100) {
          clearInterval(holdIntervalRef.current!);
          setIsCracked(true);
          hapticAudio.playGemReward();
          onSuccessClaim?.();
          return 100;
        }
        return prev + increment;
      });
    }, stepMs);
  };

  const endHold = () => {
    if (isCracked) return;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  };

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
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.85, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-orange-500/40 bg-gradient-to-b from-[#181513] to-[#0A0908] p-6 text-center shadow-[0_0_60px_rgba(255,85,0,0.35)]"
          >
            {/* Close icon */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Header copy */}
            <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>
            <p className="mt-1 text-xs text-white/60 px-4">{subtitle}</p>

            {/* Visual Vault Core */}
            <div className="relative my-8 flex items-center justify-center">
              {!isCracked ? (
                /* Locked Vault Interactive State */
                <div
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  className={cn(
                    "relative flex size-36 cursor-pointer select-none items-center justify-center rounded-3xl border-2 transition-all duration-150 touch-manipulation",
                    holdProgress > 0
                      ? "border-orange-500 bg-orange-500/10 scale-95 shadow-[0_0_30px_rgba(255,85,0,0.5)]"
                      : "border-white/15 bg-white/5 hover:border-orange-500/50 hover:bg-white/10 shadow-lg"
                  )}
                >
                  {/* Circular Progress Ring */}
                  <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-white/10"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-orange-500 transition-all duration-75"
                      strokeWidth="6"
                      strokeDasharray={402}
                      strokeDashoffset={402 - (402 * holdProgress) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Biometric trigger center */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    {holdProgress > 0 ? (
                      <Fingerprint className="size-10 text-orange-400 animate-pulse" />
                    ) : (
                      <Lock className="size-9 text-white/70" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                      {holdProgress > 0 ? "HOLDING..." : "PRESS & HOLD"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Cracked Vault Celebratory Burst */
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative flex size-32 items-center justify-center rounded-3xl bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_6px_0_0_#9a3412,0_0_40px_rgba(245,158,11,0.6)]">
                    <Gem className="size-16 text-white fill-white/30 animate-pulse" />
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-2xl font-black text-amber-400 font-mono">
                    +{gemsReward} GEMS
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom action button */}
            {isCracked ? (
              <TactileButton variant="vault" size="lg" fullWidth onClick={onClose}>
                Claim & Close
              </TactileButton>
            ) : (
              <div className="text-[11px] font-medium text-white/40">
                Hold for 0.7s to unlock secure reserve
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
