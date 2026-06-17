import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gem,
  Gift,
  LifeBuoy,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type OperationsOverview = {
  rewards_24h: {
    issued_count: number;
    unique_users: number;
  };
  gems: {
    held_balance: number;
    locked_bonus_balance: number;
    unlock_ready_count: number;
    recent_activity: Array<{
      id: string;
      email: string | null;
      is_demo: boolean;
      amount: number;
      transaction_type: string;
      redemption_status: string;
      objective_status?: string | null;
      objective_code?: string | null;
      created_at: string;
    }>;
  };
  redemptions: {
    pending_requests: number;
    completed_7d: number;
    rejected_7d: number;
    recent_attempts: Array<{
      id: string;
      email: string | null;
      is_demo: boolean;
      amount: number;
      status: string;
      withdrawal_method?: string | null;
      created_at: string;
    }>;
  };
  kyc: {
    pending_review: number;
    in_review: number;
    approved_today: number;
    rejected_today: number;
    total_verified: number;
  };
  usage: {
    demo_accounts: number;
    live_accounts: number;
    demo_participants_7d: number;
    live_participants_7d: number;
  };
  support: {
    open_escalations: number;
    high_priority_open: number;
    oldest_open_hours: number;
    recent_escalations: Array<{
      id: string;
      subject: string;
      category: string;
      priority: string;
      status: string;
      created_at: string;
      email: string | null;
      is_demo: boolean;
    }>;
  };
};

function MiniPill({ demo }: { demo: boolean }) {
  return (
    <Badge variant="outline" className={demo ? "border-amber-500/30 text-amber-700" : "border-emerald-500/30 text-emerald-700"}>
      {demo ? "Demo" : "Live"}
    </Badge>
  );
}

export function AdminOperationsTab() {
  const { session } = useAuth();
  const [data, setData] = useState<OperationsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${session?.access_token || ""}`,
    }),
    [session?.access_token],
  );

  async function fetchOverview() {
    if (!session?.access_token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/operations/overview`, { headers });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load operations overview");
      }

      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load operations overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      void fetchOverview();
    }
  }, [session?.access_token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operations Pulse</h2>
          <p className="text-sm text-muted-foreground">
            Reward issuance, Gems liability, redemption pressure, KYC, demo usage, and support escalation in one view.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchOverview()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Gift className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">Rewards 24h</span>
                </div>
                <div className="text-3xl font-black">{data.rewards_24h.issued_count}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issued to {data.rewards_24h.unique_users} unique users in the last 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-cyan-500">
                  <Gem className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">Gems On Hold</span>
                </div>
                <div className="text-3xl font-black">{Number(data.gems.held_balance || 0).toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Number(data.gems.locked_bonus_balance || 0).toLocaleString()} locked bonus Gems.
                  {" "}
                  {data.gems.unlock_ready_count} grants ready to unlock.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <WalletCards className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">Redemption Pressure</span>
                </div>
                <div className="text-3xl font-black">{data.redemptions.pending_requests}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.redemptions.completed_7d} completed and {data.redemptions.rejected_7d} rejected in the last 7 days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">KYC Queue</span>
                </div>
                <div className="text-3xl font-black">{data.kyc.pending_review + data.kyc.in_review}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.kyc.pending_review} pending review, {data.kyc.in_review} in review, {data.kyc.total_verified} verified.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-violet-600">
                  <Users className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">Demo Vs Live</span>
                </div>
                <div className="text-3xl font-black">{data.usage.live_participants_7d}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live participants in 7d. Demo: {data.usage.demo_participants_7d}. Accounts: {data.usage.live_accounts} live / {data.usage.demo_accounts} demo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-rose-600">
                  <LifeBuoy className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">Support Escalations</span>
                </div>
                <div className="text-3xl font-black">{data.support.open_escalations}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.support.high_priority_open} high-priority open.
                  {" "}
                  Oldest open ticket: {data.support.oldest_open_hours}h.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Gems Holds And Unlocks</CardTitle>
            <CardDescription>Purchased holds, locked bonuses, and unlock-ready grants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
            ) : data.gems.recent_activity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No recent Gems hold activity.
              </div>
            ) : (
              data.gems.recent_activity.map((row) => (
                <div key={row.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.email || row.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.transaction_type} · {row.redemption_status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <MiniPill demo={row.is_demo} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">{row.amount.toLocaleString()} Gems</span>
                    {row.objective_code ? (
                      <Badge variant="outline">{row.objective_code}</Badge>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Redemption Attempts</CardTitle>
            <CardDescription>Recent Gems cash-out attempts and their current status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
            ) : data.redemptions.recent_attempts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No recent redemption attempts.
              </div>
            ) : (
              data.redemptions.recent_attempts.map((row) => (
                <div key={row.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.email || row.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{row.withdrawal_method || "withdrawal"} · {row.status}</p>
                    </div>
                    <MiniPill demo={row.is_demo} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">${row.amount.toLocaleString()}</span>
                    {row.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : row.status === "rejected" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Support Escalations</CardTitle>
            <CardDescription>Open tickets that still need attention or carry higher urgency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
            ) : data.support.recent_escalations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No open escalations.
              </div>
            ) : (
              data.support.recent_escalations.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.category.replace(/_/g, " ")} · {ticket.status.replace(/_/g, " ")}</p>
                    </div>
                    <MiniPill demo={ticket.is_demo} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <Badge variant="outline">{ticket.priority}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminOperationsTab;
