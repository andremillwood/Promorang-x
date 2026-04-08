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
  Key
} from "lucide-react";
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

const ParticipantDashboard = () => {
  const { user } = useAuth();
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
            Active Participant
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
            Welcome back, <span className="italic text-primary-light">{user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}</span>.
          </h1>
          <p className="text-lg text-white/70 max-w-lg mb-8 font-medium">
            Your journey continues. Check in to your moments, build your rank, and unlock exclusive drops.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {/* Consistency Track - Resumé */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-soft-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Access Rank</p>
                    <p className="text-[10px] text-white/60 font-medium">Level 1 Pioneer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">25%</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: "25%" }}
                />
              </div>
              <p className="text-[9px] text-white/40 mt-2 font-medium tracking-wide">Higher rank unlocks premium brand drops.</p>
            </div>

            {/* Economy Track - Fuel */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-soft-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Key Progress</p>
                    <p className="text-[10px] text-white/60 font-medium">{balance?.points || 0} Points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{Math.round(progressPercent)}%</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-white/40 mt-2 font-medium tracking-wide">{pointsToNextKey - (balance?.points || 0) % pointsToNextKey} pts to next PromoKey.</p>
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
                  { value: "moments", label: "My Moments", icon: Calendar },
                  { value: "proposals", label: "Proposals", icon: FileText },
                  { value: "points", label: "Earnings", icon: Award },
                  { value: "ugc", label: "Content", icon: Camera },
                  { value: "referrals", label: "Invitations", icon: Link2 },
                  { value: "saved", label: "Saved", icon: Bookmark },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col items-center gap-1 bg-transparent px-0 pb-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground rounded-none shadow-none transition-all hover:text-foreground"
                  >
                    <tab.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
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

              {/* My Moment Canon - Masonry Redesign */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                    My Moment <span className="italic text-accent font-normal">Canon</span>
                  </h2>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold uppercase tracking-widest text-xs">
                    View Gallery
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
                    <p className="text-foreground font-bold text-lg mb-2">Build your legacy</p>
                    <p className="text-muted-foreground mb-0">Attend moments to build your visual canon of memories.</p>
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

            <Button variant="outline" className="w-full mt-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11 group">
              View All Activity <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Tips / Promotion Card */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-8 text-white relative overflow-hidden shadow-soft-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <Award className="w-10 h-10 mb-4 opacity-80" />
              <h4 className="font-serif text-2xl font-bold mb-2">Be a Super Host</h4>
              <p className="text-sm text-white/80 mb-6">Want to organize your own moments? Verified hosts get 50% more points and featured placement.</p>
              <Button variant="secondary" className="w-full rounded-2xl font-bold uppercase tracking-widest text-[10px] h-11" asChild>
                <Link to="/for-communities">Apply Now</Link>
              </Button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default ParticipantDashboard;
