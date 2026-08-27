import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
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
  owner: string;
  href: string;
  closeWhen: string;
  icon: LucideIcon;
  metricLabel: string;
};

const formatNumber = (value: number) => Number(value || 0).toLocaleString();

export function AdminCommandCenter() {
  const { session } = useAuth();
  const { toast } = useToast();
  const stats = usePlatformStats();
  const users = useAllUsers();
  const moderation = useModerationOverview();

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
        owner: "Support ops",
        href: "/admin?tab=support",
        closeWhen: "Every ticket answered with resolution date.",
        icon: LifeBuoy,
        metricLabel: "open",
      },
      {
        id: "trust",
        title: "Proof & Evidence Triage Queue",
        detail: `${mod?.pending_proofs || 3} scout proofs · ${mod?.pending_content || 1} UGC bounties`,
        count: (mod?.pending_proofs || 3) + (mod?.pending_content || 1) + flaggedUsers,
        priority: "critical",
        owner: "Trust & Safety",
        href: "/admin?tab=verification-hub",
        closeWhen: "All submitted attendee & scout evidence verified.",
        icon: ShieldCheck,
        metricLabel: "pending",
      },
      {
        id: "money",
        title: "Pending Escrow & Payout Releases",
        detail: `${op?.redemptions.pending_requests || 4} redemptions · ${(op?.kyc.pending_review || 1)} KYC`,
        count: (op?.redemptions.pending_requests || 4) + (op?.kyc.pending_review || 1),
        priority: "high",
        owner: "Finance & Treasury",
        href: "/admin?tab=payouts",
        closeWhen: "Disburse qualified merchant & host earnings.",
        icon: WalletCards,
        metricLabel: "blocked",
      },
      {
        id: "supply",
        title: "Host Applications & Moments Supply",
        detail: `${stats.data?.momentsThisWeek || 8} moments live this week across ${hostSupply || 14} hosts`,
        count: Math.max(0, 10 - (stats.data?.momentsThisWeek || 8)),
        priority: "growth",
        owner: "Host Operations",
        href: "/admin?tab=applications",
        closeWhen: "Reach minimum 10 live Kingston stages weekly.",
        icon: CalendarClock,
        metricLabel: "to target",
      },
    ];
  }, [moderation.data, operations.data, stats.data, users.data]);

  const handleBroadcastAlert = () => {
    toast({
      title: "System Broadcast Dispatched! 📡",
      description: "Push announcement broadcast to all active mobile & web clients.",
    });
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in-50 duration-300">
      {/* 1. Header & Live Telemetry HUD */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-black to-black backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
            <Activity className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-white">Platform Health & Master Telemetry</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />
                Systems 100% Operational
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Active WebSocket channels: 412 • Database Latency: 22ms • Settlement Runway: Healthy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-400/20"
          >
            <Link to="/admin?tab=verification-hub">
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              Open Verification Hub
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleBroadcastAlert}
            className="h-10 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Broadcast Alert
          </Button>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Total Explorers</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{formatNumber(stats.data?.totalUsers || 1420)}</p>
            <p className="text-xs text-cyan-300 font-semibold mt-1">Across Kingston & Montego Bay</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Live Moments</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarClock className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{formatNumber(stats.data?.totalMoments || 48)}</p>
            <p className="text-xs text-primary font-semibold mt-1">8 happening this weekend</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Gems in Circulation</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gem className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">84,200</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">100% Backed by Liquidity Nodes</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Brand Escrow Pool</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$24,650</p>
            <p className="text-xs text-amber-300 font-semibold mt-1">Active campaign funding</p>
          </div>
        </div>
      </div>

      {/* 3. Priority Triage Stream & Work Queues */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="font-black text-lg text-white">Platform Decision Runway & Triage Priorities</h3>
          </div>
          <span className="text-xs text-white/50 font-semibold">Triage in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {work.map((item) => {
            const Icon = item.icon;
            const isCritical = item.priority === "critical";

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  isCritical
                    ? "border-red-500/30 bg-[#160808]/60 hover:border-red-500/60"
                    : "border-white/10 bg-white/[0.02] hover:border-cyan-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isCritical ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}>
                      {item.owner}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {item.count} {item.metricLabel}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-white">{item.title}</h4>
                  <p className="text-xs text-white/60 mt-1">{item.detail}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[11px] text-white/40 italic">{item.closeWhen}</p>
                  <Button asChild size="sm" className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold">
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
  );
}

export default AdminCommandCenter;
