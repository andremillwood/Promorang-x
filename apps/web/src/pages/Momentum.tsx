import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
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
  TrendingUp,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function FlowNode({
  stepNumber,
  icon: Icon,
  kicker,
  title,
  detail,
  active,
  isLast,
}: {
  stepNumber: string;
  icon: typeof Route;
  kicker: string;
  title: string;
  detail: string;
  active?: boolean;
  isLast?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="relative flex-1 min-w-[180px]">
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={cn(
          "relative h-full min-h-[170px] rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between backdrop-blur-md",
          active
            ? "border-primary/80 bg-gradient-to-b from-primary/[0.12] to-primary/[0.03] shadow-[0_0_30px_rgba(255,85,0,0.15)] ring-1 ring-primary/40"
            : "border-border/60 bg-card/60 hover:border-border hover:bg-card/80"
        )}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                {stepNumber}
              </span>
              {active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-foreground shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {t("momentum.active")}
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">
            {kicker}
          </p>
          <p className="mt-1 text-base font-black leading-snug text-foreground">
            {title}
          </p>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>
      </motion.div>

      {!isLast && (
        <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-primary/40 pointer-events-none">
          <ChevronRight className="h-5 w-5 animate-pulse text-primary/60" />
        </div>
      )}
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
    <Link
      to={href}
      className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_4px_20px_rgba(255,85,0,0.1)] block"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black leading-tight text-foreground group-hover:text-primary transition-colors">
            {label}
          </p>
          <p className="mt-1 text-xs leading-normal text-muted-foreground">
            {body}
          </p>
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            {cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
    <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/10">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-xs font-black leading-none text-foreground">
          {label}
        </span>
        <span className="block truncate text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {detail}
        </span>
      </span>
    </span>
  );
}

export default function Momentum() {
  const { t } = useI18n();
  const { user, session, activeRole } = useAuth();
  const [sidebarTab, setSidebarTab] = useState<"receipt" | "actions" | "markets">("receipt");
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
  const drops = liveDrops;
  const pulseMoments = liveMoments;
  const pieces = livePieces;
  const promoShare = promoShareQuery.data;

  const promoShareTotals = useMemo(() => {
    const cycles = promoShare?.user_stats_by_cycle || [];
    const entries = cycles.reduce((sum, cycle) => sum + Number(cycle.total_entries || 0), 0);
    const weight = cycles.reduce((sum, cycle) => sum + Number(cycle.weight || 0), 0);
    const eligible = cycles.filter((cycle) => cycle.eligible).length;
    return {
      entries,
      weight,
      eligible,
    };
  }, [promoShare]);

  const activeMoments = pulseMoments.filter((moment) =>
    ["live", "forming"].includes(moment.pulse_state || "")
  );
  const topSignal = drops[0];
  const topMoment = activeMoments[0] || pulseMoments[0];
  const role = activeRole || "participant";
  const contentPieces = pieces.slice(0, 4);

  const receipts = (promoShare?.recent_entries || []).slice(0, 4).map((entry) => ({
    id: entry.id,
    label: entry.source_action.replaceAll("_", " "),
    detail: t("momentum.fromSource", { source: entry.source_type }),
    value: t("momentum.plusEntries", { count: entry.entry_count }),
  }));

  const flowNodes = [
    {
      stepNumber: "01",
      icon: RadioTower,
      kicker: t("momentum.kickerSignal"),
      title: topSignal?.title || t("momentum.noDrop"),
      detail: t("momentum.signalDetail"),
      active: true,
    },
    {
      stepNumber: "02",
      icon: Share2,
      kicker: t("momentum.kickerMovers"),
      title: t("momentum.moversTitle"),
      detail: t("momentum.moversDetail"),
      active: promoShareTotals.entries > 0,
    },
    {
      stepNumber: "03",
      icon: MapPin,
      kicker: t("momentum.kickerLanding"),
      title: topMoment?.title || t("momentum.noLanding"),
      detail: t("momentum.landingDetail"),
      active: !!topMoment,
    },
    {
      stepNumber: "04",
      icon: Ticket,
      kicker: t("momentum.kickerReward"),
      title: t("momentum.rewardTitle", { count: promoShareTotals.entries }),
      detail: t("momentum.rewardDetail"),
      active: promoShareTotals.entries > 0,
    },
    {
      stepNumber: "05",
      icon: WalletCards,
      kicker: t("momentum.kickerUpside"),
      title: t("momentum.upsideTitle", { count: pieces.length }),
      detail: t("momentum.upsideDetail"),
      active: pieces.length > 0,
    },
  ];

  return (
    <div className="pr-app-canvas min-h-screen relative overflow-hidden bg-background">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-w-0 p-4 sm:p-6 xl:p-8 space-y-8">
          {/* Unified Hero Container */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card/90 via-card/70 to-background/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(255,85,0,0.08)]"
          >
            {/* Glowing Hero Top Accent Line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 text-xs shadow-md shadow-primary/20 inline-flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    {t("momentum.liveExchange")}
                  </Badge>
                  <Badge variant="outline" className="border-border/80 text-muted-foreground text-xs">
                    <Activity className="mr-1 h-3 w-3 text-primary" /> {t("momentum.realTime")}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold capitalize">
                    {t("momentum.role", { role })}
                  </Badge>
                </div>

                <h1 className="text-3xl font-black leading-[1.0] tracking-tight sm:text-5xl xl:text-6xl text-foreground">
                  {t("momentum.hero1")} <br className="hidden sm:inline" />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {t("momentum.hero2")}
                  </span>{" "}
                  {t("momentum.hero3")}
                </h1>

                <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {t("momentum.heroCopy")}
                </p>
              </div>

              {/* Integrated Hero Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-[420px] shrink-0 pt-2 lg:pt-0">
                {[
                  { label: t("momentum.signals"), value: drops.length, icon: RadioTower, color: "text-primary" },
                  { label: t("momentum.landings"), value: activeMoments.length, icon: MapPin, color: "text-amber-500" },
                  { label: t("momentum.entries"), value: promoShareTotals.entries, icon: Ticket, color: "text-accent" },
                  { label: t("momentum.markets"), value: pieces.length, icon: WalletCards, color: "text-emerald-500" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-3.5 backdrop-blur-sm transition-all hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    </div>
                    <p className="text-2xl font-black tracking-tight text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Interactive Animated Route Pipeline */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    {t("momentum.todaysRoute")}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("momentum.routeCopy")}
                </p>
              </div>

              <Button asChild size="sm" variant="outline" className="self-start sm:self-auto text-xs font-bold gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary">
                <Link to="/content-drops">
                  {t("momentum.browseDrops")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="pr-feed-surface rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5 backdrop-blur-md"
            >
              <div className="flex flex-col lg:flex-row gap-3">
                {flowNodes.map((node, idx) => (
                  <FlowNode
                    key={node.kicker}
                    {...node}
                    isLast={idx === flowNodes.length - 1}
                  />
                ))}
              </div>
            </motion.div>
          </section>

          {/* Main 2-Column Section: Opportunity Feed & Local Landings */}
          <section className="grid gap-6 2xl:grid-cols-[1fr_0.85fr]">
            {/* Opportunity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="pr-feed-surface rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="font-black text-foreground">{t("momentum.oppFeed")}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("momentum.oppFeedCopy")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold hover:text-primary">
                  <Link to="/content-drops">{t("momentum.allDrops", { count: drops.length })}</Link>
                </Button>
              </div>

              <div className="grid gap-3.5">
                {dropsQuery.isLoading &&
                  [1, 2].map((item) => (
                    <Skeleton key={item} className="h-32 rounded-xl bg-card/80" />
                  ))}

                {!dropsQuery.isLoading && drops.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
                    <RadioTower className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold text-foreground">{t("momentum.noDrops")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("momentum.noDropsCopy")}</p>
                  </div>
                )}

                {drops.slice(0, 4).map((drop) => (
                  <Link
                    key={drop.id}
                    to={`/content-drops/${drop.id}`}
                    className="group relative block rounded-xl border border-border/70 bg-background/80 p-4 transition-all duration-300 hover:border-primary/60 hover:shadow-[0_4px_25px_rgba(255,85,0,0.1)] hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-black leading-snug text-foreground text-base group-hover:text-primary transition-colors">
                          {drop.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-primary" /> {t("momentum.creatorSignal")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5 text-primary" /> {t("momentum.earlyWindow")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Ticket className="h-3.5 w-3.5 text-primary" /> {t("momentum.ticketEligible")}
                          </span>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                        {drop.objective_type?.replace("_", " ") || "signal"}
                      </Badge>
                    </div>

                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {drop.description}
                    </p>

                    <div className="mt-3.5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        <Flame className="h-3 w-3" /> {t("momentum.earlyMover")}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {t("momentum.attributedShare")}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
                        {t("momentum.rewardWeight")}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <div className="flex flex-wrap gap-2">
                        <MovePill icon={MousePointerClick} label={t("momentum.open")} detail={t("momentum.trackClick")} />
                        <MovePill icon={Share2} label={t("momentum.share")} detail={t("momentum.proveReach")} />
                        <MovePill icon={Ticket} label={t("momentum.earn")} detail={t("momentum.tickets")} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-primary group-hover:translate-x-0.5 transition-transform">
                        {t("momentum.openDrop")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Local Landings (Pulse Moments) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="pr-feed-surface rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <p className="font-black text-foreground">{t("momentum.localLandings")}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("momentum.localCopy")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold hover:text-amber-500">
                  <Link to="/pulse">{t("momentum.pulse", { count: pulseMoments.length })}</Link>
                </Button>
              </div>

              <div className="grid gap-3.5">
                {pulseQuery.isLoading &&
                  [1, 2].map((item) => (
                    <Skeleton key={item} className="h-24 rounded-xl bg-card/80" />
                  ))}

                {!pulseQuery.isLoading && pulseMoments.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold text-foreground">{t("momentum.noLandings")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("momentum.noLandingsCopy")}</p>
                  </div>
                )}

                {pulseMoments.slice(0, 4).map((moment) => {
                  const target = Math.max(Number(moment.gathering_threshold || 0), 1);
                  const joined = Math.max(Number(moment.threshold_progress || 0), 0);
                  const progress = Math.min(100, (joined / target) * 100);

                  return (
                    <Link
                      key={moment.id}
                      to={`/moments/${moment.id}`}
                      className="group block rounded-xl border border-border/70 bg-background/80 p-4 transition-all duration-300 hover:border-amber-500/60 hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)] hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-base text-foreground group-hover:text-amber-500 transition-colors">
                            {moment.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{moment.venue_name || moment.city || t("momentum.locationForming")}</span>
                          </p>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                          {moment.pulse_state || "forming"}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                          <span>{t("momentum.gathering")}</span>
                          <span className="text-foreground font-bold">{joined} / {target}</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-muted rounded-full" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </section>
        </main>

        {/* Right Rail Sidebar with Tabbed Sections */}
        <aside className="border-t border-border/70 bg-card/60 p-4 sm:p-6 backdrop-blur-xl lg:border-l lg:border-t-0">
          <div className="sticky top-6 space-y-5">
            {/* Sidebar Segmented Control Tabs */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-background/80 p-1 border border-border/70 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSidebarTab("receipt")}
                className={cn(
                  "py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1",
                  sidebarTab === "receipt"
                    ? "bg-primary text-primary-foreground shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("momentum.receipt")}
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("actions")}
                className={cn(
                  "py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1",
                  sidebarTab === "actions"
                    ? "bg-primary text-primary-foreground shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                {t("momentum.actions")}
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("markets")}
                className={cn(
                  "py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1",
                  sidebarTab === "markets"
                    ? "bg-primary text-primary-foreground shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("momentum.marketsTab")}
              </button>
            </div>

            {/* TAB 1: YOUR RECEIPT */}
            {sidebarTab === "receipt" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-primary/[0.08] to-card/60 p-4 backdrop-blur-md">
                  <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-black text-foreground text-sm">{t("momentum.motionReceipt")}</p>
                        <p className="text-[11px] text-muted-foreground">{t("momentum.motionWorth")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 text-center">
                      <p className="text-xl font-black text-foreground">{promoShareTotals.entries}</p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{t("momentum.entriesLabel")}</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 text-center">
                      <p className="text-xl font-black text-foreground">{promoShareTotals.weight.toFixed(1)}</p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{t("momentum.weightLabel")}</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 text-center">
                      <p className="text-xl font-black text-foreground">{promoShareTotals.eligible}</p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{t("momentum.eligibleLabel")}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t("momentum.recentActivity")}</p>
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="rounded-lg border border-border/60 bg-background/70 p-3 transition-colors hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-xs text-foreground capitalize">{receipt.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{receipt.detail}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {receipt.value}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {!receipts.length && (
                      <div className="rounded-lg border border-dashed border-border/80 p-4 text-center">
                        <Ticket className="mx-auto h-5 w-5 text-muted-foreground/60 mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {t("momentum.noReceipts")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: QUICK ACTIONS */}
            {sidebarTab === "actions" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {[
                  {
                    icon: RadioTower,
                    label: role === "creator" ? t("momentum.launchSignal") : t("momentum.moveSignal"),
                    body: role === "creator" ? t("momentum.launchBody") : t("momentum.moveBody"),
                    href: "/content-drops",
                    cta: role === "creator" ? t("momentum.createDrop") : t("momentum.findDrop"),
                  },
                  {
                    icon: Calendar,
                    label: t("momentum.landAttention"),
                    body: t("momentum.landBody"),
                    href: "/pulse",
                    cta: t("momentum.openPulse"),
                  },
                  {
                    icon: Ticket,
                    label: t("momentum.claimWeight"),
                    body: t("momentum.claimBody"),
                    href: "/promoshare",
                    cta: t("momentum.viewReceipt"),
                  },
                  {
                    icon: Gem,
                    label: t("momentum.backUpside"),
                    body: t("momentum.backBody"),
                    href: "/marketplace",
                    cta: t("momentum.explorePieces"),
                  },
                ].map((action) => (
                  <ActionLane key={action.label} {...action} />
                ))}
              </motion.div>
            )}

            {/* TAB 3: MARKETS & LANES */}
            {sidebarTab === "markets" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Contributor Lanes */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <p className="font-black text-sm text-foreground">{t("momentum.contributorLanes")}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">{t("momentum.rank")}</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      [t("momentum.laneEarly"), t("momentum.laneEarlyCopy"), "2.4x"],
                      [t("momentum.laneProof"), t("momentum.laneProofCopy"), "+6"],
                      [t("momentum.laneConviction"), t("momentum.laneConvictionCopy"), "VIP"],
                    ].map(([title, body, value]) => (
                      <div
                        key={title}
                        className="rounded-lg border border-border/60 bg-background/60 p-2.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold text-xs text-foreground">{title}</p>
                          <p className="text-[10px] text-muted-foreground">{body}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold">{value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conviction Markets */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="font-black text-sm text-foreground">{t("momentum.convictionMarkets")}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">{t("momentum.upside")}</Badge>
                  </div>
                  <div className="space-y-2">
                    {contentPieces.map((piece) => (
                      <Link
                        key={piece.id}
                        to={`/pieces/${piece.piece_type}/${piece.asset_id || piece.id}`}
                        className="group block rounded-lg border border-border/60 bg-background/60 p-2.5 hover:border-primary/50 transition-colors"
                      >
                        <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {piece.asset?.title || piece.asset?.name || piece.title || t("momentum.contentPiece")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                          {piece.piece_type} · {t("momentum.volume", { count: Number(piece.volume_24h || 0).toLocaleString() })}
                        </p>
                      </Link>
                    ))}
                    {!contentPieces.length && (
                      <p className="text-xs text-muted-foreground text-center py-3">{t("momentum.noMarkets")}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
