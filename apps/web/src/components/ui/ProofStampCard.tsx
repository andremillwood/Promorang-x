import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Gem, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofStampCardProps {
  mediaUrl?: string;
  momentTitle: string;
  sceneName: string;
  verifiedAt?: string;
  gemsEarned?: number;
  isVerified?: boolean;
  className?: string;
}

export function ProofStampCard({
  mediaUrl,
  momentTitle,
  sceneName,
  verifiedAt = "Verified Just Now",
  gemsEarned = 50,
  isVerified = true,
  className,
}: ProofStampCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-[#141417] shadow-xl transition-all duration-300 hover:border-orange-500/40",
        className
      )}
    >
      {/* Media / Background Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={momentTitle}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#231A14] to-[#0D0B0A]">
            <Sparkles className="size-10 text-orange-500/30 animate-pulse" />
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-black/20 to-transparent" />

        {/* Wax Stamp Seal (Burned into proof) */}
        {isVerified && (
          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            className="absolute top-4 right-4 z-20 flex size-20 items-center justify-center rounded-full border-2 border-amber-400/90 bg-gradient-to-br from-[#B45309]/90 to-[#78350F]/90 shadow-[0_0_25px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-md"
          >
            <div className="flex flex-col items-center justify-center text-center p-1 border border-dashed border-amber-300/60 rounded-full size-[70px]">
              <ShieldCheck className="size-5 text-amber-200" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-100">
                PROVEN
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
            {sceneName}
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-white/50">
            <Clock className="size-3" />
            <span>{verifiedAt}</span>
          </div>
        </div>

        <h4 className="mt-1 text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
          {momentTitle}
        </h4>

        {/* Reward Pill / Value Securing */}
        {gemsEarned > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-black/40 border border-white/5 px-3 py-2">
            <span className="text-xs font-semibold text-white/70">Vault Yield</span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-400">
              <Gem className="size-3.5 fill-amber-400" />
              <span>+{gemsEarned} Gems</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
