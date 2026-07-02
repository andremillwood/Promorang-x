import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle2,
  CircleDot, Clock3, LifeBuoy, ShieldCheck, Sparkles, Users,
} from "lucide-react";
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
};

const priorityStyle = {
  critical: "border-red-500/25 bg-red-500/[0.06] text-red-700",
  high: "border-amber-500/25 bg-amber-500/[0.06] text-amber-700",
  growth: "border-sky-500/25 bg-sky-500/[0.06] text-sky-700",
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
    const flaggedUsers = roster.filter((user) => user.moderation_flags.length > 0).length;
    const hostSupply = roster.filter((user) => user.roles.includes("host")).length;

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
      },
    ].sort((a, b) => {
      const rank = { critical: 0, high: 1, growth: 2 };
      return rank[a.priority] - rank[b.priority] || b.count - a.count;
    });
  }, [moderation.data, operations.data, stats.data, users.data]);

  const loading = stats.isLoading || users.isLoading || moderation.isLoading || operations.isLoading;
  const openLoops = work.filter((item) => item.count > 0).length;
  const liveActivationRate = operations.data?.usage.live_accounts
    ? Math.round((operations.data.usage.live_participants_7d / operations.data.usage.live_accounts) * 100)
    : 0;

  if (loading) {
    return <div className="grid gap-4 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(125deg,hsl(var(--card))_20%,hsl(var(--primary)/0.09))] p-6 md:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-primary/10" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">Platform command center</Badge>
            <h2 className="max-w-3xl font-serif text-3xl font-bold tracking-tight md:text-5xl">
              Close the loops that make Promorang trustworthy and repeatable.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Work in order: protect users, release earned value, grow moment supply, then turn verified outcomes into funded demand.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
              <p className="text-3xl font-black">{openLoops}</p>
              <p className="text-xs text-muted-foreground">open operating loops</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
              <p className="text-3xl font-black">{liveActivationRate}%</p>
              <p className="text-xs text-muted-foreground">7-day live activation</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2"><CircleDot className="h-5 w-5 text-primary" />Needs attention now</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Ranked by customer harm, financial blockage, then growth leverage.</p>
              </div>
              <Badge variant="outline">{work.reduce((sum, item) => sum + item.count, 0)} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {work.map((item) => (
              <Link key={item.id} to={item.href} className="group grid gap-3 p-5 transition-colors hover:bg-muted/30 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${priorityStyle[item.priority]}`}>
                  {item.count ? <span className="font-black">{item.count}</span> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{item.title}</p>
                    <Badge variant="outline" className="text-[10px]">{item.owner}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  <p className="mt-2 text-xs"><span className="font-semibold">Closed when:</span> {item.closeWhen}</p>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 md:block" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-emerald-500/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-emerald-600" />Operating order</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                [AlertTriangle, "Protect", "Safety, support, compliance"],
                [Clock3, "Unblock", "Payouts, KYC, access"],
                [CalendarClock, "Supply", "Hosts and live moments"],
                [Building2, "Demand", "Brands and funded campaigns"],
                [Sparkles, "Prove", "Reports and repeat business"],
              ].map(([Icon, label, text], index) => {
                const StepIcon = Icon as typeof Users;
                return <div key={String(label)} className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">{index + 1}</div><StepIcon className="mt-1 h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-bold">{String(label)}</p><p className="text-xs text-muted-foreground">{String(text)}</p></div></div>;
              })}
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Quick control</p>
              <Button asChild variant="outline" className="w-full justify-between"><Link to="/admin?tab=users"><span className="flex items-center gap-2"><Users className="h-4 w-4" />User control</span><ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" className="w-full justify-between"><Link to="/admin?tab=support"><span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4" />Support queue</span><ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild className="w-full justify-between"><Link to="/admin?tab=proof-builder"><span>Proof readiness</span><ArrowRight className="h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
