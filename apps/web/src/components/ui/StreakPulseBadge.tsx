import * as React from "react";
import { Flame, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakPulseBadgeProps {
  streakCount: number;
  multiplier?: string;
  isFrozen?: boolean;
  className?: string;
  onClick?: () => void;
}

export function StreakPulseBadge({
  streakCount,
  multiplier = "1.5x",
  isFrozen = false,
  className,
  onClick,
}: StreakPulseBadgeProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-2xl px-3.5 py-1.5 transition-all select-none",
        "bg-gradient-to-b from-[#241710] to-[#120B07] border border-orange-500/40 shadow-[0_3px_0_0_#431407,0_4px_12px_rgba(255,85,0,0.2)]",
        "active:translate-y-[2px] active:shadow-[0_1px_0_0_#431407] hover:border-orange-400 hover:shadow-[0_3px_0_0_#431407,0_0_16px_rgba(255,85,0,0.4)]",
        isFrozen && "border-blue-500/40 from-[#0C1924] to-[#060D13] shadow-[0_3px_0_0_#082F49,0_4px_12px_rgba(14,165,233,0.2)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Animated Flame Icon Container */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "absolute -inset-1 rounded-full opacity-60 blur-sm animate-pulse transition-colors",
            isFrozen ? "bg-cyan-400" : "bg-orange-500"
          )}
        />
        {isFrozen ? (
          <ShieldAlert className="relative z-10 size-4 text-cyan-300 transition-transform group-hover:scale-110" />
        ) : (
          <Flame className="relative z-10 size-4 text-orange-400 fill-orange-400 animate-[bounce_2s_infinite] transition-transform group-hover:scale-125" />
        )}
      </div>

      {/* Streak Counter Value */}
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-sm font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {streakCount}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/90">
          DAY{streakCount !== 1 ? "S" : ""}
        </span>
      </div>

      {/* Multiplier Tag Pill */}
      {multiplier && (
        <span className="ml-1 inline-flex items-center gap-0.5 rounded-md bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-orange-300 border border-orange-500/30">
          <Sparkles className="size-2.5 text-orange-300" />
          {multiplier}
        </span>
      )}
    </div>
  );
}
