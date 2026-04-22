import { useState } from "react";
import {
  Calendar,
  Gift,
  MapPin,
  CalendarDays,
  Award,
  Camera,
  Link2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Bookmark,
  FileText,
  Coins,
  Key,
  CheckCircle,
  Store,
  Building2,
  Users,
  DollarSign,
  ChevronRight,
  Plus,
  Compass,
  Crown,
  Target,
  Zap,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FirstSteps } from "@/components/onboarding/FirstSteps";
import { SuggestedMoments } from "@/components/discovery/SuggestedMoments";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinedMoments, useParticipantStats, useCheckIn } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isFuture, isPast, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { PointsOverview, PointsTransactionHistory } from "@/components/participant/PointsSection";
import { UGCSection } from "@/components/participant/UGCSection";
import { ReferralsSection } from "@/components/participant/ReferralsSection";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SavedCollections } from "@/components/SavedCollections";
import ProposalsDashboard from "@/components/dashboards/ProposalsDashboard";
import { UserDiscovery } from "@/components/discovery";
import { EarningsDashboard } from "@/components/value";
import { CalendarButton } from "@/components/CalendarButton";
import { HostUnlockBanner } from "@/components/HostUnlockBanner";
import { UpsellBanner } from "@/components/participant/UpsellBanner";
import { RankPerksGuide } from "@/components/participant/RankPerksGuide";
import { StreakWidget } from "@/components/participant/StreakWidget";
import { TierBadge, CommunityRelationshipSummary } from "@/components/tier";
import { useUserTier } from "@/hooks/useUserTier";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ============================================================================
// PARTICIPANT DASHBOARD V2
// Improved IA with Progressive Disclosure
// ============================================================================

const ParticipantDashboardV2 = () => {
  const { user, session, profile } = useAuth();
  const maturityState = profile?.maturity_state || 0;
  const { useTierStatus } = useUserTier();
  const { data: tierStatus } = useTierStatus();
  const { data: balance, isLoading: balanceLoading } = useUserBalance();
  const { data: joinedMoments, isLoading: momentsLoading } = useJoinedMoments();
  const { data: stats, isLoading: statsLoading } = useParticipantStats();
  const checkIn = useCheckIn();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "moments";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Calculate user maturity metrics
  const hasJoinedMoments = (joinedMoments?.length || 0) > 0;
  const hasCheckedIn = (stats?.checkedIn || 0) > 0;
  const hasPoints = (balance?.points || 0) > 0;
  const isNewUser = !hasJoinedMoments && !hasCheckedIn;
  const isActiveUser = hasJoinedMoments && hasCheckedIn && (joinedMoments?.length || 0) >= 3;
  const isPowerUser = isActiveUser && (balance?.points || 0) > 1000;

  const { data: impactProfile, isLoading: impactLoading } = useQuery({
    queryKey: ["impact-profile", user?.id],
    queryFn: async () => {
      if (!session) return null;
      const response = await fetch(`${API_URL}/api/impact/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load impact profile");
      return payload?.profile || null;
    },
    enabled: !!user && !!session && isActiveUser, // Only fetch for active users
  });

  const upcomingMoments = joinedMoments?.filter((m) => isFuture(new Date(m.starts_at))) || [];
  const pastMoments = joinedMoments?.filter((m) => isPast(new Date(m.starts_at))) || [];

  const handleCheckIn = (momentId: string) => {
    checkIn.mutate(momentId);
  };

  // Economy Math
  const pointsToNextKey = 1000;
  const currentPointsProgress = balance ? (balance.points % pointsToNextKey) : 0;
  const progressPercent = (currentPointsProgress / pointsToNextKey) * 100;

  return (
    <div className="space-y-6 pb-20">
      {/* =====================================================================
          SECTION 1: ONBOARDING & GUIDANCE (Always visible for incomplete users)
          ===================================================================== */}
      <FirstSteps />

      {/* =====================================================================
          SECTION 2: SUGGESTED MOMENTS (For new users without content)
          ===================================================================== */}
      {isNewUser && !momentsLoading && (
        <SuggestedMoments limit={3} />
      )}

      {/* =====================================================================
          SECTION 3: SMART HEADER (Condensed vs Full based on user maturity)
          ===================================================================== */}
      {isNewUser ? (
        /* Simple Welcome for New Users */
        <section className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold mb-1">
                Welcome, <span className="italic text-primary">{user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Your journey starts with your first moment
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/discover">
                <Compass className="w-4 h-4 mr-2" />
                Discover
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        /* Full Hero for Active Users */
        <section className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[2rem] bg-charcoal p-5 sm:min-h-[280px] sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Welcome back, <span className="italic text-primary-light">{user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}</span>
              </h1>
              {tierStatus && (
                <TierBadge tier={tierStatus.current_tier} size="sm" showProgress={false} />
              )}
            </div>
            
            {/* Quick Stats Row - Condensed */}
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {upcomingMoments.length} upcoming
              </span>
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                {(balance?.points || 0).toLocaleString()} points
              </span>
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" />
                {balance?.promokeys || 0} keys
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 4: QUICK ACTIONS (Context-aware based on user state)
          ===================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { 
            icon: Compass, 
            label: "Discover", 
            href: "/discover", 
            color: "bg-blue-500/10 text-blue-600",
            show: true
          },
          { 
            icon: Calendar, 
            label: "My Moments", 
            href: "/dashboard?tab=moments", 
            color: "bg-primary/10 text-primary",
            show: hasJoinedMoments
          },
          { 
            icon: Crown, 
            label: "Become Host", 
            href: "/for-communities", 
            color: "bg-amber-500/10 text-amber-600",
            show: isActiveUser && maturityState < 3
          },
          { 
            icon: Gift, 
            label: "Vault", 
            href: "/vault", 
            color: "bg-emerald-500/10 text-emerald-600",
            show: hasPoints
          },
        ].filter(action => action.show).map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all"
          >
            <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">{action.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* =====================================================================
          SECTION 5: PRIMARY CONTENT (Moments - The main value)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column - Moments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Moments Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                  <h2 className="font-serif text-xl font-bold">Upcoming Moments</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {upcomingMoments.length > 0 
                      ? `${upcomingMoments.length} events on your calendar`
                      : "Nothing scheduled yet"
                    }
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/discover" className="group">
                    Find more
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="p-6">
                {momentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : upcomingMoments.length === 0 ? (
                  /* Enhanced Empty State */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">Your calendar is open</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                      Join moments to build your schedule and earn rewards for showing up
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button asChild>
                        <Link to="/discover">
                          <Compass className="w-4 h-4 mr-2" />
                          Browse Moments
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/search">
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingMoments.slice(0, 3).map((moment) => {
                      const daysUntil = differenceInDays(new Date(moment.starts_at), new Date());
                      return (
                        <div
                          key={moment.id}
                          className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:shadow-soft transition-all"
                        >
                          {/* Date Badge */}
                          <div className="flex-shrink-0 w-14 text-center">
                            <div className="text-2xl font-bold text-primary">
                              {format(new Date(moment.starts_at), "d")}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">
                              {format(new Date(moment.starts_at), "MMM")}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/moments/${moment.id}`}>
                              <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                                {moment.title}
                              </h4>
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {moment.venue_name || moment.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {format(new Date(moment.starts_at), "h:mm a")}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {daysUntil <= 1 && (moment as any).participation_status !== "checked_in" && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(moment.id)}
                                disabled={checkIn.isPending}
                                className="rounded-lg"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Check In
                              </Button>
                            )}
                            <CalendarButton
                              size="icon"
                              variant="ghost"
                              showLabel={false}
                              event={{
                                title: moment.title,
                                description: moment.description || "",
                                location: moment.location,
                                start: new Date(moment.starts_at),
                                end: moment.ends_at ? new Date(moment.ends_at) : new Date(new Date(moment.starts_at).getTime() + 3600000)
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    {upcomingMoments.length > 3 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link to="/dashboard?tab=moments">
                          View all {upcomingMoments.length} moments
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview - Only for users with data */}
          {hasJoinedMoments && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { 
                  label: "Points", 
                  value: balance?.points || 0, 
                  icon: Coins, 
                  color: "text-amber-500",
                  subtitle: `${Math.round(progressPercent)}% to next key`
                },
                { 
                  label: "Keys", 
                  value: balance?.promokeys || 0, 
                  icon: Key, 
                  color: "text-primary",
                  subtitle: "Unlock rewards"
                },
                { 
                  label: "Joined", 
                  value: stats?.totalJoined || 0, 
                  icon: Calendar, 
                  color: "text-blue-500",
                  subtitle: `${upcomingMoments.length} upcoming`
                },
                { 
                  label: "Check-ins", 
                  value: stats?.checkedIn || 0, 
                  icon: CheckCircle, 
                  color: "text-emerald-500",
                  subtitle: "Verified attends"
                },
              ].map((stat, index) => (
                <Card key={index} className="hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1">{stat.subtitle}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Gamification Elements - Progressive Disclosure */}
          {isActiveUser && (
            <>
              {/* Roadmap to Host - Only if not yet host */}
              {maturityState < 3 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                          <Target className="w-3 h-3" />
                          Path to Host
                        </div>
                        <h3 className="font-serif text-lg font-bold">Unlock moment creation</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{Math.round((maturityState / 3) * 100)}%</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Complete</div>
                      </div>
                    </div>
                    
                    <Progress value={(maturityState / 3) * 100} className="h-2 mb-4" />
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { step: 1, label: "Explorer", req: "3 check-ins", done: maturityState >= 1 },
                        { step: 2, label: "Contributor", req: "10 check-ins", done: maturityState >= 2 },
                        { step: 3, label: "Host", req: "Create moments", done: maturityState >= 3 },
                      ].map((s) => (
                        <div 
                          key={s.step}
                          className={cn(
                            "text-center p-3 rounded-xl border",
                            s.done 
                              ? "bg-emerald-500/5 border-emerald-500/20" 
                              : "bg-muted/30 border-border/40"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1.5 text-xs font-bold",
                            s.done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {s.done ? <CheckCircle className="w-3 h-3" /> : s.step}
                          </div>
                          <div className="text-xs font-medium">{s.label}</div>
                          <div className="text-[10px] text-muted-foreground">{s.req}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Impact Dashboard - Only for engaged users */}
              {impactProfile && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider mb-2">
                          <Zap className="w-3 h-3" />
                          Impact Score
                        </div>
                        <h3 className="font-serif text-lg font-bold">Your influence</h3>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {String(impactProfile.catalyst_rank || "EXPLORER").replaceAll("_", " ")}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <div className="text-xl font-bold">{impactProfile.impact_score || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Score</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <div className="text-xl font-bold">{impactProfile.first_mover_count || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">First Moves</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <div className="text-xl font-bold">{impactProfile.downstream_action_count || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Influence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Past Memories - Only if they have them */}
          {pastMoments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold">Memories</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/gallery">View all</Link>
                </Button>
              </div>
              <MasonryGrid columns={{ sm: 2, md: 3 }} gap={16}>
                {pastMoments.slice(0, 6).map((moment) => (
                  <MomentCard key={moment.id} moment={moment as any} variant="compact" />
                ))}
              </MasonryGrid>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Streak Widget - Only if they have activity */}
          {hasJoinedMoments && (
            <StreakWidget count={profile?.streak_count || 0} />
          )}

          {/* Role Activation - Context aware */}
          <RoleActivationPanel
            eyebrow="Grow Your Impact"
            title="What's next?"
            description="Level up your participation with new roles and capabilities."
            items={[
              {
                title: "Join moments",
                description: "Find experiences near you",
                status: hasJoinedMoments ? "done" : "current",
                href: "/discover",
                ctaLabel: "Discover",
              },
              {
                title: "Check in",
                description: "Verify your attendance",
                status: hasCheckedIn ? "done" : hasJoinedMoments ? "current" : "todo",
                href: "/check-in",
                ctaLabel: "Check in",
              },
              {
                title: "Become a host",
                description: "Create your own moments",
                status: maturityState >= 3 ? "done" : "todo",
                href: "/for-communities",
                ctaLabel: "Apply",
              },
            ]}
          />

          {/* Activity Feed - Mock data for now */}
          {isActiveUser && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <ActivityFeed
                  events={[
                    {
                      id: "e1",
                      user_id: user?.id || "",
                      event_type: "reward",
                      metadata: { points: "500", reason: "Check-in Bonus" },
                      created_at: new Date(Date.now() - 3600000).toISOString(),
                      actor: { full_name: "Promorang", avatar_url: null }
                    },
                  ]}
                  compact
                />
                <Button variant="ghost" className="w-full mt-4" size="sm" asChild>
                  <Link to="/dashboard/activity">View all</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Business Hub - Only for engaged users */}
          {isActiveUser && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Store className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">Business Hub</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to scale? Partner with brands or list your venue.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm" asChild>
                    <Link to="/for-brands">
                      <Building2 className="w-4 h-4 mr-2" />
                      Brand Partner
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" asChild>
                    <Link to="/for-merchants">
                      <Store className="w-4 h-4 mr-2" />
                      List Venue
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Promo Card - Only for new users */}
          {isNewUser && (
            <Card className="bg-gradient-to-br from-primary to-accent text-white">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 mb-3 opacity-80" />
                <h4 className="font-serif text-lg font-bold mb-2">Be a Host</h4>
                <p className="text-sm text-white/80 mb-4">
                  Verified hosts get 50% more points and featured placement.
                </p>
                <Button variant="secondary" className="w-full" size="sm" asChild>
                  <Link to="/for-communities">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* =====================================================================
          SECTION 6: FULL TABS INTERFACE (For power users)
          ===================================================================== */}
      {isPowerUser && (
        <section className="pt-6 border-t border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {[
                { value: "moments", label: "All Moments", icon: Calendar },
                { value: "points", label: "Points", icon: Coins },
                { value: "earnings", label: "Earnings", icon: DollarSign },
                { value: "referrals", label: "Invite", icon: Link2 },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="moments">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedMoments?.map((moment) => (
                  <MomentCard key={moment.id} moment={moment as any} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="points">
              <PointsOverview />
              <div className="mt-6">
                <PointsTransactionHistory />
              </div>
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsDashboard />
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralsSection />
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
};

export default ParticipantDashboardV2;
