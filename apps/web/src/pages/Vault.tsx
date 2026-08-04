import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
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
import { cultureEvents } from "@/data/culture-demo";
import { CommerceReceiptRail } from "@/components/commerce/CommerceReceiptRail";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

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

type AttendanceReceipt = {
  id: string;
  status: string;
  verification_method?: string | null;
  verified_at: string;
  outcomes?: { pieces_awarded?: boolean; piece_quantity?: number; promoshare_ticket_awarded?: boolean } | null;
  moments?: { id: string; title?: string | null; location?: string | null } | null;
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
  const { data: attendanceData } = useQuery<{ receipts: AttendanceReceipt[] }>({
    queryKey: ["guest-attendance-receipts", user?.id],
    enabled: !!user && !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/guest-rsvp/me/attendance-receipts`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load attendance receipts");
      return payload;
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
            <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-foreground sm:text-6xl">Vault</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Your best Moments should not disappear into the feed. Vault is where verified memories, active perks, and long-term status stay with you.
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
    <main className="mx-auto max-w-[1600px] space-y-8 sm:space-y-10 xl:space-y-14">
      <PersonalValueNav />
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-6 shadow-card sm:p-8 lg:p-10">
        <img src={cultureEvents[0]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:gap-8 xl:gap-12">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] p-6 sm:p-8 backdrop-blur-sm shadow-2xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-3.5 py-1.5 text-xs font-bold text-primary">
              <Gift className="h-4 w-4" />
              <span>⚡ Your Saved Perks & Wins Vault</span>
            </div>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white">
              Your Free Perks, <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">Treats & Cash Wins.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/75">
              Every free coffee voucher, $12 instant cash perk, and community reward you unlock stays safe right here in your private vault.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg" className="bg-primary text-primary-foreground font-black hover:bg-primary/90 rounded-2xl">
                <Link to="/discover">Claim More Perks 🚀</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-foreground rounded-2xl">
                <Link to="/wallet">Open Cash Wallet</Link>
              </Button>
            </div>
          </div>

          <div className="self-stretch rounded-[1.75rem] border border-white/12 bg-black/52 p-5 backdrop-blur-xl sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">Your story so far</p>
            <div className="mt-5 divide-y divide-white/10">
              {[
                [isLoading ? "…" : String(summary.total_memories || 0), "Moments worth remembering", "Places and experiences that did not disappear into the feed."],
                [isLoading ? "…" : String(rareMemoryCount), "Rare invitations and keepsakes", "The uncommon things that opened because you were part of it."],
                [isLoading ? "…" : String(summary.total_legacy_score || 0), "Your place taking shape", "A quiet record of returning, contributing, and becoming known."],
              ].map(([value, label, detail]) => (
                <div key={label} className="grid grid-cols-[64px_1fr] gap-4 py-4 first:pt-0 last:pb-0">
                  <p className="font-serif text-4xl font-semibold leading-none text-white">{value}</p>
                  <div><p className="text-sm font-black text-white">{label}</p><p className="mt-1 text-xs leading-5 text-white/48">{detail}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CommerceReceiptRail />

      {(attendanceData?.receipts?.length || 0) > 0 ? (
        <section className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-5 shadow-soft sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">It counted</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Attendance receipts</h2>
              <GuidanceDisclosure
                id="vault:attendance-receipts"
                eyebrow="Receipt guide"
                title="Why attendance receipts matter"
                summary="Verified arrivals show what counted and what unlocked after you showed up."
                className="mt-3"
                tone="light"
              >
                <p className="text-sm text-muted-foreground">Verified arrivals and everything they opened for you.</p>
              </GuidanceDisclosure>
            </div>
            <Badge variant="outline">{attendanceData?.receipts.length}</Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {attendanceData?.receipts.map((receipt) => {
              const results = [receipt.outcomes?.pieces_awarded ? `${receipt.outcomes.piece_quantity || 4} Pieces` : null, receipt.outcomes?.promoshare_ticket_awarded ? "1 PromoShare ticket" : null].filter(Boolean);
              return <article key={receipt.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><Badge variant="secondary">{receipt.status}</Badge></div>
                <h3 className="mt-4 font-black">{receipt.moments?.title || "Moment attended"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(receipt.verified_at).toLocaleDateString()} · {receipt.verification_method || "verified"}{receipt.moments?.location ? ` · ${receipt.moments.location}` : ""}</p>
                <p className="mt-3 text-sm font-semibold text-primary">{results.join(" · ") || "Attendance verified"}</p>
              </article>;
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(310px,0.65fr)] xl:gap-10">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Memory collection</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">What your history looks like when it stays</h2>
              <GuidanceDisclosure
                id="vault:memory-collection"
                eyebrow="Collection guide"
                title="How verified moments become memories"
                summary="Memories are collectible proof of where you showed up and what those actions unlocked."
                className="mt-3"
                tone="light"
              >
                <p className="text-sm text-muted-foreground">
                  Verified moments become collectible proof of where you showed up and what those actions unlocked.
                </p>
              </GuidanceDisclosure>
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
              <h3 className="mt-4 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Your vault is still empty</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Complete moments, verify the action, and start collecting memories that feel worth returning to.
              </p>
              <Button asChild variant="hero" className="mt-5">
                <Link to="/discover/moments">Find Your First Memory</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {memories.map((memory, index) => {
                const tone = rarityTone[(memory.rarity as keyof typeof rarityTone) || "common"];
                return (
                  <Link
                    key={memory.id}
                    to={`/memories/${memory.id}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-border bg-background/50 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={cultureEvents[index % cultureEvents.length]?.image} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>
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
                      <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary">
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
              <h2 className="text-2xl font-black tracking-[-0.04em]">Active Perks</h2>
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

          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em]">Mission History</h2>
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
