import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Clock3,
  Flame,
  Gem,
  MapPin,
  MousePointerClick,
  RadioTower,
  Route,
  Share2,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { cn } from "@/lib/utils";
import { seededContentDrops } from "@/data/seeded-content-drops";

type PulseMoment = {
  id: string;
  title: string;
  venue_name?: string | null;
  pulse_state?: string | null;
  gathering_threshold?: number | null;
  threshold_progress?: number | null;
  starts_at?: string | null;
  city?: string | null;
};

type PromoShareDashboard = {
  user_stats_by_cycle?: Array<{
    cycle_id: string;
    cycle_name?: string;
    cycle_type?: string;
    total_entries?: number;
    weight?: number;
    eligible?: boolean;
  }>;
  recent_entries?: Array<{
    id: string;
    source_type: string;
    source_action: string;
    entry_count: number;
    created_at: string;
  }>;
};

type PiecePool = {
  id: string;
  asset_id?: string;
  piece_type: "content" | "moment" | "host" | "venue";
  title?: string;
  volume_24h?: number;
  asset?: {
    title?: string;
    name?: string;
  };
};

const demoMoments: PulseMoment[] = [
  {
    id: "demo-moment-1",
    title: "Release Night Listening Room",
    venue_name: "Kingston Creative Hub",
    pulse_state: "forming",
    gathering_threshold: 100,
    threshold_progress: 68,
    city: "Kingston",
  },
  {
    id: "demo-moment-2",
    title: "Streetwear Drop Pickup",
    venue_name: "Liguanea Pop-up",
    pulse_state: "live",
    gathering_threshold: 80,
    threshold_progress: 84,
    city: "Kingston",
  },
];

const demoPieces: PiecePool[] = [
  { id: "demo-piece-1", asset_id: "demo-piece-1", piece_type: "content", title: "Release video pieces", volume_24h: 1260 },
  { id: "demo-piece-2", asset_id: "demo-piece-2", piece_type: "moment", title: "Listening room pieces", volume_24h: 880 },
];

const demoReceipts = [
  { id: "r1", label: "Shared creator drop", detail: "12 downstream clicks", value: "+2 entries" },
  { id: "r2", label: "Joined launch Moment", detail: "Proof path opened", value: "+6 pts" },
  { id: "r3", label: "Backed content piece", detail: "Early holder lane", value: "Rank #8" },
];

function FlowNode({
  icon: Icon,
  kicker,
  title,
  detail,
  active,
}: {
  icon: typeof Route;
  kicker: string;
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "relative min-h-[150px] rounded-[10px] border p-4 transition",
      active ? "border-primary/70 bg-primary/[0.08] shadow-[0_0_35px_hsl(var(--primary)/0.12)]" : "border-border/70 bg-background/70"
    )}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {active && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase text-primary-foreground">active</span>}
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{kicker}</p>
      <p className="mt-1 text-lg font-black leading-[1.05]">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function ActionLane({
  icon: Icon,
  label,
  body,
  href,
  cta,
}: {
  icon: typeof Route;
  label: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link to={href} className="group relative overflow-hidden rounded-[10px] border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/60">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-black leading-tight">{label}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{body}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {cta}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </p>
        </div>
      </div>
    </Link>
  );
}

function MovePill({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Route;
  label: string;
  detail: string;
}) {
  return (
    <span className="flex min-w-[118px] items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.07] px-3 py-2 text-left">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-xs font-black leading-none text-foreground">{label}</span>
        <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{detail}</span>
      </span>
    </span>
  );
}

export default function Momentum() {
  const { user, session, activeRole } = useAuth();
  const dropsQuery = useContentDrops("active");

  const pulseQuery = useQuery<PulseMoment[]>({
    queryKey: ["momentum-pulse", user?.id],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/pulse/live?limit=8`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load moments");
      return payload?.moments || [];
    },
  });

  const promoShareQuery = useQuery<PromoShareDashboard | null>({
    queryKey: ["momentum-promoshare", user?.id],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/promoshare/dashboard`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load PromoShare");
      return payload?.data || null;
    },
  });

  const piecesQuery = useQuery<PiecePool[]>({
    queryKey: ["momentum-pieces", user?.id],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/pieces/pools?status=active`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load pieces");
      return payload?.pools || [];
    },
  });

  const liveDrops = dropsQuery.data || [];
  const liveMoments = pulseQuery.data || [];
  const livePieces = piecesQuery.data || [];
  const drops = liveDrops.length ? liveDrops : seededContentDrops;
  const pulseMoments = liveMoments.length ? liveMoments : demoMoments;
  const pieces = livePieces.length ? livePieces : demoPieces;
  const isDemoSignal = !liveDrops.length && !liveMoments.length && !livePieces.length;
  const promoShare = promoShareQuery.data;

  const promoShareTotals = useMemo(() => {
    const cycles = promoShare?.user_stats_by_cycle || [];
    const entries = cycles.reduce((sum, cycle) => sum + Number(cycle.total_entries || 0), 0);
    const weight = cycles.reduce((sum, cycle) => sum + Number(cycle.weight || 0), 0);
    const eligible = cycles.filter((cycle) => cycle.eligible).length;
    return {
      entries: entries || (isDemoSignal ? 14 : 0),
      weight: weight || (isDemoSignal ? 18.5 : 0),
      eligible: eligible || (isDemoSignal ? 1 : 0),
    };
  }, [promoShare, isDemoSignal]);

  const activeMoments = pulseMoments.filter((moment) => ["live", "forming"].includes(moment.pulse_state || ""));
  const topSignal = drops[0];
  const topMoment = activeMoments[0] || pulseMoments[0];
  const role = activeRole || "participant";
  const contentPieces = pieces.slice(0, 3);
  const contributionReceipts = (promoShare?.recent_entries || []).slice(0, 3).map((entry) => ({
    id: entry.id,
    label: entry.source_action.replaceAll("_", " "),
    detail: `From ${entry.source_type}`,
    value: `+${entry.entry_count} entries`,
  }));
  const receipts = contributionReceipts.length ? contributionReceipts : demoReceipts;

  const flowNodes = [
    {
      icon: RadioTower,
      kicker: "Signal",
      title: topSignal?.title || "No active content drop",
      detail: "A creator asset ready for distribution.",
      active: true,
    },
    {
      icon: Share2,
      kicker: "Movers",
      title: "Shares, clicks, reposts",
      detail: "Every useful action becomes attributable.",
      active: promoShareTotals.entries > 0,
    },
    {
      icon: MapPin,
      kicker: "Landing",
      title: topMoment?.title || "No landing point",
      detail: "Attention becomes attendance, proof, or participation.",
      active: !!topMoment,
    },
    {
      icon: Ticket,
      kicker: "Reward",
      title: `${promoShareTotals.entries} PromoShare entries`,
      detail: "Verified contribution rolls into funded reward cycles.",
      active: promoShareTotals.entries > 0,
    },
    {
      icon: WalletCards,
      kicker: "Upside",
      title: `${pieces.length} Piece markets`,
      detail: "Conviction becomes a position in what is moving.",
      active: pieces.length > 0,
    },
  ];

  return (
    <div className="pr-app-canvas min-h-screen">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-accent/10 blur-[100px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 p-4 sm:p-6 xl:p-8">
          <section className="flex flex-col gap-5 border-b border-border/60 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">Live Exchange</Badge>
                <Badge variant="outline">{isDemoSignal ? "demo signal" : "live signal"}</Badge>
                <Badge variant="secondary">{role}</Badge>
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                Find what is moving. Help it travel. Get paid in proof.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                Promorang is a social marketplace for content drops, local Moments, reward tickets, and reputation. Every share, check-in, referral, and backing action leaves a receipt.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-4 xl:w-[520px]">
              {[
                ["Signals", drops.length],
                ["Landings", activeMoments.length],
                ["Entries", promoShareTotals.entries],
                ["Markets", pieces.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] border border-border/70 bg-card/70 p-4">
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Today’s route</p>
                <p className="mt-1 text-sm text-muted-foreground">A living path from creator signal to verified upside.</p>
              </div>
              <Button asChild size="sm">
                <Link to="/content-drops">
                  Browse drops
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="pr-feed-surface pr-momentum-trail p-4">
              <div className="grid gap-3 lg:grid-cols-5">
                {flowNodes.map((node) => (
                  <FlowNode key={node.kicker} {...node} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 2xl:grid-cols-[1fr_0.78fr]">
            <div className="pr-feed-surface p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">Opportunity feed</p>
                  <p className="text-sm text-muted-foreground">Creator drops asking for useful distribution right now.</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/content-drops">All drops</Link>
                </Button>
              </div>
              <div className="grid gap-3">
                {dropsQuery.isLoading && [1, 2].map((item) => <Skeleton key={item} className="h-24 rounded-[10px]" />)}
                {drops.slice(0, 3).map((drop) => (
                  <Link key={drop.id} to={`/content-drops/${drop.id}`} className="group pr-feed-item block p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black leading-tight">{drop.title}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" />Creator signal</span>
                            <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-primary" />Early window</span>
                            <span className="inline-flex items-center gap-1"><Ticket className="h-3.5 w-3.5 text-primary" />Ticket eligible</span>
                          </p>
                        </div>
                        <Badge variant="secondary">{drop.objective_type?.replace("_", " ") || "signal"}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{drop.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="pr-action-chip">early mover</span>
                        <span className="pr-action-chip">attributed share</span>
                        <span className="pr-action-chip">reward weight</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <MovePill icon={MousePointerClick} label="Open" detail="track click" />
                      <MovePill icon={Share2} label="Share" detail="prove reach" />
                      <MovePill icon={Ticket} label="Earn" detail="tickets" />
                      <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Open drop
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pr-feed-surface p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">Local landings</p>
                  <p className="text-sm text-muted-foreground">Where online attention becomes attendance, proof, or purchase.</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/pulse">Pulse</Link>
                </Button>
              </div>
              <div className="grid gap-3">
                {pulseQuery.isLoading && [1, 2].map((item) => <Skeleton key={item} className="h-20 rounded-[10px]" />)}
                {pulseMoments.slice(0, 3).map((moment) => {
                  const target = Math.max(Number(moment.gathering_threshold || 0), 1);
                  const joined = Math.max(Number(moment.threshold_progress || 0), 0);
                  const progress = Math.min(100, (joined / target) * 100);
                  return (
                    <Link key={moment.id} to={moment.id.startsWith("demo-") ? "/pulse" : `/moments/${moment.id}`} className="pr-feed-item block p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black">{moment.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{moment.venue_name || moment.city || "Location forming"}</p>
                        </div>
                        <Badge>{moment.pulse_state || "forming"}</Badge>
                      </div>
                      <Progress value={progress} className="mt-4" />
                      <p className="mt-2 text-xs text-muted-foreground">{joined} of {target} threshold</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <aside className="border-t border-border/70 bg-card/55 p-4 backdrop-blur lg:border-l lg:border-t-0 xl:p-5">
          <div className="sticky top-6 space-y-3">
            <div className="pr-feed-surface border-primary/30 bg-primary/[0.07] p-4">
              <div className="mb-4 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-black leading-tight">Your receipt</p>
                  <p className="text-xs text-muted-foreground">What your motion is worth.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[9px] border bg-background/80 p-3">
                  <p className="text-2xl font-black">{promoShareTotals.entries}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">entries</p>
                </div>
                <div className="rounded-[9px] border bg-background/80 p-3">
                  <p className="text-2xl font-black">{promoShareTotals.weight.toFixed(1)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">weight</p>
                </div>
                <div className="rounded-[9px] border bg-background/80 p-3">
                  <p className="text-2xl font-black">#{isDemoSignal ? "8" : "-"}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">rank</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="pr-exchange-row">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-tight">{receipt.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{receipt.detail}</p>
                      </div>
                      <Badge>{receipt.value}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: RadioTower,
                  label: role === "creator" ? "Launch signal" : "Move early signal",
                  body: role === "creator" ? "Wrap your external content in attribution." : "Find content before everyone else does.",
                  href: "/content-drops",
                  cta: role === "creator" ? "Create drop" : "Find drop",
                },
                {
                  icon: Calendar,
                  label: "Land attention",
                  body: "Convert traction into a Moment, check-in, or proof path.",
                  href: "/pulse",
                  cta: "Open Pulse",
                },
                {
                  icon: Ticket,
                  label: "Claim weight",
                  body: "See which actions become PromoShare entries.",
                  href: "/promoshare",
                  cta: "View receipt",
                },
                {
                  icon: Gem,
                  label: "Back upside",
                  body: "Use Pieces when momentum becomes conviction.",
                  href: "/marketplace",
                  cta: "Explore pieces",
                },
              ].map((action) => (
                <ActionLane key={action.label} {...action} />
              ))}
            </div>

            <div className="pr-feed-surface p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <p className="font-black">Contributor lanes</p>
                </div>
                <Badge variant="outline">rank</Badge>
              </div>
              <div className="space-y-2">
                {[
                  ["Early mover", "Spot content before it trends", "2.4x"],
                  ["Proof closer", "Turn attention into verified action", "+6"],
                  ["Conviction holder", "Back the asset after it forms", "VIP"],
                ].map(([title, body, value]) => (
                  <div key={title} className="pr-exchange-row flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-xs text-muted-foreground">{body}</p>
                    </div>
                    <Badge variant="secondary">{value}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pr-feed-surface p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="font-black">Conviction markets</p>
                </div>
                <Badge variant="outline">upside</Badge>
              </div>
              <div className="space-y-2">
                {contentPieces.map((piece) => (
                  <Link key={piece.id} to={piece.id.startsWith("demo-") ? "/marketplace" : `/pieces/${piece.piece_type}/${piece.asset_id || piece.id}`} className="pr-exchange-row block hover:border-primary/60">
                    <p className="font-semibold">{piece.asset?.title || piece.asset?.name || piece.title || "Content piece"}</p>
                    <p className="text-xs text-muted-foreground">{piece.piece_type} · {Number(piece.volume_24h || 0).toLocaleString()} volume</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
