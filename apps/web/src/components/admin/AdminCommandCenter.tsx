import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  HeartPulse,
  LifeBuoy,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers, useModerationOverview, usePlatformStats } from "@/hooks/useAdmin";
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
        closeWhen: "Every open escalation has an owner, resolution, or explicit next step.",
        icon: LifeBuoy,
      },
      {
        id: "trust",
        title: "Proof and moderation decisions",
        detail: `${pendingProof} proofs · ${pendingContent} content items · ${flaggedUsers} flagged users`,
        count: pendingProof + pendingContent + flaggedUsers,
        href: "/admin?tab=verification-hub",
        closeWhen: "Every item has a recorded verification or moderation decision.",
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
        closeWhen: "Current supply is sufficient or the operating target has been deliberately revised.",
        icon: CalendarClock,
      },
    ];
  }, [moderation.data, operations.data, stats.data, users.data]);

  const highestPriority = [...work].sort((a, b) => b.count - a.count)[0];
  const openExceptions = work.reduce((sum, item) => sum + item.count, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([stats.refetch?.(), users.refetch?.(), moderation.refetch?.(), operations.refetch?.()]);
    setIsRefreshing(false);
    toast({ title: "Operations refreshed", description: "Current queues and platform counts were reloaded." });
  };

  const destinations = [
    {
      label: "Cases",
      icon: LifeBuoy,
      href: "/admin?tab=support",
      title: "Resolve exceptions",
      copy: "Support, disputes, blocked journeys and operator-owned follow-up.",
    },
    {
      label: "Review",
      icon: ShieldCheck,
      href: "/admin?tab=verification-hub",
      title: "Decide what counts",
      copy: "Proof, identity, host applications, content and evidence end in an auditable decision.",
    },
    {
      label: "Economy",
      icon: CircleDollarSign,
      href: "/admin?tab=payouts",
      title: "Protect value movement",
      copy: "Payouts, KYC, Gems, access and commerce exceptions stay source-distinct.",
    },
    {
      label: "Health",
      icon: HeartPulse,
      href: "/admin?tab=audit",
      title: "Inspect integrity",
      copy: "Audit and platform health answer system questions without rewriting source history.",
    },
  ];

  const metrics = [
    { label: "Users", value: stats.data?.totalUsers, helper: `${formatNumber(stats.data?.activeUsersThisWeek)} participations this week`, icon: Users },
    { label: "Moments", value: stats.data?.totalMoments, helper: `${formatNumber(stats.data?.momentsThisWeek)} created this week`, icon: CalendarClock },
    { label: "Verified check-ins", value: stats.data?.totalCheckIns, helper: `${formatNumber(stats.data?.totalParticipations)} total participation records`, icon: ShieldCheck },
    { label: "Open exceptions", value: openExceptions, helper: "Items currently requiring an admin decision", icon: Scale },
  ];

  const isLoading = stats.isLoading || users.isLoading || moderation.isLoading || operations.isLoading;
  const PrimaryIcon = highestPriority?.icon || Activity;

  return (
    <div className="space-y-10 pb-16 text-white animate-in fade-in-50 duration-300">
      <section className="relative min-h-[430px] overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#090909]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,101,0,.24),transparent_28%),radial-gradient(circle_at_28%_85%,rgba(214,178,90,.08),transparent_34%),linear-gradient(120deg,#080808_0%,#0c0c0c_62%,#170b05_100%)]" />
        <div className="absolute right-[-8%] top-[-25%] h-[460px] w-[460px] rounded-full border border-[#ff6500]/10" />
        <div className="absolute right-[4%] top-[-6%] h-[280px] w-[280px] rounded-full border border-[#f4c66c]/10" />

        <div className="relative z-10 grid min-h-[430px] gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_360px] lg:p-11">
          <div className="flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-[#ff8a45]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff6500] shadow-[0_0_14px_rgba(255,101,0,.9)]" />Admin · Today</p>
                <p className="mt-3 text-sm font-semibold text-white/48">Source truth before intervention.</p>
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="rounded-full border-white/12 bg-black/30 text-white hover:bg-white/10">
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>

            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/55">One intervention now</p>
              <h1 className="mt-3 font-['Anton'] text-[3.35rem] font-normal uppercase leading-[.88] tracking-[-.035em] text-white sm:text-[4.7rem] lg:text-[5.1rem]">Protect the <span className="text-[#ff6500]">record.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/62 sm:text-base">PROMORANG admin exists to resolve exceptions without collapsing source, claim, decision and correction into one opaque status.</p>
            </div>
          </div>

          <div className="self-end rounded-2xl border border-[#ff6500]/25 bg-black/55 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff8a45]">Highest priority</p>
                <p className="mt-2 font-serif text-2xl font-bold leading-tight text-white">{highestPriority?.title || "No urgent exception"}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[#ff6500]/25 bg-[#ff6500]/10 text-[#ff8a45]"><PrimaryIcon className="h-5 w-5" /></span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div><p className="font-['Anton'] text-5xl text-white">{highestPriority?.count ?? 0}</p><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/35">items needing a decision</p></div>
              <Link to={highestPriority?.href || "/admin?tab=operations"} className="inline-flex min-h-11 items-center gap-5 rounded-md bg-[#ff6500] px-4 text-xs font-black text-black">Open queue <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="admin-operating-surfaces">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Operating surfaces</p><h2 id="admin-operating-surfaces" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Where the record needs you.</h2></div>
          <p className="hidden max-w-sm text-right text-xs leading-5 text-white/38 sm:block">Same platform world, but the admin lens prioritizes source, exception, decision and correction.</p>
        </div>
        <div className="pr-scroll-rail mt-5 flex snap-x gap-3 overflow-x-auto pb-2">
          {destinations.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.href} className="group min-h-[210px] min-w-[78%] snap-start rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.015))] p-5 transition hover:border-[#ff6500]/35 sm:min-w-[300px] lg:min-w-[260px]">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff8a45]">0{index + 1} · {item.label}</span><Icon className="h-5 w-5 text-white/40 transition group-hover:text-[#ff8a45]" /></div>
                <div className="mt-12"><h3 className="font-serif text-2xl font-bold leading-tight">{item.title}</h3><p className="mt-3 text-xs leading-5 text-white/45">{item.copy}</p></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="admin-attention-queue">
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Attention queue</p><h2 id="admin-attention-queue" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Resolve what blocks trust or movement.</h2></div>
        <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
          {work.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.href} className="group grid gap-4 py-5 sm:grid-cols-[44px_1fr_auto] sm:items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.03] text-white/40 group-hover:border-[#ff6500]/30 group-hover:text-[#ff8a45]"><Icon className="h-4 w-4" /></span>
                <div><h3 className="text-sm font-black text-white">{item.title}</h3><p className="mt-1 text-xs leading-5 text-white/45">{item.detail}</p><p className="mt-2 text-[10px] leading-4 text-white/28">Done when: {item.closeWhen}</p></div>
                <div className="flex items-center gap-4 sm:justify-end"><span className="font-['Anton'] text-4xl text-[#ff8a45]">{item.count}</span><ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-white" /></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="admin-health-title">
        <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Platform state</p><h2 id="admin-health-title" className="mt-2 font-serif text-3xl font-bold tracking-[-.04em]">Health, without vanity.</h2></div><p className="hidden text-xs text-white/30 sm:block">Current source-backed counts only.</p></div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-[#0b0b0c] p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">{metric.label}</p>{isLoading ? <Skeleton className="mt-3 h-10 w-20 bg-white/10" /> : <p className="mt-3 font-['Anton'] text-5xl text-white">{formatNumber(metric.value)}</p>}</div><Icon className="h-4 w-4 text-[#ff8a45]" /></div>
                <p className="mt-2 text-xs leading-5 text-white/38">{metric.helper}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminCommandCenter;
