import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Plus, 
  TrendingUp, 
  Eye, 
  Handshake, 
  Camera, 
  Coins, 
  Sparkles, 
  CreditCard, 
  Activity, 
  ShieldCheck, 
  DollarSign,
  ChevronRight,
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
import { useHostedMoments, useHostStats } from "@/hooks/useMoments";
import { useHostEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import { WalletTab } from "./host/WalletTab";
import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";
import { CommunityImpactMatrix } from "@/components/host/CommunityImpactMatrix";
import { HostProofReviewPanel } from "@/components/host/HostProofReviewPanel";
import { HostPulseControlPanel } from "@/components/host/HostPulseControlPanel";

// ============================================================================
// HOST DASHBOARD V2
// Action-first design with progressive disclosure
// ============================================================================

const HostDashboardV2 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: hostedMoments, isLoading: momentsLoading } = useHostedMoments();
  const { data: stats, isLoading: statsLoading } = useHostStats();
  const { data: economy, isLoading: economyLoading } = useHostEconomy();
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
      {/* =====================================================================
          HEADER: Context-aware
          ===================================================================== */}
      {isNewHost ? (
        // Simple welcome for new hosts
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 border border-primary/10 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                Host Sanctuary
              </div>
              <h1 className="font-serif text-2xl font-bold mb-1">
                Welcome, <span className="italic text-primary">{user?.user_metadata?.full_name?.split(" ")[0] || "Curator"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Where your moments become memories
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/create-moment">
                <Plus className="w-4 h-4 mr-2" />
                Create Moment
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        // Full header for active hosts
        <section className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Host <span className="text-primary italic">Sanctuary</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Curator"}
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            {stats && (
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  {totalParticipants} participants
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  {upcomingMoments.length} upcoming
                </span>
              </div>
            )}
            <Button asChild>
              <Link to="/create-moment">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Link>
            </Button>
          </div>
        </section>
      )}

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
                    <Link to="/create-moment">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Moment
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/discover">
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

      {/* =====================================================================
          STATS: Only for active hosts
          ===================================================================== */}
      {!isNewHost && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {statsLoading || economyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            [
              { 
                label: "Points Generated", 
                value: economy?.pointsGenerated?.toLocaleString() || "0", 
                icon: Coins, 
                color: "text-amber-500" 
              },
              { 
                label: "Participants", 
                value: totalParticipants.toLocaleString(), 
                icon: Users, 
                color: "text-blue-500" 
              },
              { 
                label: "Active Moments", 
                value: upcomingMoments.length, 
                icon: Eye, 
                color: "text-emerald-500" 
              },
              { 
                label: "Past Events", 
                value: pastMoments.length, 
                icon: Calendar, 
                color: "text-muted-foreground" 
              },
            ].map((stat, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* =====================================================================
          UPCOMING MOMENTS: Priority display for active hosts
          ===================================================================== */}
      {!isNewHost && (
        <section>
          <div className="flex min-w-0 flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-xl font-bold">Upcoming Moments</h2>
            {upcomingMoments.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("moments")}>
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
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
                  <Link to="/create-moment">
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
            <HostPulseControlPanel />
          </TabsContent>

          <TabsContent value="review" className="mt-0">
            <HostProofReviewPanel />
          </TabsContent>

          {isEstablishedHost && (
            <TabsContent value="sponsorships" className="mt-0">
              <HostSponsorshipRequests />
            </TabsContent>
          )}

          {isEstablishedHost && (
            <TabsContent value="impact" className="mt-0">
              <CommunityImpactMatrix />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* =====================================================================
          ROLE ACTIVATION: Always visible guidance
          ===================================================================== */}
      <RoleActivationPanel
        eyebrow="Host Path"
        title={isNewHost ? "Start your hosting journey" : "Grow your impact"}
        description={
          isNewHost 
            ? "Create your first moment to begin building your community."
            : "Master the momentum loop: create, monitor, review, repeat."
        }
        items={[
          {
            title: "Create moment",
            description: "Launch with venue, timing, proof, reward",
            status: hostedMoments && hostedMoments.length > 0 ? "done" : "current",
            href: "/create-moment",
            ctaLabel: "Create",
          },
          {
            title: "Monitor pulse",
            description: "Watch your gathering form",
            status: upcomingMoments.length > 0 ? "done" : "todo",
            ctaLabel: "Open pulse",
            onClick: () => setActiveTab("pulse"),
          },
          {
            title: "Review proofs",
            description: "Approve check-ins to close the loop",
            status: pastMoments.length > 0 ? "current" : "todo",
            ctaLabel: "Review",
            onClick: () => setActiveTab("review"),
          },
        ]}
      />
    </div>
  );
};

export default HostDashboardV2;
