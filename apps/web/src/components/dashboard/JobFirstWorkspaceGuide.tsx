import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";

type WorkspaceAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type JobFirstWorkspaceGuideProps = {
  role: string;
  context: string;
  purpose: string;
  outcome: string;
  nextIfWorks: string;
  proof?: string;
  primaryAction?: WorkspaceAction;
  className?: string;
};

export function JobFirstWorkspaceGuide({
  role,
  context,
  purpose,
  outcome,
  nextIfWorks,
  proof,
  primaryAction,
  className,
}: JobFirstWorkspaceGuideProps) {
  const progressQuery = useRoleSuccessProgress(role);
  const progress = progressQuery.data;
  const nextAction = primaryAction || progress?.nextAction;
  const proofText = proof || progress?.sourceLabel || "Verified activity will appear here once it exists.";

  const steps = [
    {
      label: "Why you are here",
      value: purpose,
    },
    {
      label: "What you are trying to accomplish",
      value: outcome,
    },
    {
      label: "What to do now",
      value: nextAction?.label || "Choose the next useful move from this workspace.",
    },
    {
      label: "What will prove it worked",
      value: proofText,
    },
    {
      label: "What happens next",
      value: nextIfWorks,
    },
  ];

  return (
    <section
      aria-label="Workspace job and next move"
      className={cn(
        "rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Job first
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{context}</span>
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {outcome}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{purpose}</p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          {progress && (
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-left lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {progress.successStage ? "Outcome progress" : "Verified activity"}
              </p>
              {progress.successStage ? (
                <>
                  <p className="mt-1 text-lg font-black text-foreground">
                    {progress.successStage.complete
                      ? "Outcome loop complete"
                      : `Stage ${progress.successStage.current} / ${progress.successStage.total}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{progress.successStage.label}</p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-lg font-black text-foreground">
                    {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{progress.unit}</p>
                </>
              )}
            </div>
          )}

          {nextAction?.href ? (
            <Button asChild className="rounded-xl font-black">
              <Link to={nextAction.href}>
                {nextAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : nextAction?.onClick ? (
            <Button onClick={nextAction.onClick} className="rounded-xl font-black">
              {nextAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.label} className="rounded-2xl border border-border/60 bg-background/45 p-4">
            <div className="flex items-center gap-2">
              {index === 3 ? (
                <ShieldCheck className="h-4 w-4 text-primary" />
              ) : index === 1 ? (
                <Target className="h-4 w-4 text-primary" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                  {index + 1}
                </span>
              )}
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{step.label}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground/85">{step.value}</p>
          </div>
        ))}
      </div>

      {progress?.milestones?.length ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {progress.milestones.map((milestone) => (
            <div
              key={milestone.label}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-1.5 text-xs text-muted-foreground"
            >
              {milestone.complete ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              <span className={milestone.complete ? "text-foreground" : undefined}>{milestone.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default JobFirstWorkspaceGuide;
