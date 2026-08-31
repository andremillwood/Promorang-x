import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BrandImpactDashboard } from "@/components/brand/BrandImpactDashboard";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { DashboardWorkspaceNav } from "@/components/dashboard/DashboardWorkspaceNav";
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

const roleTone = {
  brand: {
    labelKey: "agencyDash.brandClient" as const,
    icon: Building2,
    chip: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  merchant: {
    labelKey: "agencyDash.venueClient" as const,
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
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("clients");
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
  const pendingRelationships = (relationshipQuery.data?.relationships || []).filter((relationship) => relationship.status === "pending").length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHero
        badge={t("agencyDash.badge")}
        title={t("agencyDash.title")}
        description={t("agencyDash.copy", { name: activeOrg?.name || t("agencyDash.badge") })}
        actions={[
          agencyClients.length === 0
            ? { label: t("agencyDash.connectFirst"), onClick: () => setActiveTab("clients"), icon: Building2 }
            : clientCampaigns.length === 0
              ? { label: t("agencyDash.chooseActivate"), onClick: () => setActiveTab("clients"), icon: Building2 }
              : provenClientCampaigns.length > 0
                ? { label: t("agencyDash.packageProof"), onClick: () => setActiveTab("impact"), icon: TrendingUp }
                : { label: t("agencyDash.reviewWork"), onClick: () => setActiveTab("activations"), icon: Sparkles },
          { label: t("agencyDash.openPortfolio"), onClick: () => setActiveTab("clients"), icon: Briefcase },
          { label: t("agencyDash.chooseWorkspace"), onClick: () => setActiveTab("clients"), icon: Building2 },
          { label: t("agencyDash.reviewImpact"), onClick: () => setActiveTab("impact"), icon: TrendingUp },
        ]}
        stats={[
          { label: t("agencyDash.clientAccounts"), value: agencyClients.length.toString(), helper: t("agencyDash.helpManaged"), icon: Briefcase, accentClass: "text-primary-light" },
          { label: t("agencyDash.brandClients"), value: brandClients.toString(), helper: t("agencyDash.helpBrand"), icon: Building2, accentClass: "text-sky-300" },
          { label: t("agencyDash.venueClients"), value: venueClients.toString(), helper: t("agencyDash.helpVenue"), icon: Store, accentClass: "text-emerald-300" },
          { label: t("agencyDash.liveActivations"), value: activeClientCampaigns.length.toString(), helper: t("agencyDash.helpLive"), icon: Sparkles, accentClass: "text-amber-300" },
          { label: t("agencyDash.provenResults"), value: provenClientCampaigns.length.toString(), helper: t("agencyDash.helpProven"), icon: TrendingUp, accentClass: "text-emerald-300" },
        ]}
        isLoading={clientCampaignQuery.isLoading}
      />

      <DashboardWorkspaceNav
        eyebrow={t("agencyDash.eyebrow")}
        title={t("agencyDash.workspaceTitle")}
        activeValue={activeTab}
        onValueChange={setActiveTab}
        anchorId="agency-workspace"
        items={[
          { value: "clients", label: t("agencyDash.tabClients"), icon: Building2 },
          { value: "activations", label: t("agencyDash.tabActivations"), icon: Sparkles },
          { value: "impact", label: t("agencyDash.tabImpact"), icon: TrendingUp },
        ]}
      />

      <section aria-labelledby="agency-attention-heading" className="grid gap-3 rounded-3xl border border-border/70 bg-card/55 p-5 sm:grid-cols-3 sm:p-6">
        <div className="sm:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("agencyDash.portfolioAttention")}</p>
          <h2 id="agency-attention-heading" className="mt-2 font-serif text-2xl font-semibold">{t("agencyDash.attentionHeading")}</h2>
        </div>
        {[
          { label: t("agencyDash.relReq"), value: pendingRelationships, detail: pendingRelationships ? t("agencyDash.relReqYes") : t("agencyDash.relReqNo"), action: "clients" },
          { label: t("agencyDash.actMotion"), value: activeClientCampaigns.length, detail: activeClientCampaigns.length ? t("agencyDash.actMotionYes") : t("agencyDash.actMotionNo"), action: "activations" },
          { label: t("agencyDash.resReady"), value: provenClientCampaigns.length, detail: provenClientCampaigns.length ? t("agencyDash.resReadyYes") : t("agencyDash.resReadyNo"), action: "impact" },
        ].map((item) => (
          <button key={item.label} type="button" onClick={() => setActiveTab(item.action)} className="group rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-bold">{item.label}</p><span className="font-serif text-3xl font-semibold text-primary">{item.value}</span></div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.detail}</p>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-primary">{t("agencyDash.openWs")} <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </button>
        ))}
      </section>

      <div id="agency-workspace" className={`${activeTab === "clients" ? "scroll-mt-28" : "hidden"} rounded-3xl border border-border bg-card p-5 sm:p-6`}>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("agencyDash.currentAcct")}</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{activeOrg?.name || t("agencyDash.fallbackName")}</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("agencyDash.acctCopy")}
            </p>
          </div>
          <QuickAddClient organizationId={activeOrgId} />
        </div>
      </div>

      <div className={`${activeTab === "activations" ? "scroll-mt-28" : "hidden"} grid gap-6`}>
        <div className="min-w-0">
      <RoleActivationPanel
        eyebrow={t("agencyDash.today")}
        title={t("agencyDash.proveTitle")}
        description={t("agencyDash.proveCopy")}
        items={[
          {
            title: t("agencyDash.addFirst"),
            description: t("agencyDash.addFirstCopy"),
            status: agencyClients.length > 0 ? "done" : "current",
            ctaLabel: t("agencyDash.addClient"),
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
          {
            title: t("agencyDash.launchFirst"),
            description: t("agencyDash.launchFirstCopy"),
            status: "todo",
            onClick: () => setActiveTab("clients"),
            ctaLabel: t("agencyDash.chooseClient"),
          },
          {
            title: t("agencyDash.exportFirst"),
            description: t("agencyDash.exportFirstCopy"),
            status: "todo",
            href: "#agency-impact",
            ctaLabel: t("agencyDash.reviewImpactCta"),
          },
        ]}
      />
        </div>
      </div>

      <div className={`${activeTab === "clients" ? "" : "hidden"} grid gap-6`}>
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("agencyDash.portfolio")}</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{t("agencyDash.managed")}</h3>
            </div>
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {t("agencyDash.activeCount", { count: agencyClients.length })}
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
                  <div key={relationship.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <ClientIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {relationship.relationship_type ? t("agencyDash.relType", { type: relationship.relationship_type }) : t("agencyDash.managedAcct")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border ${tone.chip}`}>{t(tone.labelKey)}</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {relationship.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveOrgId(client.id);
                          if (client.type === "brand") setActiveRole("brand");
                          if (client.type === "merchant") setActiveRole("merchant");
                        }}
                      >
                        {t("agencyDash.openAcct")}
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
                              title: t("agencyDash.discTitle"),
                              description: t("agencyDash.discBody", { name: client.name }),
                            });
                          } catch (error: unknown) {
                            toast({
                              title: t("agencyDash.discFail"),
                              description: error instanceof Error ? error.message : t("agencyDash.tryAgain"),
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {t("agencyDash.remove")}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                {t("agencyDash.empty")}
              </div>
            )}
          </div>
        </div>

      </div>

      <div id="agency-impact" className={activeTab === "impact" ? "scroll-mt-28" : "hidden"}>
        <BrandImpactDashboard />
      </div>
    </div>
  );
};

export default AgencyDashboard;
