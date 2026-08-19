import { ArrowDown, BadgeCheck, CircleDashed, Radio } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignDemandIntelligence, type DemandStage } from "@/hooks/useCampaignDemandIntelligence";

const flightPath: Array<{ stage: DemandStage; number: string; label: string; question: string }> = [
  { stage: "discovery", number: "01", label: "Discovered", question: "Did the right people see it?" },
  { stage: "interest", number: "02", label: "Interested", question: "Did they lean in, scan or save?" },
  { stage: "participation", number: "03", label: "Participated", question: "Did they join or show up?" },
  { stage: "conversion", number: "04", label: "Converted", question: "Did a verified outcome happen?" },
  { stage: "review", number: "05", label: "Reviewed", question: "Did they leave honest proof?" },
  { stage: "referral", number: "06", label: "Referred", question: "Did they bring another person?" },
  { stage: "loyalty", number: "07", label: "Returned", question: "Did the relationship continue?" },
];

function valueLabel(value: number, events: Array<{ value_currency?: string | null }>) {
  const currency = events.find((event) => event.value_currency)?.value_currency || "JMD";
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function DemandFlightPath({ campaignId }: { campaignId: string }) {
  const intelligence = useCampaignDemandIntelligence(campaignId);
  const data = intelligence.data;
  const currencyEvents = data?.events || [];

  return (
    <section className="mt-10 overflow-hidden border border-black/15 bg-[#191816] text-white" aria-labelledby="demand-flight-path-title">
      <header className="grid gap-7 border-b border-white/12 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-orange-300"><Radio className="h-3.5 w-3.5" />Live demand signal</p>
          <h2 id="demand-flight-path-title" className="mt-3 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-5xl">Follow the movement, not a vanity score.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Every number traces back to a Promorang action. Verified conversion stays separate from attention, and each economic system keeps its own meaning.</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10">
          <Metric label="Verified outcomes" value={data?.summary.verified_conversions ?? 0} loading={intelligence.isLoading} />
          <Metric label="Verified value" value={data ? valueLabel(data.summary.verified_value, currencyEvents) : "—"} loading={intelligence.isLoading} />
        </div>
      </header>

      {intelligence.isLoading ? <div className="grid gap-3 p-7 sm:grid-cols-2 sm:p-10 lg:grid-cols-4">{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-32 bg-white/10" />)}</div> : intelligence.error ? (
        <div className="p-7 text-sm text-red-300 sm:p-10">{intelligence.error instanceof Error ? intelligence.error.message : "Demand intelligence is unavailable."}</div>
      ) : (
        <div className="p-7 sm:p-10">
          <div className="grid gap-0 lg:grid-cols-7">
            {flightPath.map((item, index) => {
              const count = data?.summary.counts[item.stage] || 0;
              const active = count > 0;
              return <div key={item.stage} className="relative border-l border-white/15 py-5 pl-5 pr-4 lg:border-l-0 lg:border-t lg:px-3 lg:pt-6">
                <span className={`absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full ring-4 ring-[#191816] lg:-top-[5px] lg:left-3 ${active ? "bg-[#e66a2c]" : "bg-white/25"}`} />
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">{item.number}</p>
                <p className="mt-5 text-3xl font-black">{count.toLocaleString()}</p>
                <h3 className="mt-1 text-sm font-black">{item.label}</h3>
                <p className="mt-2 text-xs leading-5 text-white/38">{item.question}</p>
                {index < flightPath.length - 1 && <ArrowDown className="absolute -bottom-3 left-3 h-4 w-4 text-white/20 lg:hidden" />}
              </div>;
            })}
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2">{data?.summary.total_events ? <BadgeCheck className="h-4 w-4 text-emerald-400" /> : <CircleDashed className="h-4 w-4" />}{data?.summary.total_events || 0} attributable events in the current campaign record.</p>
            <p>{data?.summary.last_event_at ? `Last movement ${new Date(data.summary.last_event_at).toLocaleString()}` : "Waiting for the first attributable action."}</p>
          </div>
          <div className="mt-4 border border-white/10 bg-white/[.035] p-4 text-xs leading-5 text-white/45">
            {data?.benchmark.eligible ? <p><span className="font-black text-white">Merchant benchmark:</span> participation converts at {data.benchmark.current_rate}% here versus a {data.benchmark.cohort_median}% median across {data.benchmark.campaign_count} prior campaigns ({Number(data.benchmark.difference_points) >= 0 ? "+" : ""}{data.benchmark.difference_points} points).</p> : <p><span className="font-black text-white">Benchmark building:</span> {data?.benchmark.reason || "More attributable campaigns are required before comparison becomes responsible."} Current cohort: {data?.benchmark.campaign_count || 0}.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return <div className="bg-[#24221f] p-5"><p className="text-2xl font-black">{loading ? "…" : typeof value === "number" ? value.toLocaleString() : value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[.14em] text-white/35">{label}</p></div>;
}
