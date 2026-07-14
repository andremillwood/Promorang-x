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
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";
import ForYou from "@/pages/ForYou";

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
  slug?: string;
  isSample?: boolean;
};

const publicPulseMoments: PulseMoment[] = cultureEvents.slice(0, 5).map((event, index) => {
  const states = ["live", "forming", "forming", "cooling", "forming"] as const;
  const targets = [180, 120, 90, 140, 75];
  const progress = [180, 82, 54, 126, 31];

  return {
    id: event.momentId,
    slug: event.slug,
    title: event.title,
    venue_name: event.place,
    pulse_state: states[index],
    gathering_threshold: targets[index],
    threshold_progress: progress[index],
    starts_at: new Date(Date.now() + index * 3_600_000).toISOString(),
    reward: event.reward,
    city: event.city,
    isSample: true,
  };
});

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

const PulseCard = ({ moment, featured = false, image }: { moment: PulseMoment; featured?: boolean; image?: string }) => {
  const pulseState = (moment.pulse_state || "dormant") as keyof typeof pulseTone;
  const stateClasses = pulseTone[pulseState] || pulseTone.dormant;
  const progressPercent = getProgressPercent(moment);
  const target = moment.gathering_threshold || 0;
  const joined = moment.threshold_progress || 0;
  const isLive = pulseState === "live";

  return (
    <Link
      to={moment.isSample && moment.slug ? `/events/${moment.slug}` : `/moments/${moment.id}`}
      className={`group block overflow-hidden rounded-2xl border bg-black text-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 ${
        featured ? "border-primary/35 shadow-[0_24px_80px_rgba(0,0,0,.35)]" : "border-white/10"
      }`}
    >
      <div className={featured ? "grid md:grid-cols-[1.05fr_.95fr]" : ""}>
        <div className={featured ? "relative min-h-72 overflow-hidden" : "relative aspect-[16/9] overflow-hidden"}>
          <img src={image || cultureEvents[0]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge className={stateClasses}>{moment.pulse_state || "dormant"}</Badge>
            {moment.isSample ? <Badge variant="outline" className="border-white/25 bg-black/55 text-white">Preview</Badge> : null}
          </div>
          {isLive ? <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"><Radio className="h-3 w-3" /> Live now</span> : null}
        </div>
      <div className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              {isLive ? "Happening" : "Building"}
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{isLive ? "Check-in eligible" : "Join early"}</span>
          </div>

          <h2 className="mt-4 max-w-xl text-2xl font-black text-white transition-colors group-hover:text-primary sm:text-[2rem]">
            {moment.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55">
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

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
              <span>Room signal</span>
              <span className={isLive ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                {isLive ? "Threshold Crossed" : `${Math.round(progressPercent)}% to live`}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLive ? "bg-emerald-500" : "bg-gradient-primary"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-white/55">{joined.toLocaleString()} joined</span>
              <span className="font-semibold text-white">{target.toLocaleString()} target</span>
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
    <section id={title.toLowerCase().startsWith("live") ? "live" : title.toLowerCase().startsWith("forming") ? "forming" : "cooling"} className="scroll-mt-24 space-y-4">
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
          <PulseCard key={moment.id} moment={moment} featured={index === 0} image={cultureEvents[index % cultureEvents.length]?.image} />
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

  const pulseMoments = useMemo(
    () => (user ? data || [] : publicPulseMoments),
    [data, user],
  );
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
  const thresholdCount = pulseMoments.reduce(
    (sum, moment) => sum + Math.max(moment.gathering_threshold || 0, 0),
    0,
  );
  const joinedCount = pulseMoments.reduce(
    (sum, moment) => sum + Math.max(moment.threshold_progress || 0, 0),
    0,
  );

  // Pulse remains a public window; once signed in, the ranked living feed is home.
  if (user) return <ForYou />;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-5 text-white sm:space-y-10 sm:px-6 sm:py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black">
        <img src={cultureEvents[0]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,105,0,.22),transparent_28%),linear-gradient(90deg,#050505_8%,rgba(5,5,5,.88)_48%,rgba(5,5,5,.36))]" />
        <div className="relative grid min-h-[460px] gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_390px] lg:items-end lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              {user ? "Live movement" : "Public pulse preview"}
            </div>
            <h1 className="mt-6 max-w-3xl font-sans text-6xl font-black uppercase leading-[0.82] tracking-[-0.075em] sm:text-8xl lg:text-9xl">Feel the room<br /><span className="text-primary">before</span> you arrive.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              See where people are gathering, which moments are about to tip, and where showing up matters right now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={user ? "/discover/moments" : "/auth"}>
                  {user ? "Find a moment" : "Sign in to join"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-black/35 text-white hover:bg-white/10 hover:text-white">
                <Link to={user ? "/create/moment" : "/discover/moments"}>{user ? "Start a moment" : "Explore all moments"}</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
            {[
              { label: "Live now", value: liveMoments.length, icon: Zap },
              { label: "Forming", value: formingMoments.length, icon: Flame },
              { label: "Joined", value: joinedCount, icon: Activity },
            ].map((item) => (
              <div key={item.label} className="bg-black/70 p-4 sm:p-5">
                <item.icon className="h-4 w-4 text-primary" />
                <p className="mt-8 text-3xl font-black">{user && isLoading ? "..." : item.value.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!user ? (
        <div className="flex flex-col gap-4 border-y border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">A window into the network</p>
            <p className="mt-1 max-w-2xl text-sm text-white/55">Preview activity without an account. Sign in when you want to join, check in, or leave proof.</p>
          </div>
          <Link to="/auth" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-white transition hover:text-primary">
            Unlock participation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}

      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { label: "Live now", value: liveMoments.length, href: "#live" },
          { label: "Forming", value: formingMoments.length, href: "#forming" },
          { label: "People joined", value: joinedCount, href: "#live" },
          { label: "Combined target", value: thresholdCount, href: "#forming" },
        ].map((item) => (
          <a key={item.label} href={item.href} className="min-w-44 rounded-xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-primary/50">
            <p className="text-2xl font-black">{user && isLoading ? "..." : item.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">{item.label}</p>
          </a>
        ))}
      </div>

      {user && error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : user && isLoading ? (
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
