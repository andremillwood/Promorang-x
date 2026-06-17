import { CheckCircle2, Circle, CircleDot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChecklistStatus = "done" | "current" | "todo";

interface ChecklistItem {
  title: string;
  description: string;
  status: ChecklistStatus;
  href?: string;
  ctaLabel?: string;
  onClick?: () => void;
}

interface RoleActivationPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

const statusIcon = {
  done: CheckCircle2,
  current: CircleDot,
  todo: Circle,
} as const;

const statusTone = {
  done: "text-emerald-500",
  current: "text-primary",
  todo: "text-muted-foreground/60",
} as const;

export function RoleActivationPanel({
  eyebrow,
  title,
  description,
  items,
}: RoleActivationPanelProps) {
  const completed = items.filter((item) => item.status === "done").length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <section className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="min-w-[180px] rounded-2xl border border-border/50 bg-background/70 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Progress</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{progress}%</p>
          <p className="mt-1 text-xs text-muted-foreground">{completed} of {items.length} first wins complete</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        {items.map((item, index) => {
          const StatusIcon = statusIcon[item.status];

          return (
            <div key={item.title} className="min-w-0 rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/70",
                    statusTone[item.status]
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="break-words font-semibold text-foreground">{index + 1}. {item.title}</p>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      {item.status === "done" ? "Done" : item.status === "current" ? "Now" : "Next"}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{item.description}</p>
                  {item.href ? (
                    item.href.startsWith("/") ? (
                      <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto" asChild>
                        <a href={item.href}>
                          {item.ctaLabel || "Open"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto" asChild>
                        <a href={item.href}>
                          {item.ctaLabel || "Open"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )
                  ) : item.onClick ? (
                    <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto" onClick={item.onClick}>
                      {item.ctaLabel || "Open"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
