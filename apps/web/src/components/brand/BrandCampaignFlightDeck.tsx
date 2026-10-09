import { currentUiLocale } from "@/i18n/geo-locale";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { FunnelProgressCard } from "@/components/funnels/FunnelProgressCard";

export function BrandCampaignFlightDeck({ onLaunchNew }: { onLaunchNew?: () => void }) {
  const { t: webT } = useWebI18n();
  const query = useBrandCampaigns();
  const campaigns = query.data || [];
  const [filter, setFilter] = useState<"all" | "live" | "draft">("all");
  const filtered = campaigns.filter(campaign => filter === "all" || (filter === "live" ? campaign.is_active : !campaign.is_active));
  return <div className="space-y-6 text-white">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6">
      <div><h2 className="font-serif text-3xl font-bold">{webT("campaignDetail.yourActivations")}</h2><p className="mt-2 text-sm text-white/60">Saved plans, live campaigns, and the evidence they create.</p></div>
      {onLaunchNew ? <button type="button" onClick={onLaunchNew} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black"><Plus className="h-4 w-4" />Start a pilot</button> : <Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black"><Plus className="h-4 w-4" />Start a pilot</Link>}
    </header>
    <FunnelProgressCard funnel="brand" />
    <div className="flex gap-2" aria-label="Filter activations">{([['all','All'],['live','Live'],['draft','Not live']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`min-h-11 rounded-full border px-5 text-sm ${filter === value ? 'border-primary text-primary' : 'border-white/20 text-white/65'}`}>{label}</button>)}</div>
    {query.isLoading ? <p role="status">Loading your activations…</p> : query.isError ? <div role="alert"><p>Your activations could not be loaded.</p><button type="button" onClick={() => void query.refetch()} className="min-h-11 underline">{webT("release.18")}</button></div> : filtered.length ? <div className="grid gap-5 lg:grid-cols-2">{filtered.map(campaign => <article key={campaign.id} className="rounded-2xl border border-white/15 p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-orange-300">{campaign.is_active ? webT("common.live") : campaign.compiler_metadata?.activation_status || webT("brandDash.draft")}</p>
      <h3 className="mt-3 font-serif text-2xl font-bold">{campaign.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">{campaign.description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4"><div><dt className="text-xs text-white/60">Recorded impressions</dt><dd className="mt-1 text-2xl font-bold">{Number(campaign.impressions || 0).toLocaleString(currentUiLocale())}</dd></div><div><dt className="text-xs text-white/60">Recorded accepted actions</dt><dd className="mt-1 text-2xl font-bold">{Number(campaign.redemptions || 0).toLocaleString(currentUiLocale())}</dd></div></dl>
      <Link to={`/dashboard/campaigns/${campaign.id}`} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{campaign.is_active ? webT("brandDash.reviewOutcomes") : webT("campaignDetail.continueShaping")}<ArrowRight className="h-4 w-4" /></Link>
    </article>)}</div> : <div className="border-y border-white/15 py-8"><h3 className="font-serif text-2xl font-bold">{campaigns.length ? 'No activations in this view' : 'Your first pilot starts with an outcome'}</h3><p className="mt-3 text-sm text-white/60">{campaigns.length ? 'Choose another filter to see your saved work.' : 'Define the customer action you want to create, save a brief, and scope a measurable pilot.'}</p><Link to="/business/start" className="mt-4 inline-flex min-h-11 items-center gap-2 text-orange-300">Build your brief<ArrowRight className="h-4 w-4" /></Link></div>}
  </div>;
}
export default BrandCampaignFlightDeck;
