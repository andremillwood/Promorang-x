import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BrandImpactDashboard } from "@/components/brand/BrandImpactDashboard";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import {
  Briefcase,
  Building2,
  Link2,
  Plus,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

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
  const { agencyClients, organizations, activeOrgId } = useAuth();
  const activeOrg = organizations.find((org) => org.id === activeOrgId);

  const brandClients = agencyClients.filter((client) => client.type === "brand").length;
  const venueClients = agencyClients.filter((client) => client.type === "merchant").length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            <Briefcase className="h-3.5 w-3.5" />
            Agency Command
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground">
            Agency <span className="text-primary italic">Operator Hub</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {activeOrg?.name || "Agency workspace"} is where you launch client campaigns, match creators and venues,
            and prove verified real-world outcomes instead of vague media performance.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
          <QuickAddClient />
          <Button variant="outline" asChild>
            <Link to="/for-agencies">
              <Sparkles className="mr-2 h-4 w-4" />
              Agency Story
            </Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/dashboard/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Client Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: "Client Workspaces", value: agencyClients.length, icon: Briefcase, tone: "text-primary" },
          { label: "Brand Clients", value: brandClients, icon: Building2, tone: "text-blue-500" },
          { label: "Venue Clients", value: venueClients, icon: Store, tone: "text-emerald-500" },
          { label: "Operating Mode", value: "Managed", icon: Link2, tone: "text-amber-500" },
        ].map((item) => (
          <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/40 sm:p-6">
            <item.icon className={`mb-4 h-6 w-6 ${item.tone} relative z-10`} />
            <p className="relative z-10 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{item.value}</p>
            <p className="relative z-10 mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</p>
          </div>
        ))}
      </div>

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
            href: "/dashboard/campaigns/create",
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
            {agencyClients.length ? (
              agencyClients.map((client) => {
                const tone = roleTone[client.type as keyof typeof roleTone] || roleTone.brand;
                const ClientIcon = tone.icon;

                return (
                  <div key={client.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <ClientIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {client.relationship_type ? `${client.relationship_type} relationship` : "Managed workspace"}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border ${tone.chip}`}>{tone.label}</Badge>
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
        </div>
      </div>

      <div id="agency-impact">
        <BrandImpactDashboard />
      </div>
    </div>
  );
};

export default AgencyDashboard;
