import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandImpactDashboard } from "@/components/brand/BrandImpactDashboard";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAgencyRelationship, useAgencyRelationships } from "@/hooks/useAgencyClients";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, Building2, Store, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { EvidencePair, NextMove, OutcomeProgress, OutcomeSurface, PageLead } from "@/components/promorang-v2";

const roleTone = {
  brand: { label: "Brand client", icon: Building2 },
  merchant: { label: "Merchant client", icon: Store },
} as const;

type ClientCampaign = {
  id: string;
  title: string;
  organization_id: string | null;
  is_active: boolean;
  redemptions: number;
  updated_at: string;
};

type AgencyTab = "clients" | "activations" | "impact";

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("clients");
  const { agencyClients, organizations, activeOrgId, setActiveOrgId, setActiveRole, refreshWorkspaceContext } = useAuth();
  const { toast } = useToast();
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const relationshipQuery = useAgencyRelationships({
    agencyId: activeOrgId,
    enabled: Boolean(activeOrgId && activeOrg?.type === "agency"),
  });
  const deleteRelationship = useDeleteAgencyRelationship();

  const brandClientIds = agencyClients.filter((client) => client.type === "brand").map((client) => client.id);
  const clientCampaignQuery = useQuery({
    queryKey: ["agency-client-campaigns", activeOrgId, brandClientIds.join(",")],
    enabled: brandClientIds.length > 0,
    queryFn: async () => {
      // Generated client types lag the organization_id campaign migration.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .select("id, title, organization_id, is_active, redemptions, updated_at")
        .in("organization_id", brandClientIds)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ClientCampaign[];
    },
  });

  const clientCampaigns = clientCampaignQuery.data || [];
  const activeClientCampaigns = clientCampaigns.filter((campaign) => campaign.is_active);
  const provenClientCampaigns = clientCampaigns.filter((campaign) => Number(campaign.redemptions || 0) > 0);
  const totalVerifiedActions = clientCampaigns.reduce((sum, campaign) => sum + Number(campaign.redemptions || 0), 0);
  const pendingRelationships = (relationshipQuery.data?.relationships || []).filter((relationship) => relationship.status === "pending").length;

  const nextMove = agencyClients.length === 0
    ? {
        title: "Connect the first client you will operate for.",
        description: "Add one brand or merchant account so client work, ownership and proof stay attached to the right workspace.",
        label: "Add client",
        tab: "clients" as const,
      }
    : activeClientCampaigns.length === 0
      ? {
          title: "Choose a client and launch one measurable activation.",
          description: "Open the client workspace first. The client—not the agency dashboard—should own the activation, budget and resulting evidence.",
          label: "Choose client",
          tab: "clients" as const,
        }
      : provenClientCampaigns.length === 0
        ? {
            title: "Get one client activation to a verified customer action.",
            description: "Live activity is not yet a client result. Review execution and remove whatever is blocking the first attributable action.",
            label: "Review activations",
            tab: "activations" as const,
          }
        : {
            title: "Turn verified client movement into a client decision.",
            description: "Package the evidence clearly enough for the client to decide what to repeat, change or stop. Do not turn redemptions into invented revenue.",
            label: "Review client proof",
            tab: "impact" as const,
          };

  const stages = [
    { id: "connect", label: "Client connected", status: agencyClients.length > 0 ? "complete" as const : "current" as const },
    { id: "launch", label: "Activation live", status: activeClientCampaigns.length > 0 ? "complete" as const : agencyClients.length > 0 ? "current" as const : "upcoming" as const },
    { id: "prove", label: "Verified client outcome", status: provenClientCampaigns.length > 0 ? "complete" as const : activeClientCampaigns.length > 0 ? "current" as const : "upcoming" as const },
    { id: "package", label: "Proof packaged", status: provenClientCampaigns.length > 0 ? "current" as const : "upcoming" as const },
    { id: "repeat", label: "Repeat client work", status: "upcoming" as const },
  ];

  const tabs: Array<{ id: AgencyTab; label: string }> = [
    { id: "clients", label: "Clients" },
    { id: "activations", label: "Client work" },
    { id: "impact", label: "Proof" },
  ];

  const relationships = useMemo(
    () => (relationshipQuery.data?.relationships || []).filter((relationship) => relationship.agency_id === activeOrgId),
    [activeOrgId, relationshipQuery.data?.relationships],
  );

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)]" data-role="agency">
      <div className="pr-v2-page space-y-9 py-2 sm:py-4">
        <PageLead
          eyebrow="Agency · Home"
          title={activeOrg?.name || "Agency portfolio"}
          description="Operate client work in the correct client workspace, prove an outcome, and bring the evidence back to the client."
          action={<QuickAddClient organizationId={activeOrgId} />}
        />

        <NextMove
          title={nextMove.title}
          description={nextMove.description}
          reason="This recommendation uses only connected-client, live-campaign and recorded-redemption facts available to this agency workspace."
          action={
            <Button onClick={() => setActiveTab(nextMove.tab)} className="bg-[hsl(var(--pr-v2-active-role))] font-bold text-black hover:brightness-110">
              {nextMove.label}<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />

        <OutcomeProgress stages={stages} />

        <EvidencePair
          proof={{
            value: clientCampaignQuery.isLoading ? "…" : totalVerifiedActions,
            label: "Recorded client actions",
            description: "Campaign redemptions across connected Brand clients. These are attributable actions, not automatically sales or incremental value.",
          }}
          value={{
            value: "—",
            label: "Client business value",
            description: "Not inferred by the agency layer. Use the client workspace and approved evidence to establish value.",
          }}
        />

        <nav aria-label="Agency workspace" className="flex gap-6 overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pr-v2-focusable min-h-11 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold ${activeTab === tab.id ? "border-[hsl(var(--pr-v2-active-role))] text-[hsl(var(--pr-v2-text-1))]" : "border-transparent text-[hsl(var(--pr-v2-text-3))]"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "clients" ? (
          <section aria-labelledby="agency-clients" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="pr-v2-eyebrow">Portfolio</p>
                <h2 id="agency-clients" className="pr-v2-heading mt-2">Connected clients</h2>
                <p className="pr-v2-body mt-2">Open the actual client workspace before creating or changing client work.</p>
              </div>
              {pendingRelationships > 0 ? <Badge className="w-fit border border-amber-300/20 bg-amber-300/10 text-amber-200">{pendingRelationships} relationship request{pendingRelationships === 1 ? "" : "s"} waiting</Badge> : null}
            </div>

            {relationshipQuery.isLoading ? (
              <div role="status" aria-label="Loading clients" className="h-32 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" />
            ) : relationships.length ? (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {relationships.map((relationship) => {
                  const client = relationship.client;
                  if (!client) return null;
                  const tone = roleTone[client.type as keyof typeof roleTone] || roleTone.brand;
                  const ClientIcon = tone.icon;
                  const campaignCount = clientCampaigns.filter((campaign) => campaign.organization_id === client.id).length;
                  const clientVerifiedActions = clientCampaigns
                    .filter((campaign) => campaign.organization_id === client.id)
                    .reduce((sum, campaign) => sum + Number(campaign.redemptions || 0), 0);

                  return (
                    <article key={relationship.id} className="grid gap-4 py-5 lg:grid-cols-[42px_minmax(0,1fr)_auto] lg:items-center">
                      <span className="grid size-10 place-items-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role)/0.10)] text-[hsl(var(--pr-v2-active-role))]">
                        <ClientIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{client.name}</p>
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[hsl(var(--pr-v2-text-3))]">{tone.label}</span>
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[hsl(var(--pr-v2-text-3))]">{relationship.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-[hsl(var(--pr-v2-text-2))]">{campaignCount} activation{campaignCount === 1 ? "" : "s"} · {clientVerifiedActions} recorded action{clientVerifiedActions === 1 ? "" : "s"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveOrgId(client.id);
                            if (client.type === "brand") setActiveRole("brand");
                            if (client.type === "merchant") setActiveRole("merchant");
                          }}
                        >
                          Open client<ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              await deleteRelationship.mutateAsync(relationship.id);
                              await refreshWorkspaceContext();
                              toast({ title: "Client disconnected", description: `${client.name} was removed from this agency portfolio.` });
                            } catch (error: unknown) {
                              toast({ title: "Disconnect failed", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <OutcomeSurface>
                <p className="font-semibold">No client is connected yet.</p>
                <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">Connect one Brand or Merchant client to begin operating work in the right ownership context.</p>
              </OutcomeSurface>
            )}
          </section>
        ) : null}

        {activeTab === "activations" ? (
          <section aria-labelledby="agency-activations" className="space-y-4">
            <div>
              <p className="pr-v2-eyebrow">Client work</p>
              <h2 id="agency-activations" className="pr-v2-heading mt-2">Activations in motion</h2>
              <p className="pr-v2-body mt-2">Use this as a portfolio view. Make changes inside the corresponding client workspace.</p>
            </div>

            {clientCampaignQuery.isLoading ? (
              <div role="status" aria-label="Loading client work" className="h-32 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" />
            ) : clientCampaigns.length ? (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {clientCampaigns.map((campaign) => {
                  const client = agencyClients.find((item) => item.id === campaign.organization_id);
                  return (
                    <div key={campaign.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{campaign.title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${campaign.is_active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-[hsl(var(--pr-v2-text-3))]"}`}>{campaign.is_active ? "Live" : "Not live"}</span>
                        </div>
                        <p className="mt-1 text-sm text-[hsl(var(--pr-v2-text-2))]">{client?.name || "Client"} · {Number(campaign.redemptions || 0)} recorded redemption{Number(campaign.redemptions || 0) === 1 ? "" : "s"}</p>
                      </div>
                      {client ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveOrgId(client.id);
                            if (client.type === "brand") setActiveRole("brand");
                            if (client.type === "merchant") setActiveRole("merchant");
                          }}
                        >
                          Open client
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <OutcomeSurface>
                <p className="font-semibold">No client activation is available yet.</p>
                <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">Choose a connected client and create the work inside that client workspace.</p>
                <Button onClick={() => setActiveTab("clients")} variant="link" className="mt-3 px-0 text-[hsl(var(--pr-v2-active-role))]">Choose client</Button>
              </OutcomeSurface>
            )}
          </section>
        ) : null}

        {activeTab === "impact" ? (
          <section id="agency-impact" aria-labelledby="agency-impact-title" className="space-y-4">
            <div>
              <p className="pr-v2-eyebrow">Proof</p>
              <h2 id="agency-impact-title" className="pr-v2-heading mt-2">Package what happened for the client</h2>
              <p className="pr-v2-body mt-2">Use verified evidence to support a client decision. Do not convert activity into unsupported revenue or lift claims.</p>
            </div>
            <BrandImpactDashboard />
          </section>
        ) : null}

        <section className="grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-4">
          <div><Briefcase className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" /><p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Clients</p><p className="mt-1 text-2xl font-semibold">{agencyClients.length}</p></div>
          <div><Building2 className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" /><p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Client activations</p><p className="mt-1 text-2xl font-semibold">{clientCampaignQuery.isLoading ? "…" : clientCampaigns.length}</p></div>
          <div><Store className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" /><p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Live work</p><p className="mt-1 text-2xl font-semibold">{clientCampaignQuery.isLoading ? "…" : activeClientCampaigns.length}</p></div>
          <div><TrendingUp className="h-4 w-4 text-[hsl(var(--pr-v2-active-role))]" /><p className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">Proven campaigns</p><p className="mt-1 text-2xl font-semibold">{clientCampaignQuery.isLoading ? "…" : provenClientCampaigns.length}</p></div>
        </section>
      </div>
    </div>
  );
}
