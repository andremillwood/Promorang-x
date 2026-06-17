import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BrandImpactDashboard } from "@/components/brand/BrandImpactDashboard";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAgencyRelationship, useAgencyRelationships } from "@/hooks/useAgencyClients";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Link2,
  Plus,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

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

const AgencyDashboard = () => {
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHero
        badge="Agency Command"
        title="Operate multi-client work from one proof layer"
        description={`${activeOrg?.name || "Agency workspace"} should feel like an operator cockpit: launch client activations, match the right collaborators, and export verified outcomes.`}
        actions={[
          { label: "Agency story", href: "/for-agencies", icon: Sparkles },
          { label: "Create campaign", href: "/create/campaign", icon: Plus },
        ]}
        stats={[
          { label: "Client Workspaces", value: agencyClients.length.toString(), helper: "Managed directly", icon: Briefcase, accentClass: "text-primary-light" },
          { label: "Brand Clients", value: brandClients.toString(), helper: "Brand relationships", icon: Building2, accentClass: "text-sky-300" },
          { label: "Venue Clients", value: venueClients.toString(), helper: "Venue relationships", icon: Store, accentClass: "text-emerald-300" },
          { label: "Operating Mode", value: "Managed", helper: "Agency-led operations", icon: Link2, accentClass: "text-amber-300" },
        ]}
      />

      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Current Workspace</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{activeOrg?.name || "Agency workspace"}</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              This is the command layer you use to attach brand and venue workspaces, switch into them, and prove client outcomes back out.
            </p>
          </div>
          <QuickAddClient organizationId={activeOrgId} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div>
      <RoleActivationPanel
        eyebrow="Agency Today"
        title="Prove one client outcome end to end."
        description="Agencies win when they make the first managed result undeniable: add a client workspace, launch a campaign, then show the attributed movement back to that client."
        items={[
          {
            title: "Add first client",
            description: "Connect the first brand or venue workspace you will operate for.",
            status: agencyClients.length > 0 ? "done" : "current",
            ctaLabel: "Add client",
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
          {
            title: "Launch first activation",
            description: "Create the campaign that turns agency strategy into a live field program.",
            status: "todo",
            href: "/create/campaign",
            ctaLabel: "Create campaign",
          },
          {
            title: "Export first result",
            description: "Use the impact layer as the proof artifact for your client relationship.",
            status: "todo",
            href: "#agency-impact",
            ctaLabel: "Review impact",
          },
        ]}
      />
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">How This Works</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Connect a brand or venue workspace to this agency command center.</p>
              <p>Switch into that workspace when you need to operate campaigns or reporting from the client perspective.</p>
              <p>The client can remove the agency connection later from their brand workspace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Client Portfolio</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Managed Accounts</h3>
            </div>
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {agencyClients.length} active
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
                            {relationship.relationship_type ? `${relationship.relationship_type} relationship` : "Managed workspace"}
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
                        onClick={() => {
                          setActiveOrgId(client.id);
                          if (client.type === "brand") setActiveRole("brand");
                          if (client.type === "merchant") setActiveRole("merchant");
                        }}
                      >
                        Switch to workspace
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
                              description: error instanceof Error ? error.message : "Try again.",
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
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No agency clients connected yet. Add a client workspace to start operating campaigns across brands and venues.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Why agency mode matters</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Operate multiple client workspaces from one Promorang command layer.",
              "Use creator-to-footfall attribution as the proof layer for client reporting.",
              "Coordinate brand, venue, creator, and participant outcomes in one loop.",
              "Package Founder, Mayor, Catalyst, and Memory mechanics as managed campaigns.",
            ].map((line) => (
              <div key={line} className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Agency Play</span>
                </div>
                {line}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/80">Client switching</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the organization switcher in the shell or the “Switch to workspace” action above to move into a specific brand or venue before managing their campaigns.
            </p>
            <Button asChild size="sm" variant="ghost" className="mt-3">
              <Link to="/dashboard">
                Open workspace switcher
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div id="agency-impact">
        <BrandImpactDashboard />
      </div>
    </div>
  );
};

export default AgencyDashboard;
