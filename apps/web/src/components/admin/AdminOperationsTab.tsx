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
import { useI18n } from "@/i18n/I18nContext";

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
  const { t } = useI18n();
  return (
    <Badge variant="outline" className={demo ? "border-amber-500/30 text-amber-700" : "border-emerald-500/30 text-emerald-700"}>
      {demo ? t("opsPulse.demo") : t("opsPulse.live")}
    </Badge>
  );
}

export function AdminOperationsTab() {
  const { t, formatNumber } = useI18n();
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
          <h2 className="text-2xl font-bold">{t("opsPulse.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("opsPulse.copy")}
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchOverview()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {t("opsPulse.refresh")}
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
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.rewards24")}</span>
                </div>
                <div className="text-3xl font-black">{data.rewards_24h.issued_count}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.issuedTo", { count: data.rewards_24h.unique_users })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-cyan-500">
                  <Gem className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.gemsHold")}</span>
                </div>
                <div className="text-3xl font-black">{formatNumber(Number(data.gems.held_balance || 0))}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.lockedBonus", {
                    locked: formatNumber(Number(data.gems.locked_bonus_balance || 0)),
                    ready: data.gems.unlock_ready_count,
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <WalletCards className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.redeemPress")}</span>
                </div>
                <div className="text-3xl font-black">{data.redemptions.pending_requests}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.redeemMeta", { done: data.redemptions.completed_7d, rejected: data.redemptions.rejected_7d })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.kycQ")}</span>
                </div>
                <div className="text-3xl font-black">{data.kyc.pending_review + data.kyc.in_review}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.kycMeta", { pending: data.kyc.pending_review, review: data.kyc.in_review, verified: data.kyc.total_verified })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-violet-600">
                  <Users className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.demoLive")}</span>
                </div>
                <div className="text-3xl font-black">{data.usage.live_participants_7d}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.demoLiveMeta", { demo: data.usage.demo_participants_7d, live: data.usage.live_accounts, demoAcc: data.usage.demo_accounts })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-rose-600">
                  <LifeBuoy className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em]">{t("opsPulse.supportEsc")}</span>
                </div>
                <div className="text-3xl font-black">{data.support.open_escalations}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("opsPulse.supportMeta", { high: data.support.high_priority_open, hours: data.support.oldest_open_hours })}
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
                <CardTitle className="text-xl">{t("opsPulse.queueTitle")}</CardTitle>
                <CardDescription className="mt-1">{t("opsPulse.queueCopy")}</CardDescription>
              </div>
              <TabsList className="h-auto justify-start overflow-x-auto bg-background/70 p-1">
                <TabsTrigger value="gems">{t("opsPulse.tabGems")}</TabsTrigger>
                <TabsTrigger value="redemptions">{t("opsPulse.tabRedeem")}</TabsTrigger>
                <TabsTrigger value="support">{t("opsPulse.tabSupport")}</TabsTrigger>
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
                    <span>{t("opsPulse.colAccount")}</span><span>{t("opsPulse.colState")}</span><span>{t("opsPulse.colAmount")}</span><span>{t("opsPulse.colSource")}</span>
                  </div>
                  {data.gems.recent_activity.length ? data.gems.recent_activity.map((row) => (
                    <div key={row.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{row.email || row.id.slice(0, 8)}</span>
                      <span className="truncate text-muted-foreground">{row.transaction_type} · {row.redemption_status.replace(/_/g, " ")}</span>
                      <span className="font-black">{t("opsPulse.gemsAmt", { amount: formatNumber(row.amount) })}</span>
                      <MiniPill demo={row.is_demo} />
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">{t("opsPulse.emptyGems")}</div>}
                </TabsContent>

                <TabsContent value="redemptions" className="m-0">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] gap-3 border-b border-border bg-muted/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{t("opsPulse.colAccount")}</span><span>{t("opsPulse.colMethod")}</span><span>{t("opsPulse.colAmount")}</span><span>{t("opsPulse.colStatus")}</span>
                  </div>
                  {data.redemptions.recent_attempts.length ? data.redemptions.recent_attempts.map((row) => (
                    <div key={row.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{row.email || row.id.slice(0, 8)}</span>
                      <span className="truncate text-muted-foreground">{row.withdrawal_method || t("opsPulse.withdrawal")}</span>
                      <span className="font-black">${formatNumber(row.amount)}</span>
                      <Badge variant="outline" className="w-fit capitalize">{row.status}</Badge>
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">{t("opsPulse.emptyRedeem")}</div>}
                </TabsContent>

                <TabsContent value="support" className="m-0">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] gap-3 border-b border-border bg-muted/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{t("opsPulse.colIssue")}</span><span>{t("opsPulse.colCategory")}</span><span>{t("opsPulse.colPriority")}</span><span>{t("opsPulse.colSource")}</span>
                  </div>
                  {data.support.recent_escalations.length ? data.support.recent_escalations.map((ticket) => (
                    <div key={ticket.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.7fr)_110px_90px] items-center gap-3 border-b border-border/60 px-5 py-4 text-sm last:border-0 hover:bg-muted/20">
                      <span className="truncate font-semibold">{ticket.subject}</span>
                      <span className="truncate text-muted-foreground">{ticket.category.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="w-fit capitalize">{ticket.priority}</Badge>
                      <MiniPill demo={ticket.is_demo} />
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">{t("opsPulse.emptySupport")}</div>}
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
