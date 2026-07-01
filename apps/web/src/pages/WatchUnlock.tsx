import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, Sparkles, ExternalLink, MapPin, Activity, ArrowRight } from "lucide-react";
import { cultureEvents } from "@/data/culture-demo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const pulseTone = {
  dormant: "bg-muted text-muted-foreground",
  forming: "bg-primary/10 text-primary border border-primary/20",
  live: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cooling: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
} as const;

const WatchUnlock = () => {
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["o2o-feed", user?.id],
    enabled: !!user && !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/feed`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load watch and unlock feed");
      }

      return payload?.feed || [];
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <PlayCircle className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold">Watch & Unlock</h1>
          <p className="mt-2 text-muted-foreground">
            Discover creator stories that open real-world moments, perks, and collectible memories.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const feed = data || [];

  return (
    <main className="mx-auto max-w-7xl space-y-6 text-white sm:space-y-8">
      <section className="relative min-h-[460px] overflow-hidden rounded-3xl border border-white/10 bg-black">
        <img src={cultureEvents[1]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/20" />
        <div className="relative flex min-h-[460px] items-end p-6 sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary"><PlayCircle className="h-3.5 w-3.5" /> Creator missions</div>
            <h1 className="mt-5 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] sm:text-7xl">Take the signal.<br /><span className="text-primary">Make it real.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">Watch the story, complete the action, prove what happened, and unlock the reward, status, or memory attached to your movement.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><a href="#mission-board">Browse missions <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
              <Button asChild variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white"><Link to="/pulse">See what is live</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <div id="mission-board" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Hybrid missions</p>
          <p className="mt-2 text-3xl font-black">{isLoading ? "..." : feed.length}</p>
          <p className="mt-1 text-sm text-white/45">Active stories with a physical unlock path.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700/80">Sponsored momentum</p>
          <p className="mt-2 text-3xl font-black">
            {isLoading ? "..." : feed.filter((item: any) => item.is_sponsored).length}
          </p>
          <p className="mt-1 text-sm text-white/45">Brand-backed drops tying story to real action.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Journey</p>
          <p className="mt-2 text-sm font-medium text-white/65">
            Watch → Move → Verify → Unlock.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border bg-card p-5">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold">No content missions live yet</h2>
          <p className="mt-2 text-muted-foreground">
            Creator-linked moments have not been connected yet. When they are, this is where digital-to-physical drops will appear.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {feed.map((item: any) => {
            const pulseClass = pulseTone[(item.moment?.pulse_state as keyof typeof pulseTone) || "dormant"];

            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-soft">
                <div className="relative h-56 overflow-hidden bg-muted">
                  <img
                    src={item.content?.media_url}
                    alt={item.content?.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge className="bg-black/60 text-white backdrop-blur">
                      {item.content?.platform || "content"}
                    </Badge>
                    <Badge className={pulseClass}>
                      {item.moment?.pulse_state || "forming"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                      {item.content?.creator_name}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-white">
                      {item.content?.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <p className="text-sm leading-6 text-white/50">
                    {item.content?.description}
                  </p>

                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
                        Physical Unlock
                      </p>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {item.physical_unlock_rules?.summary || "Complete the linked moment to unlock the creator drop."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.entry_action_types || []).map((action: string) => (
                        <span key={action} className="rounded-full bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {item.moment?.venue_name || item.moment?.location}
                    </span>
                    <span className="font-medium text-white">
                      {item.moment?.reward || "Memory unlock"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">O2O Conversion</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {Number(item.o2o_conversion_rate || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Threshold</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {item.moment?.gathering_threshold || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline" className="sm:flex-1">
                      <a href={item.content?.platform_url || "#"} target="_blank" rel="noreferrer">
                        Watch Story
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="hero" className="sm:flex-1">
                      <Link to={`/watch-unlock/${item.id}`}>
                        Open Mission
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default WatchUnlock;
