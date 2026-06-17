import { Suspense, lazy, useState } from "react";
import { 
  ArrowRight,
  Calendar, 
  Users, 
  Plus, 
  TrendingUp, 
  Eye, 
  Handshake, 
  Coins, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Zap,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useHostedMoments, useHostStats } from "@/hooks/useMoments";
import { useHostEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";
import { useHostProofOutcome } from "@/hooks/useProofOutcome";

const HostSponsorshipRequests = lazy(() =>
  import("@/components/host/SponsorshipRequests").then((module) => ({ default: module.HostSponsorshipRequests })),
);
const CommunityImpactMatrix = lazy(() =>
  import("@/components/host/CommunityImpactMatrix").then((module) => ({ default: module.CommunityImpactMatrix })),
);
const HostProofReviewPanel = lazy(() =>
  import("@/components/host/HostProofReviewPanel").then((module) => ({ default: module.HostProofReviewPanel })),
);
const HostPulseControlPanel = lazy(() =>
  import("@/components/host/HostPulseControlPanel").then((module) => ({ default: module.HostPulseControlPanel })),
);

const tabFallback = <Skeleton className="h-64 rounded-xl" />;

// ============================================================================
// HOST DASHBOARD V2
// Action-first design with progressive disclosure
// ============================================================================

const HostDashboardV2 = () => {
  useAuth();
  const { data: hostedMoments, isLoading: momentsLoading } = useHostedMoments();
  const { data: stats, isLoading: statsLoading } = useHostStats();
  const { data: economy, isLoading: economyLoading } = useHostEconomy();
  const proofOutcomeQuery = useHostProofOutcome();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "moments";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Calculate host maturity
  const upcomingMoments = hostedMoments?.filter(
    (m) => isFuture(new Date(m.starts_at)) && m.is_active
  ) || [];
  
  const pastMoments = hostedMoments?.filter(
    (m) => isPast(new Date(m.starts_at))
  ) || [];

  const isNewHost = hostedMoments?.length === 0;
  const isActiveHost = hostedMoments && hostedMoments.length > 0 && hostedMoments.length < 5;
  const isEstablishedHost = hostedMoments && hostedMoments.length >= 5;

  // Calculate total participants
  const totalParticipants = stats?.totalParticipants || 0;

  return (
    <div className="space-y-6 pb-20">
      <DashboardHero
        badge="Host Sanctuary"
        title={isNewHost ? "Create the first moment worth showing up for" : "Run live moments with clear proof"}
        description="Hosts create the real-world loop: launch the moment, watch it form, review the proof, then repeat what worked."
        actions={[
          { label: "Create", href: "/create/moment", icon: Plus },
          { label: "Pulse", onClick: () => setActiveTab("pulse"), icon: Activity },
          { label: "Review", onClick: () => setActiveTab("review"), icon: ShieldCheck },
        ]}
        stats={[
          { label: "Active moments", value: upcomingMoments.length.toLocaleString(), helper: "Currently on your calendar", icon: Calendar },
          { label: "Participants", value: totalParticipants.toLocaleString(), helper: "Across hosted moments", icon: Users },
          { label: "Points generated", value: economy?.pointsGenerated?.toLocaleString() || "0", helper: "Distributed through moments", icon: Coins },
          { label: "Past events", value: pastMoments.length.toLocaleString(), helper: "Already completed", icon: TrendingUp },
        ]}
        isLoading={statsLoading || economyLoading}
      />

      {/* =====================================================================
          NEW HOST: First Steps
          ===================================================================== */}
      {isNewHost && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Create Your First Moment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your first win: create a live moment with clear venue, timing, 
                  proof requirements, and rewards.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/create/moment">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Moment
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/discover/moments">
                      <Eye className="w-4 h-4 mr-2" />
                      See Examples
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          ACTIVE HOST: Host Journey Progress
          ===================================================================== */}
      {!isNewHost && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Host Journey</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {isEstablishedHost ? "Complete" : isActiveHost ? "In Progress" : "Just Started"}
              </Badge>
            </div>
            <Progress 
              value={isEstablishedHost ? 100 : isActiveHost ? 50 : 25} 
              className="h-2 mb-3" 
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { 
                  label: "Create moment", 
                  done: hostedMoments && hostedMoments.length > 0,
                  icon: Calendar
                },
                { 
                  label: "Get participants", 
                  done: totalParticipants > 0,
                  icon: Users
                },
                { 
                  label: "5+ moments", 
                  done: isEstablishedHost,
                  icon: Sparkles
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

      {!isNewHost && (
        <ProofOutcomeRail
          eyebrow="Shared Proof Layer"
          title="Run the same verified loop across every hosted moment"
          data={proofOutcomeQuery.data}
          isLoading={proofOutcomeQuery.isLoading}
          ctaHref="/dashboard?tab=review"
          ctaLabel="Review pending proofs"
        />
      )}

      {/* =====================================================================
          UPCOMING MOMENTS: Priority display for active hosts
          ===================================================================== */}
      {!isNewHost && (
        <section>
          <div className="flex min-w-0 flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">Upcoming Moments</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The dashboard should keep your active schedule close, not replace moment detail pages.
              </p>
            </div>
            {upcomingMoments.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("moments")}>
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {momentsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : upcomingMoments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No upcoming moments</p>
                <Button asChild>
                  <Link to="/create/moment">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Moment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingMoments.slice(0, 4).map((moment) => {
                const daysUntil = differenceInDays(new Date(moment.starts_at), new Date());
                return (
                  <Card key={moment.id} className="group hover:shadow-soft transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex min-w-0 flex-col sm:flex-row">
                        {/* Image */}
                        <div className="relative h-36 w-full flex-shrink-0 bg-muted sm:h-24 sm:w-24">
                          {moment.image_url ? (
                            <img
                              src={moment.image_url}
                              alt={moment.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-white/60" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4 min-w-0">
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <Link to={`/moments/${moment.id}`}>
                                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                  {moment.title}
                                </h3>
                              </Link>
                              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{moment.venue_name || moment.location}</span>
                              </div>
                            </div>
                            <Badge 
                              variant={daysUntil <= 3 ? "default" : "outline"}
                              className="flex-shrink-0 text-[10px]"
                            >
                              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                            </Badge>
                          </div>
                          
                          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                            <span className="flex min-w-0 items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(moment.starts_at), "h:mm a")}
                            </span>
                            <span className="flex min-w-0 items-center gap-1">
                              <Users className="w-3 h-3" />
                              0/{moment.max_participants || "∞"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MAIN TABS: Progressive disclosure
          ===================================================================== */}
      {!isNewHost && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="moments" className="gap-2">
              <Calendar className="w-4 h-4" />
              All Moments
            </TabsTrigger>
            <TabsTrigger value="pulse" className="gap-2">
              <Activity className="w-4 h-4" />
              Pulse
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Review
            </TabsTrigger>
            {isEstablishedHost && (
              <TabsTrigger value="sponsorships" className="gap-2">
                <Handshake className="w-4 h-4" />
                Sponsors
              </TabsTrigger>
            )}
            {isEstablishedHost && (
              <TabsTrigger value="impact" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Impact
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="moments" className="mt-0">
            {momentsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {[...upcomingMoments, ...pastMoments].map((moment) => (
                  <Card key={moment.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                        <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                          {moment.image_url ? (
                            <img src={moment.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-white/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/moments/${moment.id}`}>
                            <h3 className="font-medium truncate hover:text-primary transition-colors">
                              {moment.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(moment.starts_at), "MMM d, yyyy • h:mm a")}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              {isFuture(new Date(moment.starts_at)) ? "Upcoming" : "Past"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {moment.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pulse" className="mt-0">
            <Suspense fallback={tabFallback}>
              <HostPulseControlPanel moments={upcomingMoments} />
            </Suspense>
          </TabsContent>

          <TabsContent value="review" className="mt-0">
            <Suspense fallback={tabFallback}>
              <HostProofReviewPanel />
            </Suspense>
          </TabsContent>

          {isEstablishedHost && (
            <TabsContent value="sponsorships" className="mt-0">
              <Suspense fallback={tabFallback}>
                <HostSponsorshipRequests />
              </Suspense>
            </TabsContent>
          )}

          {isEstablishedHost && (
            <TabsContent value="impact" className="mt-0">
              <Suspense fallback={tabFallback}>
                <CommunityImpactMatrix />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* =====================================================================
          ROLE ACTIVATION: Always visible guidance
          ===================================================================== */}
      <RoleActivationPanel
        eyebrow="Host Path"
        title={isNewHost ? "Create the room people want to enter" : "Keep turning gatherings into repeatable momentum"}
        description={
          isNewHost 
            ? "Start with one moment: the place, the time, who it is for, what people do when they arrive, and why it will be worth remembering."
            : "Master the loop: create the room, manage access, watch the pulse, review proof, then bring people back for the next one."
        }
        items={[
          {
            title: "Create moment",
            description: "Launch with venue, timing, access, proof, and a reason to show up.",
            status: hostedMoments && hostedMoments.length > 0 ? "done" : "current",
            href: "/create/moment",
            ctaLabel: "Create",
          },
          {
            title: "Monitor pulse",
            description: "Watch interest form before the room fills, then adjust the signal.",
            status: upcomingMoments.length > 0 ? "done" : "todo",
            ctaLabel: "Open pulse",
            onClick: () => setActiveTab("pulse"),
          },
          {
            title: "Review proofs",
            description: "Approve check-ins and proofs so the value loop closes cleanly.",
            status: pastMoments.length > 0 ? "current" : "todo",
            ctaLabel: "Review",
            onClick: () => setActiveTab("review"),
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full">
                  Host Economy Layer
                </Badge>
                <h2 className="font-serif text-xl font-bold">Show participants what comes after attendance</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  If your moments can generate pieces, pull liquidity, or build PromoShare relevance, that path should be intentionally legible from the host side.
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
                      Use pieces when a recurring or high-signal moment deserves a complementary value profile of its own.
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/portfolio">Open Pieces</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Liquidity</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Liquidity is where the economic layer becomes active instead of theoretical.
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
                      PromoShare lets stakeholders experience recurring relevance as its own qualified reward surface.
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

        <DashboardQuickRoutesCard
          title="Host Routes"
          description="Surface the value systems that can sit behind your moments, not just the operational tabs."
          routes={[
            { label: "Create moment", href: "/create/moment", icon: Plus },
            { label: "Pulse controls", onClick: () => setActiveTab("pulse"), icon: Activity },
            { label: "Proof review", onClick: () => setActiveTab("review"), icon: ShieldCheck },
            { label: "Pieces", href: "/portfolio", icon: Coins },
            { label: "Liquidity", href: "/liquidity", icon: TrendingUp },
            { label: "PromoShare", href: "/promoshare", icon: Sparkles },
          ]}
        />
      </div>
    </div>
  );
};

export default HostDashboardV2;
