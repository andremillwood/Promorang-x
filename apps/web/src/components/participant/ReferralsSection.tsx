import { Link2, Users, TrendingUp, Copy, Check, Plus, Share2, Gem, Coins } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useReferralCodes, useReferralStats, useCreateReferralCode } from "@/hooks/useReferrals";
import { Skeleton } from "@/components/ui/skeleton";

export function ReferralsSection() {
  const { data: codes, isLoading: codesLoading } = useReferralCodes();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const createCode = useCreateReferralCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getReferralUrl = (code: string) =>
    `${window.location.origin}/auth?mode=signup&ref=${encodeURIComponent(code)}`;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(getReferralUrl(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareReferral = async (code: string) => {
    const url = getReferralUrl(code);
    const shareData = {
      title: "Join me on Promorang",
      text: "Come discover Moments, creators, and experiences with me on Promorang.",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    copyToClipboard(code);
  };

  if (codesLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <Link2 className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {stats?.referrals.totalClicks || 0}
          </p>
          <p className="text-xs text-muted-foreground">Clicks</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <Users className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {stats?.referrals.totalSignups || 0}
          </p>
          <p className="text-xs text-muted-foreground">Signups</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {stats?.referrals.totalConversions || 0}
          </p>
          <p className="text-xs text-muted-foreground">Conversions</p>
        </div>
      </div>

      {/* Referral Codes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Your Referral Codes</h3>
          <Button
            size="sm"
            onClick={() => createCode.mutate()}
            disabled={createCode.isPending}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Code
          </Button>
        </div>

        {codes && codes.length > 0 ? (
          <div className="space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <code className="text-lg font-mono font-bold text-primary">
                    {code.code}
                  </code>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                      aria-label={copiedCode === code.code ? "Referral link copied" : "Copy referral link"}
                    >
                      {copiedCode === code.code ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => shareReferral(code.code)}
                      className="gap-1.5 font-bold"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{code.total_clicks || 0} clicks</span>
                  <span>{code.total_signups || 0} signups</span>
                  <span>{code.total_conversions || 0} conversions</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No referral codes yet</p>
            <Button onClick={() => createCode.mutate()} disabled={createCode.isPending}>
              Create Your First Code
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Direct referral return</p>
            <h3 className="mt-1 text-xl font-black text-foreground">You receive 5% when an invitee earns.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              The commission follows the value they earn—USD, Gems, or Points—and is recorded automatically in your wallet.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-black text-primary">One level · 5%</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <EarningTotal icon={TrendingUp} value={`$${(stats?.earnings.usd || 0).toFixed(2)}`} label="USD earned" />
          <EarningTotal icon={Gem} value={(stats?.earnings.gems || 0).toLocaleString()} label="Gems earned" />
          <EarningTotal icon={Coins} value={(stats?.earnings.points || 0).toLocaleString()} label="Points earned" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-semibold text-foreground">People you invited</h3>
          <div className="space-y-2">
            {stats?.referralsList.length ? stats.referralsList.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{referral.users?.display_name || referral.users?.username || "Promorang member"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Joined {new Date(referral.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${referral.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {referral.status === "active" ? "Active" : "Joined"}
                </span>
              </div>
            )) : <EmptyState text="Your invitees will appear here after they create an account through your link." />}
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-foreground">Commission history</h3>
          <div className="space-y-2">
            {stats?.commissions.length ? stats.commissions.map((commission) => (
              <div key={commission.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold capitalize text-foreground">{commission.earning_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {commission.users?.display_name || commission.users?.username || "Invitee"} · {new Date(commission.paid_at || commission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">+{formatCommission(commission.commission_amount, commission.commission_currency)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{commission.status}</p>
                </div>
              </div>
            )) : <EmptyState text="Every referral commission will appear here with its source and payment status." />}
          </div>
        </section>
      </div>
    </div>
  );
}

function EarningTotal({ icon: Icon, value, label }: { icon: typeof TrendingUp; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-lg font-black text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">{text}</p>;
}

function formatCommission(amount: number, currency: string) {
  const value = Number(amount || 0);
  if (currency === "usd") return `$${value.toFixed(2)}`;
  return `${value.toLocaleString()} ${currency === "gems" ? "Gems" : "Points"}`;
}
