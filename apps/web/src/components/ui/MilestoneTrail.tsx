import * as React from "react";
import { Check, Lock, Sparkles, Gift, Flame, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MilestoneNode {
  id: string;
  title: string;
  subtitle?: string;
  rewardText?: string;
  status: "locked" | "available" | "completed";
  type?: "standard" | "chest" | "boss";
}

interface MilestoneTrailProps {
  nodes: MilestoneNode[];
  onNodeClick?: (node: MilestoneNode) => void;
  className?: string;
}

export function MilestoneTrail({ nodes, onNodeClick, className }: MilestoneTrailProps) {
  return (
    <div className={cn("relative flex flex-col items-center gap-8 py-6 max-w-sm mx-auto", className)}>
      {nodes.map((node, index) => {
        const isLocked = node.status === "locked";
        const isAvailable = node.status === "available";
        const isCompleted = node.status === "completed";
        const isChest = node.type === "chest";

        // Slight playful horizontal zigzag offset (Duolingo-style path)
        const offsetClass =
          index % 3 === 1
            ? "translate-x-6 sm:translate-x-8"
            : index % 3 === 2
            ? "-translate-x-6 sm:-translate-x-8"
            : "translate-x-0";

        return (
          <div key={node.id} className={cn("relative flex flex-col items-center transition-transform", offsetClass)}>
            {/* Connecting Pipe/Line to next node */}
            {index < nodes.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "absolute top-14 h-10 w-2.5 rounded-full z-0 transition-colors",
                  isCompleted
                    ? "bg-gradient-to-b from-orange-500 to-amber-500 shadow-[0_0_10px_rgba(255,85,0,0.4)]"
                    : "bg-white/10"
                )}
              />
            )}

            {/* Node Button Orb */}
            <button
              type="button"
              disabled={isLocked}
              onClick={() => onNodeClick?.(node)}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-3xl transition-all duration-100 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isChest ? "size-18" : "size-16",
                // Active / Available state
                isAvailable &&
                  "bg-gradient-to-b from-[#FF6B1A] to-[#FF4500] text-white shadow-[0_5px_0_0_#A32D00,0_8px_20px_rgba(255,69,0,0.5)] active:translate-y-[4px] active:shadow-[0_1px_0_0_#A32D00] hover:scale-105 cursor-pointer",
                // Completed state
                isCompleted &&
                  "bg-gradient-to-b from-[#10B981] to-[#059669] text-white shadow-[0_5px_0_0_#065F46,0_6px_14px_rgba(16,185,129,0.3)] active:translate-y-[4px] active:shadow-[0_1px_0_0_#065F46] cursor-pointer hover:scale-105",
                // Locked state
                isLocked &&
                  "bg-[#1A1A1E] text-white/30 border border-white/5 shadow-[0_4px_0_0_#0E0E10] cursor-not-allowed opacity-75"
              )}
            >
              {/* Pulsing Beacon for current available node */}
              {isAvailable && (
                <span className="absolute -inset-1.5 rounded-3xl bg-orange-500/40 animate-ping pointer-events-none -z-10" />
              )}

              {/* Node Icon Graphics */}
              {isCompleted ? (
                <Check className="size-7 stroke-[3] text-white drop-shadow-md" />
              ) : isLocked ? (
                <Lock className="size-6 text-white/40" />
              ) : isChest ? (
                <Gift className="size-7 text-amber-200 fill-amber-300/30 animate-bounce" />
              ) : (
                <Gem className="size-7 text-white fill-white/20 animate-pulse" />
              )}
            </button>

            {/* Node Tooltip / Label */}
            <div className="mt-2.5 flex flex-col items-center text-center">
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  isAvailable ? "text-orange-400" : isCompleted ? "text-emerald-400" : "text-white/50"
                )}
              >
                {node.title}
              </span>

              {node.rewardText && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Sparkles className="size-2.5" />
                  {node.rewardText}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
