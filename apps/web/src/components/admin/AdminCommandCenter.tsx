import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, LifeBuoy, RefreshCw, ShieldCheck, Users, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers, useModerationOverview, usePlatformStats } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { JobFirstWorkspaceGuide } from "@/components/dashboard/JobFirstWorkspaceGuide";

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
  href: string;
  closeWhen: string;
  icon: LucideIcon;
};

const formatNumber = (value: number | null | undefined) => Number(value || 0).toLocaleString();

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
    const pendingProof = Number(mod?.pending_proofs || 0);
    const pendingContent = Number(mod?.pending_content || 0);
    const pendingPayouts = Number(op?.redemptions.pending_requests || 0);
    const pendingKyc = Number(op?.kyc.pending_review || 0);
    const weeklyMoments = Number(stats.data?.momentsThisWeek || 0);

    return [
      {
        id: "support",
        title: "Support escalations",
        detail: `${Number(op?.support.high_priority_open || 0)} high priority · oldest ${Math.round(Number(op?.support.oldest_open_hours || 0))}h`,
        count: Number(op?.support.open_escalations || 0),
        href: "/admin?tab=support",
        closeWhen: "Resolve or route every open escalation with an auditable owner.",
        icon: LifeBuoy,
      },
      {
        id: "trust",
        title: "Proof and moderation decisions",
        detail: `${pendingProof} proofs · ${pendingContent} content items · ${flaggedUsers} flagged users`,
        count: pendingProof + pendingContent + flaggedUsers,
        href: "/admin?tab=verification-hub",
        closeWhen: "Every item has a verification or moderation decision.",
        icon: ShieldCheck,
      },
      {
        id: "money",
        title: "Payout and KYC blockers",
        detail: `${pendingPayouts} redemption requests · ${pendingKyc} KYC reviews`,
        count: pendingPayouts + pendingKyc,
        href: "/admin?tab=payouts",
        closeWhen: "Qualified payouts are released and blocked cases have a documented reason.",
        icon: WalletCards,
      },
      {
        id: "supply",
        title: "Moment supply",
        detail: `${weeklyMoments} Moments created this week across ${hostSupply} host accounts`,
        count: Math.max(0, 10 - weeklyMoments),
        href: "/admin?tab=applications",
        closeWhen: "Reach or deliberately revise the current weekly supply target of 10 Moments.",
        icon: CalendarClock,
      },
    ];
  }, [moderation.data, operations.data, stats.data, users.data]);

  const highestPriority = [...work].sort((a, b) => b.count - a.count)[0];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      stats.refetch?.(),
      users.refetch?.(),
      moderation.refetch?.(),
      operations.refetch?.(),
    ]);
    setIsRefreshing(false);
    toast({ title: "Operations refreshed", description: "Current queues and platform counts were reloaded." });
  };

  const metrics = [
    { label: "Users", value: stats.data?.totalUsers, helper: `${formatNumber(stats.data?.activeUsersThisWeek)} participations this week`, icon: Users },
    { label: "Moments", value: stats.data?.totalMoments, helper: `${formatNumber(stats.data?.momentsThisWeek)} created this week`, icon: CalendarClock },
    { label: "Verified check-ins", value: stats.data?.totalCheckIns, helper: `${formatNumber(stats.data?.totalParticipations)} total participation records`, icon: ShieldCheck },
    { label: "Open exceptions", value: work.reduce((sum, item) => sum + item.count, 0), helper: "Items that currently require an admin decision", icon: LifeBuoy },
  ];

  const isLoading = stats.isLoading || users.isLoading || moderation.isLoading || operations.isLoading;

  return (
    <div className="space-y-6 text-white animate-in fade-in-50 duration-300">
      <JobFirstWorkspaceGuide
        role="admin"
        context="Platform administration"
        purpose="Keep Promorang trustworthy and moving by resolving the highest-value exception, failure, dispute, verification decision, or operational blocker first."
        outcome="Restore healthy operation where the system currently needs intervention."
        proof="A closed queue item, recorded verification or moderation decision, released or explained payout, resolved support case, or auditable operational record."
        nextIfWorks="Move to the next highest-priority exception, then use recurring patterns to improve the system so the same problem happens less often."
        primaryAction={highestPriority ? { label: `Open ${highestPriority.title}`, href: highestPriority.href } : undefined}
      />

      <section className="rounded-3xl border border-cyan-500/20 bg-cyan-950/15 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">What needs attention</p>
            <h2 className="mt-2 text-2xl font-black text-white">Work the exceptions, not the dashboard.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              Counts below come from the current platform queries. Zero is allowed; no synthetic live status or placeholder telemetry is used here.
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{metric.label}</p>
                  {isLoading ? <Skeleton className="mt-2 h-8 w-20 bg-white/10" /> : <p className="mt-2 text-3xl font-black text-white">{formatNumber(metric.value)}</p>}
                </div>
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">{metric.helper}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Decision queue</p>
            <h2 className="mt-2 text-xl font-black text-white">Resolve what is blocking trust or movement.</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {work.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.href} className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300"><Icon className="h-4 w-4" /></div>
                    <div>
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-white/50">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-cyan-300">{item.count}</span>
                </div>
                <p className="mt-3 border-t border-white/5 pt-3 text-[11px] leading-5 text-white/45">Done when: {item.closeWhen}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminCommandCenter;
