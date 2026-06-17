import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDemoExperience } from "@/contexts/DemoExperienceContext";
import { useTour } from "@/contexts/TourContext";
import { ProductTour } from "@/components/tours/ProductTour";

export function DemoCoachmark() {
  const location = useLocation();
  const { activeTour, startTour } = useTour();
  const { isActive, guide, currentStep, nextStep } = useDemoExperience();
  const [dismissedStepId, setDismissedStepId] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep?.id !== dismissedStepId) {
      setDismissedStepId(null);
    }
  }, [currentStep?.id, dismissedStepId]);

  const stepIndex = useMemo(() => {
    if (!guide || !currentStep) return -1;
    return guide.steps.findIndex((step) => step.id === currentStep.id);
  }, [currentStep, guide]);

  if (!isActive || !guide || !currentStep) {
    return null;
  }

  if (dismissedStepId === currentStep.id) {
    return null;
  }

  if (location.pathname === "/dashboard") {
    return null;
  }

  const hasPageTour = !!currentStep.tourId;
  const shouldRunTour = !!currentStep.tourId && activeTour === currentStep.tourId;
  const nextAction = nextStep && nextStep.id !== currentStep.id ? nextStep : null;

  return (
    <>
      <aside
        className={cn(
          "fixed bottom-24 right-4 z-[90] w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-primary/20 bg-background/95 p-4 shadow-2xl backdrop-blur-xl",
          "sm:bottom-8 sm:right-8",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">
              Step {stepIndex + 1} of {guide.steps.length}
            </p>
            <h3 className="mt-2 font-serif text-xl font-bold text-foreground">
              {currentStep.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setDismissedStepId(currentStep.id)}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Hide demo tip"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {currentStep.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {hasPageTour ? (
            <Button
              variant="hero"
              onClick={() => currentStep.tourId && startTour(currentStep.tourId)}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start page tour
            </Button>
          ) : null}

          {nextAction ? (
            <Button variant={hasPageTour ? "outline" : "hero"} asChild>
              <Link to={nextAction.href}>
                Open next step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant={hasPageTour ? "outline" : "hero"} asChild>
              <Link to="/dashboard">
                Return to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {shouldRunTour && currentStep.tourId ? (
        <ProductTour tourId={currentStep.tourId} />
      ) : null}
    </>
  );
}
