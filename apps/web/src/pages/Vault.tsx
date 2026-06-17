import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Crown,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type MemoryPerk = {
  id: string;
  benefit_type?: string | null;
  benefit_value?: {
    label?: string;
    percent_off?: number;
    amount_off?: number;
  } | string | null;
  source_type?: string | null;
  expires_at?: string | null;
};

type MemoryRecord = {
  id: string;
  moment_id?: string | null;
  rarity?: "common" | "rare" | "epic" | "legendary" | string | null;
  title: string;
  collection_key?: string | null;
  legacy_score?: number | null;
  perk?: MemoryPerk | null;
  metadata?: {
    artifact_type?: string | null;
    source?: string | null;
    issued_from?: string | null;
  } | null;
};

type MissionHistoryRecord = {
  id: string;
  status?: "engaged" | "joined" | "verified" | "memorized" | string | null;
  content_title?: string | null;
  moment_title?: string | null;
  first_engaged_at?: string | null;
  joined_at?: string | null;
  verified_at?: string | null;
  digital_event_count?: number | null;
  join_event_count?: number | null;
  verification_event_count?: number | null;
};

type VaultSummary = {
  total_memories?: number | null;
  total_legacy_score?: number | null;
  legendary_count?: number | null;
};

type VaultPayload = {
  memories?: MemoryRecord[];
  active_perks?: MemoryPerk[];
  mission_history?: MissionHistoryRecord[];
  summary?: VaultSummary;
};

const rarityTone = {
  common: "border-border/70 bg-card text-muted-foreground",
  rare: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  epic: "border-primary/20 bg-primary/10 text-primary",
  legendary: "border-accent/30 bg-accent/15 text-accent-foreground",
} as const;

const missionTone = {
  engaged: "bg-muted text-muted-foreground",
  joined: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  verified: "bg-primary/10 text-primary border border-primary/20",
  memorized: "bg-accent/15 text-accent-foreground border border-accent/30",
} as const;

const formatMissionDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString() : null;

const formatBenefitValue = (perk?: MemoryPerk | null) => {
  if (!perk?.benefit_value) return "Active benefit";
  if (typeof perk.benefit_value === "string") return perk.benefit_value;
  if (perk.benefit_value.label) return perk.benefit_value.label;
  if (perk.benefit_value.percent_off) return `${perk.benefit_value.percent_off}% off`;
  if (perk.benefit_value.amount_off) return `${perk.benefit_value.amount_off} off`;
  return "Active benefit";
};

const Vault = () => {
  const { user, session } = useAuth();

  const { data, isLoading, error } = useQuery<VaultPayload>({
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

      return payload?.vault || {};
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/15 via-background to-primary/10 p-8 shadow-soft sm:p-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-foreground" />
              Digital Legacy
            </div>
            <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">Vault</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Your best moments should not disappear into the feed. The vault is where verified memories, active perks, and long-term status stay with you.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth">Sign In to Open Your Vault</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/discover/moments">Browse Moments</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const memories = data?.memories || [];
  const activePerks = data?.active_perks || [];
  const missionHistory = data?.mission_history || [];
  const summary = data?.summary || {};
  const rareMemoryCount = memories.filter((memory) => ["rare", "epic", "legendary"].includes(memory.rarity || "")).length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-accent/20 bg-charcoal p-6 shadow-card sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-accent/20 via-transparent to-primary/10 p-6 sm:p-8">
            <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/85">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                What you keep
              </div>
              <h1 className="font-serif text-4xl font-black text-white sm:text-5xl">Vault</h1>
              <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                Rewards can expire or be spent. Memories, status, and the best perks are what make participation compound into identity.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="hero" size="lg">
                  <Link to="/discover/moments">Collect More Memories</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-foreground">
                  <Link to="/wallet">Open Wallet</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-accent/20 bg-accent/10 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Memories</p>
              <p className="mt-3 text-4xl font-black text-white lg:text-5xl">
                {isLoading ? "..." : summary.total_memories || 0}
              </p>
              <p className="mt-2 text-sm text-white/65">Verified moments you can point back to, not just feed activity that fades.</p>
            </div>
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-light">Legacy score</p>
              <p className="mt-3 text-4xl font-black text-white lg:text-5xl">
                {isLoading ? "..." : summary.total_legacy_score || 0}
              </p>
              <p className="mt-2 text-sm text-white/65">The cumulative weight of what you have shown up for, verified, and kept.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/55">Rare and above</p>
              <p className="mt-3 text-4xl font-black text-white lg:text-5xl">
                {isLoading ? "..." : rareMemoryCount}
              </p>
              <p className="mt-2 text-sm text-white/65">The strongest signals of founder status, rarity, and return value.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Why vault exists</p>
          <p className="mt-3 text-sm font-medium text-foreground">
            The vault turns real-world participation into something persistent instead of disposable.
          </p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">What grows here</p>
          <p className="mt-3 text-sm font-medium text-foreground">
            Memories, attached perks, collection patterns, and long-term status become the real retention loop.
          </p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Where to go next</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/discover/moments">Moments</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/missions">Missions</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/wallet">Wallet</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Memory collection</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">What your history looks like when it stays</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Verified moments become collectible proof of where you showed up and what those actions unlocked.
              </p>
            </div>
            {!isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {memories.length} {memories.length === 1 ? "memory" : "memories"}
              </Badge>
            ) : null}
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
                  <Skeleton className="mt-4 h-7 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-background/50 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-bold">Your vault is still empty</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Complete moments, verify the action, and start collecting memories that feel worth returning to.
              </p>
              <Button asChild variant="hero" className="mt-5">
                <Link to="/discover/moments">Find Your First Memory</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {memories.map((memory) => {
                const tone = rarityTone[(memory.rarity as keyof typeof rarityTone) || "common"];
                return (
                  <Link
                    key={memory.id}
                    to={`/memories/${memory.id}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-border bg-background/50 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={tone}>{memory.rarity || "common"}</Badge>
                          {memory.metadata?.artifact_type === "i_was_there" ? (
                            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
                              I was there
                            </Badge>
                          ) : null}
                        </div>
                        <Star className="h-4 w-4 text-accent" />
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {memory.title}
                      </h3>
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          Collection: <span className="font-medium text-foreground">{memory.collection_key || "Independent"}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Legacy value: <span className="font-semibold text-foreground">{memory.legacy_score || 0}</span>
                        </p>
                        {memory.perk ? (
                          <p className="text-muted-foreground">
                            Attached perk: <span className="font-semibold text-foreground">{formatBenefitValue(memory.perk)}</span>
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-primary">
                        <span className="inline-flex items-center gap-1.5">
                          Open memory
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        {memory.moment_id ? (
                          <span className="text-xs font-medium text-muted-foreground">
                            Moment record kept
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold">Active Perks</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Benefits still attached to your memories and status right now.
            </p>

            {isLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : activePerks.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-5 text-sm text-muted-foreground">
                No active perks yet. Epic and legendary memories can carry persistent benefits that keep your participation feeling tangible.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activePerks.map((perk) => (
                  <div key={perk.id} className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{formatBenefitValue(perk)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {perk.benefit_type} via {perk.source_type}
                        </p>
                        {perk.expires_at ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Expires {new Date(perk.expires_at).toLocaleDateString()}
                          </p>
                        ) : null}
                      </div>
                      <Crown className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5 shadow-soft sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-foreground">Why this layer matters</p>
            <p className="mt-3 text-sm font-medium leading-6 text-foreground">
              The vault is what creates switching cost. Rewards can be spent and forgotten. Memory-backed perks, rarity, and visible history are what make the product feel cumulative.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button asChild variant="hero" size="sm">
                <Link to="/promoshare">Use activity in PromoShare</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/wallet">Open balances and value tools</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
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
                {missionHistory.slice(0, 5).map((mission) => {
                  const tone = missionTone[(mission.status as keyof typeof missionTone) || "engaged"];
                  return (
                    <div key={mission.id} className="rounded-2xl border border-border bg-background/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {mission.content_title || mission.moment_title || "Untitled Mission"}
                          </p>
                          {mission.content_title && mission.moment_title ? (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              Unlocks {mission.moment_title}
                            </p>
                          ) : null}
                        </div>
                        <Badge className={tone}>{mission.status || "engaged"}</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {formatMissionDate(mission.first_engaged_at) ? (
                          <p>Engaged {formatMissionDate(mission.first_engaged_at)}</p>
                        ) : null}
                        {formatMissionDate(mission.joined_at) ? (
                          <p>Joined {formatMissionDate(mission.joined_at)}</p>
                        ) : null}
                        {formatMissionDate(mission.verified_at) ? (
                          <p>Verified {formatMissionDate(mission.verified_at)}</p>
                        ) : null}
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
