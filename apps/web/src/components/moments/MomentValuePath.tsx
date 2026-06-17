import type { LucideIcon } from "lucide-react";
import { Route, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export type MomentValuePathStep = {
  label: string;
  detail?: string;
  Icon?: LucideIcon;
};

type MomentValuePathProps = {
  steps: MomentValuePathStep[];
  variant?: "compact" | "detail";
  className?: string;
};

const defaultIcons = [Route, Target, Sparkles];

export function MomentValuePath({ steps, variant = "compact", className }: MomentValuePathProps) {
  const safeSteps = steps.slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-muted/30",
        variant === "detail" ? "p-4 sm:p-5" : "p-3",
        className
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
        {safeSteps.map((step, index) => {
          const Icon = step.Icon || defaultIcons[index] || Sparkles;
          const isLast = index === safeSteps.length - 1;

          return (
            <div key={`${step.label}-${index}`} className="contents">
              <div className="min-w-0 rounded-xl bg-background/55 p-2 text-center">
                <Icon
                  className={cn(
                    "mx-auto mb-1 text-primary",
                    variant === "detail" ? "h-5 w-5" : "h-3.5 w-3.5"
                  )}
                />
                <p className={cn("truncate font-bold text-foreground", variant === "detail" ? "text-sm" : "text-[11px]")}>
                  {step.label}
                </p>
                {step.detail && (
                  <p className={cn("mt-1 truncate text-muted-foreground", variant === "detail" ? "text-xs" : "text-[10px]")}>
                    {step.detail}
                  </p>
                )}
              </div>
              {!isLast && <span className="self-center justify-self-center h-px w-4 bg-border sm:w-6" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MomentValuePath;
