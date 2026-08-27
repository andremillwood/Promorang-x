import * as React from "react";
import { Flame, Radio, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TactileButton } from "./TactileButton";

export type SceneEnergyLevel = "chill" | "trending" | "peak";

interface LivingSceneAuraCardProps {
  title: string;
  location: string;
  imageUrl: string;
  checkInCount: number;
  energyLevel?: SceneEnergyLevel;
  perkText?: string;
  onJoin?: () => void;
  className?: string;
}

export function LivingSceneAuraCard({
  title,
  location,
  imageUrl,
  checkInCount,
  energyLevel = "trending",
  perkText = "3x Boost Active",
  onJoin,
  className,
}: LivingSceneAuraCardProps) {
  const getEnergyStyles = () => {
    switch (energyLevel) {
      case "peak":
        return {
          badge: "bg-purple-600/30 text-purple-300 border-purple-500/50 animate-pulse",
          glow: "border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.35)]",
          label: "PEAK ENERGY",
          icon: <Radio className="size-3.5 text-purple-300 animate-ping" />,
        };
      case "trending":
        return {
          badge: "bg-orange-600/30 text-orange-300 border-orange-500/50",
          glow: "border-orange-500/40 shadow-[0_0_30px_rgba(255,85,0,0.35)]",
          label: "TRENDING NOW",
          icon: <Flame className="size-3.5 text-orange-400 fill-orange-400 animate-bounce" />,
        };
      case "chill":
      default:
        return {
          badge: "bg-amber-600/20 text-amber-300 border-amber-500/30",
          glow: "border-white/10 shadow-lg",
          label: "GATHERING",
          icon: <Users className="size-3.5 text-amber-300" />,
        };
    }
  };

  const currentEnergy = getEnergyStyles();

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-[#141316] transition-all duration-300 hover:scale-[1.01]",
        currentEnergy.glow,
        className
      )}
    >
      {/* Background Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
        <img
          src={imageUrl}
          alt={title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#141316] via-black/40 to-transparent" />

        {/* Live Energy Badge */}
        <div
          className={cn(
            "absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border",
            currentEnergy.badge
          )}
        >
          {currentEnergy.icon}
          <span>{currentEnergy.label}</span>
        </div>

        {/* Perk Tag */}
        {perkText && (
          <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-extrabold text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <Sparkles className="size-2.5" />
            <span>{perkText}</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400/90">
            {location}
          </span>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white line-clamp-1">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
            <Users className="size-3.5 text-white/40" />
            <span>{checkInCount} people checked in</span>
          </div>
        </div>

        {/* Action Button */}
        {onJoin && (
          <TactileButton variant="primary" size="default" fullWidth onClick={onJoin}>
            Check In & Unlock
          </TactileButton>
        )}
      </div>
    </div>
  );
}
