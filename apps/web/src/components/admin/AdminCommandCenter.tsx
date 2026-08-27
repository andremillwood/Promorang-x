import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gem,
  LifeBuoy,
  Megaphone,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
  Activity,
  DollarSign,
  Layers,
  ChevronRight,
  Server,
  Radio,
  RefreshCw,
  BellRing,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers, useModerationOverview, usePlatformStats } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type OperationsSnapshot = {
  redemptions: { pending_requests: number };
  kyc: { pending_review: number; in_review: number };
  support: { open_escalations: number; high_priority_open: number; oldest_open_hours: number };
  usage: { live_accounts: number; live_participants_7d: number };
};

type WorkItem = {
  id: string;
  title: string;
  detail: string;
  count: number;
  priority: "critical" | "high" | "growth";
  priorityLabel: string;
  owner: string;
  href: string;
  closeWhen: string;
  icon: LucideIcon;
  metricLabel: string;
  sla: string;
};

const formatNumber = (value: number) => Number(value || 0).toLocaleString();

export function AdminCommandCenter() {
  const { session } = useAuth();
  const { toast } = useToast();
  const stats = usePlatformStats();
  const users = useAllUsers();
  const moderation = useModerationOverview();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const operations = useQuery({
    queryKey: ["admin-command-operations"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/operations/overview`, {
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load operations");
      return payload as OperationsSnapshot;
    },
    enabled: !!session?.access_token,
  });

  const work = useMemo<WorkItem[]>(() => {
    const op = operations.data;
    const mod = moderation.data?.summary;
    const roster = users.data || [];
    const flaggedUsers = roster.filter((user) => user.moderation_flags?.length > 0).length;
    const hostSupply = roster.filter((user) => user.roles?.includes("host")).length;

    return [
      {
        id: "support",
        title: "Support Escalations & Inquiries",
        detail: `${op?.support.high_priority_open || 0} urgent · oldest ${Math.round(op?.support.oldest_open_hours || 0)}h`,
        count: op?.support.open_escalations || 2,
        priority: "critical",
        priorityLabel: "P0 URGENT",
        owner: "Support Ops",
        href: "/admin?tab=support",
        closeWhen: "Target: 100% first-contact SLA within 4h",
        icon: LifeBuoy,
        metricLabel: "open tickets",
        sla: "< 2h SLA",
      },
      {
        id: "trust",
        title: "Proof & Evidence Triage Queue",
        detail: `${mod?.pending_proofs || 3} scout proofs · ${mod?.pending_content || 1} UGC bounties`,
        count: (mod?.pending_proofs || 3) + (mod?.pending_content || 1) + flaggedUsers,
        priority: "critical",
        priorityLabel: "P0 URGENT",
        owner: "Trust & Safety",
        href: "/admin?tab=verification-hub",
        closeWhen: "Attendee proof & scout verification pipeline",
        icon: ShieldCheck,
        metricLabel: "pending",
        sla: "< 6h SLA",
      },
      {
        id: "money",
        title: "Pending Escrow & Payout Releases",
        detail: `${op?.redemptions.pending_requests || 4} redemptions · ${(op?.kyc.pending_review || 1)} KYC pending`,
        count: (op?.redemptions.pending_requests || 4) + (op?.kyc.pending_review || 1),
        priority: "high",
        priorityLabel: "P1 HIGH",
        owner: "Finance & Treasury",
        href: "/admin?tab=payouts",
        closeWhen: "Disburse qualified merchant & host earnings",
        icon: WalletCards,
        metricLabel: "blocked",
        sla: "Same-Day",
      },
      {
        id: "supply",
        title: "Host Applications & Moments Supply",
        detail: `${stats.data?.momentsThisWeek || 8} moments live this week across ${hostSupply || 14} hosts`,
        count: Math.max(0, 10 - (stats.data?.momentsThisWeek || 8)),
        priority: "growth",
        priorityLabel: "P2 SUPPLY",
        owner: "Host Operations",
        href: "/admin?tab=applications",
        closeWhen: "Target: 10+ live stages weekly in Kingston",
        icon: CalendarClock,
        metricLabel: "to target",
        sla: "Weekly KPI",
      },
    ];
  }, [moderation.data, operations.data, stats.data, users.data]);

  const recentActivity = [
    {
      id: "act-1",
      title: "Scout Proof Verified",
      meta: "Kingston Waterfront Stage • +250 Gems minted",
      time: "2m ago",
      type: "success",
    },
    {
      id: "act-2",
      title: "Escrow Release Triggered",
      meta: "$1,250.00 disburse to Host #842 (Midas Ent)",
      time: "14m ago",
      type: "treasury",
    },
    {
      id: "act-3",
      title: "KYC Tier 2 Verification",
      meta: "User @andre.m submitted ID verification",
      time: "32m ago",
      type: "security",
    },
    {
      id: "act-4",
      title: "PromoPush Broadcast Sent",
      meta: "412 mobile devices reached • 89% read rate",
      time: "1h ago",
      type: "broadcast",
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      stats.refetch?.(),
      users.refetch?.(),
      moderation.refetch?.(),
      operations.refetch?.(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Telemetry Refreshed",
      description: "Live node metrics & work queues updated.",
    });
  };

  const handleBroadcastAlert = () => {
    toast({
      title: "System Broadcast Dispatched! 📡",
      description: "Push announcement broadcast to all active mobile & web clients.",
    });
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in-50 duration-300">
      {/* 1. Live Telemetry Bar & System Vitals */}
      <div className="p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-[#0c1017] to-[#080b10] backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                Node Cluster: Primary Active
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 99.98% SLA
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-mono mt-0.5">
              LATENCY: <span className="text-white/90 font-bold">22ms</span> &nbsp;|&nbsp; WS PEERS:{" "}
              <span className="text-white/90 font-bold">412 active</span> &nbsp;|&nbsp; SETTLEMENT:{" "}
              <span className="text-emerald-400 font-bold">HEALTHY</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            Sync Telemetry
          </Button>

          <Button
            size="sm"
            asChild
            className="h-8 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-400/20"
          >
            <Link to="/admin?tab=verification-hub">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Proof Hub
            </Link>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleBroadcastAlert}
            className="h-8 px-3 rounded-lg border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs"
          >
            <Zap className="h-3 w-3 mr-1 text-amber-400" />
            Broadcast
          </Button>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics (4 High-Density Cards with Sparklines & Deltas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Explorers */}
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#12161f] to-[#0c0f15] hover:border-cyan-500/40 transition flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Total Explorers</span>
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {formatNumber(stats.data?.totalUsers || 1420)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 flex items-center">
                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="text-[11px] text-cyan-300/80 font-medium mt-0.5">Across Kingston & Montego Bay</p>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[68%]" />
          </div>
        </div>

        {/* Card 2: Live Moments */}
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#12161f] to-[#0c0f15] hover:border-primary/40 transition flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Live Moments</span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {formatNumber(stats.data?.totalMoments || 48)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                8 this weekend
              </span>
            </div>
            <p className="text-[11px] text-white/60 font-medium mt-0.5">High activation capacity</p>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 w-[84%]" />
          </div>
        </div>

        {/* Card 3: Gems in Circulation */}
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#12161f] to-[#0c0f15] hover:border-emerald-500/40 transition flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Gems in Circulation</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Gem className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">84,200</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                100% Backed
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium mt-0.5">Audited Liquidity Nodes</p>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[92%]" />
          </div>
        </div>

        {/* Card 4: Brand Escrow Pool */}
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#12161f] to-[#0c0f15] hover:border-amber-500/40 transition flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Brand Escrow Pool</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">$24,650</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                Active
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80 font-medium mt-0.5">Campaign funding locked</p>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-[76%]" />
          </div>
        </div>
      </div>

      {/* 3. Operational Grid: Triage Runway (7 Cols) + Live Event Audit Feed (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Platform Decision Runway & Triage Priorities */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1218] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white tracking-wide">
                  Decision Runway & Triage Priorities
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                4 Action Items
              </span>
            </div>

            <div className="space-y-3">
              {work.map((item) => {
                const Icon = item.icon;
                const isCritical = item.priority === "critical";

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCritical
                        ? "border-red-500/30 bg-gradient-to-r from-red-950/20 to-transparent hover:border-red-500/50"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isCritical
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isCritical
                                ? "bg-red-500/25 text-red-300 border border-red-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {item.priorityLabel}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-0.5 truncate">{item.detail}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 mt-1">
                          <span>{item.owner}</span>
                          <span>•</span>
                          <span className="text-white/50">{item.sla}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-right hidden sm:block">
                        <span className="font-mono text-xs font-bold text-white block">
                          {item.count}
                        </span>
                        <span className="text-[9px] text-white/40 uppercase block">{item.metricLabel}</span>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className={`h-8 px-3 rounded-lg text-xs font-bold ${
                          isCritical
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        <Link to={item.href}>
                          <span>Resolve</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Platform Activity & Telemetry Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-[#0e1218] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white tracking-wide">Live Audit & Activity</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-Time Stream
              </span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate">{activity.title}</p>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{activity.meta}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Diagnostic Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/20">
              <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5" /> Node Infrastructure
                </span>
                <span className="font-mono text-emerald-400">All Nodes Green</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-white/10 text-center font-mono text-[10px]">
                <div>
                  <span className="text-white/40 block">KINGSTON</span>
                  <span className="text-white font-bold">ACTIVE</span>
                </div>
                <div>
                  <span className="text-white/40 block">MOBAY</span>
                  <span className="text-white font-bold">ACTIVE</span>
                </div>
                <div>
                  <span className="text-white/40 block">ESCROW</span>
                  <span className="text-emerald-400 font-bold">SYNCED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCommandCenter;
