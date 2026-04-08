import { useState } from "react";
import { Calendar, Users, Plus, TrendingUp, Eye, MoreVertical, Handshake, Camera, Coins, Sparkles, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useHostedMoments, useHostStats } from "@/hooks/useMoments";
import { useHostEconomy } from "@/hooks/useStakeholderEconomy";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isPast, isFuture } from "date-fns";
import { WalletTab } from "./host/WalletTab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";

const HostDashboard = () => {
  const { user } = useAuth();
  const { data: hostedMoments, isLoading: momentsLoading } = useHostedMoments();
  const { data: stats, isLoading: statsLoading } = useHostStats();
  const { data: economy, isLoading: economyLoading } = useHostEconomy();
  const [activeTab, setActiveTab] = useState("moments");

  const upcomingMoments = hostedMoments?.filter(
    (m) => isFuture(new Date(m.starts_at)) && m.is_active
  ) || [];

  const pastMoments = hostedMoments?.filter(
    (m) => isPast(new Date(m.starts_at))
  ) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Host <span className="text-primary italic">Sanctuary</span>
          </h1>
          <p className="text-muted-foreground font-serif italic">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Curator"} — where your moments become memories.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/create-moment">
            <Plus className="w-4 h-4 mr-2" />
            Create Moment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading || economyLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          [
            { label: "Points Generated", value: economy?.pointsGenerated?.toLocaleString() || "0", icon: Coins, color: "text-amber-500" },
            { label: "Economic Impact", value: economy?.economicInfluence?.toLocaleString() || "0", icon: Sparkles, color: "text-primary" },
            { label: "Total Participants", value: stats?.totalParticipants || 0, icon: Users, color: "text-blue-500" },
            { label: "Active Moments", value: stats?.activeMoments || 0, icon: Eye, color: "text-emerald-500" },
          ].map((stat, index) => (
            <div
              key={index}
              className="group relative bg-card/60 backdrop-blur-md rounded-2xl p-6 border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <stat.icon className={`w-6 h-6 ${stat.color} mb-4 relative z-10`} />
              <p className="text-3xl font-bold text-foreground tracking-tight relative z-10">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-1 relative z-10">{stat.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="moments" className="gap-2">
            <Calendar className="w-4 h-4" />
            My Moments
          </TabsTrigger>
          <TabsTrigger value="sponsorships" className="gap-2">
            <Handshake className="w-4 h-4" />
            Sponsorships
          </TabsTrigger>
          <TabsTrigger value="ugc" className="gap-2">
            <Camera className="w-4 h-4" />
            Photos & Notes
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Wallet
          </TabsTrigger>
        </TabsList>

        {/* Moments Tab */}
        <TabsContent value="moments" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Your Moments
            </h2>
            {hostedMoments && hostedMoments.length > 0 && (
              <Button variant="ghost" size="sm">View All</Button>
            )}
          </div>

          {momentsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : upcomingMoments.length === 0 && pastMoments.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No moments created yet</p>
              <Button variant="hero" asChild>
                <Link to="/create-moment">Create Your First Moment</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {[...upcomingMoments, ...pastMoments.slice(0, 2)].slice(0, 4).map((moment) => {
                const isUpcoming = isFuture(new Date(moment.starts_at));

                return (
                  <div
                    key={moment.id}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-card transition-shadow"
                  >
                    <div className="relative h-40">
                      {moment.image_url ? (
                        <img
                          src={moment.image_url}
                          alt={moment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-primary-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg ${isUpcoming && moment.is_active
                        ? "bg-emerald-500/80 text-white"
                        : "bg-black/40 text-white/80"
                        }`}>
                        {isUpcoming && moment.is_active ? "Active" : "Past"}
                      </span>
                    </div>
                    <div className="p-5">
                      <Link to={`/moments/${moment.id}`}>
                        <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                          {moment.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-1">
                        {moment.venue_name || moment.location}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {format(new Date(moment.starts_at), "EEE, MMM d 'at' h:mm a")}
                      </p>

                      {/* Participant Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">
                            {moment.max_participants ? `0/${moment.max_participants}` : "Unlimited"}
                          </span>
                        </div>
                        {moment.max_participants && (
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary rounded-full"
                              style={{ width: "0%" }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/moments/${moment.id}`}>View Details</Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Moment</DropdownMenuItem>
                            <DropdownMenuItem>View Participants</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancel Moment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Sponsorships Tab */}
        <TabsContent value="sponsorships" className="mt-6">
          <HostSponsorshipRequests />
        </TabsContent>

        {/* UGC Tab */}
        <TabsContent value="ugc" className="mt-6">
          <div className="bg-card rounded-xl p-12 border border-border text-center">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Photos & Notes</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Review and approve the photos, videos, and notes from people who attended your moments.
            </p>
            <Button variant="outline" className="mt-6">
              Review New Posts
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="bg-gradient-warm rounded-2xl p-6 border border-border">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto py-4 bg-background/50" asChild>
            <Link to="/create-moment">
              <Plus className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Create Moment</p>
                <p className="text-xs text-muted-foreground">Start a new gathering</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 bg-background/50" asChild>
            <Link to="/discover">
              <Users className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Discover</p>
                <p className="text-xs text-muted-foreground">Find other moments</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 bg-background/50" asChild>
            <Link to="/dashboard/settings">
              <TrendingUp className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Update your profile</p>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
