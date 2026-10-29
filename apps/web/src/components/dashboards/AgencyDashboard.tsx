import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { AgencyManagedResultPack } from "@/components/agency/AgencyManagedResultPack";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useRoleWorkspaceTab } from "@/hooks/useRoleWorkspaceTab";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAgencyRelationship, useAgencyRelationships } from "@/hooks/useAgencyClients";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

const roleTone = {
  brand: {
    label: "Brand Client",
    icon: Building2,
    chip: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  merchant: {
    label: "Venue Client",
    icon: Store,
    chip: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
} as const;

type ClientCampaign = {
  id: string;
  title: string;
  organization_id: string | null;
  is_active: boolean;
  redemptions: number;
  updated_at: string;
};

const AgencyDashboard = () => {
  const { t: webT } = useI18n();
  const { t } = useI18n();
  const { activeTab, setActiveTab } = useRoleWorkspaceTab("clients", ["clients", "activations", "impact"]);
  const { agencyClients, organizations, activeOrgId, setActiveOrgId, setActiveRole, refreshWorkspaceContext } = useAuth();
  const { toast } = useToast();
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const relationshipQuery = useAgencyRelationships({
    agencyId: activeOrgId,
    enabled: !!activeOrgId && activeOrg?.type === "agency",
  });
  const deleteRelationship = useDeleteAgencyRelationship();

  const brandClients = agencyClients.filter((client) => client.type === "brand").length;
  const venueClients = agencyClients.filter((client) => client.type === "merchant").length;
  const brandClientIds = agencyClients.filter((client) => client.type === "brand").map((client) => client.id);
  const clientCampaignQuery = useQuery({
    queryKey: ["agency-client-campaigns", activeOrgId, brandClientIds.join(",")],
    enabled: brandClientIds.length > 0,
    queryFn: async () => {
      // Generated client types lag the organization_id campaign migration.
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
  const pendingRelationships = (relationshipQuery.data?.relationships || []).filter((relationship) => relationship.status === "pending").length;

  const primaryTab = agencyClients.length === 0 || clientCampaigns.length === 0 ? "clients" : provenClientCampaigns.length > 0 ? "impact" : "activations";
  const primaryLabel = agencyClients.length === 0 ? "Connect your first client" : clientCampaigns.length === 0 ? "Choose a client to activate" : primaryTab === "impact" ? "Package client proof" : "Review active client work";
  const openSection = (value: string) => {
    setActiveTab(value);
    window.requestAnimationFrame(() => {
      const section = document.querySelector<HTMLElement>(`[data-agency-section="${value}"]`);
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <div data-role-workspace="agency" className="dark min-w-0 space-y-6">
      {relationshipQuery.isError || clientCampaignQuery.isError ? <div role="alert" className="rounded-sm border border-amber-300/25 p-4 text-sm"><p>Some client activity could not be loaded. Available accounts remain visible.</p><button type="button" disabled={relationshipQuery.isFetching || clientCampaignQuery.isFetching} onClick={() => { void Promise.allSettled([relationshipQuery.refetch(), clientCampaignQuery.refetch()]); }} className="mt-2 min-h-11 underline disabled:opacity-50">{webT("common.tryAgain")}</button></div> : null}
      <DashboardHero
        badge={t("agencyDash.badge")}
        title={t("agencyDash.title")}
        description={t("agencyDash.copy", { name: activeOrg?.name || t("agencyDash.badge") })}
        actions={[
          { label: primaryLabel, onClick: () => openSection(primaryTab), icon: Building2 },
          ...[
            { value: "clients", label: "Open client portfolio", icon: Briefcase },
            { value: "activations", label: "Review client activations", icon: Sparkles },
            { value: "impact", label: "Review client impact", icon: TrendingUp },
          ].filter((item) => item.value !== primaryTab).map((item) => ({ label: item.label, icon: item.icon, onClick: () => openSection(item.value) })),
        ]}
        stats={[
          { label: t("agencyDash.clientAccounts"), value: agencyClients.length.toString(), helper: "Managed directly", icon: Briefcase, accentClass: "text-primary-light" },
          { label: t("agencyDash.brandClients"), value: brandClients.toString(), helper: "Brand relationships", icon: Building2, accentClass: "text-sky-300" },
          { label: t("agencyDash.venueClients"), value: venueClients.toString(), helper: "Venue relationships", icon: Store, accentClass: "text-emerald-300" },
        ]}
        isLoading={clientCampaignQuery.isLoading}
      />

      <nav aria-label={t("agencyDash.workspaceTitle")} className="flex flex-wrap gap-2 rounded-sm  p-2">
        {[
          {value: "clients", label: t("agencyDash.tabClients")},
          {value: "activations", label: t("agencyDash.tabActivations")},
          {value: "impact", label: t("agencyDash.tabImpact")},
        ].map((item) => <button key={item.value} type="button" aria-pressed={activeTab === item.value} onClick={() => setActiveTab(item.value)} className={`min-h-11 rounded-none border-b-[3px] px-4 py-2 text-sm font-medium ${activeTab === item.value ? "border-orange-400 text-orange-300" : "border-transparent text-white/70 hover:bg-white/5"}`}>{item.label}</button>)}
      </nav>

      <section aria-labelledby="agency-attention-heading" className="grid gap-3 rounded-sm  bg-card/55 p-5 sm:grid-cols-3 sm:p-6">
        <div className="sm:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("agencyDash.portfolioAttention")}</p>
          <h2 id="agency-attention-heading" className="mt-2 font-sans text-2xl font-semibold tracking-tight">{t("agencyDash.attentionHeading")}</h2>
        </div>
        {[
          { label: "Relationship requests", value: relationshipQuery.isError ? "—" : pendingRelationships, detail: relationshipQuery.isError ? "Relationship requests are unavailable." : pendingRelationships ? "Approve or decline client access." : "No access requests waiting.", action: "clients" },
          { label: "Activations in motion", value: clientCampaignQuery.isError ? "—" : activeClientCampaigns.length, detail: clientCampaignQuery.isError ? "Client activity is unavailable." : activeClientCampaigns.length ? "Check execution and unblock delivery." : "No client activations are live.", action: "activations" },
          { label: "Results ready", value: clientCampaignQuery.isError ? "—" : provenClientCampaigns.length, detail: clientCampaignQuery.isError ? "Client results are unavailable." : provenClientCampaigns.length ? "Turn verified outcomes into a client decision." : "No proven result is ready yet.", action: "impact" },
        ].map((item) => (
          <button key={item.label} type="button" onClick={() => setActiveTab(item.action)} className="group rounded-sm  bg-background/60 p-4 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex flex-wrap items-start justify-between gap-3"><p className="text-sm font-bold">{item.label}</p><span className="font-sans text-3xl font-semibold tabular-nums text-foreground">{item.value}</span></div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.detail}</p>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-primary">Open workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </button>
        ))}
      </section>

      <div data-agency-section="clients" tabIndex={-1} id="agency-workspace" className={`${activeTab === "clients" ? "scroll-mt-28" : "hidden"} rounded-sm  bg-card p-5 sm:p-6`}>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Current Account</p>
            <h3 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-foreground">{activeOrg?.name || "Agency portfolio"}</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Use this view to connect brand and venue clients, manage their work, and package clear proof of outcomes.
            </p>
          </div>
          <QuickAddClient organizationId={activeOrgId} />
        </div>
      </div>

      <div data-agency-section="activations" tabIndex={-1} className={`${activeTab === "activations" ? "scroll-mt-28" : "hidden"} grid gap-6`}>
        <div className="min-w-0">
      <RoleActivationPanel
        eyebrow="Agency Today"
        title="Prove one client outcome end to end."
        description="Agencies win when they make the first managed result undeniable: add a client account, launch a campaign, then show the attributed movement back to that client."
        items={[
          {
            title: "Add first client",
            description: "Connect the first brand or venue account you will manage.",
            status: agencyClients.length > 0 ? "done" : "current",
            ctaLabel: "Add client",
            onClick: () => openSection("clients"),
          },
          {
            title: "Launch first activation",
            description: "Open the client account first so ownership, budget, and results stay attached to the correct workspace.",
            status: clientCampaigns.length > 0 ? "done" : agencyClients.length > 0 ? "current" : "todo",
            onClick: () => setActiveTab("clients"),
            ctaLabel: clientCampaigns.length > 0 ? "Review client work" : "Choose client",
          },
          {
            title: "Package first result",
            description: "Use the managed result pack as the client-facing proof artifact after a recorded outcome exists.",
            status: provenClientCampaigns.length > 0 ? "done" : clientCampaigns.length > 0 ? "current" : "todo",
            onClick: () => setActiveTab("impact"),
            ctaLabel: provenClientCampaigns.length > 0 ? "Open result pack" : "Review impact",
          },
        ]}
      />
        </div>
      </div>

      <div className={`${activeTab === "clients" ? "" : "hidden"} grid gap-6`}>
        <div className="rounded-sm  bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Client Portfolio</p>
              <h3 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-foreground">Managed Accounts</h3>
            </div>
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {agencyClients.length} {webT("web.activeLower")}
            </Badge>
          </div>

          <div className="mt-5 space-y-3">
            {relationshipQuery.data?.relationships?.length ? (
              relationshipQuery.data.relationships
                .filter((relationship) => relationship.agency_id === activeOrgId)
                .map((relationship) => {
                const client = relationship.client;
                if (!client) return null;
                const tone = roleTone[client.type as keyof typeof roleTone] || roleTone.brand;
                const ClientIcon = tone.icon;

                return (
                  <div key={relationship.id} className="rounded-sm  bg-background/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                          <ClientIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="break-words font-semibold text-foreground">{client.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {relationship.relationship_type ? `${relationship.relationship_type} relationship` : "Managed account"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border ${tone.chip}`}>{tone.label}</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {relationship.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={relationship.status !== "active"}
                        onClick={() => {
                          setActiveOrgId(client.id);
                          if (client.type === "brand") setActiveRole("brand");
                          if (client.type === "merchant") setActiveRole("merchant");
                        }}
                      >
                        {relationship.status === "active" ? "Open account" : "Awaiting access"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await deleteRelationship.mutateAsync(relationship.id);
                            await refreshWorkspaceContext();
                            toast({
                              title: "Client disconnected",
                              description: `${client.name} was removed from this agency portfolio.`,
                            });
                          } catch (error: unknown) {
                            toast({
                              title: "Disconnect failed",
                              description: error instanceof Error ? error.message : webT("web.tryAgainShort"),
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Remove client
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-sm border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No agency clients connected yet. Add a client account to start operating campaigns across brands and venues.
              </div>
            )}
          </div>
        </div>

      </div>

      <div data-agency-section="impact" tabIndex={-1} id="agency-impact" className={activeTab === "impact" ? "scroll-mt-28" : "hidden"}>
        <AgencyManagedResultPack />
      </div>
    </div>
  );
};

export default AgencyDashboard;
