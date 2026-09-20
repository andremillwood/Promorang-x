import { CheckCircle2, Clock, Coins, Hourglass, PieChart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreatorEconomicProfile,
  useCreatorEarningsSummary,
  useEarningsBySource,
  useRecentEarnings,
} from "@/hooks/useCreatorEconomics";
import { formatCurrency, formatNumber } from "@/lib/utils";

const TIER_INFO = {
  starter: { name: "Starter", share: "10%" },
  rising: { name: "Rising", share: "15%" },
  signature: { name: "Signature", share: "25%" },
  icon: { name: "Icon", share: "40%" },
};

const SOURCE_LABELS: Record<string, string> = {
  mission_join: "Mission joins",
  mission_verification: "Verifications",
  memory_issuance: "Memory issuance",
  sponsored_boost: "Sponsored boosts",
  catalyst_conversion: "Catalyst conversions",
};

function statusLabel(status: string) {
  if (status === "pending") return "Attributed · pending review";
  if (status === "approved") return "Approved in ledger";
  if (status === "settled") return "Settled in ledger";
  if (status === "reversed") return "Reversed";
  return status;
}

export function CreatorEarningsTab() {
  const { data: profile, isLoading: profileLoading } = useCreatorEconomicProfile();
  const { data: summary, isLoading: summaryLoading } = useCreatorEarningsSummary();
  const { data: bySource, isLoading: sourceLoading } = useEarningsBySource();
  const { data: recentEarnings, isLoading: recentLoading } = useRecentEarnings(12);

  const isLoading = profileLoading || summaryLoading || sourceLoading || recentLoading;
  if (isLoading) {
    return <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div><Skeleton className="h-72 rounded-2xl" /></div>;
  }

  const tierInfo = profile ? TIER_INFO[profile.tier] : TIER_INFO.starter;
  const recent = recentEarnings || [];
  const sources = bySource || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Ledger state</p>
          <h3 className="mt-2 text-2xl font-black text-foreground">Creator value recorded by PROMORANG</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">These amounts come from the creator earnings ledger. “Approved” and “settled” describe ledger states; this surface does not claim an external payout occurred unless a payment record proves it.</p>
        </div>
        <Badge variant="outline"><Sparkles className="mr-1 h-3.5 w-3.5" />{tierInfo.name} · {tierInfo.share} configured share</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Attributed · pending review</CardDescription><CardTitle className="text-3xl">{formatCurrency(summary?.pendingAmount || 0)}</CardTitle></CardHeader>
          <CardContent className="flex items-center text-xs text-muted-foreground"><Hourglass className="mr-1.5 h-3.5 w-3.5" />Not yet approved</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Approved in ledger</CardDescription><CardTitle className="text-3xl">{formatCurrency(summary?.approvedAmount || 0)}</CardTitle></CardHeader>
          <CardContent className="flex items-center text-xs text-muted-foreground"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Approved ≠ payout sent</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Settled in ledger</CardDescription><CardTitle className="text-3xl">{formatCurrency(summary?.settledAmount || 0)}</CardTitle></CardHeader>
          <CardContent className="flex items-center text-xs text-muted-foreground"><Coins className="mr-1.5 h-3.5 w-3.5" />Ledger-settled value</CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Recent value events</CardTitle><CardDescription>What was attributed, approved, settled or reversed.</CardDescription></CardHeader>
          <CardContent>
            {recent.length ? <div className="space-y-3">{recent.map((earning: any) => (
              <div key={earning.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium">{SOURCE_LABELS[earning.source_type] || earning.source_type}</p><p className="mt-1 text-xs text-muted-foreground">{statusLabel(earning.status)} · {new Date(earning.created_at).toLocaleDateString()}</p></div>
                <div className="text-left sm:text-right"><p className="font-bold">{formatCurrency(earning.creator_share_amount)}</p><p className="text-xs text-muted-foreground">{formatNumber(earning.unit_count || 0)} unit{earning.unit_count === 1 ? "" : "s"}</p></div>
              </div>
            ))}</div> : <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No creator value events yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" />Settled value by source</CardTitle><CardDescription>Only ledger rows currently marked settled.</CardDescription></CardHeader>
          <CardContent>
            {sources.length ? <div className="space-y-4">{sources.map((source) => (
              <div key={source.source_type} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><span className="font-medium">{SOURCE_LABELS[source.source_type] || source.source_type}</span><span className="font-bold">{formatCurrency(source.creator_share_amount)}</span></div><p className="mt-1 text-xs text-muted-foreground">{source.count} settled ledger entr{source.count === 1 ? "y" : "ies"}</p></div>
            ))}</div> : <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No settled creator value by source yet.</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader className="pb-3"><CardDescription>Verified unlocks</CardDescription><CardTitle className="text-2xl">{formatNumber(profile?.lifetime_verified_unlocks || 0)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Memories issued</CardDescription><CardTitle className="text-2xl">{formatNumber(profile?.lifetime_memories_issued || 0)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Catalyst conversions</CardDescription><CardTitle className="text-2xl">{formatNumber(profile?.lifetime_catalyst_conversions || 0)}</CardTitle></CardHeader></Card>
      </div>
    </div>
  );
}
