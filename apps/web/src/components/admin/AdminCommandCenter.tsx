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
import { NextMove, OutcomeSurface, PageLead } from "@/components/promorang-v2";

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
  const priorityWork = useMemo(
    () => work.find((item) => item.urgent && (item.count || 0) > 0) || work.find((item) => (item.count || 0) > 0) || work[0],
    [work],
  );
  const remainingWork = priorityWork ? work.filter((item) => item.id !== priorityWork.id) : work;

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
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)]" data-role="admin">
      <div className="pr-v2-page space-y-9 py-2 sm:py-4">
        <PageLead
          eyebrow={`Admin · ${accessProfile.label}`}
          title="What needs you?"
          description="Start with the highest-priority work you are authorized to resolve. Everything else stays secondary until it needs attention."
          action={
            <Button size="sm" variant="outline" onClick={refresh} disabled={isRefreshing} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh work
            </Button>
          }
        />

        {hasLoadError ? (
          <div role="status" className="flex gap-3 border-y border-amber-500/20 py-4 text-sm text-amber-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold">Some live counts are unavailable.</p>
              <p className="mt-1 text-xs text-amber-100/70">The work areas you can access are still available. Refresh to retry the live counts.</p>
            </div>
          </div>
        ) : null}

        {loading && !work.length ? (
          <Skeleton className="h-56 rounded-[var(--pr-v2-radius-module)] bg-white/5" />
        ) : priorityWork ? (
          <NextMove
            eyebrow={priorityWork.urgent ? "Highest priority" : "Start here"}
            title={priorityWork.title}
            description={priorityWork.description}
            reason={typeof priorityWork.count === "number" ? `${priorityWork.count.toLocaleString()} ${priorityWork.countLabel || "items"} currently visible to your role.` : "This is the first available queue within your current access."}
            action={
              <Link to={priorityWork.href} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black">
                {priorityWork.action}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        ) : (
          <OutcomeSurface>
            <p className="font-semibold">No work queue is currently available for this access level.</p>
            <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">If this is unexpected, review the administrator role and capabilities assigned to this account.</p>
          </OutcomeSurface>
        )}

        <section aria-labelledby="admin-queue" className="space-y-3">
          <div>
            <p className="pr-v2-eyebrow">Operating queue</p>
            <h2 id="admin-queue" className="pr-v2-heading mt-2">Everything else requiring attention</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {remainingWork.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} to={item.href} className="pr-v2-focusable group grid gap-3 py-5 sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-center">
                  <span className="grid size-10 place-items-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role)/0.10)] text-[hsl(var(--pr-v2-active-role))]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold text-[hsl(var(--pr-v2-text-1))]">
                      {item.title}
                      {item.urgent ? <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">Priority</span> : null}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{item.description}</span>
                  </span>
                  <span className="flex min-w-32 items-center justify-between gap-4 sm:justify-end">
                    {typeof item.count === "number" ? (
                      <span className="text-right">
                        <span className="block text-lg font-semibold">{item.count.toLocaleString()}</span>
                        <span className="block text-[10px] text-[hsl(var(--pr-v2-text-3))]">{item.countLabel}</span>
                      </span>
                    ) : null}
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--pr-v2-text-3))] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 pt-7 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" /> Your responsibilities
            </div>
            <ul className="mt-4 space-y-3">
              {ROLE_GUIDANCE[accessProfile.level].map((guidance) => (
                <li key={guidance} className="flex gap-2 text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{guidance}</span>
                </li>
              ))}
            </ul>
          </div>

          {canSeeReports && stats.data ? (
            <div>
              <p className="text-sm font-semibold">Platform evidence</p>
              <p className="mt-1 text-xs text-[hsl(var(--pr-v2-text-3))]">Live totals available to your role. These are context, not targets or promises.</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-7 gap-y-5">
                {[["People", stats.data.totalUsers], ["Moments", stats.data.totalMoments], ["Participations", stats.data.totalParticipations], ["Check-ins", stats.data.totalCheckIns]].map(([label, value]) => (
                  <div key={String(label)} className="border-t border-white/10 pt-3">
                    <dt className="text-xs text-[hsl(var(--pr-v2-text-3))]">{label}</dt>
                    <dd className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{Number(value).toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default AdminCommandCenter;
