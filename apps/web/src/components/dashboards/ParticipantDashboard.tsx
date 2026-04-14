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
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinedMoments, useParticipantStats, useCheckIn } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isPast, isFuture } from "date-fns";
import { PointsOverview, PointsTransactionHistory } from "@/components/participant/PointsSection";
import { UGCSection } from "@/components/participant/UGCSection";
import { ReferralsSection } from "@/components/participant/ReferralsSection";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SavedCollections } from "@/components/SavedCollections";
import ProposalsDashboard from "@/components/dashboards/ProposalsDashboard";
import { CalendarButton } from "@/components/CalendarButton";
import { HostUnlockBanner } from "@/components/HostUnlockBanner";
import { UpsellBanner } from "@/components/participant/UpsellBanner";
import { RankPerksGuide } from "@/components/participant/RankPerksGuide";
import { StreakWidget } from "@/components/participant/StreakWidget";

const ParticipantDashboard = () => {
  const { user, profile } = useAuth();
  const maturityState = profile?.maturity_state || 0;
  const { data: balance, isLoading: balanceLoading } = useUserBalance();
  const { data: joinedMoments, isLoading: momentsLoading } = useJoinedMoments();
  const { data: stats, isLoading: statsLoading } = useParticipantStats();
  const checkIn = useCheckIn();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "moments";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const upcomingMoments = joinedMoments?.filter(
    (m) => isFuture(new Date(m.starts_at))
  ) || [];

  const pastMoments = joinedMoments?.filter(
    (m) => isPast(new Date(m.starts_at))
  ) || [];

  const handleCheckIn = (momentId: string) => {
    checkIn.mutate(momentId);
  };

  // Economy Math
  const pointsToNextKey = 1000;
  const currentPointsProgress = balance ? (balance.points % pointsToNextKey) : 0;
  const progressPercent = (currentPointsProgress / pointsToNextKey) * 100;

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Atmospheric Welcome */}
      <section className="relative rounded-[2rem] overflow-hidden min-h-[360px] bg-charcoal flex flex-col justify-end p-8 md:p-12 group transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 dark:opacity-90" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3 text-primary" />
            A Story in Progress
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
            Welcome back, <span className="italic text-primary-light">{user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}</span>.
          </h1>
          <p className="text-lg text-white/70 max-w-lg mb-8 font-medium">
            Your journey continues. Check in to your moments, build your rank, and unlock exclusive drops.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {/* Streak / Retention Loop */}
            <div className="md:col-span-2">
                <StreakWidget count={profile?.streak_count || 3} />
            </div>

            {/* Community Level Track */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-soft-xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white uppercase tracking-wider">Community Level</p>
                          <RankPerksGuide />
                      </div>
                      <p className="text-sm font- serif font-bold text-white italic">
                        {
                          maturityState === 0 ? "Seeker" :
                            maturityState === 1 ? "Herald" :
                              maturityState === 2 ? "Luminary" :
                                maturityState === 3 ? "Eminence" : "Steward"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Sharing Bonus</p>
                    <p className="text-sm font-bold text-primary">
                      {maturityState === 0 ? "1.1x Bonus" : maturityState === 1 ? "1.25x Bonus" : maturityState === 2 ? "1.5x Bonus" : "2.0x Bonus"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar with Tier Markers */}
                <div className="relative h-2 w-full bg-white/10 rounded-full mb-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out shadow-glow"
                    style={{ width: `${Math.min(100, ((maturityState + 1) / 4) * 100)}%` }}
                  />
                  {/* Tier Markers */}
                  {[0, 1, 2, 3].map((tier) => (
                    <div 
                      key={tier} 
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-white/20 transition-colors",
                        maturityState >= tier ? "bg-primary" : "bg-white/10"
                      )}
                      style={{ left: `${(tier / 3) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-white/20 font-black uppercase tracking-widest">
                  <span>Seeker</span>
                  <span className="ml-4">Herald</span>
                  <span className="ml-4">Luminary</span>
                  <span>Eminence</span>
                </div>
              </div>
            </div>

            {/* Sharing Power - Social Reach Track */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-soft-xl group overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Sharing Power</p>
                    <p className="text-[10px] text-white/60 font-medium">Your Followers: {profile?.follower_count || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/participant/points?tab=resonance" className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">
                    Link Socials
                  </Link>
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[10px] text-white/80 font-medium tracking-wide">Next bonus at 2,000 followers</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                    +{Math.round(((maturityState + 1) * 0.1) * 100)}% Bonus
                </div>
              </div>
              <p className="text-[8px] text-white/20 mt-3 font-black uppercase tracking-widest leading-relaxed">Your social reach helps you earn bigger rewards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading || balanceLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))
        ) : (
          [
            { label: "Points Balance", value: balance?.points || 0, icon: Coins, color: "bg-amber-500/10 text-amber-500" },
            { label: "PromoKeys Held", value: balance?.promokeys || 0, icon: Key, color: "bg-primary/10 text-primary" },
            { label: "Moments Joined", value: stats?.totalJoined || 0, icon: Calendar, color: "bg-blue-500/10 text-blue-500" },
            { label: "Check-ins", value: stats?.checkedIn || 0, icon: MapPin, color: "bg-emerald-500/10 text-emerald-500" },
          ].map((stat, index) => (
            <div key={index} className="bg-card rounded-3xl p-6 border border-border/50 shadow-soft flex flex-col justify-between group hover:shadow-soft-xl transition-all duration-300 active:scale-95">
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tighter">{stat.value.toLocaleString()}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Host Unlock Banner */}
      <HostUnlockBanner />

      {/* Strategic Upsell */}
      <UpsellBanner />

      {/* Main Content Layout with Sidebar for Social/Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Primary Actions & Moments (8/12) */}
        <div className="lg:col-span-8 space-y-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 border-b border-border/40">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {[
                  { value: "moments", label: "My Stories", icon: Calendar },
                  { value: "proposals", label: "Pitches", icon: FileText, isNew: maturityState >= 1 },
                  { value: "points", label: "Gratitude", icon: Award, isNew: maturityState >= 2 },
                  { value: "ugc", label: "Memories", icon: Camera },
                  { value: "referrals", label: "Invitations", icon: Link2 },
                  { value: "saved", label: "Vault", icon: Bookmark },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex flex-col items-center gap-1 bg-transparent px-0 pb-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground rounded-none shadow-none transition-all hover:text-foreground"
                  >
                    <tab.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    {(tab as any).isNew && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Moments Tab */}
            <TabsContent value="moments" className="space-y-12 outline-none">
              {/* Upcoming Moments */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                    Upcoming <span className="italic text-primary font-normal">Moments</span>
                  </h2>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold uppercase tracking-widest text-xs group" asChild>
                    <Link to="/discover" className="flex items-center gap-2">
                      Discover <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>

                {momentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-3xl" />
                    ))}
                  </div>
                ) : upcomingMoments.length === 0 ? (
                  <div className="bg-muted/50 rounded-[2rem] p-12 border border-dashed border-border/60 text-center flex flex-col items-center">
                    <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center shadow-soft mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-foreground font-bold text-lg mb-2">Your calendar is open</p>
                    <p className="text-muted-foreground mb-6 max-w-xs">Start joining moments to build your social schedule.</p>
                    <Button variant="default" className="rounded-2xl px-8 shadow-soft" asChild>
                      <Link to="/discover">Discover Local Moments</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingMoments.slice(0, 5).map((moment) => (
                      <div
                        key={moment.id}
                        className="group flex flex-col sm:flex-row sm:items-center gap-6 bg-card rounded-[1.5rem] p-5 border border-border/40 hover:shadow-soft-xl transition-all duration-300"
                      >
                        <div className="w-full sm:w-28 aspect-video sm:aspect-square rounded-2xl overflow-hidden shadow-soft relative flex-shrink-0">
                          {moment.image_url ? (
                            <img
                              src={moment.image_url}
                              alt={moment.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white">
                              <Calendar className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-md text-[10px] font-bold text-foreground shadow-sm">
                            {format(new Date(moment.starts_at), "MMM d")}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link to={`/moments/${moment.id}`}>
                            <h3 className="font-serif text-xl font-bold text-foreground mb-2 truncate group-hover:text-primary transition-colors tracking-tight">
                              {moment.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground/80">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {moment.venue_name || moment.location}</span>
                            <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-accent" /> {format(new Date(moment.starts_at), "h:mm a")}</span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                          <div className="flex-1 sm:flex-none">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Status</p>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                              {(moment as any).participation_status === "checked_in" ? "Checked In" : "Confirmed"}
                            </span>
                          </div>
                          <div className="flex flex-row gap-2">
                            <CalendarButton
                              size="icon"
                              showLabel={false}
                              variant="ghost"
                              event={{
                                title: moment.title,
                                description: moment.description || "",
                                location: moment.location,
                                start: new Date(moment.starts_at),
                                end: moment.ends_at ? new Date(moment.ends_at) : new Date(new Date(moment.starts_at).getTime() + 3600000)
                              }}
                            />
                            {(moment as any).participation_status !== "checked_in" && (
                              <Button
                                size="sm"
                                className="rounded-xl shadow-soft font-bold uppercase tracking-wider text-[10px] h-9"
                                onClick={() => handleCheckIn(moment.id)}
                                disabled={checkIn.isPending}
                              >
                                Check In
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Roadmap to Host - Progressive Disclosure */}
              {maturityState < 3 && (
                <section className="bg-card/50 border border-border/40 rounded-[2rem] p-8 md:p-10 shadow-soft">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                        Path to Mastery
                      </div>
                      <h2 className="font-serif text-3xl font-bold tracking-tight">
                        Roadmap to <span className="italic text-primary">Host Role</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Overall Progress</p>
                        <p className="text-xl font-bold font-serif">{Math.round((maturityState / 3) * 100)}%</p>
                      </div>
                      <div className="h-10 w-1 outline outline-1 outline-border/20 bg-muted rounded-full overflow-hidden">
                        <div
                          className="w-full bg-primary transition-all duration-1000"
                          style={{ height: `${(maturityState / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        step: 1,
                        title: "Active Explorer",
                        desc: "Attend your first 3 moments",
                        isDone: maturityState >= 1,
                        current: maturityState >= 1 ? 3 : stats?.checkedIn || 0,
                        total: 3
                      },
                      {
                        step: 2,
                        title: "Trusted Contributor",
                        desc: "Build consistency & trust",
                        isDone: maturityState >= 2,
                        current: maturityState >= 2 ? 10 : stats?.checkedIn || 0,
                        total: 10
                      },
                      {
                        step: 3,
                        title: "Unlock Host Privileges",
                        desc: "Auto-unlock moment creation",
                        isDone: maturityState >= 3,
                        current: maturityState >= 3 ? 1 : 0,
                        total: 1
                      }
                    ].map((step, idx) => (
                      <div key={idx} className={cn(
                        "p-6 rounded-2xl border transition-all duration-300",
                        step.isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/20 border-border/40"
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <span className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                            step.isDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {step.isDone ? <CheckCircle className="w-4 h-4" /> : step.step}
                          </span>
                          {!step.isDone && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {step.current}/{step.total}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* My Memories - Masonry Redesign */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                    My <span className="italic text-accent font-normal">Memories</span>
                  </h2>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold uppercase tracking-widest text-xs" asChild>
                    <Link to="/dashboard/gallery">View Gallery</Link>
                  </Button>
                </div>

                {momentsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />
                    ))}
                  </div>
                ) : pastMoments.length === 0 ? (
                  <div className="bg-accent/5 rounded-[2rem] p-12 border border-dashed border-accent/20 text-center">
                    <Camera className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                    <p className="text-foreground font-bold text-lg mb-2">Start making memories</p>
                    <p className="text-muted-foreground mb-0">Attend moments and your photos will show up here.</p>
                  </div>
                ) : (
                  <MasonryGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={24}>
                    {pastMoments.map((moment) => (
                      <MomentCard key={moment.id} moment={moment as any} />
                    ))}
                  </MasonryGrid>
                )}
              </section>
            </TabsContent>



            <TabsContent value="proposals" className="mt-8 outline-none">
              <ProposalsDashboard />
            </TabsContent>

            {/* Other Tabs Placeholder */}
            <TabsContent value="points" className="mt-8">
              <PointsOverview />
              <div className="mt-8">
                <PointsTransactionHistory />
              </div>
            </TabsContent>

            <TabsContent value="ugc" className="mt-8">
              <UGCSection />
            </TabsContent>

            <TabsContent value="referrals" className="mt-8">
              <ReferralsSection />
            </TabsContent>

            <TabsContent value="saved" className="mt-8">
              <SavedCollections
                collections={[
                  { id: "c1", name: "Summer Vibes", moments: pastMoments.slice(0, 2) as any, isDefault: true },
                  { id: "c2", name: "Coffee Spots", moments: [], isDefault: false }
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Social/Activity Widgets (4/12) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Activity Feed Widget */}
          <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-soft sticky top-24">
            <ActivityFeed
              events={[
                {
                  id: "e1",
                  user_id: user?.id || "",
                  event_type: "reward",
                  metadata: { points: "500", reason: "First Check-in" },
                  created_at: new Date(Date.now() - 3600000).toISOString(),
                  actor: { full_name: "Promorang", avatar_url: null }
                },
                {
                  id: "e2",
                  user_id: user?.id || "",
                  event_type: "follow",
                  metadata: {},
                  created_at: new Date(Date.now() - 86400000).toISOString(),
                  actor: { full_name: "Sarah Miller", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" }
                }
              ]}
            />

            <Button variant="outline" className="w-full mt-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11 group" asChild>
              <Link to="/dashboard/activity">
                View All Activity <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Business Hub - Scale your Impact */}
          <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold">Business Hub</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Ready to scale? Use your influence to partner with brands or list your own venue as an anchor.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11 justify-start px-4 group" asChild>
                <Link to="/for-brands" className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Building2 className="w-3 h-3" />
                  </div>
                  Become a Brand Partner
                </Link>
              </Button>
              <Button variant="outline" className="w-full rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11 justify-start px-4 group" asChild>
                <Link to="/for-merchants" className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Store className="w-3 h-3" />
                  </div>
                  Anchor your Venue
                </Link>
              </Button>
            </div>
          </div>

          {/* Tips / Promotion Card */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-8 text-white relative overflow-hidden shadow-soft-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 mb-4 opacity-80" />
              <h4 className="font-serif text-2xl font-bold mb-2">Be a Super Host</h4>
              <p className="text-sm text-white/80 mb-6">Want to organize your own moments? Verified hosts get 50% more points and featured placement in the discovery feed.</p>
              <Button variant="secondary" className="w-full rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11" asChild>
                <Link to="/for-communities">Apply Now</Link>
              </Button>
            </div>
          </div>
        </aside>

      </div >
    </div >
  );
};

export default ParticipantDashboard;
