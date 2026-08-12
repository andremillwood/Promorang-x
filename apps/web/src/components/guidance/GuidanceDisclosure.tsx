import { ReactNode, useEffect, useState } from "react";
import { ChevronDown, HelpCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGuidanceProgress } from "@/hooks/useGuidanceProgress";
import { cn } from "@/lib/utils";

type GuidanceDisclosureProps = {
  id: string;
  eyebrow?: string;
  title: string;
  summary: string;
  children: ReactNode;
  className?: string;
  compactClassName?: string;
  tone?: "dark" | "light";
};

export function GuidanceDisclosure({
  id,
  eyebrow = "Guide",
  title,
  summary,
  children,
  className,
  compactClassName,
  tone = "dark",
}: GuidanceDisclosureProps) {
  const { density, loading, shouldStartOpen, markCollapsed, markOpened } = useGuidanceProgress(id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading) setOpen(shouldStartOpen);
  }, [loading, shouldStartOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (loading) return;
    if (nextOpen) markOpened();
    else markCollapsed();
  };
  const isLight = tone === "light";

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange} className={cn("mt-6", className)}>
      <div
        className={cn(
          "rounded-2xl border transition-colors",
          isLight ? "border-border bg-muted/35" : "border-primary/20 bg-primary/10",
          open ? "p-4" : isLight ? "bg-background/55 px-4 py-3" : "bg-white/[0.035] px-4 py-3",
          compactClassName,
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary", isLight ? "bg-primary/10" : "bg-primary/15")}>
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <h3 className={cn("mt-1 text-sm font-black leading-5", isLight ? "text-foreground" : "text-white")}>{title}</h3>
            {!open && density !== "minimal" ? (
              <p className={cn("mt-1 text-xs leading-5", isLight ? "text-muted-foreground" : "text-white/50")}>{summary}</p>
            ) : null}
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant={density === "minimal" ? "outline" : "ghost"}
              size={density === "minimal" ? "sm" : "icon"}
              className={cn(
                "h-9 shrink-0",
                isLight ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "text-white/55 hover:bg-white/10 hover:text-white",
                density === "minimal"
                  ? cn("w-auto bg-transparent px-3 text-xs font-bold", isLight ? "border-border" : "border-white/15")
                  : "w-9",
              )}
              aria-label={open ? "Collapse guide" : "Open guide"}
            >
              {open ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {density === "minimal" ? <span>{open ? "Hide" : "Guide"}</span> : null}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className={cn("mt-4 border-t pt-4", isLight ? "border-border" : "border-white/10")}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
