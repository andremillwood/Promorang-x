import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CheckCircle2, Layers3, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ClientCampaign = {
  id: string;
  title: string;
  organization_id: string | null;
  is_active: boolean;
  redemptions: number | null;
  updated_at: string;
};

export function AgencyManagedResultPack() {
  const { agencyClients, setActiveOrgId, setActiveRole } = useAuth();
  const brandClients = useMemo(() => agencyClients.filter((client) => client.type === "brand"), [agencyClients]);
  const venueClients = useMemo(() => agencyClients.filter((client) => client.type === "merchant"), [agencyClients]);
  const brandIds = useMemo(() => brandClients.map((client) => client.id), [brandClients]);

  const campaignsQuery = useQuery({
    queryKey: ["agency-managed-result-pack", brandIds.join(",")],
    enabled: brandIds.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .select("id,title,organization_id,is_active,redemptions,updated_at")
        .in("organization_id", brandIds)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ClientCampaign[];
    },
  });

  if (campaignsQuery.isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>;
  }

  if (campaignsQuery.error) {
    return <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">{(campaignsQuery.error as Error).message}</div>;
  }

  const campaigns = campaignsQuery.data || [];
  const totalRedemptions = campaigns.reduce((sum, campaign) => sum + Number(campaign.redemptions || 0), 0);
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active).length;
  const provenCampaigns = campaigns.filter((campaign) => Number(campaign.redemptions || 0) > 0).length;

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-border/70 bg-card p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Managed result pack</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight">What can you actually take back to the client?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">This view only summarizes records that are actually attached to connected client workspaces. A redemption is evidence of a recorded customer action; it is not automatically a sale, ROI claim, or incremental lift.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{brandClients.length} brand client{brandClients.length === 1 ? "" : "s"}</Badge>
            <Badge variant="outline">{venueClients.length} venue client{venueClients.length === 1 ? "" : "s"}</Badge>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Active brand work", activeCampaigns, Layers3],
            ["Brand campaigns with action", provenCampaigns, CheckCircle2],
            ["Recorded brand redemptions", totalRedemptions, TrendingUp],
          ].map(([label, value, Icon]) => {
            const MetricIcon = Icon as typeof Layers3;
            return <div key={String(label)} className="rounded-2xl border border-border/60 bg-background/60 p-4"><MetricIcon className="h-4 w-4 text-primary" /><p className="mt-3 text-3xl font-semibold">{Number(value).toLocaleString()}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{String(label)}</p></div>;
          })}
        </div>
      </div>

      {agencyClients.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Connect a client first. PROMORANG should not manufacture a result pack when there is no managed client context.</div>
      ) : (
        <div className="space-y-3">
          {agencyClients.map((client) => {
            const isVenue = client.type === "merchant";
            const clientCampaigns = isVenue ? [] : campaigns.filter((campaign) => campaign.organization_id === client.id);
            const clientRedemptions = clientCampaigns.reduce((sum, campaign) => sum + Number(campaign.redemptions || 0), 0);
            const ClientIcon = isVenue ? Store : Building2;
            return (
              <article key={client.id} className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ClientIcon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-serif text-xl font-semibold">{client.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{isVenue ? "Venue client · venue evidence remains in the Merchant workspace" : `Brand client · ${clientCampaigns.length} recorded campaign${clientCampaigns.length === 1 ? "" : "s"}`}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setActiveOrgId(client.id); setActiveRole(isVenue ? "merchant" : "brand"); }}>Open client workspace <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>

                {isVenue ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">This Agency pack does not yet have a canonical venue-result projection, so it does not display zeroes as if the venue produced no result. Open the Merchant workspace to review real validation, commerce, place and receipt evidence.</div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-muted/30 p-4"><p className="text-2xl font-semibold">{clientCampaigns.filter((c) => c.is_active).length}</p><p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Active</p></div>
                    <div className="rounded-2xl bg-muted/30 p-4"><p className="text-2xl font-semibold">{clientCampaigns.filter((c) => Number(c.redemptions || 0) > 0).length}</p><p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">With recorded action</p></div>
                    <div className="rounded-2xl bg-muted/30 p-4"><p className="text-2xl font-semibold">{clientRedemptions.toLocaleString()}</p><p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Redemptions</p></div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AgencyManagedResultPack;
