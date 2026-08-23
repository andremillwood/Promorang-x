import { Suspense, lazy, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  Gift,
  Eye,
  Building2,
  Sparkles,
  Handshake,
  Coins,
  TrendingUp,
  Target,
  Plus,
  ArrowRight,
  MapPin,
  Clock3,
  Link2,
  ExternalLink,
  Layers3,
  Megaphone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { DashboardHero, DashboardNextStepsSection, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CommercialProofLoop } from "@/components/commercial/CommercialProofLoop";
import { DashboardWorkspaceNav } from "@/components/dashboard/DashboardWorkspaceNav";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";
import { useCampaignProofOutcome } from "@/hooks/useProofOutcome";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { useAgencyRelationships, useDeleteAgencyRelationship, useUpdateAgencyRelationship } from "@/hooks/useAgencyClients";
import { useToast } from "@/hooks/use-toast";
import { rankBrandOpportunities } from "@promorang/shared";
import { StudioJourneyStory } from "@/components/dashboard/StudioJourneyStory";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { useI18n } from "@/i18n/I18nContext";

const BrandSponsorshipTab = lazy(() =>
  import("@/components/brand/BrandSponsorshipTab").then((module) => ({ default: module.BrandSponsorshipTab })),
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
  const { t, formatNumber } = useI18n();
  const { toast } = useToast();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  const { isLoading: statsLoading } = useBrandStats();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "campaigns";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const activeBrandName = activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || user?.email || "Your brand";
  const activeBrandSlug = activeOrg?.slug || null;

  // Calculate brand maturity
  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];
  const isNewBrand = !campaigns || campaigns.length === 0;
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
  const totalBudget = campaigns?.reduce((sum, campaign) => sum + Number(campaign.budget || 0), 0) || 0;
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

  const rankedOpportunities = useMemo(() => {
    const connectedMomentIds = new Set(directlyAssociatedMoments.map((item) => item.id));
    const connectedContentIds = new Set(directlyAssociatedContent.map((item) => item.id));
    const objectives = (campaigns || []).flatMap((campaign: any) => [campaign.objective_type, campaign.objective, campaign.name, campaign.description].filter(Boolean));
    const profileLocation = (profile as any)?.location || (profile as any)?.city || user?.user_metadata?.location;
    return rankBrandOpportunities({
      name: activeBrandName,
      industries: [(activeOrg as any)?.industry, (activeOrg as any)?.category].filter(Boolean),
      interests: [(activeOrg as any)?.description, ...(user?.user_metadata?.interests || [])].filter(Boolean),
      geographies: [profileLocation, (activeOrg as any)?.city, (activeOrg as any)?.country].filter(Boolean),
      objectives,
    }, [
      ...workspaceMoments.filter((item) => item.id).map((item) => ({ id: item.id!, kind: "moment" as const, title: item.title || "Untitled Moment", description: item.description, category: item.category, city: item.city, country: item.country, starts_at: item.starts_at, momentum: item.participant_count, already_connected: connectedMomentIds.has(item.id), data: item })),
      ...workspaceContent.filter((item) => item.id).map((item) => ({ id: item.id!, kind: "content" as const, title: item.title || "Untitled Content", description: item.description, category: item.category, city: item.city, country: item.country, starts_at: item.posted_at, already_connected: connectedContentIds.has(item.id), data: item })),
      ...workspaceVenues.filter((item) => item.id).map((item) => ({ id: item.id!, kind: "venue" as const, title: item.name || "Untitled Venue", description: item.description, category: item.venue_type, city: item.city, country: item.country, momentum: Number(item.popularity_score || 0) + Number(item.total_checkins || 0), verified: item.verification_status === "verified", data: item })),
    ]);
  }, [activeBrandName, activeOrg, campaigns, directlyAssociatedContent, directlyAssociatedMoments, profile, user?.user_metadata, workspaceContent, workspaceMoments, workspaceVenues]);
  const opportunitiesMoments = rankedOpportunities.filter((item) => item.kind === "moment").slice(0, 4);
  const opportunitiesContent = rankedOpportunities.filter((item) => item.kind === "content").slice(0, 4);
  const opportunitiesVenues = rankedOpportunities.filter((item) => item.kind === "venue").slice(0, 4);
  const topCorrelationRows = correlationRows.slice(0, 6);

  return (
    <div className="space-y-8 pb-20 xl:space-y-10">
      {/* Top Story & Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />

      <DashboardHero
        badge={t("brandDash.badge")}
        title={t(isNewBrand ? "brandDash.newTitle" : "brandDash.title")}
        description={t("brandDash.copy")}
        actions={[
          isNewBrand
            ? { label: t("brandDash.firstActivation"), icon: Plus, href: "/create/campaign" }
            : activeCampaigns.length > 0
              ? { label: t("brandDash.reviewLive"), icon: BarChart3, onClick: () => setActiveTab("campaigns") }
              : { label: t("brandDash.activateNext"), icon: Calendar, onClick: () => setActiveTab("planner") },
          { label: t("brandDash.createActivation"), icon: Plus, href: "/create/campaign" },
          { label: t("brandDash.createOffer"), icon: Gift, href: "/dashboard/offers" },
          { label: t(isEstablishedBrand ? "brandDash.insights" : "brandDash.planner"), icon: BarChart3, onClick: () => setActiveTab(isEstablishedBrand ? "insights" : "planner") },
        ]}
        stats={[
          { label: t("brandDash.activeCampaigns"), value: formatNumber(activeCampaigns.length), helper: t("brandDash.liveLoops"), icon: Target },
          { label: t("brandDash.attention"), value: formatNumber(totalImpressions), helper: t("brandDash.impressions"), icon: Users },
          { label: t("brandDash.actions"), value: formatNumber(totalRedemptions), helper: t("brandDash.redemptions"), icon: Gift },
          { label: t("brandDash.budget"), value: formatNumber(totalBudget), helper: t("brandDash.activations"), icon: Coins },
        ]}
        isLoading={statsLoading}
      />

      <DashboardWorkspaceNav
        eyebrow={t("brandDash.eyebrow")}
        title={t("brandDash.workspace")}
        activeValue={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: "opportunities", label: t("brandDash.opportunities"), icon: Target },
          { value: "correlation", label: t("brandDash.signals"), icon: Link2 },
          { value: "campaigns", label: t("brandDash.campaigns"), icon: Megaphone },
          { value: "planner", label: t("brandDash.planner"), icon: Calendar },
          { value: "sponsorships", label: t("brandDash.sponsorships"), icon: Handshake, hidden: !isEstablishedBrand },
          { value: "insights", label: t("brandDash.insights"), icon: BarChart3, hidden: !isEstablishedBrand },
        ]}
      />

      {/* 3-Column Desktop Layout */}
      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0 space-y-8">

      <Tabs id="role-workspace" value={activeTab} onValueChange={setActiveTab} className="scroll-mt-28 space-y-6">
        <TabsList className="sr-only">
          <TabsTrigger value="campaigns">{t("brandDash.campaigns")}</TabsTrigger>
          <TabsTrigger value="opportunities">{t("brandDash.opportunities")}</TabsTrigger>
          <TabsTrigger value="correlation">{t("brandDash.signals")}</TabsTrigger>
          <TabsTrigger value="insights">{t("brandDash.analyticsAgency")}</TabsTrigger>
        </TabsList>

        {/* TAB 1: CAMPAIGNS & OVERVIEW */}
        <TabsContent value="campaigns" className="mt-0 space-y-6">
          {/* New Brand Launch Card */}
          {isNewBrand && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-xl font-black tracking-[-0.03em]">{t("brandDash.launchTitle")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("brandDash.launchCopy")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link to="/create/campaign">
                          <Plus className="w-4 h-4 mr-2" />
                          {t("brandDash.createPromoPush")}
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("planner")}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {t("brandDash.planFirst")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Campaigns List */}
          <section>
            <div className="flex min-w-0 flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em]">
                  {t(activeCampaigns.length > 0 ? "brandDash.activeCampaigns" : "brandDash.yourCampaigns")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("brandDash.campaignListCopy")}
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/create/campaign">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t("brandDash.newCampaign")}
                </Link>
              </Button>
            </div>

            {campaignsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : campaigns && campaigns.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">{t("brandDash.none")}</p>
                  <Button asChild>
                    <Link to="/create/campaign">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("brandDash.createProofLoop")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(activeCampaigns.length > 0 ? activeCampaigns : campaigns || []).map((campaign) => (
                  <Card key={campaign.id} className="group hover:shadow-soft transition-all border-border/80">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge
                            variant={campaign.is_active ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {t(campaign.is_active ? "brandDash.live" : "brandDash.draft")}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            ${formatNumber(Number(campaign.budget || 0))}
                          </span>
                        </div>
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">
                          {campaign.title}
                        </h3>
                        {campaign.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {campaign.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            {formatNumber(campaign.impressions)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5 text-emerald-500" />
                            {formatNumber(campaign.redemptions)}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                          <Link to={`/dashboard/campaigns/${campaign.id}`}>
                            {t("brandDash.manage")} <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <DashboardNextStepsSection
            description={t("brandDash.nextCopy")}
            ctaLabel={t("brandDash.openPlanner")}
            ctaOnClick={() => setActiveTab("planner")}
            items={[
              {
                title: t("brandDash.launchActivation"),
                description: t("brandDash.launchActivationCopy"),
                cta: t("brandDash.createCampaign"),
                href: "/create/campaign",
              },
              {
                title: t("brandDash.connectOperators"),
                description: t("brandDash.connectOperatorsCopy"),
                cta: t("brandDash.openSponsors"),
                onClick: () => setActiveTab("sponsorships"),
              },
              {
                title: t("brandDash.reviewOutcomes"),
                description: t("brandDash.reviewOutcomesCopy"),
                cta: t(isEstablishedBrand ? "brandDash.openInsights" : "brandDash.openPlanner"),
                onClick: () => setActiveTab(isEstablishedBrand ? "insights" : "planner"),
              },
              {
                title: t("brandDash.reviewContent"),
                description: t("brandDash.reviewContentCopy"),
                cta: t("brandDash.openOpportunities"),
                onClick: () => setActiveTab("opportunities"),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="opportunities" className="mt-0 space-y-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Brand Opportunities</p>
                  <h3 className="mt-2 font-sans text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">See what fits—and why—before you spend</h3>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    Opportunities are ranked from your market, industry, objectives, existing relationships, timing, and visible momentum. Every recommendation explains the signals behind its position.
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
                    <h4 className="mt-1 text-2xl font-black tracking-[-0.04em]">
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
                    {opportunitiesMoments.map((opportunity) => { const moment = opportunity.data as PublicMomentRow; return (
                      <div key={opportunity.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{moment.title || "Untitled moment"}</p>
                              <Badge className="bg-primary text-primary-foreground">{opportunity.match_score}% fit</Badge>
                              {opportunity.already_connected ? (
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
                            <div className="mt-3 flex flex-wrap gap-1.5">{opportunity.reasons.map((reason)=><span key={reason} className="rounded-full bg-primary/8 px-2 py-1 text-[10px] font-semibold text-primary">{reason}</span>)}</div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/moments/${moment.slug || moment.id}`}>
                              Open
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );})}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Content</p>
                    <h4 className="mt-1 text-2xl font-black tracking-[-0.04em]">
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
                    {opportunitiesContent.map((opportunity) => { const item = opportunity.data as PublicContentRow; return (
                      <div key={opportunity.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{item.title || "Untitled content"}</p>
                              <Badge className="bg-primary text-primary-foreground">{opportunity.match_score}% fit</Badge>
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
                            <div className="mt-3 flex flex-wrap gap-1.5">{opportunity.reasons.map((reason)=><span key={reason} className="rounded-full bg-primary/8 px-2 py-1 text-[10px] font-semibold text-primary">{reason}</span>)}</div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={item.linked_moment_slug || item.linked_moment_id ? `/moments/${item.linked_moment_slug || item.linked_moment_id}` : "/explore/content"}>
                              Review
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );})}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Venues</p>
                    <h4 className="mt-1 text-2xl font-black tracking-[-0.04em]">Places where campaigns can become proof</h4>
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
                    {opportunitiesVenues.map((opportunity) => { const venue = opportunity.data as PublicVenueRow; return (
                      <div key={opportunity.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{venue.name || "Untitled venue"}</p>
                              <Badge className="bg-primary text-primary-foreground">{opportunity.match_score}% fit</Badge>
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
                            <div className="mt-3 flex flex-wrap gap-1.5">{opportunity.reasons.map((reason)=><span key={reason} className="rounded-full bg-primary/8 px-2 py-1 text-[10px] font-semibold text-primary">{reason}</span>)}</div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/venues/${venue.slug || venue.id}`}>
                              Open
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );})}
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
                  <h3 className="mt-2 font-sans text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">Map content to moments before you spend</h3>
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
            <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
              <div className="flex flex-col gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Work in the world</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.04em]">Your activations</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">See where the brand is participating, whether people responded, and which relationship deserves another investment.</p></div>
                <Button asChild className="rounded-full"><Link to="/create/campaign"><Plus className="mr-2 h-4 w-4" />Create Activation</Link></Button>
              </div>
              <div>
              {campaigns.map((campaign) => (
                <Link key={campaign.id} to={`/dashboard/campaigns/${campaign.id}`} className="group grid min-w-0 gap-5 border-b border-border/60 p-6 last:border-b-0 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                      <div className="min-w-0">
                        <h4 className="font-serif text-2xl font-semibold transition-colors group-hover:text-primary">{campaign.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{campaign.is_active ? `${campaign.impressions.toLocaleString()} people reached · ${campaign.redemptions.toLocaleString()} accepted actions` : "A saved activation plan awaiting Scene, people, terms, and secured Gems."}</p>
                      </div>
                      <Badge variant={campaign.is_active ? "default" : "outline"}>
                        {campaign.is_active ? "Live" : "Plan · not live"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
              </div>
            </section>
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

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-full">
                    Value Systems
                  </Badge>
                  <h3 className="text-2xl font-black tracking-[-0.04em]">See the post-campaign layer clearly</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Brands should be able to understand not just the campaign, but the moments, scenes, rewards, and status surfaces that keep working after verified participation starts compounding.
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
            description="Keep campaign tools close, but also make downstream moments, scenes, proof, and rewards visible."
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

        {/* Right Utility Sidebar (Desktop) */}
        <RightUtilityRail
          onOpenSlashModal={() => setSlashOpen(true)}
          onOpenStreakModal={() => setStreakOpen(true)}
        />
      </div>

      {/* Gamification Modals */}
      <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
      <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
      <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
      </div>
    </div>
  );
};

export default BrandDashboardV2;
