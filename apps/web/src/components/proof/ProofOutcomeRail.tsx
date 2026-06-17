import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Repeat2, ScanSearch, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProofOutcomeData } from "@/hooks/useProofOutcome";

interface ProofOutcomeRailProps {
  eyebrow: string;
  title: string;
  data?: ProofOutcomeData;
  isLoading?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  try {
    return format(new Date(value), "MMM d");
  } catch {
    return null;
  }
}

export function ProofOutcomeRail({
  eyebrow,
  title,
  data,
  isLoading = false,
  ctaHref,
  ctaLabel,
}: ProofOutcomeRailProps) {
  if (isLoading) {
    return (
      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const chainItems = [
    { label: "Action", value: data.chain.action, icon: Target },
    { label: "Verified", value: data.chain.verification, icon: ScanSearch },
    { label: "Outcome", value: data.chain.outcome, icon: CheckCircle2 },
    { label: "Repeat", value: data.chain.repeatability, icon: Repeat2 },
  ];

  const metrics = [
    { label: "Check-ins", value: data.metrics.check_ins },
    { label: "Verified proofs", value: data.metrics.verified_proofs },
    { label: "Proof completion", value: `${data.metrics.proof_completion_rate}%` },
    { label: "Content approval", value: `${data.metrics.content_approval_rate}%` },
  ];

  if (typeof data.spend_usd === "number") {
    metrics.push({ label: "Spend", value: `$${data.spend_usd.toLocaleString()}` });
  }
  if (typeof data.spend_per_verified_proof === "number") {
    metrics.push({ label: "Spend / verified proof", value: `$${data.spend_per_verified_proof.toLocaleString()}` });
  }

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="outline" className="w-fit border-primary/20 text-primary">
              {eyebrow}
            </Badge>
            <CardTitle className="mt-3 text-xl">{title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{data.label}</p>
          </div>
          {ctaHref && ctaLabel ? (
            <Badge variant="outline" className="w-fit border-border/80 bg-background/70 px-3 py-2">
              <Link to={ctaHref} className="inline-flex items-center gap-2 text-sm text-foreground">
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {chainItems.map((item, index) => (
            <div key={item.label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{item.value.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.value.helper}</p>
              {index < 3 ? <ArrowRight className="mt-4 hidden h-4 w-4 text-muted-foreground md:block" /> : null}
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        {data.top_moments.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Verified Units</p>
              <p className="text-xs text-muted-foreground">Highest-signal moments in the chain</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {data.top_moments.map((moment) => (
                <div key={moment.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{moment.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[formatDate(moment.starts_at), moment.venue_name].filter(Boolean).join(" • ") || "Tracked activity unit"}
                      </p>
                    </div>
                    <Badge variant="outline">{moment.verified_proofs} verified</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Joins</p>
                      <p className="mt-1 font-semibold">{moment.joins}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Rewards</p>
                      <p className="mt-1 font-semibold">{moment.reward_units}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default ProofOutcomeRail;
