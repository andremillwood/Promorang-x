import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle,
  Compass,
  Crown,
  Gift,
  HeartHandshake,
  Key,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { format, isFuture, isPast, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FirstSteps } from "@/components/onboarding/FirstSteps";
import { SuggestedMoments } from "@/components/discovery/SuggestedMoments";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { DashboardHero, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { CalendarButton } from "@/components/CalendarButton";
import { StreakWidget } from "@/components/participant/StreakWidget";
import { TierBadge } from "@/components/tier";
import { useUserTier } from "@/hooks/useUserTier";
import { useCheckIn, useJoinedMoments, useParticipantStats, type Moment } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type JoinedMoment = Moment & {
  participation_status?: string | null;
  joined_at?: string | null;
  checked_in_at?: string | null;
};

const ParticipantDashboardV2 = () => {
  const { user, session, profile } = useAuth();
  const maturityState = profile?.maturity_state || 0;
  const { useTierStatus } = useUserTier();
  const { data: tierStatus } = useTierStatus();
  const { data: balance, isLoading: balanceLoading } = useUserBalance();
  const { data: joinedMoments = [], isLoading: momentsLoading } = useJoinedMoments();
  const { data: stats, isLoading: statsLoading } = useParticipantStats();
  const checkIn = useCheckIn();

  const typedJoinedMoments = joinedMoments as JoinedMoment[];
  const upcomingMoments = typedJoinedMoments.filter((moment) => isFuture(new Date(moment.starts_at)));
  const pastMoments = typedJoinedMoments.filter((moment) => isPast(new Date(moment.starts_at)));

  const hasJoinedMoments = typedJoinedMoments.length > 0;
  const hasCheckedIn = (stats?.checkedIn || 0) > 0;
  const hasPoints = (balance?.points || 0) > 0;
  const isNewUser = !hasJoinedMoments && !hasCheckedIn;
  const isActiveUser = hasJoinedMoments && hasCheckedIn;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Explorer";
  const uniquePlaces = new Set(
    typedJoinedMoments
      .map((moment) => moment.venue_name || moment.location)
      .filter(Boolean)
  ).size;
  const visibleMarks = stats?.checkedIn || pastMoments.length || 0;
  const visibleMemories = pastMoments.length;

  const pointsToNextKey = 1000;
  const currentPointsProgress = balance ? balance.points % pointsToNextKey : 0;
  const progressPercent = (currentPointsProgress / pointsToNextKey) * 100;

  const { data: impactProfile } = useQuery({
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
    enabled: !!user && !!session && isActiveUser,
  });

  const handleCheckIn = (momentId: string) => {
    checkIn.mutate(momentId);
  };

  const statCards = [
    {
      label: "Upcoming",
      value: upcomingMoments.length.toLocaleString(),
      helper: hasJoinedMoments ? "Moments on your calendar" : "Nothing scheduled yet",
      icon: Calendar,
      accent: "text-primary",
    },
    {
      label: "Check-ins",
      value: (stats?.checkedIn || 0).toLocaleString(),
      helper: "Verified participation",
      icon: CheckCircle,
      accent: "text-emerald-500",
    },
    {
      label: "Points",
      value: (balance?.points || 0).toLocaleString(),
      helper: `${Math.round(progressPercent)}% to next key`,
      icon: Sparkles,
      accent: "text-amber-500",
    },
    {
      label: "Keys",
      value: (balance?.promokeys || 0).toLocaleString(),
      helper: "Access and unlocks",
      icon: Key,
      accent: "text-sky-500",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <FirstSteps />

      {isNewUser && !momentsLoading ? <SuggestedMoments limit={3} /> : null}

      <DashboardHero
        badge="Participant Dashboard"
        title={isNewUser ? `Start your momentum, ${firstName}` : `Welcome back, ${firstName}`}
        description="Find a moment, unlock access when needed, show up, and leave a Mark. This is where your real participation turns into Keys, rewards, memories, and future priority."
        actions={[
          { label: "Pulse", href: "/pulse", icon: TrendingUp },
          { label: "Discover", href: "/discover", icon: Compass },
          { label: "Vault", href: "/vault", icon: Gift },
        ]}
        stats={statCards.map((stat) => ({ ...stat, accentClass: stat.accent }))}
        isLoading={balanceLoading || statsLoading}
        glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(255,167,38,0.22),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(244,81,30,0.18),_transparent_34%)]"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-card to-accent/8">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20">
                    Social Identity
                  </Badge>
                  <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">
                    Your Promorang should feel like your scene, not just your stats.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Marks, people, places, streaks, and memories are the social layer. They show where you were, who you move with, and what keeps pulling you back.
                  </p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/profile">
                    View profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "My Marks", value: visibleMarks.toLocaleString(), helper: "Verified times you showed up", icon: CheckCircle },
                  { label: "My people", value: "Crew", helper: "Follows, referrals, and repeat movement", icon: Users },
                  { label: "My places", value: uniquePlaces.toLocaleString(), helper: "Venues and locations in your story", icon: MapPin },
                  { label: "My streak", value: String(profile?.streak_count || 0), helper: "Consistency over time", icon: Zap },
                  { label: "My memories", value: visibleMemories.toLocaleString(), helper: "Moments that stayed with you", icon: HeartHandshake },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <item.icon className="h-4 w-4 text-primary" />
                    <p className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.helper}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/50 p-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">What&apos;s next</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Stay close to the next moment that needs your attention.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/pulse">
                    Open Pulse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="p-6">
                {momentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : upcomingMoments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold">Your calendar is open</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                      Use Discover when you want to browse with intent, or jump into Pulse when you want to catch what is forming right now.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Button asChild>
                        <Link to="/discover">
                          <Compass className="mr-2 h-4 w-4" />
                          Browse Discover
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/search">
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingMoments.slice(0, 4).map((moment) => {
                      const daysUntil = differenceInDays(new Date(moment.starts_at), new Date());
                      const needsCheckIn =
                        daysUntil <= 1 && moment.participation_status !== "checked_in" && !moment.checked_in_at;

                      return (
                        <div
                          key={moment.id}
                          className="group flex flex-col gap-4 rounded-2xl border border-border/50 p-4 transition-all hover:border-primary/30 hover:shadow-soft sm:flex-row sm:items-center"
                        >
                          <div className="w-14 shrink-0 text-center">
                            <div className="text-2xl font-bold text-primary">{format(new Date(moment.starts_at), "d")}</div>
                            <div className="text-xs uppercase text-muted-foreground">
                              {format(new Date(moment.starts_at), "MMM")}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link to={`/moments/${moment.id}`} className="block">
                              <h3 className="truncate font-semibold group-hover:text-primary">{moment.title}</h3>
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {moment.venue_name || moment.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {format(new Date(moment.starts_at), "EEE, MMM d • h:mm a")}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {needsCheckIn ? (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(moment.id)}
                                disabled={checkIn.isPending}
                                className="rounded-full"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Check in
                              </Button>
                            ) : null}
                            <CalendarButton
                              size="icon"
                              variant="ghost"
                              showLabel={false}
                              event={{
                                title: moment.title,
                                description: moment.description || "",
                                location: moment.location,
                                start: new Date(moment.starts_at),
                                end: moment.ends_at
                                  ? new Date(moment.ends_at)
                                  : new Date(new Date(moment.starts_at).getTime() + 60 * 60 * 1000),
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-3 rounded-full">
                      Momentum
                    </Badge>
                    <h2 className="font-serif text-xl font-bold">Your current standing</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Progress toward more access, better placement, and stronger reputation.
                    </p>
                  </div>
                  {tierStatus ? <TierBadge tier={tierStatus.current_tier} size="sm" showProgress={false} /> : null}
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">Points to next key</span>
                      <span className="text-muted-foreground">
                        {currentPointsProgress}/{pointsToNextKey}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-muted/30 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        This month
                      </div>
                      <div className="text-2xl font-semibold">{stats?.thisMonth || 0}</div>
                      <div className="text-xs text-muted-foreground">Moments joined</div>
                    </div>
                    <div className="rounded-2xl bg-muted/30 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Target className="h-4 w-4 text-primary" />
                        Rewards
                      </div>
                      <div className="text-2xl font-semibold">{stats?.rewardsClaimed || 0}</div>
                      <div className="text-xs text-muted-foreground">Claimed so far</div>
                    </div>
                  </div>

                  {impactProfile ? (
                    <div className="rounded-3xl border border-border/60 bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Zap className="h-4 w-4 text-accent" />
                          Influence footprint
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {String(impactProfile.catalyst_rank || "EXPLORER").replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-background/80 p-3">
                          <div className="text-lg font-semibold">{impactProfile.impact_score || 0}</div>
                          <div className="text-[11px] uppercase text-muted-foreground">Score</div>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-3">
                          <div className="text-lg font-semibold">{impactProfile.first_mover_count || 0}</div>
                          <div className="text-[11px] uppercase text-muted-foreground">First moves</div>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-3">
                          <div className="text-lg font-semibold">{impactProfile.downstream_action_count || 0}</div>
                          <div className="text-[11px] uppercase text-muted-foreground">Influenced</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-3 rounded-full">
                      Value Layer
                    </Badge>
                    <h2 className="font-serif text-xl font-bold">Keep what you earn</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vault is for memories and status. Wallet is for balances and mechanics.
                    </p>
                  </div>
                  <Gift className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">Vault readiness</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {hasPoints
                            ? "You have enough activity to start building a meaningful vault."
                            : "Your vault opens up as you join, verify, and earn."}
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link to="/vault">Open Vault</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Key className="h-4 w-4 text-sky-500" />
                        PromoKeys
                      </div>
                      <div className="text-2xl font-semibold">{balance?.promokeys || 0}</div>
                      <div className="text-xs text-muted-foreground">For gated access and unlocks</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Wallet className="h-4 w-4 text-emerald-500" />
                        Gems
                      </div>
                      <div className="text-2xl font-semibold">{balance?.gems || 0}</div>
                      <div className="text-xs text-muted-foreground">For platform purchases and pieces</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                      <Link to="/wallet">Open Wallet</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link to="/saved">Saved collections</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {pastMoments.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Recent memories</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vault should carry the long-tail value. This preview keeps the dashboard light.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/vault">
                    Open Vault
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <MasonryGrid columns={{ sm: 2, md: 3 }} gap={16}>
                {pastMoments.slice(0, 6).map((moment) => (
                  <MomentCard key={moment.id} moment={moment} variant="compact" />
                ))}
              </MasonryGrid>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          {hasJoinedMoments ? <StreakWidget count={profile?.streak_count || 0} /> : null}

          <RoleActivationPanel
            eyebrow="Next Moves"
            title="Turn today into access"
            description="The simplest loop is enough: join something real, verify that you were there, then keep the value in your record."
            items={[
              {
                title: "Join a moment",
                description: "Find something worth showing up for",
                status: hasJoinedMoments ? "done" : "current",
                href: "/discover",
                ctaLabel: "Discover",
              },
              {
                title: "Verify attendance",
                description: "Check in so your action counts",
                status: hasCheckedIn ? "done" : hasJoinedMoments ? "current" : "todo",
                href: "/pulse",
                ctaLabel: "Open Pulse",
              },
              {
                title: "Unlock your vault",
                description: "Keep memories, rewards, and earned upside visible",
                status: hasPoints ? "done" : hasCheckedIn ? "current" : "todo",
                href: "/vault",
                ctaLabel: "Open Vault",
              },
            ]}
          />

          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-full">
                    Next Layer
                  </Badge>
                  <h2 className="font-serif text-xl font-bold">Where your momentum can go next</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These are not the first screens a participant needs, but they should become visible once showing up starts turning into value.
                  </p>
                </div>
                <Layers className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Pieces</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Pieces are earned from verified momentum and traded through Gems.
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/portfolio">Portfolio</Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/marketplace">Market</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Liquidity</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Liquidity is where active value gets circulation. It should feel earned, not dumped into the first-run participant path.
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
                        PromoShare is the recurring relevance layer. Verified actions increase your standing inside qualified reward cycles.
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
            title="Operational Routes"
            description="Keep the utility tools close and the compounding-value layer visible."
            routes={[
              { label: "Activity", href: "/activity", icon: Sparkles },
              { label: "Saved", href: "/saved", icon: Gift },
              { label: "Wallet", href: "/wallet", icon: Wallet },
              { label: "Pieces", href: "/portfolio", icon: Layers },
              { label: "Piece market", href: "/marketplace", icon: Compass },
              { label: "Liquidity", href: "/liquidity", icon: TrendingUp },
              { label: "PromoShare", href: "/promoshare", icon: Zap },
            ]}
          />

          {maturityState < 3 ? (
            <Card className="border-primary/15 bg-gradient-to-br from-primary/8 via-background to-accent/5">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Path to host</h3>
                    <p className="text-sm text-muted-foreground">Creation should be earned and intentional.</p>
                  </div>
                </div>

                <Progress value={(maturityState / 3) * 100} className="mb-4 h-2" />

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { step: 1, label: "Explorer" },
                    { step: 2, label: "Contributor" },
                    { step: 3, label: "Host" },
                  ].map((item) => {
                    const done = maturityState >= item.step;
                    return (
                      <div
                        key={item.step}
                        className={cn(
                          "rounded-2xl border p-3",
                          done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-muted/20",
                        )}
                      >
                        <div className="mb-2 text-sm font-semibold">{item.step}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    );
                  })}
                </div>

                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link to="/for-communities">Learn about hosting</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboardV2;
