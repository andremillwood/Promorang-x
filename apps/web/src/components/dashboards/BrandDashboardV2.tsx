import { Suspense, lazy, useMemo, useState } from "react";
import { 
  BarChart3, 
  Users, 
  Gift, 
  Eye, 
  Building2, 
  Sparkles, 
  Handshake, 
  Award, 
  Coins, 
  TrendingUp, 
  Zap,
  Target,
  Plus,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock3,
  Link2,
  ExternalLink,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { useBrandEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { DashboardHero, DashboardNextStepsSection, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CommercialProofLoop } from "@/components/commercial/CommercialProofLoop";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";
import { useCampaignProofOutcome } from "@/hooks/useProofOutcome";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { useAgencyRelationships, useDeleteAgencyRelationship, useUpdateAgencyRelationship } from "@/hooks/useAgencyClients";
import { useToast } from "@/hooks/use-toast";

const BrandSponsorshipTab = lazy(() =>
  import("@/components/brand/BrandSponsorshipTab").then((module) => ({ default: module.BrandSponsorshipTab })),
);
const FlashCampaignCompiler = lazy(() =>
  import("@/components/campaigns/FlashCampaignCompiler").then((module) => ({ default: module.FlashCampaignCompiler })),
);
const BrandEstimator = lazy(() =>
  import("@/components/brand/BrandEstimator").then((module) => ({ default: module.BrandEstimator })),
);
const IntelligenceBureau = lazy(() =>
  import("@/components/brand/IntelligenceBureau").then((module) => ({ default: module.IntelligenceBureau })),
);

const tabFallback = <Skeleton className="h-64 rounded-xl" />;

type PublicMomentRow = Tables<"view_public_moment_directory">;
type PublicContentRow = Tables<"view_public_content_directory">;
type PublicVenueRow = Tables<"view_public_venue_directory">;

type CorrelationRow = {
  content: PublicContentRow;
  moment: PublicMomentRow | null;
  relationship: "existing_brand_link" | "moment_match" | "open_opportunity";
};

// ============================================================================
// BRAND DASHBOARD V2
// Campaign-first design with progressive disclosure
// ============================================================================

const BrandDashboardV2 = () => {
  const { user, organizations, activeOrgId, profile, refreshWorkspaceContext } = useAuth();
  const { toast } = useToast();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  const { isLoading: statsLoading } = useBrandStats();
  const { data: economy, isLoading: economyLoading } = useBrandEconomy();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "campaigns";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isFlashCompilerOpen, setIsFlashCompilerOpen] = useState(false);
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const activeBrandName = activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || user?.email || "Your brand";
  const activeBrandSlug = activeOrg?.slug || null;

  // Calculate brand maturity
  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];
  const isNewBrand = !campaigns || campaigns.length === 0;
  const isActiveBrand = campaigns && campaigns.length > 0 && campaigns.length < 3;
  const isEstablishedBrand = campaigns && campaigns.length >= 3;
  const featuredCampaign = activeCampaigns[0] || campaigns?.[0] || null;
  const proofOutcomeQuery = useCampaignProofOutcome(featuredCampaign?.id);

  const brandWorkspaceQuery = useQuery({
    queryKey: ["brand-workspace-opportunities", activeOrgId, activeBrandSlug, activeBrandName],
    queryFn: async () => {
      const [momentsResult, contentResult, venuesResult] = await Promise.all([
        supabase
          .from("view_public_moment_directory")
          .select("*")
          .eq("is_active", true)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(36),
        supabase
          .from("view_public_content_directory")
          .select("*")
          .order("posted_at", { ascending: false, nullsFirst: false })
          .limit(36),
        supabase
          .from("view_public_venue_directory")
          .select("*")
          .order("popularity_score", { ascending: false, nullsFirst: false })
          .limit(24),
      ]);

      if (momentsResult.error) throw momentsResult.error;
      if (contentResult.error) throw contentResult.error;
      if (venuesResult.error) throw venuesResult.error;

      return {
        moments: (momentsResult.data || []) as PublicMomentRow[],
        content: (contentResult.data || []) as PublicContentRow[],
        venues: (venuesResult.data || []) as PublicVenueRow[],
      };
    },
  });

  // Calculate total impact
  const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
  const totalRedemptions = campaigns?.reduce((sum, c) => sum + (c.redemptions || 0), 0) || 0;
  const agencyRelationshipQuery = useAgencyRelationships({
    clientId: activeOrgId,
    enabled: !!activeOrgId && activeOrg?.type === "brand",
  });
  const deleteAgencyRelationship = useDeleteAgencyRelationship();
  const updateAgencyRelationship = useUpdateAgencyRelationship();
  const workspaceMoments = useMemo(() => brandWorkspaceQuery.data?.moments || [], [brandWorkspaceQuery.data?.moments]);
  const workspaceContent = useMemo(() => brandWorkspaceQuery.data?.content || [], [brandWorkspaceQuery.data?.content]);
  const workspaceVenues = useMemo(() => brandWorkspaceQuery.data?.venues || [], [brandWorkspaceQuery.data?.venues]);
  const connectedAgencies = useMemo(
    () => (agencyRelationshipQuery.data?.relationships || []).filter((row) => row.client_id === activeOrgId),
    [agencyRelationshipQuery.data?.relationships, activeOrgId],
  );

  const {
    directlyAssociatedMoments,
    openMoments,
    directlyAssociatedContent,
    openContent,
    correlationRows,
  } = useMemo(() => {
    const brandName = activeBrandName.toLowerCase();
    const brandSlug = activeBrandSlug?.toLowerCase() || null;
    const associatedMomentMap = new Map<string, PublicMomentRow>();

    const matchesBrand = (names?: string[] | null, slugs?: string[] | null) => {
      const slugMatch = brandSlug ? (slugs || []).some((slug) => slug?.toLowerCase() === brandSlug) : false;
      const nameMatch = (names || []).some((name) => name?.toLowerCase() === brandName);
      return slugMatch || nameMatch;
    };

    const directlyAssociatedMoments = workspaceMoments
      .filter((moment) => matchesBrand(moment.associated_brand_names, moment.associated_brand_slugs))
      .sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));

    directlyAssociatedMoments.forEach((moment) => {
      if (moment.id) associatedMomentMap.set(moment.id, moment);
    });

    const openMoments = workspaceMoments
      .filter((moment) => !matchesBrand(moment.associated_brand_names, moment.associated_brand_slugs))
      .sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));

    const directlyAssociatedContent = workspaceContent
      .filter((item) => matchesBrand(item.associated_brand_names, item.associated_brand_slugs))
      .sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());

    const openContent = workspaceContent
      .filter((item) => !matchesBrand(item.associated_brand_names, item.associated_brand_slugs))
      .sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());

    const correlationRows: CorrelationRow[] = workspaceContent
      .map((item) => {
        const linkedMoment = item.linked_moment_id ? associatedMomentMap.get(item.linked_moment_id) || workspaceMoments.find((moment) => moment.id === item.linked_moment_id) || null : null;
        const relationship: CorrelationRow["relationship"] = matchesBrand(item.associated_brand_names, item.associated_brand_slugs)
          ? "existing_brand_link"
          : linkedMoment
            ? "moment_match"
            : "open_opportunity";

        return { content: item, moment: linkedMoment, relationship };
      })
      .filter((row) => row.moment || row.relationship !== "open_opportunity")
      .sort((a, b) => {
        const score = (row: CorrelationRow) => {
          if (row.relationship === "existing_brand_link") return 3;
          if (row.relationship === "moment_match") return 2;
          return 1;
        };
        return score(b) - score(a);
      });

    return {
      directlyAssociatedMoments,
      openMoments,
      directlyAssociatedContent,
      openContent,
      correlationRows,
    };
  }, [workspaceMoments, workspaceContent, activeBrandName, activeBrandSlug]);

  const opportunitiesMoments = directlyAssociatedMoments.length > 0 ? directlyAssociatedMoments.slice(0, 4) : openMoments.slice(0, 4);
  const opportunitiesContent = directlyAssociatedContent.length > 0 ? directlyAssociatedContent.slice(0, 4) : openContent.slice(0, 4);
  const opportunitiesVenues = workspaceVenues
    .slice()
    .sort((a, b) => Number(b.active_moments_count || 0) - Number(a.active_moments_count || 0))
    .slice(0, 4);
  const topCorrelationRows = correlationRows.slice(0, 6);

  return (
    <div className="space-y-6 pb-20">
      <DashboardHero
        badge="PromoPush Dashboard"
        title={isNewBrand ? "Launch the first campaign you can actually prove" : "Turn campaign attention into verified movement"}
        description="Fund a moment, drop, or reward people actually want, verify who acted, attribute what happened, then scale the communities that moved."
        actions={[
          { label: "Quick launch", icon: Zap, onClick: () => setIsFlashCompilerOpen(!isFlashCompilerOpen) },
          { label: "Create offer", icon: Gift, href: "/dashboard/offers" },
          { label: isEstablishedBrand ? "Insights" : "Planner", icon: BarChart3, onClick: () => setActiveTab(isEstablishedBrand ? "insights" : "planner") },
        ]}
        stats={[
          { label: "Active campaigns", value: activeCampaigns.length.toLocaleString(), helper: "Live right now", icon: Target },
          { label: "Participants", value: totalImpressions.toLocaleString(), helper: "Attributed actions", icon: Users },
          { label: "Redemptions", value: totalRedemptions.toLocaleString(), helper: "Outcome signals", icon: Gift },
          { label: "Points given", value: economy?.totalPointsDistributed?.toLocaleString() || "0", helper: "Distributed through campaigns", icon: Coins },
        ]}
        isLoading={statsLoading || economyLoading}
      />

      {/* =====================================================================
          FLASH COMPILER: Collapsible quick create
          ===================================================================== */}
      {isFlashCompilerOpen && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Flash Launchpad</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsFlashCompilerOpen(false)}>
              Close
            </Button>
          </div>
          <Suspense fallback={tabFallback}>
            <FlashCampaignCompiler onSuccess={() => setIsFlashCompilerOpen(false)} />
          </Suspense>
        </div>
      )}

      {/* =====================================================================
          NEW BRAND: First Campaign Guidance
          ===================================================================== */}
      {isNewBrand && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Launch Your First PromoPush</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start with one live Moment, one clear participant action, and one distribution zone. Then review joins, redemptions, content, and proof-bearing outcomes.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/create/campaign">
                      <Plus className="w-4 h-4 mr-2" />
                      Create PromoPush
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("planner")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Plan First
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isNewBrand && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Brand Journey</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {isEstablishedBrand ? "3/3" : isActiveBrand ? "2/3" : "1/3"}
              </Badge>
            </div>
            <Progress 
              value={isEstablishedBrand ? 100 : isActiveBrand ? 66 : 33} 
              className="h-2 mb-3" 
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { 
                  label: "First campaign", 
                  done: campaigns && campaigns.length > 0,
                  icon: Target
                },
                { 
                  label: "Get participants", 
                  done: totalImpressions > 0,
                  icon: Users
                },
                { 
                  label: "3+ campaigns", 
                  done: isEstablishedBrand,
                  icon: Award
                },
              ].map((step, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col items-center p-3 rounded-xl text-center ${
                    step.done ? "bg-emerald-500/5" : "bg-muted/30"
                  }`}
                >
                  <step.icon className={`w-4 h-4 mb-1 ${step.done ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={`text-xs ${step.done ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                  {step.done && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10">
        <CardContent className="p-5 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Agency Access</p>
              <h3 className="mt-2 font-serif text-2xl font-bold">Who is managing this brand?</h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Connect the agencies allowed to operate this workspace, review pending requests, and remove an agency when the relationship ends.
              </p>
            </div>
            <QuickAddClient mode="brand" organizationId={activeOrgId} />
          </div>

          <div className="mt-5 space-y-3">
            {connectedAgencies.length > 0 ? (
              connectedAgencies.map((relationship) => (
                <div key={relationship.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{relationship.agency?.name || "Agency workspace"}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {relationship.relationship_type} relationship
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {relationship.status}
                      </Badge>
                      {relationship.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await updateAgencyRelationship.mutateAsync({ id: relationship.id, status: "active" });
                              toast({ title: "Agency approved", description: "The workspace connection is now live." });
                            } catch (error: unknown) {
                              toast({
                                title: "Approval failed",
                                description: error instanceof Error ? error.message : "Try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Approve
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await deleteAgencyRelationship.mutateAsync(relationship.id);
                            await refreshWorkspaceContext();
                            toast({
                              title: "Agency removed",
                              description: `${relationship.agency?.name || "Agency"} no longer manages this brand.`,
                            });
                          } catch (error: unknown) {
                            toast({
                              title: "Removal failed",
                              description: error instanceof Error ? error.message : "Try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No agencies are connected to this brand workspace yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <DashboardNextStepsSection
            description="Keep brand work focused on one provable operating loop before broadening the surface area."
            ctaLabel="Open planner"
            ctaOnClick={() => setActiveTab("planner")}
            items={[
              {
                title: "Launch activation",
                description: "Create the next campaign with one clear human outcome.",
                cta: "Create campaign",
                href: "/create/campaign",
              },
              {
                title: "Connect operators",
                description: "Match creators, venues, hosts, and participants to the campaign loop.",
                cta: "Open sponsors",
                onClick: () => setActiveTab("sponsorships"),
              },
              {
                title: "Review outcomes",
                description: "Use joins, redemptions, content, and proof data to decide what deserves more budget.",
                cta: isEstablishedBrand ? "Open insights" : "Open planner",
                onClick: () => setActiveTab(isEstablishedBrand ? "insights" : "planner"),
              },
              {
                title: "Review content + moments",
                description: "See which creator media and physical moments align with your brand intent.",
                cta: "Open opportunities",
                onClick: () => setActiveTab("opportunities"),
              },
            ]}
          />

          <CommercialProofLoop
        eyebrow="Commercial Narrative"
        title="Reduce the story to one repeatable proof loop"
        action={
          activeCampaigns.length > 0
            ? `${activeCampaigns.length} active campaign${activeCampaigns.length === 1 ? "" : "s"} drove real-world participant movement.`
            : "Launch one activation that asks people to show up, check in, redeem, or submit proof."
        }
        verification={
          totalImpressions > 0
            ? `${totalImpressions.toLocaleString()} attributed participant actions and ${totalRedemptions.toLocaleString()} redemption signals are visible in-platform.`
            : "Use joins, check-ins, proof submissions, and redemptions as the validation layer."
        }
        outcome={
          totalRedemptions > 0
            ? `${totalRedemptions.toLocaleString()} measured redemption outcomes show the campaign produced behavior, not just attention.`
            : "Report turnout, proof completion, redemption rate, and attributed sales lift as the outcome."
        }
        repeatability={
          isEstablishedBrand
            ? "Reuse the same targeting, proof, and reward structure across markets with better benchmark confidence."
            : "Once one activation works, repeat the same verified pattern with tighter targeting and stronger reward design."
        }
          />

          {featuredCampaign && (
            <ProofOutcomeRail
          eyebrow="Shared Proof Layer"
          title={`See the verified chain for ${featuredCampaign.title}`}
          data={proofOutcomeQuery.data}
          isLoading={proofOutcomeQuery.isLoading}
          ctaHref={`/dashboard/campaigns/${featuredCampaign.id}`}
          ctaLabel="Open campaign detail"
            />
          )}

          {!isNewBrand && (
            <section>
              <div className="flex min-w-0 flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    {activeCampaigns.length > 0 ? "Active Campaigns" : "Your Campaigns"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep the current operating slate visible without turning the dashboard into a reporting maze.
                  </p>
                </div>
                {campaigns && campaigns.length > 3 && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("campaigns")}>
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              {campaignsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : campaigns && campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Button asChild>
                  <Link to="/create/campaign">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(activeCampaigns.length > 0 ? activeCampaigns : campaigns.slice(0, 3)).map((campaign) => (
                <Card key={campaign.id} className="group hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                            {campaign.title}
                          </h3>
                          <Badge 
                            variant={campaign.is_active ? "default" : "outline"}
                            className="text-[10px] flex-shrink-0"
                          >
                            {campaign.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {campaign.description}
                          </p>
                        )}
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex min-w-0 items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {campaign.impressions.toLocaleString()} views
                          </span>
                          <span className="flex min-w-0 items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {campaign.redemptions.toLocaleString()} redemptions
                          </span>
                          {campaign.impressions > 0 && (
                            <span className="text-emerald-500">
                              {((campaign.redemptions / campaign.impressions) * 100).toFixed(1)}% rate
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="self-start sm:self-center" asChild>
                        <Link to={`/dashboard/campaigns/${campaign.id}`}>
                          Manage
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              )}
            </section>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="opportunities" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="correlation" className="gap-2">
            <Layers3 className="w-4 h-4" />
            Correlation
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Building2 className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Planner
          </TabsTrigger>
          {!isNewBrand && (
            <TabsTrigger value="sponsorships" className="gap-2">
              <Handshake className="w-4 h-4" />
              Sponsors
            </TabsTrigger>
          )}
          {isEstablishedBrand && (
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Insights
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="opportunities" className="mt-0 space-y-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Brand Opportunities</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">See moments and creator content in the same workspace</h3>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    Brands should not have to jump between unrelated browse pages. This view surfaces active moments and public creator media together so you can decide what to sponsor, join, or turn into campaign input.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setActiveTab("correlation")}>
                    <Layers3 className="mr-2 h-4 w-4" />
                    Open correlation
                  </Button>
                  <Button asChild>
                    <Link to="/create/campaign">
                      <Plus className="mr-2 h-4 w-4" />
                      Create campaign
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Moments</p>
                    <h4 className="mt-1 font-serif text-xl font-bold">
                      {directlyAssociatedMoments.length > 0 ? "Moments already touching your brand" : "Moments worth evaluating"}
                    </h4>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {workspaceMoments.length} live
                  </Badge>
                </div>

                {brandWorkspaceQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunitiesMoments.map((moment) => (
                      <div key={moment.id || moment.slug || moment.title} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{moment.title || "Untitled moment"}</p>
                              {moment.associated_brand_names?.length ? (
                                <Badge className="bg-primary/10 text-primary border border-primary/20">
                                  Associated
                                </Badge>
                              ) : (
                                <Badge variant="outline">Open fit</Badge>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {moment.venue_name ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {moment.venue_name}
                                </span>
                              ) : null}
                              {moment.starts_at ? (
                                <span className="flex items-center gap-1">
                                  <Clock3 className="h-3 w-3" />
                                  {new Date(moment.starts_at).toLocaleDateString()}
                                </span>
                              ) : null}
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {(moment.participant_count || 0).toLocaleString()} participants
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {moment.reward || moment.description || "A live physical moment that can be matched to campaign objectives."}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/moments/${moment.slug || moment.id}`}>
                              Open
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Content</p>
                    <h4 className="mt-1 font-serif text-xl font-bold">
                      {directlyAssociatedContent.length > 0 ? "Creator media already near your graph" : "Content worth matching"}
                    </h4>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {workspaceContent.length} public
                  </Badge>
                </div>

                {brandWorkspaceQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunitiesContent.map((item) => (
                      <div key={item.id || item.slug || item.title} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{item.title || "Untitled content"}</p>
                              {item.platform ? <Badge variant="outline">{item.platform}</Badge> : null}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {item.description || "Public creator content that can be evaluated for campaign or sponsorship fit."}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {item.venue_name ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.venue_name}
                                </span>
                              ) : null}
                              {item.linked_moment_title ? (
                                <span className="flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  Linked to {item.linked_moment_title}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={item.linked_moment_slug || item.linked_moment_id ? `/moments/${item.linked_moment_slug || item.linked_moment_id}` : "/explore/content"}>
                              Review
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Venues</p>
                    <h4 className="mt-1 font-serif text-xl font-bold">Places where campaigns can become proof</h4>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {workspaceVenues.length} visible
                  </Badge>
                </div>

                {brandWorkspaceQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunitiesVenues.map((venue) => (
                      <div key={venue.id || venue.slug || venue.name} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{venue.name || "Untitled venue"}</p>
                              <Badge variant="outline">{venue.venue_type || "venue"}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {venue.city || venue.location || "Location pending"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {(venue.active_moments_count || 0).toLocaleString()} active moments
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {venue.description || "A physical place a brand can sponsor, activate, or match to an existing proof loop."}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/venues/${venue.slug || venue.id}`}>
                              Open
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="mt-0 space-y-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Correlation Layer</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Map content to moments before you spend</h3>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    The important question for a brand is not just “what content exists?” or “what moments are live?” It is whether a creator asset and a physical moment reinforce the same behavior loop.
                  </p>
                </div>
                <Badge className="w-fit bg-primary/10 text-primary border border-primary/20">
                  {topCorrelationRows.length} visible pairings
                </Badge>
              </div>
            </CardContent>
          </Card>

          {brandWorkspaceQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : topCorrelationRows.length > 0 ? (
            <div className="space-y-4">
              {topCorrelationRows.map((row) => (
                <Card key={`${row.content.id}-${row.moment?.id || row.relationship}`} className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Content</p>
                        <h4 className="mt-1 font-semibold text-foreground">{row.content.title || "Untitled content"}</h4>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {row.content.description || "Public creator media that can be evaluated for sponsorship or integration."}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-center">
                          <Link2 className="h-4 w-4 text-primary" />
                          <Badge variant="outline" className="rounded-full">
                            {row.relationship === "existing_brand_link"
                              ? "Already associated"
                              : row.relationship === "moment_match"
                                ? "Moment-linked"
                                : "Open opportunity"}
                          </Badge>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Moment</p>
                        <h4 className="mt-1 font-semibold text-foreground">{row.moment?.title || row.content.linked_moment_title || "No linked moment"}</h4>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {row.moment?.description || row.moment?.reward || "A physical moment connected to the same discovery path."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="outline" asChild>
                        <Link to={row.content.linked_moment_slug || row.content.linked_moment_id ? `/moments/${row.content.linked_moment_slug || row.content.linked_moment_id}` : "/explore/content"}>
                          Open moment
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link to="/create/campaign">
                          Use in campaign
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Layers3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <h3 className="font-medium">No visible correlations yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  As more public content links into active moments, this layer will help brands compare creator assets and physical destinations directly.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : campaigns && campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-medium mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to start connecting with participants
                </p>
                <Button asChild>
                  <Link to="/create/campaign">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="font-medium">{campaign.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.impressions.toLocaleString()} impressions • {campaign.redemptions.toLocaleString()} redemptions
                        </p>
                      </div>
                      <Badge variant={campaign.is_active ? "default" : "outline"}>
                        {campaign.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planner" className="mt-0">
          <Suspense fallback={tabFallback}>
            <BrandEstimator />
          </Suspense>
        </TabsContent>

        {!isNewBrand && (
          <TabsContent value="sponsorships" className="mt-0">
            <Suspense fallback={tabFallback}>
              <BrandSponsorshipTab />
            </Suspense>
          </TabsContent>
        )}

        {isEstablishedBrand && (
          <TabsContent value="insights" className="mt-0">
            <Suspense fallback={tabFallback}>
              <IntelligenceBureau />
            </Suspense>
          </TabsContent>
        )}
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-full">
                    Value Systems
                  </Badge>
                  <h3 className="font-serif text-xl font-bold">See the post-campaign layer clearly</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Brands should be able to understand not just the campaign, but the stakeholder experiences that continue after verified participation starts compounding.
                  </p>
                </div>
                <Coins className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Pieces</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Review the Gem-denominated market layer attached to moments, content, hosts, and venues.
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/marketplace">Open Market</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Liquidity</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Track where value circulation becomes active and where liquidity participation matters for sponsored loops.
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/liquidity">Open Liquidity</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">PromoShare</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        PromoShare should be visible as a stakeholder experience in its own right, not just a backend reward mechanic.
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/promoshare">Open PromoShare</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <RoleActivationPanel
            eyebrow="Brand Today"
            title={isNewBrand ? "Fund one moment people can feel" : "Turn spend into proof you can stand behind"}
            description={
              isNewBrand 
                ? "Start with one campaign tied to a real action: a visit, join, post, sample, purchase, or check-in. Then use creators, venues, and proof to see what actually moved."
                : "Keep the loop honest: fund the action, connect the people who can carry it, compare moments with content, then scale what has proof."
            }
            items={[
              {
                title: "Create campaign",
                description: "Choose one human outcome and make the reward path clear.",
                status: campaigns && campaigns.length > 0 ? "done" : "current",
                href: "/create/campaign",
                ctaLabel: "Create",
              },
              {
                title: "Connect creators",
                description: "Bring in people and places that can make the campaign feel local and alive.",
                status: activeTab === "sponsorships" ? "current" : "todo",
                ctaLabel: "Sponsors",
                onClick: () => setActiveTab("sponsorships"),
              },
              {
                title: "Compare moments + content",
                description: "Find where the story, the place, and the participant action reinforce each other.",
                status: topCorrelationRows.length > 0 ? "done" : "current",
                ctaLabel: "Opportunities",
                onClick: () => setActiveTab("opportunities"),
              },
              {
                title: "View impact",
                description: "Confirm joins, check-ins, redemptions, content, and sales before scaling.",
                status: totalRedemptions > 0 ? "done" : "todo",
                ctaLabel: "Impact",
                onClick: () => setActiveTab("insights"),
              },
            ]}
          />

          <DashboardQuickRoutesCard
            title="Brand Routes"
            description="Keep campaign tools close, but also make the downstream stakeholder experiences visible."
            routes={[
              { label: "Create campaign", href: "/create/campaign", icon: Target },
              { label: "Opportunities", onClick: () => setActiveTab("opportunities"), icon: Sparkles },
              { label: "Campaign planner", onClick: () => setActiveTab("planner"), icon: BarChart3 },
              { label: "Correlation", onClick: () => setActiveTab("correlation"), icon: Layers3 },
              { label: "Piece market", href: "/marketplace", icon: Coins },
              { label: "Liquidity", href: "/liquidity", icon: TrendingUp },
              { label: "PromoShare", href: "/promoshare", icon: Gift },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandDashboardV2;
