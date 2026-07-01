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
import { cultureEvents } from "@/data/culture-demo";

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
  const heroImage = cultureEvents[0]?.image;

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
      <DashboardHero
        badge="For you"
        title={isNewUser ? `Start moving, ${firstName}` : `Welcome back, ${firstName}`}
        description="Find what is live, show up, prove it, and keep the value. Your participation should feel like culture in motion, not a report."
        actions={[
          { label: "Live now", href: "/pulse", icon: TrendingUp },
          { label: "Discover", href: "/discover", icon: Compass },
          { label: "Vault", href: "/vault", icon: Gift },
        ]}
        stats={statCards.map((stat) => ({ ...stat, accentClass: stat.accent }))}
        isLoading={balanceLoading || statsLoading}
        imageSrc={heroImage}
        glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(255,167,38,0.22),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(244,81,30,0.18),_transparent_34%)]"
      />

      <RoleActivationPanel
        eyebrow="Your next move"
        title={hasJoinedMoments ? "Make your participation count" : "Choose one thing worth showing up for"}
        description={
          hasJoinedMoments
            ? "Check in at the moment, leave proof, and your attendance becomes access, status, and something worth keeping."
            : "Start with a moment. Promorang will reveal proof, rewards, and deeper tools when they become useful."
        }
        items={[
          {
            title: "Choose",
            description: "Join a moment that feels worth your time",
            status: hasJoinedMoments ? "done" : "current",
            href: "/discover",
            ctaLabel: "Discover",
          },
          {
            title: "Prove",
            description: "Check in so your presence becomes verified",
            status: hasCheckedIn ? "done" : hasJoinedMoments ? "current" : "todo",
            href: "/pulse",
            ctaLabel: "Check in",
          },
          {
            title: "Unlock",
            description: "Keep the access, rewards, and status you earn",
            status: hasPoints ? "done" : hasCheckedIn ? "current" : "todo",
            href: "/vault",
            ctaLabel: "Open Vault",
          },
        ]}
      />

      <div className="space-y-6">
          <Card className="overflow-hidden rounded-[1.5rem] border-white/10 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <Badge className="rounded-full border border-primary/30 bg-primary/15 text-primary">
                    Your scene graph
                  </Badge>
                  <h2 className="mt-3 text-3xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-white md:text-4xl">
                    Your scene starts with where you show up.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Marks, people, places, streaks, and memories become your proof trail. Use them to unlock access, rewards, and stronger placement over time.
                  </p>
                </div>
                <Button asChild variant="outline" className="shrink-0 border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:text-white">
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
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <item.icon className="h-4 w-4 text-primary" />
                    <p className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/42">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{item.helper}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/50 p-6">
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">Live choices</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start with one moment worth acting on. The system can teach the rest after you move.
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
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cultureEvents.slice(0, 3).map((event) => (
                      <Link
                        key={event.momentId}
                        to={`/moments/${event.momentId}`}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-primary/45"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={event.image}
                            alt=""
                            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                          <div className="absolute left-4 top-4 rounded-lg bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary-foreground">
                            {event.date}
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                              {event.category}
                            </p>
                            <h3 className="mt-1 text-2xl font-black uppercase leading-[0.9] tracking-[-0.05em]">
                              {event.shortTitle}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0 text-xs text-white/62">
                            <p className="truncate font-semibold text-white">{event.place}</p>
                            <p className="mt-1">{event.attending} interested</p>
                          </div>
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    ))}
                    <div className="flex min-h-[260px] flex-col justify-between rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6">
                      <div>
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Calendar className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-black tracking-[-0.04em]">Browse with intent</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Choose a moment, check what proof is needed, then show up. Everything else unlocks from that first action.
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button asChild>
                          <Link to="/discover">
                            <Compass className="mr-2 h-4 w-4" />
                            Discover
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to="/pulse">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Live Pulse
                          </Link>
                        </Button>
                      </div>
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
                    <h2 className="text-2xl font-black tracking-[-0.04em]">Your current standing</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your proof is becoming status: more access, better placement, and stronger reputation.
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
                    <h2 className="text-2xl font-black tracking-[-0.04em]">Keep what you earn</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vault is where proof becomes memory and status. Wallet keeps the balances and mechanics close.
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
                  <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Recent memories</h2>
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

          {hasJoinedMoments ? <StreakWidget count={profile?.streak_count || 0} /> : null}

          {!isNewUser ? <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-full">
                    Next Layer
                  </Badge>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">Where your momentum can go next</h2>
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
          </Card> : null}

          {!isNewUser ? <DashboardQuickRoutesCard
            title="More value tools"
            description="These deepen the experience after someone has discovered, joined, and verified a few moments."
            routes={[
              { label: "Saved", href: "/saved", icon: Gift },
              { label: "Wallet", href: "/wallet", icon: Wallet },
              { label: "Pieces", href: "/portfolio", icon: Layers },
              { label: "Liquidity", href: "/liquidity", icon: TrendingUp },
              { label: "PromoShare", href: "/promoshare", icon: Zap },
            ]}
          /> : null}

          {!isNewUser && maturityState < 3 ? (
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
  );
};

export default ParticipantDashboardV2;
