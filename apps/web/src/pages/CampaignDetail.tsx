import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Coins, Eye, Gift, Target } from "lucide-react";
import { format } from "date-fns";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { useCampaignProofOutcome } from "@/hooks/useProofOutcome";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "—";
  return `${formatDate(start)} to ${formatDate(end)}`;
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, activeRole } = useAuth();
  const campaignsQuery = useBrandCampaigns();
  const proofOutcomeQuery = useCampaignProofOutcome(id);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (activeRole !== "brand" && activeRole !== "agency" && activeRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const campaign = campaignsQuery.data?.find((entry) => entry.id === id);
  const isPromoPush = campaign?.system_module === "promopush";

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to="/dashboard?tab=campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to campaigns
            </Link>
          </Button>
          {campaignsQuery.isLoading ? (
            <>
              <Skeleton className="h-8 w-72" />
              <Skeleton className="mt-2 h-5 w-96" />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl font-bold text-foreground">{campaign?.title || "Campaign detail"}</h1>
                {campaign && (
                  <Badge variant={campaign.is_active ? "default" : "outline"}>
                    {campaign.is_active ? (isPromoPush ? "Distribution Live" : "Active") : "Paused"}
                  </Badge>
                )}
              </div>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {campaign?.description || "Review the closed loop from entry to proof-bearing outcome."}
              </p>
            </>
          )}
        </div>
        <Button asChild>
          <Link to="/dashboard/campaigns/create">Launch another PromoPush</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {campaignsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)
        ) : (
          [
            { label: "Impressions", value: campaign?.impressions?.toLocaleString() || "0", icon: Eye },
            { label: isPromoPush ? "Rewards" : "Redemptions", value: campaign?.redemptions?.toLocaleString() || "0", icon: Gift },
            { label: "Budget", value: campaign?.budget ? `$${campaign.budget.toLocaleString()}` : "—", icon: Coins },
            { label: isPromoPush ? "Zone Window" : "Live Since", value: isPromoPush ? formatRange(campaign?.distribution_starts_at, campaign?.distribution_ends_at) : formatDate(campaign?.created_at), icon: Calendar },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <metric.icon className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ProofOutcomeRail
        eyebrow={isPromoPush ? "PromoPush Outcome Loop" : "Proof Of Outcome"}
        title={isPromoPush ? "Every role should see the same distribution-to-proof chain" : "Every role should see the same verified campaign chain"}
        data={proofOutcomeQuery.data}
        isLoading={proofOutcomeQuery.isLoading}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isPromoPush ? "Distribution Readout" : "Commercial Readout"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {isPromoPush
                ? "PromoPush is the traffic layer. It should route attention into one Moment, then rely on check-ins and proof to validate the behavior it created."
                : "This page is the brand-side answer to the same moment and host proof flow. The action is campaign-attributed joins, the verification is check-ins plus approved proofs, and the outcome is reward-bearing verified behavior."}
            </p>
            <p>
              {isPromoPush
                ? "What matters here is not raw attention. It is whether the distribution zone created entries, proof completions, and reward-worthy actions that can be repeated in the next geo campaign."
                : "What matters here is not just attention. It is whether the campaign generated check-ins, proof completions, and reward-worthy actions that can be repeated across other moments."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">Reward</p>
              <p className="mt-2 text-sm text-foreground">{campaign?.reward_value || "No reward value configured"}</p>
            </div>
            {isPromoPush && (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">Distribution Zone</p>
                <p className="mt-2 text-sm text-foreground">
                  {campaign?.geo_label || "No geo zone configured"}
                  {campaign?.geo_radius_meters ? ` • ${campaign.geo_radius_meters}m radius` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {campaign?.entry_endpoint || "No entry endpoint configured"}
                </p>
              </div>
            )}
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">Conversion Rate</p>
              <p className="mt-2 text-sm text-foreground">
                {campaign && campaign.impressions > 0
                  ? `${((campaign.redemptions / campaign.impressions) * 100).toFixed(1)}% ${isPromoPush ? "reward completion against exposure" : "redemption against exposure"}`
                  : "No exposure or outcome data yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">Next Move</p>
              <p className="mt-2 text-sm text-foreground">
                {proofOutcomeQuery.data?.metrics.pending_proofs
                  ? `Follow through on ${proofOutcomeQuery.data.metrics.pending_proofs} pending proof submissions to tighten attribution.`
                  : "Scale the same proof and reward structure into the next moment cluster."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!campaignsQuery.isLoading && !campaign && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Campaign not found in this workspace.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignDetail;
