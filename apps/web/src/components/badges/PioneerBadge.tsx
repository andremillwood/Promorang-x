import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PioneerBadgeProps {
  className?: string;
  showText?: boolean;
}

export function PioneerBadge({ className, showText = true }: PioneerBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-600 shadow-sm animate-in fade-in zoom-in duration-500",
      className
    )}>
      <Sparkles className="w-3 h-3 animate-pulse" />
      {showText && <span className="text-[10px] font-black uppercase tracking-widest">Pioneer</span>}
    </div>
  );
}
