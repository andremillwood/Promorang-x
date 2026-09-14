import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, ClipboardCheck, LifeBuoy, RefreshCw, ShieldCheck, ShoppingBag, Users, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers, useModerationOverview, usePlatformStats } from "@/hooks/useAdmin";
import { canAccessAdminTab, type AdminAccessProfile } from "@/lib/admin-access";
import { Button } from "@/components/ui/button";
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
  description: string;
  href: string;
  action: string;
  icon: LucideIcon;
  count?: number;
  countLabel?: string;
  urgent?: boolean;
};

const ROLE_GUIDANCE: Record<AdminAccessProfile["level"], string[]> = {
  support: [
    "Find people and understand the context of their issue",
    "Respond to support cases and record useful internal notes",
    "Escalate identity, money, or policy decisions to the right owner",
  ],
  reviewer: [
    "Review identity, proof, application, and content evidence",
    "Record a clear reason for decisions that affect a person",
    "Escalate unclear or financially sensitive cases",
  ],
  operations: [
    "Run Moments, Activations, catalog, orders, and communications",
    "Resolve operational exceptions without changing owner-only policy",
    "Escalate payout approval, balance changes, and admin access",
  ],
  owner: [
    "Govern administrator access and platform safeguards",
    "Approve sensitive money, policy, and system decisions",
    "Review audit evidence and keep responsibilities appropriately delegated",
  ],
};

export function AdminCommandCenter({ accessProfile }: { accessProfile: AdminAccessProfile }) {
  const { session } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canReview = canAccessAdminTab(accessProfile.level, "verification-hub", accessProfile.capabilities);
  const canSeeReports = canAccessAdminTab(accessProfile.level, "overview", accessProfile.capabilities);
  const canSeeOperations = canAccessAdminTab(accessProfile.level, "operations", accessProfile.capabilities);
  const canSeePayouts = canAccessAdminTab(accessProfile.level, "payouts", accessProfile.capabilities);

  const stats = usePlatformStats(canSeeReports);
  const users = useAllUsers(true);
  const moderation = useModerationOverview(canReview);
  const operations = useQuery({
    queryKey: ["admin-command-operations"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/operations/overview`, {
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load operational work");
      return payload as OperationsSnapshot;
    },
    enabled: Boolean(session?.access_token && canSeeOperations),
  });

  const work = useMemo<WorkItem[]>(() => {
    const items: WorkItem[] = [];
    const operationData = operations.data;
    const moderationSummary = moderation.data?.summary;
    const roster = users.data || [];

    items.push({
      id: "support",
      title: "Help people",
      description: "Review open questions, respond clearly, and escalate cases that need another team.",
      href: "/admin?tab=support",
      action: "Open support",
      icon: LifeBuoy,
      count: operationData?.support.open_escalations,
      countLabel: "open escalations",
      urgent: Boolean(operationData?.support.high_priority_open),
    });
    items.push({
      id: "people",
      title: "Find a person",
      description: "Look up an account and understand the activity relevant to their request.",
      href: "/admin?tab=users",
      action: "Find a person",
      icon: Users,
      count: roster.length || undefined,
      countLabel: "accounts available",
    });

    if (canReview) {
      const reviewCount = moderationSummary
        ? Number(moderationSummary.pending_proofs || 0) + Number(moderationSummary.pending_content || 0)
        : undefined;
      items.unshift({
        id: "reviews",
        title: "Complete reviews",
        description: "Work through identity, participation evidence, applications, and reported content.",
        href: "/admin?tab=verification-hub",
        action: "Open reviews",
        icon: ClipboardCheck,
        count: reviewCount,
        countLabel: "waiting for review",
        urgent: Boolean(reviewCount),
      });
    }

    if (canAccessAdminTab(accessProfile.level, "moments", accessProfile.capabilities)) {
      items.push({
        id: "moments",
        title: "Review Moments and venues",
        description: "Find upcoming experiences, ownership questions, and information that needs attention.",
        href: "/admin?tab=moments",
        action: "Open experiences",
        icon: Calendar,
      });
    }
    if (canAccessAdminTab(accessProfile.level, "commerce", accessProfile.capabilities)) {
      items.push({
        id: "orders",
        title: "Resolve order issues",
        description: "Review orders, redemptions, receipts, and exceptions affecting customers or merchants.",
        href: "/admin?tab=commerce",
        action: "Open orders",
        icon: ShoppingBag,
        count: operationData?.redemptions.pending_requests,
        countLabel: "redemptions waiting",
      });
    }
    if (canSeePayouts) {
      items.push({
        id: "payouts",
        title: "Review payouts",
        description: "Check identity and supporting records before approving or rejecting money movement.",
        href: "/admin?tab=payouts",
        action: "Open payouts",
        icon: WalletCards,
        count: operationData?.redemptions.pending_requests,
        countLabel: "requests waiting",
        urgent: Boolean(operationData?.redemptions.pending_requests),
      });
    }
    return items;
  }, [accessProfile.capabilities, accessProfile.level, canReview, canSeePayouts, moderation.data, operations.data, users.data]);

  const loading = users.isLoading || moderation.isLoading || operations.isLoading || stats.isLoading;
  const hasLoadError = users.isError || moderation.isError || operations.isError || stats.isError;

  async function refresh() {
    setIsRefreshing(true);
    await Promise.all([
      users.refetch(),
      canReview ? moderation.refetch() : Promise.resolve(),
      canSeeOperations ? operations.refetch() : Promise.resolve(),
      canSeeReports ? stats.refetch() : Promise.resolve(),
    ]);
    setIsRefreshing(false);
  }

  return (
    <div className="space-y-6 text-white animate-in fade-in-50 duration-300">
      <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/35 via-[#0d1218] to-[#080b10] shadow-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Your admin home</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Start with the work that needs you.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              This workspace is shaped around your responsibilities as {accessProfile.label}. Open a queue below, complete what you can, and escalate anything outside your authority.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-cyan-300" /> Your responsibilities
            </div>
            <ul className="mt-3 space-y-2">
              {ROLE_GUIDANCE[accessProfile.level].map((guidance) => (
                <li key={guidance} className="flex gap-2 text-xs leading-5 text-white/65">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>{guidance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">What needs attention</h3>
          <p className="mt-1 text-sm text-white/50">Only work within your current access is shown here.</p>
        </div>
        <Button size="sm" variant="outline" onClick={refresh} disabled={isRefreshing} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh work
        </Button>
      </div>

      {hasLoadError && (
        <div role="status" className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">Some live counts are unavailable.</p>
            <p className="mt-1 text-xs text-amber-100/70">You can still open the work areas available to you. Refresh to try the counts again.</p>
          </div>
        </div>
      )}

      {loading && !work.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-48 rounded-2xl bg-white/5" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {work.map((item) => {
            const Icon = item.icon;
            const count = typeof item.count === "number" ? item.count.toLocaleString() : null;
            return (
              <article key={item.id} className="flex min-h-52 flex-col rounded-2xl border border-white/10 bg-[#0e1218] p-5 transition hover:border-cyan-500/30 hover:bg-[#111721]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"><Icon className="h-5 w-5" /></div>
                  {count && (
                    <div className={`rounded-lg px-2.5 py-1 text-right ${item.urgent ? "bg-amber-500/10 text-amber-200" : "bg-white/5 text-white/70"}`}>
                      <span className="block text-sm font-bold">{count}</span>
                      <span className="block text-[10px]">{item.countLabel}</span>
                    </div>
                  )}
                </div>
                <h4 className="mt-4 font-semibold">{item.title}</h4>
                <p className="mt-2 flex-1 text-sm leading-6 text-white/55">{item.description}</p>
                <Button asChild variant="ghost" className="mt-4 w-full justify-between bg-white/5 text-white hover:bg-white/10">
                  <Link to={item.href}>{item.action}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {canSeeReports && stats.data && (
        <section aria-labelledby="platform-summary-title" className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h3 id="platform-summary-title" className="text-sm font-semibold">Platform summary</h3>
          <p className="mt-1 text-xs text-white/45">Live totals available to your role. These are not targets or promises.</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["People", stats.data.totalUsers], ["Moments", stats.data.totalMoments], ["Participations", stats.data.totalParticipations], ["Check-ins", stats.data.totalCheckIns]].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-white/5 bg-black/15 p-3">
                <dt className="text-xs text-white/45">{label}</dt>
                <dd className="mt-1 text-xl font-bold">{Number(value).toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

export default AdminCommandCenter;
