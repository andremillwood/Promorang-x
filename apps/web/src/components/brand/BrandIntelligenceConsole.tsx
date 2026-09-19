import { BarChart3, CheckCircle2, CircleDollarSign, Megaphone, Scale, ShieldCheck } from "lucide-react";
import { useBrandCampaigns } from "@/hooks/useCampaigns";

export function BrandIntelligenceConsole() {
  const campaignsQuery = useBrandCampaigns();
  const campaigns = campaignsQuery.data || [];
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active);
  const verifiedResults = campaigns.reduce((total, campaign) => total + Number(campaign.redemptions || 0), 0);
  const sourceReady = !campaignsQuery.isLoading && !campaignsQuery.error;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary"><BarChart3 className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Evidence & decisions</p>
            <h2 className="mt-2 text-2xl font-black text-white">Decide what deserves the next dollar.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              See the campaign results PROMORANG can currently confirm. Financial metrics such as treasury balances or ROI appear only when the supporting data exists.
            </p>
          </div>
        </div>
      </section>

      {campaignsQuery.error ? (
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-white/60">
          <p className="font-black text-white">Campaign evidence source unavailable.</p>
          <p className="mt-2">Campaign results couldn’t load right now.</p>
          <button type="button" className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-xs font-black text-white hover:bg-white/5" onClick={() => campaignsQuery.refetch()}>
            Retry campaign source
          </button>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Megaphone className="h-4 w-4 text-primary" />
          <p className="mt-3 text-3xl font-black text-white">{sourceReady ? campaigns.length.toLocaleString() : "—"}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Campaign records</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <p className="mt-3 text-3xl font-black text-white">{sourceReady ? activeCampaigns.length.toLocaleString() : "—"}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Active campaigns</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-3xl font-black text-white">{sourceReady ? verifiedResults.toLocaleString() : "—"}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Redemptions / results</p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Decision framework</p>
        <h3 className="mt-2 text-xl font-black text-white">What should happen after the evidence?</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "Compare against the objective",
              copy: "Judge the campaign against the customer action it was built to create, not against generic reach or vanity metrics.",
            },
            {
              icon: CircleDollarSign,
              title: "Fund only what is understood",
              copy: "A budget is an input. ROI is a conclusion. Do not display projected or modeled ROI as realized performance.",
            },
            {
              icon: CheckCircle2,
              title: "Repeat, change, or stop",
              copy: "Use confirmed activity to decide whether to scale the approach, revise the offer or audience, or stop investing in it.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Icon className="h-4 w-4 text-primary" />
                <h4 className="mt-3 text-sm font-black text-white">{item.title}</h4>
                <p className="mt-2 text-xs leading-5 text-white/50">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-6 text-white/50">
        <strong className="text-white">Not asserted here:</strong> escrow balance, liquidity APY, realized ROI, quarterly disbursement, or AI budget performance. Those belong in the product only when the underlying financial and attribution records can support them.
      </section>
    </div>
  );
}

export default BrandIntelligenceConsole;
