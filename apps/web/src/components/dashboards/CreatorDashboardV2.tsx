import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Calendar,
  DollarSign, 
  Film, 
  Link2, 
  PlayCircle, 
  Sparkles, 
  Eye,
  Zap,
  Award,
  BarChart3,
  Upload,
  CheckCircle2,
  Clock3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHero, DashboardNextStepsSection, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";
import { CreatorMissionPublisher } from "@/components/creator/CreatorMissionPublisher";
import { CreatorEarningsTab } from "./host/CreatorEarningsTab";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { StakeholderReturnPanel } from "@/components/dashboard/StakeholderReturnPanel";

// ============================================================================
// CREATOR DASHBOARD V2
// Action-first design with progressive disclosure
// ============================================================================

type CreatorStory = {
  id: string;
  title?: string | null;
  description?: string | null;
  platform?: string | null;
  platform_url?: string | null;
  views_count?: number | null;
  impressions?: number | null;
  shares_count?: number | null;
  shares?: number | null;
  conversions?: number | null;
};

const CreatorDashboardV2 = () => {
  const { user, session } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "studio";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedContentId, setSelectedContentId] = useState<string>("");

  const creatorContentQuery = useQuery({
    queryKey: ["creator-content-library", user?.id],
    queryFn: async () => {
      if (!session?.access_token) return [];
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/content/mine?limit=24`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load your stories");
      return payload?.content || [];
    },
    enabled: !!user && !!session,
  });

  const creatorLinksQuery = useQuery({
    queryKey: ["creator-mission-links", user?.id],
    queryFn: async () => {
      if (!session?.access_token) return [];
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/o2o/links/mine`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load your linked missions");
      return payload?.links || [];
    },
    enabled: !!user && !!session,
  });

  const creatorSummaryQuery = useQuery({
    queryKey: ["creator-dashboard-summary", user?.id],
    queryFn: async () => {
      if (!session?.access_token) return null;
      const [summaryResponse, economicsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/o2o/creator-summary`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/creator-economics/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const summaryPayload = await summaryResponse.json();
      const economicsPayload = await economicsResponse.json();
      if (!summaryResponse.ok) throw new Error(summaryPayload?.error || "Failed to load creator summary");
      if (!economicsResponse.ok) throw new Error(economicsPayload?.error || "Failed to load creator economics");

      return {
        summary: summaryPayload?.summary || {},
        economics: economicsPayload?.economics || {},
      };
    },
    enabled: !!user && !!session,
  });

  const stories = creatorContentQuery.data || [];
  const linkedMissions = creatorLinksQuery.data || [];
  const economics = creatorSummaryQuery.data?.economics || {};
  const earningsSummary = economics.summary || {};
  const totalViews = (stories as CreatorStory[]).reduce((sum: number, item) => sum + Number(item.views_count || item.impressions || 0), 0);
  const totalEarnings =
    Number(earningsSummary.pending_value || 0) +
    Number(earningsSummary.settled_value || 0);
  const contentCount = stories.length;
  const missionCount = linkedMissions.length;
  const hasPublished = contentCount > 0;
  const hasLinkedMission = missionCount > 0;
  const isNewCreator = !hasPublished;
  const statsLoading = creatorContentQuery.isLoading || creatorLinksQuery.isLoading || creatorSummaryQuery.isLoading;

  const creatorStats = {
    contentCount,
    missionCount,
    totalViews,
    earnings: totalEarnings,
    hasPublished,
    hasLinkedMission,
  };

  const nextRecommendedStep = !hasPublished
    ? "Publish your first story"
    : !hasLinkedMission
      ? "Turn one story into a mission"
      : totalEarnings <= 0
        ? "Drive the first verified conversion"
        : "Scale the loop across more stories";

  return (
    <div className="space-y-6 pb-20">
      <DashboardHero
        badge="Creator Proof Studio"
        title={isNewCreator ? "Turn your first story into movement" : "Create stories that move people"}
        description="Publish stories that can stand alone, launch a moment, support a scene, or become a mission. Then track whether attention becomes joins, visits, unlocks, rewards, and real-world proof."
        actions={[
          { label: "Publish", icon: Film, onClick: () => setActiveTab("publish") },
          { label: "Create mission", icon: Link2, onClick: () => setActiveTab("missions") },
          { label: "Missions", icon: Eye, href: "/missions" },
        ]}
        stats={[
          { label: "Stories", value: creatorStats?.contentCount?.toLocaleString() || "0", helper: isNewCreator ? "Start by publishing one" : "Published so far", icon: Film },
          { label: "Views", value: creatorStats?.totalViews?.toLocaleString() || "0", helper: "Audience attention", icon: Eye },
          { label: "Missions", value: creatorStats?.missionCount?.toLocaleString() || "0", helper: "Connected experiences", icon: Link2 },
          { label: "Earnings", value: `$${creatorStats?.earnings?.toLocaleString() || "0"}`, helper: "Measured outcome", icon: DollarSign },
        ]}
        isLoading={statsLoading}
      />

      <StakeholderReturnPanel role="creator" />

      {/* =====================================================================
          NEW CREATOR: First Steps Guidance
          ===================================================================== */}
      {isNewCreator && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-xl font-black tracking-[-0.03em]">Start with one story that can move people</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your first win is simple: publish a story, attach it to a mission or moment,
                  then watch for the first person who moves because of it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab("publish")}>
                    <Film className="w-4 h-4 mr-2" />
                    Publish Story
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/create/moment">
                      <Calendar className="w-4 h-4 mr-2" />
                      Launch Moment
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          ACTIVE CREATORS: Progress Overview
          ===================================================================== */}
      {!isNewCreator && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Creator Journey Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Creator Journey</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {creatorStats?.hasLinkedMission ? "2/3" : creatorStats?.hasPublished ? "1/3" : "0/3"}
                </Badge>
              </div>
              <Progress 
                value={creatorStats?.hasLinkedMission ? 66 : creatorStats?.hasPublished ? 33 : 0} 
                className="h-2 mb-3" 
              />
              <div className="space-y-2">
                {[
                  { label: "Publish first story", done: creatorStats?.hasPublished },
                  { label: "Link to mission", done: creatorStats?.hasLinkedMission },
                  { label: "Get first conversion", done: creatorStats?.earnings > 0 },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      step.done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={step.done ? "text-muted-foreground line-through" : ""}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {creatorStats && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Total Views</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {creatorStats.totalViews.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Earnings</span>
                  </div>
                  <div className="text-2xl font-bold">
                    ${creatorStats.earnings.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          MAIN CONTENT: Tabs (Progressive disclosure)
          ===================================================================== */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <DashboardNextStepsSection
            description={`Next best move: ${nextRecommendedStep.toLowerCase()}. The dashboard now exposes the full creator operating loop directly.`}
            ctaLabel="Browse missions"
            ctaHref="/missions"
            items={[
              {
                title: "Publish a story",
                description: "Create the content object that starts the loop.",
                cta: "Open publisher",
                onClick: () => setActiveTab("publish"),
              },
              {
                title: "Connect to a mission",
                description: "Attach your content to a real-world destination.",
                cta: "Link mission",
                onClick: () => setActiveTab("missions"),
              },
              {
                title: "Track outcomes",
                description: "Review whether audience attention turned into action.",
                cta: "Open analytics",
                onClick: () => setActiveTab("earnings"),
              },
            ]}
          />

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Workflow</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">Publish stories, then turn them into movement</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    The creator path is flexible: create a story, let it stand alone, launch a moment from it, connect it to a scene, or turn it into a mission when you want verified action.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab("publish")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("missions")}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Create Mission
                  </Button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { title: "1. Publish Story", detail: "Add the story metadata, URL, and preview image people will see.", icon: Film },
                  { title: "2. Choose Its Shape", detail: "Keep it standalone, launch a new moment, or link it to an existing one.", icon: Calendar },
                  { title: "3. Measure Movement", detail: "Track views, joins, unlocks, visits, and creator earnings as the proof layer.", icon: BarChart3 },
                ].map((step) => (
                  <div key={step.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <step.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-semibold text-foreground">{step.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="studio" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Studio
          </TabsTrigger>
          <TabsTrigger value="publish" className="gap-2">
            <Film className="w-4 h-4" />
            Publish
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <PlayCircle className="w-4 h-4" />
            My Content
          </TabsTrigger>
          <TabsTrigger value="missions" className="gap-2">
            <Link2 className="w-4 h-4" />
            Create Mission
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="mt-0">
          {statsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : (
            <CreatorO2OSummaryPanel />
          )}
        </TabsContent>

        <TabsContent value="publish" className="mt-0">
          <CreatorMissionPublisher
            onPublished={(content) => {
              setSelectedContentId(String(content.id));
              setActiveTab("missions");
            }}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-0">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">My Stories</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">Published story library</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These are the stories you can reuse in missions, sponsor loops, and creator portfolio reporting.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">{contentCount} stories</Badge>
              </div>
              <div className="mt-6 space-y-3">
                {creatorContentQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)
                ) : stories.length > 0 ? (
                  (stories as CreatorStory[]).map((story) => (
                    <div key={story.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{story.title || "Untitled story"}</p>
                            <Badge variant="secondary" className="capitalize">{story.platform || "external"}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {story.description || "No description yet."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>{Number(story.views_count || story.impressions || 0).toLocaleString()} views</span>
                            <span>{Number(story.shares_count || story.shares || 0).toLocaleString()} shares</span>
                            <span>{Number(story.conversions || 0).toLocaleString()} conversions</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedContentId(String(story.id));
                              setActiveTab("missions");
                            }}
                          >
                            Link to mission
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to={`/create/moment?sourceContentId=${story.id}&sourceContentTitle=${encodeURIComponent(story.title || "Creator story")}`}>
                              Launch moment
                              <Calendar className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          {story.platform_url ? (
                            <Button variant="ghost" asChild>
                              <a href={story.platform_url} target="_blank" rel="noreferrer">Open story</a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                    No stories published yet. Start in the Publish tab and create your first story.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="mt-0">
          <O2OLinkManager
            initialContentId={selectedContentId}
            onLinkCreated={() => {
              setSelectedContentId("");
            }}
          />
        </TabsContent>

        <TabsContent value="earnings" className="mt-0">
          <CreatorEarningsTab />
        </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <RoleActivationPanel
            eyebrow="Creator Path"
            title={isNewCreator ? "Turn one story into a reason to move" : "Keep the story connected to real action"}
            description={
              isNewCreator
                ? "Start with one story. It can stand alone, launch a moment, or become a mission once there is a real action you want people to take."
                : "Build the loop: publish the story, choose whether it stands alone or connects to a moment, read the proof, and keep creating around what actually moved people."
            }
            items={[
              {
                title: "Publish story",
                description: "Create the content people can see, share, and remember.",
                status: hasPublished ? "done" : "current",
                ctaLabel: "Publish",
                onClick: () => setActiveTab("publish"),
              },
              {
                title: "Link mission",
                description: "Connect the story to a moment, venue, offer, or action when it is ready to move people.",
                status: hasLinkedMission ? "done" : hasPublished ? "current" : "todo",
                ctaLabel: "Create mission",
                onClick: () => setActiveTab("missions"),
              },
              {
                title: "Read the outcome",
                description: "Check whether people watched, joined, visited, unlocked, or earned because of it.",
                status: totalEarnings > 0 ? "done" : hasLinkedMission ? "current" : "todo",
                ctaLabel: "Review",
                onClick: () => setActiveTab("earnings"),
              },
            ]}
          />

          <DashboardQuickRoutesCard
            description="Keep discovery and publishing close without turning the dashboard into the whole product."
            routes={[
              { icon: Film, label: "Publish story", onClick: () => setActiveTab("publish") },
              { icon: Calendar, label: "Launch moment", href: "/create/moment" },
              { icon: Link2, label: "Create mission", onClick: () => setActiveTab("missions") },
              { icon: PlayCircle, label: "My content", onClick: () => setActiveTab("content") },
              { icon: BarChart3, label: "Review analytics", onClick: () => setActiveTab("earnings") },
            ]}
          />

          <Card className="shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">At a Glance</p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    icon: hasPublished ? CheckCircle2 : Clock3,
                    label: "Content status",
                    value: hasPublished ? `${contentCount} published` : "No stories yet",
                  },
                  {
                    icon: hasLinkedMission ? CheckCircle2 : Clock3,
                    label: "Mission status",
                    value: hasLinkedMission ? `${missionCount} linked` : "No linked missions yet",
                  },
                  {
                    icon: BarChart3,
                    label: "Creator value",
                    value: `$${totalEarnings.toFixed(2)} tracked`,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </div>
                    <Separator className="mt-4 last:hidden" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboardV2;
