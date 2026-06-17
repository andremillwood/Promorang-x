import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Clock3,
  Flame,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type PulseMoment = {
  id: string;
  title: string;
  venue_name?: string | null;
  pulse_state?: "dormant" | "forming" | "live" | "cooling" | string | null;
  gathering_threshold?: number | null;
  threshold_progress?: number | null;
  starts_at?: string | null;
  reward?: string | null;
  city?: string | null;
};

const pulseTone = {
  dormant: "border-border/70 bg-card text-muted-foreground",
  forming: "border-primary/20 bg-primary/10 text-primary",
  live: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cooling: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
} as const;

const pulseSectionCopy = {
  live: {
    title: "Live now",
    description: "Threshold crossed. These are the moments where momentum is already visible.",
  },
  forming: {
    title: "Forming now",
    description: "These moments are close enough to matter. Join early and help tip the room.",
  },
  cooling: {
    title: "Cooling down",
    description: "The spike has passed, but the story and memory layer may still be worth catching.",
  },
} as const;

const formatStartTime = (value?: string | null) => {
  if (!value) return "Time not posted";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Time not posted";
  }
};

const getProgressPercent = (moment: PulseMoment) => {
  const threshold = Math.max(moment.gathering_threshold || 0, 1);
  const progress = Math.max(moment.threshold_progress || 0, 0);
  return Math.min((progress / threshold) * 100, 100);
};

const PulseCard = ({ moment, featured = false }: { moment: PulseMoment; featured?: boolean }) => {
  const pulseState = (moment.pulse_state || "dormant") as keyof typeof pulseTone;
  const stateClasses = pulseTone[pulseState] || pulseTone.dormant;
  const progressPercent = getProgressPercent(moment);
  const target = moment.gathering_threshold || 0;
  const joined = moment.threshold_progress || 0;
  const isLive = pulseState === "live";

  return (
    <Link
      to={`/moments/${moment.id}`}
      className={`group block overflow-hidden rounded-[1.75rem] border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card ${
        featured ? "border-primary/15 shadow-soft" : "border-border/70"
      }`}
    >
      <div className="relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent opacity-80" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <Badge className={stateClasses}>{moment.pulse_state || "dormant"}</Badge>
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              {isLive ? "Happening" : "Building"}
            </span>
          </div>

          <h2 className="mt-5 max-w-xl font-serif text-2xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-[2rem]">
            {moment.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {moment.venue_name ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {moment.venue_name}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-primary" />
              {formatStartTime(moment.starts_at)}
            </span>
            {moment.city ? (
              <span className="text-muted-foreground/80">{moment.city}</span>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <span>Momentum Signal</span>
              <span className={isLive ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                {isLive ? "Threshold Crossed" : `${Math.round(progressPercent)}% to live`}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLive ? "bg-emerald-500" : "bg-gradient-primary"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{joined.toLocaleString()} joined</span>
              <span className="font-semibold text-foreground">{target.toLocaleString()} target</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                isLive ? "text-emerald-600 dark:text-emerald-400" : "text-orange-500"
              }`}
            >
              <Flame className="h-4 w-4" />
              {isLive ? "Move while the room is alive" : "Join before it tips"}
            </span>

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Open moment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const PulseSection = ({
  title,
  description,
  moments,
}: {
  title: string;
  description: string;
  moments: PulseMoment[];
}) => {
  if (moments.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
          {moments.length} {moments.length === 1 ? "moment" : "moments"}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {moments.map((moment, index) => (
          <PulseCard key={moment.id} moment={moment} featured={index === 0} />
        ))}
      </div>
    </section>
  );
};

const Pulse = () => {
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery<PulseMoment[]>({
    queryKey: ["pulse-live", user?.id],
    enabled: !!user && !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/pulse/live?limit=24`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load pulse feed");
      }

      return payload?.moments || [];
    },
  });

  const pulseMoments = useMemo(() => data || [], [data]);
  const liveMoments = useMemo(
    () => pulseMoments.filter((moment) => moment.pulse_state === "live"),
    [pulseMoments],
  );
  const formingMoments = useMemo(
    () => pulseMoments.filter((moment) => moment.pulse_state === "forming"),
    [pulseMoments],
  );
  const coolingMoments = useMemo(
    () => pulseMoments.filter((moment) => moment.pulse_state === "cooling"),
    [pulseMoments],
  );
  const activeCount = liveMoments.length + formingMoments.length;
  const thresholdCount = pulseMoments.reduce(
    (sum, moment) => sum + Math.max(moment.gathering_threshold || 0, 0),
    0,
  );
  const joinedCount = pulseMoments.reduce(
    (sum, moment) => sum + Math.max(moment.threshold_progress || 0, 0),
    0,
  );

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 shadow-soft sm:p-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
              <Zap className="h-3.5 w-3.5" />
              Live Momentum
            </div>
            <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">
              Pulse
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              See which moments are forming, which rooms have already tipped, and where real-world energy is strong enough to act on.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth">Sign In to Join the Pulse</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/discover/moments">Browse Discovery</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-charcoal p-6 shadow-card sm:p-8 lg:p-10">
        <div className="absolute" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 p-6 sm:p-8">
            <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary-light">
                <Zap className="h-3.5 w-3.5" />
                What is forming now
              </div>
              <h1 className="max-w-3xl font-serif text-4xl font-black text-white sm:text-5xl">
                Pulse
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                Join the moments that are already building real density. Pulse is where urgency becomes visible before it becomes memory.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="hero" size="lg">
                  <Link to="/discover/moments">Find a Moment</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-foreground">
                  <Link to="/create/moment">Create Momentum</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
                Live now
              </p>
              <p className="mt-3 text-4xl font-black text-white lg:text-5xl">{isLoading ? "..." : liveMoments.length}</p>
              <p className="mt-2 text-sm text-white/65">Moments with thresholds crossed and visible energy.</p>
            </div>
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-light">
                Forming
              </p>
              <p className="mt-3 text-4xl font-black text-white lg:text-5xl">{isLoading ? "..." : formingMoments.length}</p>
              <p className="mt-2 text-sm text-white/65">Moments close enough to join before they tip.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/55">
                Why Pulse matters
              </p>
              <p className="mt-3 text-sm font-medium text-white/80">
                It lets participants, hosts, venues, and brands see coordinated movement while there is still time to act.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Active windows</p>
          <p className="mt-3 text-3xl font-black text-foreground">{isLoading ? "..." : activeCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">The moments that feel immediate enough to shape a day or night.</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">People joined</p>
          <p className="mt-3 text-3xl font-black text-foreground">{isLoading ? "..." : joinedCount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-muted-foreground">Visible movement already committed across the current pulse surface.</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Threshold targets</p>
          <p className="mt-3 text-3xl font-black text-foreground">{isLoading ? "..." : thresholdCount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-muted-foreground">Combined target count across the moments now competing for energy.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">How to use Pulse</p>
              <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">This is the urgency layer</h2>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Join the pulse</p>
              <p className="mt-2 text-sm text-muted-foreground">Open the moments that are already pulling people in and decide if you want to enter early.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Show up while it matters</p>
              <p className="mt-2 text-sm text-muted-foreground">Use pulse state and threshold progress to know where the room is actually alive.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Keep the memory</p>
              <p className="mt-2 text-sm text-muted-foreground">The best moments do not end at check-in. They convert into memory, perks, and return value.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Fast Paths</p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">Where to go next</h2>
          <div className="mt-6 space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/discover/moments">
                Browse all moments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/missions">
                Open missions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/vault">
                Open your vault
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[1.75rem] border border-border bg-card p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-5 h-10 w-2/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : pulseMoments.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-serif text-3xl font-bold text-foreground">No active pulse right now</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Nothing is currently forming or live. Start the next moment or move into discovery to find what is scheduled next.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link to="/create/moment">Start a Moment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/discover/moments">Browse Discovery</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <PulseSection
            title={pulseSectionCopy.live.title}
            description={pulseSectionCopy.live.description}
            moments={liveMoments}
          />
          <PulseSection
            title={pulseSectionCopy.forming.title}
            description={pulseSectionCopy.forming.description}
            moments={formingMoments}
          />
          <PulseSection
            title={pulseSectionCopy.cooling.title}
            description={pulseSectionCopy.cooling.description}
            moments={coolingMoments}
          />
        </div>
      )}
    </main>
  );
};

export default Pulse;
