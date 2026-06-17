import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  DemoGuide,
  DemoGuideStep,
  DemoProgress,
  DemoSession,
  getDemoGuide,
  matchesDemoStep,
  readDemoProgress,
  readDemoSession,
  writeDemoProgress,
} from "@/lib/demo-session";

type DemoExperienceContextValue = {
  isActive: boolean;
  session: DemoSession | null;
  guide: DemoGuide | null;
  progress: DemoProgress | null;
  completedStepIds: string[];
  currentStep: DemoGuideStep | null;
  nextStep: DemoGuideStep | null;
  progressPercent: number;
  isStepCompleted: (stepId: string) => boolean;
  completeStep: (stepId: string) => void;
  resetProgress: () => void;
};

const DemoExperienceContext = createContext<DemoExperienceContextValue | undefined>(undefined);

export function DemoExperienceProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<DemoSession | null>(() => readDemoSession());
  const [progress, setProgress] = useState<DemoProgress | null>(() => {
    const initialSession = readDemoSession();
    return initialSession ? readDemoProgress(initialSession.role) : null;
  });

  useEffect(() => {
    const nextSession = readDemoSession();
    setSession(nextSession);
    setProgress(nextSession ? readDemoProgress(nextSession.role) : null);
  }, [location.pathname, location.search]);

  const guide = useMemo(() => {
    if (!session) return null;
    return getDemoGuide(session.role);
  }, [session]);

  const currentStep = useMemo(() => {
    if (!guide) return null;
    return (
      guide.steps.find((step) => matchesDemoStep(location.pathname, location.search, step)) ?? null
    );
  }, [guide, location.pathname, location.search]);

  useEffect(() => {
    if (!session || !guide || !currentStep) return;

    const currentProgress = progress ?? readDemoProgress(session.role);
    const nextCompletedStepIds = currentProgress.completedStepIds.includes(currentStep.id)
      ? currentProgress.completedStepIds
      : [...currentProgress.completedStepIds, currentStep.id];

    const nextProgress: DemoProgress = {
      role: session.role,
      completedStepIds: nextCompletedStepIds,
      lastActiveStepId: currentStep.id,
      updatedAt: new Date().toISOString(),
    };

    const hasChanged =
      nextProgress.lastActiveStepId !== currentProgress.lastActiveStepId ||
      nextProgress.completedStepIds.length !== currentProgress.completedStepIds.length;

    if (!hasChanged) return;

    writeDemoProgress(nextProgress);
    setProgress(nextProgress);
  }, [currentStep, guide, progress, session]);

  const completedStepIds = progress?.completedStepIds ?? [];

  const nextStep = useMemo(() => {
    if (!guide) return null;
    return guide.steps.find((step) => !completedStepIds.includes(step.id))
      ?? guide.steps[guide.steps.length - 1]
      ?? null;
  }, [completedStepIds, guide]);

  const value = useMemo<DemoExperienceContextValue>(() => {
    const isStepCompleted = (stepId: string) => completedStepIds.includes(stepId);

    const completeStep = (stepId: string) => {
      if (!session) return;

      const currentProgress = progress ?? readDemoProgress(session.role);
      if (currentProgress.completedStepIds.includes(stepId)) return;

      const nextProgress: DemoProgress = {
        role: session.role,
        completedStepIds: [...currentProgress.completedStepIds, stepId],
        lastActiveStepId: stepId,
        updatedAt: new Date().toISOString(),
      };

      writeDemoProgress(nextProgress);
      setProgress(nextProgress);
    };

    const resetProgress = () => {
      if (!session) return;

      const nextProgress: DemoProgress = {
        role: session.role,
        completedStepIds: [],
        lastActiveStepId: null,
        updatedAt: new Date().toISOString(),
      };

      writeDemoProgress(nextProgress);
      setProgress(nextProgress);
    };

    const totalSteps = guide?.steps.length ?? 0;
    const progressPercent = totalSteps > 0
      ? Math.round((completedStepIds.length / totalSteps) * 100)
      : 0;

    return {
      isActive: !!session && !!guide,
      session,
      guide,
      progress,
      completedStepIds,
      currentStep,
      nextStep,
      progressPercent,
      isStepCompleted,
      completeStep,
      resetProgress,
    };
  }, [completedStepIds, currentStep, guide, nextStep, progress, session]);

  return (
    <DemoExperienceContext.Provider value={value}>
      {children}
    </DemoExperienceContext.Provider>
  );
}

export function useDemoExperience() {
  const context = useContext(DemoExperienceContext);

  if (!context) {
    throw new Error("useDemoExperience must be used within a DemoExperienceProvider");
  }

  return context;
}
