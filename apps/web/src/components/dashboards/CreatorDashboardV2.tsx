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
  BarChart3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHero, DashboardNextStepsSection, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";
import { CreatorMissionPublisher } from "@/components/creator/CreatorMissionPublisher";
import { CreatorEarningsTab } from "./host/CreatorEarningsTab";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { DashboardWorkspaceNav } from "@/components/dashboard/DashboardWorkspaceNav";
import { StudioJourneyStory } from "@/components/dashboard/StudioJourneyStory";

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
    <div className="space-y-8 pb-20 xl:space-y-10">
      <DashboardHero
        badge="Creator studio"
        title={isNewCreator ? "Turn your first story into movement" : "Create stories that move people"}
        description="Publish stories that can stand alone, launch a moment, support a scene, or become a mission. Then track whether attention becomes joins, visits, unlocks, rewards, and real-world proof."
        actions={[
          !hasPublished
            ? { label: "Publish your first story", icon: Film, onClick: () => setActiveTab("publish") }
            : !hasLinkedMission
              ? { label: "Connect a story to a mission", icon: Link2, onClick: () => setActiveTab("missions") }
              : { label: "Review supporter movement", icon: BarChart3, onClick: () => setActiveTab("earnings") },
          { label: "Publish another story", icon: Film, onClick: () => setActiveTab("publish") },
          { label: "Manage mission links", icon: Link2, onClick: () => setActiveTab("missions") },
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

      <DashboardWorkspaceNav
        eyebrow="Inside your studio"
        title="Choose the work you came here to do"
        activeValue={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: "studio", label: "Studio", icon: Sparkles },
          { value: "publish", label: "Publish", icon: Film },
          { value: "content", label: "My content", icon: PlayCircle },
          { value: "missions", label: "Missions", icon: Link2 },
          { value: "earnings", label: "Analytics", icon: BarChart3 },
        ]}
      />

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

      {!isNewCreator && (
        <StudioJourneyStory
          guidanceId="creator-dashboard:story-in-motion"
          eyebrow="Your story in motion"
          title="See whether attention became something people actually did"
          introduction="The studio connects a published story to the movement, proof, and value that followed—then makes the next creative decision clear."
          signalLabel="Audience attention"
          signalValue={`${creatorStats.totalViews.toLocaleString()} views`}
          beats={[
            { label: creatorStats.hasPublished ? "A story entered the world" : "No story is live yet", detail: `${creatorStats.contentCount} published ${creatorStats.contentCount === 1 ? "story" : "stories"} in your studio.`, icon: Film, tone: creatorStats.hasPublished ? "complete" : "quiet" },
            { label: creatorStats.hasLinkedMission ? "The story has somewhere to lead" : "Give the story a reason to move people", detail: creatorStats.hasLinkedMission ? `${creatorStats.missionCount} connected ${creatorStats.missionCount === 1 ? "mission" : "missions"} can turn attention into action.` : "Connect the strongest story to a Moment or mission.", icon: Link2, tone: creatorStats.hasLinkedMission ? "complete" : "current" },
            { label: nextRecommendedStep, detail: creatorStats.earnings > 0 ? `$${creatorStats.earnings.toLocaleString()} has returned through measured outcomes.` : "Look for the first verified action before scaling the format.", icon: ArrowRight, tone: "current" },
          ]}
        />
      )}

      {/* =====================================================================
          MAIN CONTENT: Tabs (Progressive disclosure)
          ===================================================================== */}
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="min-w-0 space-y-6">
          <DashboardNextStepsSection
            description={`Next best move: ${nextRecommendedStep.toLowerCase()}. Your studio keeps the full creator journey close without putting every tool in front of you at once.`}
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

          <Tabs id="role-workspace" value={activeTab} onValueChange={setActiveTab} className="scroll-mt-28">
        <TabsList className="sr-only">
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
          <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Your published work</p>
                  <h3 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground">Story library</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Return to a story, give it a real-world destination, or see what it moved.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">{contentCount} stories</Badge>
              </div>
              <div className="mt-7 border-t border-border/60">
                {creatorContentQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)
                ) : stories.length > 0 ? (
                  (stories as CreatorStory[]).map((story) => (
                    <article key={story.id} className="group border-b border-border/60 py-6 last:border-b-0">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-serif text-2xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">{story.title || "Untitled story"}</p>
                            <Badge variant="secondary" className="capitalize">{story.platform || "external"}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {story.description || "No description yet."}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            <span><strong className="font-serif text-base text-foreground">{Number(story.views_count || story.impressions || 0).toLocaleString()}</strong> views</span>
                            <span><strong className="font-serif text-base text-foreground">{Number(story.shares_count || story.shares || 0).toLocaleString()}</strong> shares</span>
                            <span><strong className="font-serif text-base text-foreground">{Number(story.conversions || 0).toLocaleString()}</strong> actions</span>
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
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                    No stories published yet. Start in the Publish tab and create your first story.
                  </div>
                )}
              </div>
            </div>
          </section>
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

        </div>
      </div>
    </div>
  );
};

export default CreatorDashboardV2;
