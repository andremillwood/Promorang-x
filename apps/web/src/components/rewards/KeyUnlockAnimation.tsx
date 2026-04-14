import { Key, Lock, Unlock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: () => void;
}

export function KeyUnlockAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<"insert" | "turn" | "unlock" | "done">("insert");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("turn"), 1000),
      setTimeout(() => setPhase("unlock"), 2000),
      setTimeout(() => onComplete(), 3500)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8 min-h-[400px]">
      <div className="relative w-32 h-32">
        {/* The Lock */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-700",
          phase === "unlock" || phase === "done" ? "scale-110 opacity-0" : "scale-100 opacity-100"
        )}>
          <Lock className="w-24 h-24 text-white/20 stroke-[1]" />
        </div>

        {/* The Unlock Icon */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-700",
          phase === "unlock" || phase === "done" ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}>
          <Unlock className="w-24 h-24 text-primary stroke-[1.5] animate-pulse" />
        </div>

        {/* The Key */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-500",
          phase === "insert" ? "translate-y-12 opacity-0" : "translate-y-0 opacity-100",
          phase === "turn" ? "rotate-90 scale-110" : "rotate-0",
          phase === "unlock" || phase === "done" ? "scale-150 opacity-0" : ""
        )}>
          <Key className="w-16 h-16 text-primary fill-primary shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
        </div>
        
        {/* Particle Effects */}
        {phase === "unlock" && (
            <div className="absolute inset-x-0 top-0 flex justify-center">
                <Sparkles className="w-12 h-12 text-primary animate-ping" />
            </div>
        )}
      </div>

      <div className="text-center space-y-2 relative z-10">
        <h3 className="font-serif text-2xl font-black italic tracking-tight text-white animate-pulse">
          {phase === "insert" && "Inserting PromoKey..."}
          {phase === "turn" && "Verifying Proof..."}
          {phase === "unlock" && "Vault Unlocked!"}
        </h3>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
          Electronic Behavioral Settlement
        </p>
      </div>
      
      {/* Background Glow */}
      <div className={cn(
          "absolute inset-0 bg-primary/20 blur-[100px] rounded-full transition-opacity duration-1000",
          phase === "unlock" ? "opacity-100" : "opacity-0"
      )} />
    </div>
  );
}
