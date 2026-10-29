import { currentUiLocale } from "@/i18n/geo-locale";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { Button } from "@/components/ui/button";

export function BrandIntelligenceConsole({ compact = false }: { compact?: boolean }) {
  const query = useBrandCampaigns();
  const campaigns = query.data || [];
  const ready = !query.isLoading && !query.isError;
  const metrics = [
    ["Campaigns", campaigns.length],
    ["Active campaigns", campaigns.filter((campaign) => campaign.is_active).length],
    ["Recorded redemptions", campaigns.reduce((total, campaign) => total + Number(campaign.redemptions || 0), 0)],
  ] as const;

  return (
    <section className="min-w-0 space-y-5">
      <header>
        {compact ? <h3 className="font-sans text-xl font-semibold tracking-tight">Campaign results</h3> : <h2 className="font-sans text-2xl font-semibold tracking-tight">Campaign results</h2>}
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Compare recorded customer actions before choosing your next activation. Redemptions do not measure return on investment.</p>
      </header>
      {query.isError ? <div role="alert" className="rounded-sm border border-destructive/30 p-4 text-sm"><p>Campaign results could not be loaded.</p><Button variant="outline" className="mt-3" disabled={query.isFetching} onClick={() => void query.refetch()}>Try again</Button></div> : null}
      <dl className="grid gap-3 sm:grid-cols-3" aria-busy={query.isLoading}>
        {metrics.map(([label, value]) => <div key={label} className="min-w-0 rounded-sm  bg-card p-5"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-3 break-words text-3xl font-semibold tabular-nums">{ready ? value.toLocaleString(currentUiLocale()) : "—"}</dd></div>)}
      </dl>
      {ready && campaigns.length === 0 ? <p className="text-sm text-muted-foreground">Campaign results will appear after you create your first activation.</p> : null}
    </section>
  );
}

export default BrandIntelligenceConsole;
