import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Activity, 
  DollarSign, 
  Film, 
  Link2, 
  PlayCircle, 
  Plus, 
  Sparkles, 
  TrendingUp,
  ChevronRight,
  Compass,
  Eye,
  Zap,
  Award,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";
import { CreatorMissionPublisher } from "@/components/creator/CreatorMissionPublisher";
import { CreatorEarningsTab } from "./host/CreatorEarningsTab";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

// ============================================================================
// CREATOR DASHBOARD V2
// Action-first design with progressive disclosure
// ============================================================================

const CreatorDashboardV2 = () => {
  const { user, session } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "studio";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Fetch creator stats
  const { data: creatorStats, isLoading: statsLoading } = useQuery({
    queryKey: ["creator-stats", user?.id],
    queryFn: async () => {
      if (!session) return null;
      // Mock data for now - replace with actual API
      return {
        contentCount: 0,
        missionCount: 0,
        totalViews: 0,
        earnings: 0,
        hasPublished: false,
        hasLinkedMission: false,
      };
    },
    enabled: !!user && !!session,
  });

  // Calculate maturity
  const isNewCreator = !creatorStats?.hasPublished;
  const isActiveCreator = creatorStats?.hasPublished && creatorStats?.contentCount < 5;
  const isEstablishedCreator = creatorStats?.contentCount >= 5;

  return (
    <div className="space-y-6 pb-20">
      {/* =====================================================================
          HEADER: Context-aware welcome
          ===================================================================== */}
      {isNewCreator ? (
        // Simple welcome for new creators
        <section className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                Creator Studio
              </div>
              <h1 className="font-serif text-2xl font-bold mb-1">
                Welcome, <span className="italic text-primary">{user?.user_metadata?.full_name?.split(" ")[0] || "Creator"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Turn stories into verified movement and measurable yield
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/watch-unlock">
                <Eye className="w-4 h-4 mr-2" />
                Explore Missions
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        // Full header for active creators
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Creator <span className="text-primary italic">Studio</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Creator"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {creatorStats && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-primary" />
                  {creatorStats.contentCount} stories
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-accent" />
                  {creatorStats.totalViews.toLocaleString()} views
                </span>
              </div>
            )}
            <Button onClick={() => setActiveTab("publish")}>
              <Plus className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </section>
      )}

      {/* =====================================================================
          NEW CREATOR: First Steps Guidance
          ===================================================================== */}
      {isNewCreator && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Start Creating</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your first win is simple: publish a story, attach it to a mission, 
                  then watch for your first conversion.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab("publish")}>
                    <Film className="w-4 h-4 mr-2" />
                    Publish First Story
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/watch-unlock">
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Missions
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
          {!isNewCreator && (
            <TabsTrigger value="missions" className="gap-2">
              <Link2 className="w-4 h-4" />
              Missions
            </TabsTrigger>
          )}
          {isEstablishedCreator && (
            <TabsTrigger value="earnings" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          )}
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
          <CreatorMissionPublisher />
        </TabsContent>

        {!isNewCreator && (
          <TabsContent value="missions" className="mt-0">
            <O2OLinkManager />
          </TabsContent>
        )}

        {isEstablishedCreator && (
          <TabsContent value="earnings" className="mt-0">
            <CreatorEarningsTab />
          </TabsContent>
        )}
      </Tabs>

      {/* =====================================================================
          QUICK ACTIONS: Context-aware
          ===================================================================== */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: Film,
                label: "Publish Story",
                desc: "Create new content",
                action: () => setActiveTab("publish"),
                show: true,
              },
              {
                icon: Link2,
                label: "Link Mission",
                desc: "Attach to moment",
                action: () => setActiveTab("missions"),
                show: !isNewCreator,
              },
              {
                icon: PlayCircle,
                label: "Watch Feed",
                desc: "See missions",
                href: "/watch-unlock",
                show: true,
              },
              {
                icon: DollarSign,
                label: "Earnings",
                desc: "Review yield",
                action: () => setActiveTab("earnings"),
                show: isEstablishedCreator,
              },
            ]
              .filter((action) => action.show)
              .map((action) =>
                action.href ? (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="justify-start h-auto py-4"
                    asChild
                  >
                    <Link to={action.href}>
                      <action.icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={action.action}
                  >
                    <action.icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </Button>
                )
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboardV2;
