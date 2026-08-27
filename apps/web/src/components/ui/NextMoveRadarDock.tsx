import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Zap, Camera, Sparkles, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { TactileButton } from "./TactileButton";

export type NextMoveType = "check_in_nearby" | "claim_boost" | "submit_proof" | "explore";

export interface NextMoveData {
  id: string;
  type: NextMoveType;
  title: string;
  subtitle: string;
  rewardPill?: string;
  actionLabel: string;
  onAction: () => void;
}

interface NextMoveRadarDockProps {
  currentMove?: NextMoveData | null;
  className?: string;
}

export function NextMoveRadarDock({ currentMove, className }: NextMoveRadarDockProps) {
  if (!currentMove) return null;

  const getIcon = () => {
    switch (currentMove.type) {
      case "check_in_nearby":
        return <MapPin className="size-4 text-orange-400 fill-orange-400/20 animate-bounce" />;
      case "claim_boost":
        return <Flame className="size-4 text-amber-400 fill-amber-400/30 animate-pulse" />;
      case "submit_proof":
        return <Camera className="size-4 text-cyan-400 animate-pulse" />;
      case "explore":
      default:
        return <Zap className="size-4 text-orange-400" />;
    }
  };

  const getVariant = () => {
    switch (currentMove.type) {
      case "claim_boost":
        return "vault";
      case "submit_proof":
        return "cyber";
      case "check_in_nearby":
      default:
        return "primary";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl pointer-events-auto",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMove.id}
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-orange-500/30 bg-[#141211]/90 p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(255,85,0,0.2)] backdrop-blur-xl"
        >
          {/* Subtle Radar Sweep Scanline */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-[shimmer_3s_infinite]" />

          {/* Left Context & Icon */}
          <div className="flex items-center gap-3 min-w-0 pl-1">
            {/* Beacon Orb */}
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
              <span className="absolute -inset-1 rounded-xl bg-orange-500/20 animate-ping pointer-events-none" />
              {getIcon()}
            </div>

            {/* Text details */}
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs sm:text-sm font-black tracking-tight text-white">
                  {currentMove.title}
                </span>
                {currentMove.rewardPill && (
                  <span className="hidden xs:inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/30">
                    <Sparkles className="size-2.5" />
                    {currentMove.rewardPill}
                  </span>
                )}
              </div>
              <span className="truncate text-[11px] font-medium text-white/60">
                {currentMove.subtitle}
              </span>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <TactileButton
              variant={getVariant()}
              size="sm"
              onClick={currentMove.onAction}
              className="gap-1.5 px-3.5"
            >
              <span>{currentMove.actionLabel}</span>
              <ArrowRight className="size-3.5" />
            </TactileButton>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
