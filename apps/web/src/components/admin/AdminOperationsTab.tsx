import { useEffect, useMemo, useState } from "react";
import {
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <Card className="overflow-hidden">
        <Tabs defaultValue="gems">
          <CardHeader className="border-b border-border/70 bg-muted/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-xl">Live operations queue</CardTitle>
                <CardDescription className="mt-1">Switch queues without losing the operating context.</CardDescription>
              </div>
              <TabsList className="h-auto justify-start overflow-x-auto bg-background/70 p-1">
                <TabsTrigger value="gems">Gems holds</TabsTrigger>
                <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-lg" />)}</div>
            ) : (
              <>
                <TabsContent value="gems" className="m-0">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] gap-3 border-b border-border bg-muted/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Account</span><span>State</span><span>Amount</span><span>Source</span>
                  </div>
                  {data.gems.recent_activity.length ? data.gems.recent_activity.map((row) => (
                    <div key={row.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{row.email || row.id.slice(0, 8)}</span>
                      <span className="truncate text-muted-foreground">{row.transaction_type} · {row.redemption_status.replace(/_/g, " ")}</span>
                      <span className="font-black">{row.amount.toLocaleString()} Gems</span>
                      <MiniPill demo={row.is_demo} />
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">No recent Gems hold activity.</div>}
                </TabsContent>

                <TabsContent value="redemptions" className="m-0">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] gap-3 border-b border-border bg-muted/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Account</span><span>Method</span><span>Amount</span><span>Status</span>
                  </div>
                  {data.redemptions.recent_attempts.length ? data.redemptions.recent_attempts.map((row) => (
                    <div key={row.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{row.email || row.id.slice(0, 8)}</span>
                      <span className="truncate text-muted-foreground">{row.withdrawal_method || "withdrawal"}</span>
                      <span className="font-black">${row.amount.toLocaleString()}</span>
                      <Badge variant="outline" className="w-fit capitalize">{row.status}</Badge>
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">No recent redemption attempts.</div>}
                </TabsContent>

                <TabsContent value="support" className="m-0">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] gap-3 border-b border-border bg-muted/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Issue</span><span>Category</span><span>Priority</span><span>Source</span>
                  </div>
                  {data.support.recent_escalations.length ? data.support.recent_escalations.map((ticket) => (
                    <div key={ticket.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{ticket.subject}</span>
                      <span className="truncate text-muted-foreground">{ticket.category.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="w-fit capitalize">{ticket.priority}</Badge>
                      <MiniPill demo={ticket.is_demo} />
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">No open escalations.</div>}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default AdminOperationsTab;
