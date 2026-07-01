import type { TourId } from "@/config/tour-config";

export type DemoRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency";

export interface DemoSession {
  role: DemoRole;
  recipientEmail: string;
  startedAt: string;
  source: "auth-demo";
}

export type DemoStepMatcher = {
  path: string;
  match?: "exact" | "prefix";
  searchIncludes?: string[];
};

export type DemoGuideStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  matchers: DemoStepMatcher[];
  tourId?: TourId;
};

export type DemoGuide = {
  label: string;
  headline: string;
  summary: string;
  primaryHref: string;
  primaryLabel: string;
  steps: DemoGuideStep[];
};

export interface DemoProgress {
  role: DemoRole;
  completedStepIds: string[];
  lastActiveStepId: string | null;
  updatedAt: string;
}

export const DEMO_SESSION_STORAGE_KEY = "promorang_demo_session";
export const DEMO_EMAIL_STORAGE_KEY = "promorang_demo_email_recipient";
export const DEMO_PROGRESS_STORAGE_KEY = "promorang_demo_progress";

const exact = (path: string, searchIncludes?: string[]): DemoStepMatcher => ({
  path,
  match: "exact",
  searchIncludes,
});

const prefix = (path: string, searchIncludes?: string[]): DemoStepMatcher => ({
  path,
  match: "prefix",
  searchIncludes,
});

const demoGuides: Record<DemoRole, DemoGuide> = {
  participant: {
    label: "Participant Demo",
    headline: "See how a guest discovers, checks in, and earns.",
    summary: "This path is best for showing how real-world attendance turns into profile momentum.",
    primaryHref: "/explore/moments?firstTime=true",
    primaryLabel: "Explore moments",
    steps: [
      {
        id: "discover",
        title: "Browse live moments",
        description: "Open the discovery feed and pick a nearby experience to anchor the story.",
        href: "/explore/moments?firstTime=true",
        matchers: [exact("/explore/moments"), exact("/discover")],
        tourId: "discover",
      },
      {
        id: "check-in",
        title: "Walk through check-in",
        description: "Open a moment and show how proof, attendance, and participation are captured.",
        href: "/explore/moments?firstTime=true",
        matchers: [prefix("/moments/")],
      },
      {
        id: "dashboard",
        title: "Return to the dashboard",
        description: "Close on points, streaks, memory, and the profile momentum created by attendance.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/wallet"), exact("/vault")],
      },
    ],
  },
  creator: {
    label: "Creator Demo",
    headline: "Show how creators publish missions and unlock brand demand.",
    summary: "Use this to frame Promorang as a repeatable engine for creator participation, not just another content board.",
    primaryHref: "/watch-unlock",
    primaryLabel: "Open missions",
    steps: [
      {
        id: "missions",
        title: "Browse creator missions",
        description: "Start in the missions view to show available work and how clearly briefs are framed.",
        href: "/watch-unlock",
        matchers: [exact("/watch-unlock")],
      },
      {
        id: "mission-detail",
        title: "Open a mission detail",
        description: "Use a mission page to explain how creator actions tie back to real-world outcomes.",
        href: "/watch-unlock",
        matchers: [prefix("/watch-unlock/")],
      },
      {
        id: "creator-dashboard",
        title: "Show repeatable earnings",
        description: "Return to the dashboard to connect activity with creator momentum and revenue.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/wallet")],
      },
    ],
  },
  host: {
    label: "Host Demo",
    headline: "Demonstrate how hosts launch moments and orchestrate turnout.",
    summary: "This is the clearest path for prospects evaluating community-led event execution.",
    primaryHref: "/create-moment?firstTime=true",
    primaryLabel: "Create a moment",
    steps: [
      {
        id: "create-moment",
        title: "Open the creation flow",
        description: "Show how a host frames the concept, rules, and participation mechanics.",
        href: "/create-moment?firstTime=true",
        matchers: [exact("/create-moment")],
        tourId: "create-moment",
      },
      {
        id: "execution-view",
        title: "Connect execution to turnout",
        description: "Use the dashboard to explain how activity, participation, and proof are monitored.",
        href: "/dashboard",
        matchers: [exact("/pulse"), exact("/dashboard/analytics"), exact("/dashboard")],
      },
      {
        id: "host-dashboard",
        title: "Close on downstream results",
        description: "Return to the main dashboard to connect launched moments with repeatable host outcomes.",
        href: "/dashboard",
        matchers: [exact("/dashboard")],
      },
    ],
  },
  brand: {
    label: "Brand Demo",
    headline: "Lead with campaign outcomes, not feature inventory.",
    summary: "Show how a brand launches an activation, verifies movement, and measures real participation.",
    primaryHref: "/create/campaign",
    primaryLabel: "Launch a campaign",
    steps: [
      {
        id: "launch-campaign",
        title: "Start a campaign",
        description: "Open the campaign flow and frame the objective, audience, and activation design.",
        href: "/create/campaign",
        matchers: [exact("/create/campaign"), exact("/dashboard/campaigns/create")],
        tourId: "create-campaign",
      },
      {
        id: "opportunities",
        title: "Review matched opportunities",
        description: "Use the brand dashboard to compare relevant content, moments, and execution options together.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/dashboard/campaigns")],
      },
      {
        id: "brand-dashboard",
        title: "Close on reporting",
        description: "Return to the dashboard to discuss verified participation, redemptions, and scale.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/dashboard/analytics"), exact("/sponsor"), exact("/sponsor/analytics")],
      },
    ],
  },
  merchant: {
    label: "Merchant Demo",
    headline: "Show how venues turn foot traffic into measurable repeat behavior.",
    summary: "This path works best when the prospect cares about local demand, in-store activity, or sampling.",
    primaryHref: "/dashboard/venues/add?firstTime=true",
    primaryLabel: "Add a venue",
    steps: [
      {
        id: "add-venue",
        title: "Anchor a physical location",
        description: "Start with venue setup to show how the merchant enters the ecosystem.",
        href: "/dashboard/venues/add?firstTime=true",
        matchers: [exact("/dashboard/venues/add")],
        tourId: "merchant-setup",
      },
      {
        id: "traffic-flow",
        title: "Explain check-ins and offers",
        description: "Use the venue or dashboard views to show how visits, offers, and local demand are measured.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/dashboard/venues"), exact("/create-moment")],
      },
      {
        id: "merchant-dashboard",
        title: "Discuss repeat visits",
        description: "Close on operational visibility, retention, and measurable venue outcomes.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/dashboard/analytics")],
      },
    ],
  },
  agency: {
    label: "Agency Demo",
    headline: "Operate multiple client outcomes from one portfolio.",
    summary: "Use this to position Promorang as an execution and proof system for managed client work.",
    primaryHref: "/create/campaign",
    primaryLabel: "Create client campaign",
    steps: [
      {
        id: "agency-launch",
        title: "Launch a client campaign",
        description: "Frame the agency view as a client portfolio and start with campaign creation.",
        href: "/create/campaign",
        matchers: [exact("/create/campaign"), exact("/dashboard/campaigns/create")],
      },
      {
        id: "agency-coordination",
        title: "Show coordination across partners",
        description: "Use the dashboard to explain how agencies coordinate brands, creators, and venues.",
        href: "/dashboard",
        matchers: [exact("/dashboard"), exact("/dashboard/campaigns"), exact("/dashboard/brand/hosts")],
      },
      {
        id: "agency-reporting",
        title: "Close on client reporting",
        description: "Use analytics or sponsor reporting to show client-facing proof and attribution.",
        href: "/dashboard/analytics",
        matchers: [exact("/dashboard/analytics"), exact("/sponsor/analytics"), exact("/dashboard")],
      },
    ],
  },
};

const progressStorageKey = (role: DemoRole) => `${DEMO_PROGRESS_STORAGE_KEY}:${role}`;

const createEmptyProgress = (role: DemoRole): DemoProgress => ({
  role,
  completedStepIds: [],
  lastActiveStepId: null,
  updatedAt: new Date().toISOString(),
});

const isSearchMatch = (search: string, searchIncludes?: string[]) => {
  if (!searchIncludes?.length) return true;
  return searchIncludes.every((fragment) => search.includes(fragment));
};

export const matchesDemoStep = (
  pathname: string,
  search: string,
  step: DemoGuideStep,
) => step.matchers.some((matcher) => {
  const mode = matcher.match ?? "exact";
  const pathMatches = mode === "prefix"
    ? pathname.startsWith(matcher.path)
    : pathname === matcher.path;

  return pathMatches && isSearchMatch(search, matcher.searchIncludes);
});

export const readDemoSession = (): DemoSession | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed?.role || !parsed?.recipientEmail) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeDemoSession = (session: DemoSession) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const readDemoProgress = (role: DemoRole): DemoProgress => {
  if (typeof window === "undefined") return createEmptyProgress(role);

  const raw = window.localStorage.getItem(progressStorageKey(role));
  if (!raw) return createEmptyProgress(role);

  try {
    const parsed = JSON.parse(raw) as DemoProgress;
    if (!Array.isArray(parsed?.completedStepIds)) {
      return createEmptyProgress(role);
    }

    return {
      role,
      completedStepIds: parsed.completedStepIds,
      lastActiveStepId: parsed.lastActiveStepId ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createEmptyProgress(role);
  }
};

export const writeDemoProgress = (progress: DemoProgress) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(progressStorageKey(progress.role), JSON.stringify(progress));
};

export const clearDemoProgress = (role?: DemoRole) => {
  if (typeof window === "undefined") return;

  if (role) {
    window.localStorage.removeItem(progressStorageKey(role));
    return;
  }

  (Object.keys(demoGuides) as DemoRole[]).forEach((demoRole) => {
    window.localStorage.removeItem(progressStorageKey(demoRole));
  });
};

export const clearDemoSession = () => {
  if (typeof window === "undefined") return;
  const existingSession = readDemoSession();
  window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  if (existingSession?.role) {
    clearDemoProgress(existingSession.role);
  } else {
    clearDemoProgress();
  }
};

export const getDemoGuide = (role: DemoRole) => demoGuides[role];

export const getDemoLandingPath = (role: DemoRole) => demoGuides[role].primaryHref;
