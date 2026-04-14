import { MapPin, Camera, Key, Trophy, ArrowRight, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EconomyPathGuide() {
  const steps = [
    { 
        icon: MapPin, 
        label: "Discover", 
        desc: "Find a local moment in your niche.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    { 
        icon: Zap, 
        label: "Action", 
        desc: "Check-in & generate verified proof.",
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    { 
        icon: Sparkles, 
        label: "Gain Points", 
        desc: "Verification fuels your standing.",
        color: "text-primary",
        bg: "bg-primary/10"
    },
    { 
        icon: Key, 
        label: "Mint Keys", 
        desc: "1,000 Pts converts to 1 PromoKey.",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    { 
        icon: Trophy, 
        label: "The Vault", 
        desc: "Unlock high-value brand rewards.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="bg-charcoal text-cream rounded-[2.5rem] p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 mb-10 text-center max-w-lg mx-auto">
          <h3 className="text-3xl font-serif font-black italic mb-2 tracking-tight">The Point-to-Key Path</h3>
          <p className="text-white/60 text-sm">Every action is a step toward exclusive access. Here is how your effort converts to value.</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center group">
            <div className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500 relative",
                step.bg,
                step.color
            )}>
                <step.icon className="w-8 h-8" />
                {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-[2px] bg-white/10 -translate-y-1/2 z-0">
                        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                    </div>
                )}
            </div>
            <h4 className="font-bold text-sm mb-1">{step.label}</h4>
            <p className="text-[10px] text-white/40 leading-relaxed max-w-[120px]">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-primary italic uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Verified Status Economy
          </div>
          <p className="text-[9px] text-white/40 max-w-xs text-center md:text-right">
              Points are non-monetary attribution units used to verify behavioral ROI for Brands & Venues. They fuel the scarcity of the Vault.
          </p>
      </div>
    </div>
  );
}
