import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ArrowLeft, Crown, Gift, ShieldCheck, Sparkles, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const rarityTone = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  epic: "bg-primary/10 text-primary border border-primary/20",
  legendary: "bg-accent/15 text-accent-foreground border border-accent/30",
} as const;

const formatBenefitValue = (perk: any) => {
  if (!perk?.benefit_value) return "Active benefit";
  if (typeof perk.benefit_value === "string") return perk.benefit_value;
  if (perk.benefit_value.label) return perk.benefit_value.label;
  if (perk.benefit_value.percent_off) return `${perk.benefit_value.percent_off}% off`;
  if (perk.benefit_value.amount_off) return `${perk.benefit_value.amount_off} off`;
  return "Active benefit";
};

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["memory", id, user?.id],
    enabled: !!id && !!user && !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load memory");
      }

      return payload?.memory;
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold">Memory Detail</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to open your vault items and see the perks attached to them.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const memory = data;
  const tone = rarityTone[(memory?.rarity as keyof typeof rarityTone) || "common"];

  return (
    <main className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/vault">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vault
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/pulse">Pulse</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/discover">Find More Moments</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="mt-5 h-12 w-2/3" />
            <Skeleton className="mt-4 h-5 w-full" />
            <Skeleton className="mt-3 h-5 w-5/6" />
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </div>
      ) : !memory ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold">Memory not found</h2>
          <p className="mt-2 text-muted-foreground">
            This vault item may no longer exist or may belong to another user.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={tone}>{memory.rarity || "common"}</Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Memory
              </div>
            </div>

            <h1 className="mt-5 font-serif text-4xl font-black text-foreground">
              {memory.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {memory.description || "A verified receipt of real-world momentum, preserved as part of your long-term digital legacy."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Legacy Score</p>
                <p className="mt-2 text-3xl font-black text-foreground">{memory.legacy_score || 0}</p>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Collection</p>
                <p className="mt-2 text-lg font-bold text-foreground">{memory.collection_key || "Independent"}</p>
              </div>
              <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Issued</p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {memory.issued_at ? new Date(memory.issued_at).toLocaleDateString() : "Recent"}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-background/50 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Metadata</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Memory ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-foreground">{memory.id}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Moment ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-foreground">{memory.moment_id || "Not linked"}</p>
                </div>
              </div>
            </div>

            {memory.mission_attribution && (
              <div className="mt-8 rounded-3xl border border-primary/15 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Mission Timeline</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "First Engaged",
                      value: memory.mission_attribution.first_engaged_at
                        ? new Date(memory.mission_attribution.first_engaged_at).toLocaleString()
                        : "Not tracked",
                    },
                    {
                      label: "Joined",
                      value: memory.mission_attribution.joined_at
                        ? new Date(memory.mission_attribution.joined_at).toLocaleString()
                        : "Not tracked",
                    },
                    {
                      label: "Verified",
                      value: memory.mission_attribution.verified_at
                        ? new Date(memory.mission_attribution.verified_at).toLocaleString()
                        : "Not tracked",
                    },
                    {
                      label: "Status",
                      value: memory.mission_attribution.status || "memorized",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
                      <p className="mt-3 text-sm font-medium leading-6 text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Digital Events</p>
                    <p className="mt-3 text-2xl font-bold text-foreground">{memory.mission_attribution.engagement_events_count || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Join Events</p>
                    <p className="mt-3 text-2xl font-bold text-foreground">{memory.mission_attribution.join_events_count || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Verification Events</p>
                    <p className="mt-3 text-2xl font-bold text-foreground">{memory.mission_attribution.verification_events_count || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold">Perk Status</h2>
              </div>
              {memory.perk ? (
                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{formatBenefitValue(memory.perk)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {memory.perk.benefit_type} via {memory.perk.source_type}
                      </p>
                      {memory.perk.expires_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Expires {new Date(memory.perk.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Crown className="h-4 w-4 text-primary" />
                  </div>
                  {memory.perk.redemption_rules && (
                    <div className="mt-4 rounded-xl border border-border/50 bg-background/70 p-3 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">Redemption Rules</p>
                      <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-xs">
                        {JSON.stringify(memory.perk.redemption_rules, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                  No active perk is attached to this memory yet.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-accent/20 bg-accent/10 p-6">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Legacy Logic</p>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Memories make participation persistent. They turn a finished moment into status, retention, and future unlock potential.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default MemoryDetail;
