import { ArrowRight, CircleDollarSign, Link2, Megaphone, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { EvidencePair, NextMove, OutcomeSurface, PageLead } from "@/components/promorang-v2";
import { resolveBrandOutcome, type BrandDecisionSignal } from "@/lib/brand-outcome";

const signalTone: Record<BrandDecisionSignal["state"], string> = {
  verified: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  current: "text-[hsl(var(--pr-v2-active-role))] bg-[hsl(var(--pr-v2-active-role)/0.10)] border-[hsl(var(--pr-v2-active-role)/0.20)]",
  unknown: "text-amber-200 bg-amber-300/10 border-amber-300/20",
  upcoming: "text-[hsl(var(--pr-v2-text-3))] bg-white/[0.03] border-white/10",
};

const stateLabel: Record<BrandDecisionSignal["state"], string> = {
  verified: "Verified",
  current: "Needs attention",
  unknown: "Not yet proven",
  upcoming: "Later",
};

export default function BrandOutcomeHomeV2() {
  const { user, organizations, activeOrgId, profile, agencyClients } = useAuth();
  const campaignsQuery = useBrandCampaigns();
  const campaigns = campaignsQuery.data || [];
  const outcome = resolveBrandOutcome({ campaigns });

  const activeOrg = organizations.find((organization) => organization.id === activeOrgId);
  const managingAgency = organizations.find((organization) => organization.type === "agency");
  const isManagedClient = agencyClients.some((client) => client.id === activeOrgId);
  const brandName = activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || "Brand workspace";
  const latestCampaign = campaigns[0] || null;

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)]" data-role="brand">
      <div className="pr-v2-page space-y-10 py-2 sm:py-4">
        <PageLead
          eyebrow={isManagedClient ? `Brand · Managed by ${managingAgency?.name || "agency"}` : "Brand · Home"}
          title={brandName}
          description="Move real customers, prove what happened, and make the next budget decision from evidence instead of activity alone."
          action={
            <Link to="/create/campaign" className="pr-v2-focusable inline-flex min-h-11 items-center justify-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black">
              New activation
            </Link>
          }
        />

        <NextMove
          title={outcome.nextMove.title}
          description={outcome.nextMove.description}
          reason="The next move is based only on campaign state and attributable customer actions currently recorded by PROMORANG."
          action={
            <Link to={outcome.nextMove.href} className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black">
              {outcome.nextMove.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <section aria-labelledby="brand-decision-spine" className="space-y-4">
          <div>
            <p className="pr-v2-eyebrow">Decision spine</p>
            <h2 id="brand-decision-spine" className="pr-v2-heading mt-2">From customer outcome to a budget decision</h2>
            <p className="pr-v2-body mt-2 max-w-3xl">A stage is only called verified when the current data proves it. Budget entries, impressions, and redemptions are not silently converted into funding certainty or incremental revenue.</p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {outcome.signals.map((signal, index) => (
              <div key={signal.id} className="grid gap-3 py-5 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-start">
                <span className="grid size-8 place-items-center rounded-full border border-white/10 text-xs font-semibold text-[hsl(var(--pr-v2-text-2))]">{index + 1}</span>
                <div>
                  <p className="font-semibold text-[hsl(var(--pr-v2-text-1))]">{signal.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{signal.detail}</p>
                </div>
                <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${signalTone[signal.state]}`}>
                  {stateLabel[signal.state]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <EvidencePair
          proof={{
            value: campaignsQuery.isLoading ? "…" : outcome.totalRedemptions,
            label: "Attributed customer actions",
            description: "Recorded campaign redemptions. This is evidence of attributed action, not automatically a sale or incremental customer.",
          }}
          value={{
            value: "—",
            label: "Incremental business value",
            description: "Unavailable until PROMORANG has approved transaction, margin, lift, or other incremental-value evidence.",
          }}
        />

        <section aria-labelledby="brand-live" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pr-v2-eyebrow">Right now</p>
              <h2 id="brand-live" className="pr-v2-heading mt-2">Activations in market</h2>
            </div>
            <Link to="/dashboard?tab=campaigns" className="pr-v2-focusable inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">View all activations</Link>
          </div>

          {campaignsQuery.isLoading ? (
            <div role="status" aria-label="Loading activations" className="h-28 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" />
          ) : outcome.activeCampaigns.length === 0 ? (
            <OutcomeSurface>
              <p className="font-semibold">No activation is live right now.</p>
              <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">A draft or planned campaign can exist without being live. Review readiness before launch.</p>
              <Link to={campaigns.length ? "/dashboard?tab=campaigns" : "/create/campaign"} className="pr-v2-focusable mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
                {campaigns.length ? "Review activations" : "Create first activation"}
              </Link>
            </OutcomeSurface>
          ) : (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {outcome.activeCampaigns.slice(0, 4).map((campaign) => (
                <div key={campaign.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[hsl(var(--pr-v2-text-1))]">{campaign.title}</p>
                      <span className="rounded-full bg-[hsl(var(--pr-v2-active-role)/0.10)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--pr-v2-active-role))]">Live</span>
                    </div>
                    {campaign.description ? <p className="mt-1 text-sm text-[hsl(var(--pr-v2-text-2))]">{campaign.description}</p> : null}
                    <p className="mt-2 text-xs text-[hsl(var(--pr-v2-text-3))]">{Number(campaign.redemptions || 0).toLocaleString()} redemptions · {Number(campaign.impressions || 0).toLocaleString()} impressions</p>
                  </div>
                  <Link to="/dashboard?tab=correlation" className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
                    Review proof <Link2 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-4">
          <div>
            <Target className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" aria-hidden="true" />
            <p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Activations</p>
            <p className="mt-1 text-2xl font-semibold">{campaignsQuery.isLoading ? "…" : campaigns.length.toLocaleString()}</p>
          </div>
          <div>
            <Megaphone className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" aria-hidden="true" />
            <p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Live</p>
            <p className="mt-1 text-2xl font-semibold">{campaignsQuery.isLoading ? "…" : outcome.activeCampaigns.length.toLocaleString()}</p>
          </div>
          <div>
            <Users className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" aria-hidden="true" />
            <p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Attributed actions</p>
            <p className="mt-1 text-2xl font-semibold">{campaignsQuery.isLoading ? "…" : outcome.totalRedemptions.toLocaleString()}</p>
          </div>
          <div>
            <CircleDollarSign className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Incremental value</p>
            <p className="mt-1 text-2xl font-semibold">—</p>
          </div>
        </section>

        {latestCampaign && !outcome.activeCampaigns.length ? (
          <p className="text-xs text-[hsl(var(--pr-v2-text-3))]">Latest saved activation: {latestCampaign.title}. Saved does not mean live, funded, or proven.</p>
        ) : null}
      </div>
    </div>
  );
}
