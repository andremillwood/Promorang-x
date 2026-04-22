import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Flame, MapPin, Sparkles, Users, Zap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const pulseTone = {
  dormant: "bg-muted text-muted-foreground",
  forming: "bg-primary/10 text-primary border border-primary/20",
  live: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cooling: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
} as const;

const Pulse = () => {
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery({
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

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <Activity className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold">Pulse</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to track live gatherings, momentum surges, and content moments forming near you.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
            <Zap className="h-3.5 w-3.5" />
            Live Momentum
          </div>
          <h1 className="font-serif text-3xl font-black text-foreground sm:text-4xl">
            Pulse
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            What is forming right now, what is about to cross threshold, and where real-world energy is becoming measurable.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link to="/discover">Explore All Moments</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/create-moment">Create a Pulse</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Forming now</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {isLoading ? "..." : pulseMoments.filter((moment: any) => moment.pulse_state === "forming").length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Moments building toward gathering state.</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700/80">Live gatherings</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {isLoading ? "..." : pulseMoments.filter((moment: any) => moment.pulse_state === "live").length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Thresholds crossed and bonuses active.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Why it matters</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            Pulse is the real-time layer where venues, brands, hosts, and participants see coordinated energy before it becomes history.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border bg-card p-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-8 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : pulseMoments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold">No active pulse right now</h2>
          <p className="mt-2 text-muted-foreground">
            Nothing is currently forming or live. Create the next gathering or browse upcoming moments.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero">
              <Link to="/create-moment">Start a Moment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/discover">Browse Discover</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pulseMoments.map((moment: any) => {
            const pulseClass = pulseTone[(moment.pulse_state as keyof typeof pulseTone) || "dormant"];
            return (
              <Link
                key={moment.id}
                to={`/moments/${moment.id}`}
                className="group rounded-3xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge className={pulseClass}>
                    {moment.pulse_state || "dormant"}
                  </Badge>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Pulse
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {moment.title}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {moment.venue_name && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {moment.venue_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    Threshold {moment.gathering_threshold || 0}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Energy Signal</span>
                    <span className="text-primary">
                      {moment.pulse_state === "live" ? "Gathering Active" : "Building"}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all"
                      style={{
                        width: `${Math.min(
                          ((moment.threshold_progress || 0) / Math.max(moment.gathering_threshold || 1, 1)) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {(moment.threshold_progress || 0).toLocaleString()} joined
                    </span>
                    <span className="font-semibold text-foreground">
                      {moment.gathering_threshold || 0} target
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-orange-500">
                    <Flame className="h-4 w-4" />
                    Move while momentum is live
                  </span>
                  <span className="font-semibold text-primary">Open</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Pulse;
