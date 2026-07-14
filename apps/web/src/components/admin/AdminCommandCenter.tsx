import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle2,
  CircleDot, Clock3, Gem, LifeBuoy, Megaphone, Radar, Scale,
  ShieldCheck, Sparkles, TrendingUp, Users, WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers, useModerationOverview, usePlatformStats } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

const priorityStyle: Record<WorkItem["priority"], string> = {
  critical: "border-red-500/25 bg-red-500/[0.08] text-red-700 dark:text-red-300",
  high: "border-amber-500/30 bg-amber-500/[0.1] text-amber-700 dark:text-amber-300",
  growth: "border-sky-500/25 bg-sky-500/[0.08] text-sky-700 dark:text-sky-300",
};

const priorityLabel: Record<WorkItem["priority"], string> = {
  critical: "Protect",
  high: "Unblock",
  growth: "Grow",
};

const formatNumber = (value: number) => Number(value || 0).toLocaleString();

function SignalTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-black leading-none tracking-tight md:text-3xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-black">{value}</p>
    </div>
  );
}

function ProgressRail({ value }: { value: number }) {
  const width = Math.max(6, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]" style={{ width: `${width}%` }} />
    </div>
  );
}

const operatingOrder: Array<{ icon: LucideIcon; label: string; text: string }> = [
  { icon: AlertTriangle, label: "Protect", text: "Safety, support, compliance" },
  { icon: Clock3, label: "Unblock", text: "Payouts, KYC, access" },
  { icon: CalendarClock, label: "Supply", text: "Hosts and live moments" },
  { icon: Building2, label: "Demand", text: "Brands and funded campaigns" },
  { icon: Sparkles, label: "Prove", text: "Reports and repeat business" },
];

const controlLinks: Array<{ href: string; label: string; icon: LucideIcon; tone: string }> = [
  { href: "/admin?tab=users", label: "User control", icon: Users, tone: "text-primary" },
  { href: "/admin?tab=support", label: "Support queue", icon: LifeBuoy, tone: "text-red-600 dark:text-red-300" },
  { href: "/admin?tab=proof-builder", label: "Proof readiness", icon: Radar, tone: "text-emerald-600 dark:text-emerald-300" },
  { href: "/admin?tab=compiler", label: "Campaign compiler", icon: Megaphone, tone: "text-amber-600 dark:text-amber-300" },
];

const escalationCopy: Record<WorkItem["priority"], string> = {
  critical: "Human impact first",
  high: "Value is waiting",
  growth: "Growth leverage",
};

export function AdminCommandCenter() {
  const { session } = useAuth();
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
        title: "Resolve support escalations",
        detail: `${op?.support.high_priority_open || 0} high priority · oldest open ${Math.round(op?.support.oldest_open_hours || 0)}h`,
        count: op?.support.open_escalations || 0,
        priority: "critical",
        owner: "Support operations",
        href: "/admin?tab=support",
        closeWhen: "Every escalation has an owner, response, and resolution date.",
        icon: LifeBuoy,
        metricLabel: "open",
      },
      {
        id: "trust",
        title: "Clear trust and moderation queues",
        detail: `${mod?.pending_proofs || 0} proofs · ${mod?.pending_content || 0} content · ${flaggedUsers} flagged users`,
        count: (mod?.pending_proofs || 0) + (mod?.pending_content || 0) + flaggedUsers,
        priority: "critical",
        owner: "Trust & safety",
        href: "/admin?tab=moderation",
        closeWhen: "Every item is approved, rejected with reason, or escalated.",
        icon: Scale,
        metricLabel: "reviews",
      },
      {
        id: "money",
        title: "Release blocked value",
        detail: `${op?.redemptions.pending_requests || 0} redemptions · ${(op?.kyc.pending_review || 0) + (op?.kyc.in_review || 0)} KYC reviews`,
        count: (op?.redemptions.pending_requests || 0) + (op?.kyc.pending_review || 0) + (op?.kyc.in_review || 0),
        priority: "high",
        owner: "Finance & compliance",
        href: "/admin?tab=operations",
        closeWhen: "Qualified users receive value and exceptions have documented reasons.",
        icon: WalletCards,
        metricLabel: "blocked",
      },
      {
        id: "supply",
        title: "Grow reliable moment supply",
        detail: `${stats.data?.momentsThisWeek || 0} moments this week across ${hostSupply} hosts`,
        count: Math.max(0, 10 - (stats.data?.momentsThisWeek || 0)),
        priority: "growth",
        owner: "Host success",
        href: "/admin?tab=applications",
        closeWhen: "At least 10 new, joinable moments are live this week.",
        icon: CalendarClock,
        metricLabel: "to target",
      },
      {
        id: "demand",
        title: "Convert brands into funded demand",
        detail: `${stats.data?.totalCampaigns || 0} campaigns · ${stats.data?.totalRewards || 0} rewards issued`,
        count: Math.max(0, 5 - (stats.data?.totalCampaigns || 0)),
        priority: "growth",
        owner: "Brand success",
        href: "/admin?tab=compiler",
        closeWhen: "Five active campaigns have funded incentives and measurable outcomes.",
        icon: Building2,
        metricLabel: "to target",
      },
    ].sort((a, b) => {
      const rank = { critical: 0, high: 1, growth: 2 };
      return rank[a.priority] - rank[b.priority] || b.count - a.count;
    });
  }, [moderation.data, operations.data, stats.data, users.data]);

  const loading = stats.isLoading || users.isLoading || moderation.isLoading || operations.isLoading;
  const openLoops = work.filter((item) => item.count > 0).length;
  const totalWork = work.reduce((sum, item) => sum + item.count, 0);
  const criticalWork = work.filter((item) => item.priority === "critical").reduce((sum, item) => sum + item.count, 0);
  const topWork = work.find((item) => item.count > 0) || work[0];
  const hostSupply = users.data?.filter((user) => user.roles?.includes("host")).length || 0;
  const liveActivationRate = operations.data?.usage.live_accounts
    ? Math.round((operations.data.usage.live_participants_7d / operations.data.usage.live_accounts) * 100)
    : 0;
  const weeklyMomentProgress = Math.min(100, Math.round(((stats.data?.momentsThisWeek || 0) / 10) * 100));
  const campaignProgress = Math.min(100, Math.round(((stats.data?.totalCampaigns || 0) / 5) * 100));
  const operatingScore = Math.max(0, Math.min(100, 100 - criticalWork * 12 - Math.max(0, totalWork - criticalWork) * 4));

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-[linear-gradient(135deg,hsl(var(--foreground))_0%,hsl(var(--charcoal-light))_48%,hsl(var(--primary)/0.92)_100%)] text-white shadow-elevated">
        <div className="grid min-h-[280px] gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-7">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/10">Admin command center</Badge>
              <h2 className="max-w-4xl font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Run the platform from the few decisions that matter next.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                Triage harm, unblock value, and keep supply and demand moving without hunting through every admin tab.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/[0.08] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Top priority</p>
                <p className="mt-2 text-lg font-black text-white">{topWork?.title || "All clear"}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/[0.08] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Open loops</p>
                <p className="mt-2 text-3xl font-black text-white">{openLoops}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/[0.08] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Operating score</p>
                <p className="mt-2 text-3xl font-black text-white">{operatingScore}</p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/55">Live activation</p>
                <p className="mt-3 text-5xl font-black leading-none text-white">{liveActivationRate}%</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-primary">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-7 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/75">
                  <span>Moment supply</span>
                  <span>{stats.data?.momentsThisWeek || 0}/10</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(6, weeklyMomentProgress)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/75">
                  <span>Funded campaigns</span>
                  <span>{stats.data?.totalCampaigns || 0}/5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(6, campaignProgress)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SignalTile
          label="Customer risk"
          value={formatNumber(criticalWork)}
          hint="Support, proofs, content, and flagged users."
          icon={ShieldCheck}
          tone="bg-red-500/10 text-red-600 dark:text-red-300"
        />
        <SignalTile
          label="Value queue"
          value={formatNumber((operations.data?.redemptions.pending_requests || 0) + (operations.data?.kyc.pending_review || 0) + (operations.data?.kyc.in_review || 0))}
          hint="Redemptions plus KYC reviews waiting."
          icon={WalletCards}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-300"
        />
        <SignalTile
          label="Live accounts"
          value={formatNumber(operations.data?.usage.live_accounts || 0)}
          hint={`${formatNumber(operations.data?.usage.live_participants_7d || 0)} active participants in 7 days.`}
          icon={Users}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
        />
        <SignalTile
          label="Hosts online"
          value={formatNumber(hostSupply)}
          hint={`${formatNumber(stats.data?.momentsThisWeek || 0)} new moments this week.`}
          icon={Gem}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-300"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Card className="rounded-2xl">
          <CardHeader className="border-b border-border/70 bg-muted/20 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <CircleDot className="h-5 w-5 text-primary" />
                  Priority board
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">Ranked by customer harm, financial blockage, then growth leverage.</p>
              </div>
              <Badge variant="outline" className="shrink-0">{formatNumber(totalWork)} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {work.map((item) => (
              <Link key={item.id} to={item.href} className="group grid gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)_150px_auto] lg:items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${priorityStyle[item.priority]}`}>
                  {item.count ? <item.icon className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold leading-tight">{item.title}</p>
                    <Badge className={priorityStyle[item.priority]} variant="outline">
                      {priorityLabel[item.priority]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{item.owner}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                  <p className="mt-3 text-xs leading-5"><span className="font-semibold">Done when:</span> {item.closeWhen}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 lg:block lg:text-right">
                  <div>
                    <p className="text-2xl font-black leading-none">{formatNumber(item.count)}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{item.metricLabel}</p>
                  </div>
                  <p className="self-center rounded-lg bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground lg:mt-3 lg:inline-block">
                    {item.count > 0 ? escalationCopy[item.priority] : "Clear"}
                  </p>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 lg:block" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-2xl border-primary/20">
            <CardHeader className="p-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Operating order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0">
              {operatingOrder.map(({ icon: StepIcon, label, text }, index) => (
                <div key={label} className="grid grid-cols-[36px_1fr] gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">{index + 1}</div>
                  <div className="min-w-0 border-b border-border/60 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <StepIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-bold">{label}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Quick control</p>
              <div className="grid gap-2">
                {controlLinks.map(({ href, label, icon: Icon, tone }) => (
                  <Button key={href} asChild variant="outline" className="h-11 w-full justify-between rounded-xl">
                    <Link to={href}>
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
                        <span className="truncate">{label}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Growth gauges</p>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">Weekly moment supply</p>
                    <p className="text-xs font-black text-muted-foreground">{weeklyMomentProgress}%</p>
                  </div>
                  <ProgressRail value={weeklyMomentProgress} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">Campaign readiness</p>
                    <p className="text-xs font-black text-muted-foreground">{campaignProgress}%</p>
                  </div>
                  <ProgressRail value={campaignProgress} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniMetric label="rewards" value={formatNumber(stats.data?.totalRewards || 0)} />
                <MiniMetric label="campaigns" value={formatNumber(stats.data?.totalCampaigns || 0)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
