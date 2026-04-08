import { Link2, Users, TrendingUp, Copy, Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useReferralCodes, useReferralStats, useCreateReferralCode } from "@/hooks/useReferrals";
import { Skeleton } from "@/components/ui/skeleton";

export function ReferralsSection() {
  const { data: codes, isLoading: codesLoading } = useReferralCodes();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const createCode = useCreateReferralCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    const referralUrl = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
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

      {/* Affiliate Earnings */}
      {stats?.affiliate && (stats.affiliate.totalEarnings > 0 || stats.affiliate.pendingEarnings > 0) && (
        <div className="bg-gradient-warm rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground mb-3">Affiliate Earnings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${stats.affiliate.totalEarnings.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                ${stats.affiliate.pendingEarnings.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Pending Payout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
