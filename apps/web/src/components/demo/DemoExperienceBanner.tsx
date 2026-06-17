import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Mail,
  RotateCcw,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DemoRole, getDemoGuide } from "@/lib/demo-session";
import { useDemoExperience } from "@/contexts/DemoExperienceContext";

const roleIcons: Record<DemoRole, typeof Users> = {
  participant: Users,
  creator: Sparkles,
  host: Sparkles,
  brand: Building2,
  merchant: Store,
  agency: Briefcase,
};

interface DemoExperienceBannerProps {
  role?: DemoRole | null;
  variant?: "full" | "compact";
}

export function DemoExperienceBanner({ role, variant = "full" }: DemoExperienceBannerProps) {
  const {
    isActive,
    session,
    guide: activeGuide,
    currentStep,
    nextStep,
    progressPercent,
    isStepCompleted,
    resetProgress,
  } = useDemoExperience();

  const targetRole = role || session?.role || null;

  if (!isActive || !session || !targetRole) {
    return null;
  }

  const guide = targetRole === session.role ? activeGuide : getDemoGuide(targetRole);
  if (!guide) {
    return null;
  }

  const RoleIcon = roleIcons[targetRole];
  const compact = variant === "compact";
  const highlightedStep = currentStep ?? nextStep ?? guide.steps[0] ?? null;
  const continueTarget = nextStep ?? currentStep ?? guide.steps[0] ?? null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-amber-500/10",
        compact ? "mb-6 p-4" : "mb-8 p-5 sm:p-6 lg:p-7",
      )}
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-primary/20 bg-primary/10 text-primary">
                <RoleIcon className="mr-1 h-3.5 w-3.5" />
                Guided Demo
              </Badge>
              <Badge variant="outline">{guide.label}</Badge>
              <Badge variant="outline" className="max-w-full">
                <Mail className="mr-1 h-3.5 w-3.5" />
                {session.recipientEmail}
              </Badge>
              <Badge variant="outline">{progressPercent}% complete</Badge>
            </div>
            <h2 className={cn("mt-3 font-serif font-bold text-foreground", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
              {guide.headline}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {guide.summary} Demo emails are routed to <span className="font-medium text-foreground">{session.recipientEmail}</span>,
              while this workspace stays on a stable preset account for the selected role.
            </p>

            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">
                <span>Journey progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {highlightedStep ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {currentStep ? "Current step:" : "Next step:"}
                  </span>{" "}
                  {highlightedStep.title}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button asChild>
              <Link to={continueTarget?.href || guide.primaryHref}>
                {currentStep ? "Continue journey" : guide.primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Switch demo role</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact">Request walkthrough</Link>
            </Button>
            {!compact && (
              <Button variant="ghost" onClick={resetProgress}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart path
              </Button>
            )}
          </div>
        </div>

        {!compact && (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {guide.steps.map((step, index) => {
              const completed = targetRole === session.role && isStepCompleted(step.id);
              const active = currentStep?.id === step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "rounded-2xl border bg-background/70 p-4 backdrop-blur transition-colors",
                    active ? "border-primary/50" : "border-border/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">{step.title}</p>
                    </div>
                    {completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  <Button variant="link" className="mt-3 h-auto p-0 text-primary" asChild>
                    <Link to={step.href}>
                      {completed ? "Revisit step" : "Open step"}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
