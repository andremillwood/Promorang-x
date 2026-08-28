import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { hapticAudio } from "@/lib/hapticAudio";

const tactileButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2.5 select-none font-bold uppercase tracking-wider text-xs sm:text-sm transition-all duration-75 active:translate-y-[4px] disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        // Promorang Orange primary extruded button
        primary:
          "bg-gradient-to-b from-[#FF6B1A] to-[#FF4500] text-white border-t border-white/20 shadow-[0_4px_0_0_#A32D00,0_8px_16px_rgba(255,69,0,0.35)] active:shadow-[0_0px_0_0_#A32D00,0_2px_8px_rgba(255,69,0,0.2)] hover:brightness-110",
        
        // Vault Gold / Gem reward button
        vault:
          "bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-black font-extrabold border-t border-white/40 shadow-[0_4px_0_0_#854D0E,0_8px_16px_rgba(245,158,11,0.35)] active:shadow-[0_0px_0_0_#854D0E,0_2px_8px_rgba(245,158,11,0.2)] hover:brightness-110",

        // Obsidian Glass / Stealth Dark button
        obsidian:
          "bg-gradient-to-b from-[#2A2A30] to-[#17171A] text-white border border-white/10 shadow-[0_4px_0_0_#09090B,0_6px_12px_rgba(0,0,0,0.5)] active:shadow-[0_0px_0_0_#09090B,0_2px_4px_rgba(0,0,0,0.3)] hover:border-white/20 hover:text-orange-400",

        // Success / Check-In button
        success:
          "bg-gradient-to-b from-[#10B981] to-[#059669] text-white border-t border-white/25 shadow-[0_4px_0_0_#065F46,0_8px_16px_rgba(16,185,129,0.35)] active:shadow-[0_0px_0_0_#065F46,0_2px_8px_rgba(16,185,129,0.2)] hover:brightness-110",

        // Cyber / Laser Cyan button
        cyber:
          "bg-gradient-to-b from-[#06B6D4] to-[#0891B2] text-white border-t border-white/30 shadow-[0_4px_0_0_#155E75,0_8px_16px_rgba(6,182,212,0.35)] active:shadow-[0_0px_0_0_#155E75,0_2px_8px_rgba(6,182,212,0.2)] hover:brightness-110",

        // Outline Tactile
        outline:
          "bg-black/40 backdrop-blur-md text-white border-2 border-orange-500/80 shadow-[0_4px_0_0_rgba(255,85,0,0.5),0_6px_14px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_0_transparent] hover:bg-orange-500/10 hover:border-orange-400",
      },
      size: {
        sm: "h-9 px-4 rounded-xl text-xs",
        default: "h-11 px-6 rounded-2xl text-sm",
        lg: "h-13 px-8 rounded-2xl text-base tracking-widest",
        xl: "h-15 px-10 rounded-2xl text-lg font-black tracking-widest",
        icon: "h-11 w-11 rounded-2xl p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface TactileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tactileButtonVariants> {
  asChild?: boolean;
  glow?: boolean;
}

export const TactileButton = React.forwardRef<HTMLButtonElement, TactileButtonProps>(
  ({ className, variant, size, fullWidth, glow = true, asChild = false, onPointerDown, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      hapticAudio.playClick();
      onPointerDown?.(e);
    };

    return (
      <Comp
        ref={ref}
        onPointerDown={handlePointerDown}
        className={cn(
          tactileButtonVariants({ variant, size, fullWidth, className }),
          glow && variant === "primary" && "hover:shadow-[0_4px_0_0_#A32D00,0_0_24px_rgba(255,85,0,0.6)]",
          glow && variant === "vault" && "hover:shadow-[0_4px_0_0_#854D0E,0_0_24px_rgba(251,191,36,0.6)]"
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {children}
          </span>
        )}
      </Comp>
    );
  }
);

TactileButton.displayName = "TactileButton";
