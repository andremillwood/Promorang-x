import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive, Crown, Gift, ShieldCheck, Sparkles, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const rarityTone = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  epic: "bg-primary/10 text-primary border border-primary/20",
  legendary: "bg-accent/15 text-accent-foreground border border-accent/30",
} as const;

const missionTone = {
  engaged: "bg-muted text-muted-foreground",
  joined: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  verified: "bg-primary/10 text-primary border border-primary/20",
  memorized: "bg-accent/15 text-accent-foreground border border-accent/30",
} as const;

const formatMissionDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString() : null;

const formatBenefitValue = (perk: any) => {
  if (!perk?.benefit_value) return "Active benefit";
  if (typeof perk.benefit_value === "string") return perk.benefit_value;
  if (perk.benefit_value.label) return perk.benefit_value.label;
  if (perk.benefit_value.percent_off) return `${perk.benefit_value.percent_off}% off`;
  if (perk.benefit_value.amount_off) return `${perk.benefit_value.amount_off} off`;
  return "Active benefit";
};

const Vault = () => {
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vault", user?.id],
    enabled: !!user && !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/memories/vault`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load vault");
      }

      return payload?.vault;
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <Archive className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold">Vault</h1>
          <p className="mt-2 text-muted-foreground">
            Your memories, active perks, and long-term legacy live here.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const memories = data?.memories || [];
  const activePerks = data?.active_perks || [];
  const missionHistory = data?.mission_history || [];
  const summary = data?.summary || {};

  return (
    <main className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-foreground" />
            Digital Legacy
          </div>
          <h1 className="font-serif text-3xl font-black text-foreground sm:text-4xl">
            Vault
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Verified memories, active perks, and the persistent value you carry forward across venues, creators, and future moments.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link to="/pulse">View Pulse</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/discover">Collect More Memories</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Memories</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {isLoading ? "..." : summary.total_memories || 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Verified receipts of real-world participation.</p>
        </div>
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Legacy score</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {isLoading ? "..." : summary.total_legacy_score || 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">The cumulative weight of what you have built and kept.</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Legendary</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {isLoading ? "..." : summary.legendary_count || 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Your rarest signals of founder status and lasting relevance.</p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Memory Collection</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Persistent proof of where you showed up and what you unlocked.
              </p>
            </div>
            <Archive className="h-5 w-5 text-primary" />
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {(error as Error).message}
            </div>
          ) : isLoading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border p-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-background/50 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-4 font-serif text-xl font-bold">Your vault is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete moments and verified hybrid actions to start building your digital legacy.
              </p>
              <Button asChild variant="hero" className="mt-5">
                <Link to="/discover">Find Your First Memory</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {memories.map((memory: any) => {
                const tone = rarityTone[(memory.rarity as keyof typeof rarityTone) || "common"];
                return (
                  <Link
                    key={memory.id}
                    to={`/memories/${memory.id}`}
                    className="group rounded-2xl border border-border bg-background/50 p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Badge className={tone}>{memory.rarity || "common"}</Badge>
                      <Star className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {memory.title}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Collection: <span className="font-medium text-foreground">{memory.collection_key || "Independent"}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Legacy value: <span className="font-semibold text-foreground">{memory.legacy_score || 0}</span>
                      </p>
                      {memory.perk && (
                        <p className="text-muted-foreground">
                          Perk: <span className="font-semibold text-foreground">{formatBenefitValue(memory.perk)}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold">Active Perks</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Benefits still attached to your memories and status.
            </p>

            {isLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : activePerks.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-5 text-sm text-muted-foreground">
                No active perks yet. Epic and legendary memories can carry persistent benefits.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activePerks.map((perk: any) => (
                  <div key={perk.id} className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{formatBenefitValue(perk)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {perk.benefit_type} via {perk.source_type}
                        </p>
                        {perk.expires_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Expires {new Date(perk.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Crown className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Collection Logic</p>
            <p className="mt-3 text-sm font-medium text-foreground">
              The vault is what creates switching cost. Rewards can be spent, but memory-backed perks and status stay with the participant.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold">Mission History</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hybrid journeys across content, movement, verification, and memory.
                </p>
              </div>
              <Badge variant="secondary">{missionHistory.length}</Badge>
            </div>

            {isLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : missionHistory.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-5 text-sm text-muted-foreground">
                No mission journeys yet. Watch creator drops and complete linked moments to build your hybrid history.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {missionHistory.slice(0, 5).map((mission: any) => {
                  const tone = missionTone[(mission.status as keyof typeof missionTone) || "engaged"];
                  return (
                    <div key={mission.id} className="rounded-2xl border border-border bg-background/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {mission.content_title || mission.moment_title || "Untitled Mission"}
                          </p>
                          {mission.content_title && mission.moment_title && (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              Unlocks {mission.moment_title}
                            </p>
                          )}
                        </div>
                        <Badge className={tone}>{mission.status || "engaged"}</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {formatMissionDate(mission.first_engaged_at) && (
                          <p>Engaged {formatMissionDate(mission.first_engaged_at)}</p>
                        )}
                        {formatMissionDate(mission.joined_at) && (
                          <p>Joined {formatMissionDate(mission.joined_at)}</p>
                        )}
                        {formatMissionDate(mission.verified_at) && (
                          <p>Verified {formatMissionDate(mission.verified_at)}</p>
                        )}
                        <p>
                          {mission.digital_event_count || 0} digital · {mission.join_event_count || 0} joins · {mission.verification_event_count || 0} verifications
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Vault;
