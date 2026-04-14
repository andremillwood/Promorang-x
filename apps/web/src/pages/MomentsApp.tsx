import { useState } from "react";
import {
    Calendar,
    MapPin,
    CalendarDays,
    Sparkles,
    TrendingUp,
    ArrowRight,
    Search,
    Filter,
    Trophy,
    Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinedMoments, useParticipantStats, useCheckIn } from "@/hooks/useMoments";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isPast, isFuture } from "date-fns";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PioneerBadge } from "@/components/badges/PioneerBadge";

const MomentsApp = () => {
    const { user, profile } = useAuth();
    const maturityState = profile?.maturity_state || 0;
    const { data: joinedMoments, isLoading: momentsLoading } = useJoinedMoments();
    const { data: stats, isLoading: statsLoading } = useParticipantStats();
    const checkIn = useCheckIn();

    const upcomingMoments = joinedMoments?.filter(
        (m) => isFuture(new Date(m.starts_at))
    ) || [];

    const pastMoments = joinedMoments?.filter(
        (m) => isPast(new Date(m.starts_at))
    ) || [];

    const handleCheckIn = (momentId: string) => {
        checkIn.mutate(momentId);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Focused Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                        Moments <span className="italic text-primary">App</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Your personalized gathering space. Build your canon, unlock status, and preserve moments.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl gap-2" asChild>
                        <Link to="/discover">
                            <Search className="w-4 h-4" />
                            Discover More
                        </Link>
                    </Button>
                    <Button className="rounded-2xl gap-2 shadow-glow">
                        <Sparkles className="w-4 h-4" />
                        Find Near Me
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Upcoming Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-primary" />
                                Your Upcoming Schedule
                            </h2>
                        </div>

                        {momentsLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 rounded-3xl" />
                                ))}
                            </div>
                        ) : upcomingMoments.length === 0 ? (
                            <div className="bg-muted/30 rounded-[2rem] p-10 border border-dashed border-border/60 text-center">
                                <p className="text-foreground font-bold text-lg mb-2">Ready for something new?</p>
                                <p className="text-muted-foreground mb-6 text-sm">You don't have any upcoming moments scheduled yet.</p>
                                <Button variant="default" className="rounded-2xl px-8" asChild>
                                    <Link to="/discover">Browse the Feed</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {upcomingMoments.map((moment) => (
                                    <div
                                        key={moment.id}
                                        className="group bg-card rounded-3xl p-5 border border-border/40 hover:shadow-soft-xl transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center"
                                    >
                                        <div className="w-full sm:w-24 aspect-square rounded-2xl overflow-hidden shadow-soft flex-shrink-0">
                                            {moment.image_url ? (
                                                <img src={moment.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Calendar className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                                    {format(new Date(moment.starts_at), "EEEE, MMM d")}
                                                </span>
                                            </div>
                                            <Link to={`/moments/${moment.id}`}>
                                                <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors truncate">
                                                    {moment.title}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {moment.venue_name || moment.location}</span>
                                                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {format(new Date(moment.starts_at), "h:mm a")}</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button
                                                onClick={() => handleCheckIn(moment.id)}
                                                disabled={checkIn.isPending}
                                                className="rounded-2xl px-6 h-11 shadow-soft"
                                            >
                                                Check In
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past/Canon Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-accent" />
                                Your Moment Canon
                            </h2>
                        </div>

                        {momentsLoading ? (
                            <div className="grid grid-cols-2 gap-6">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
                                ))}
                            </div>
                        ) : pastMoments.length === 0 ? (
                            <div className="bg-card border border-border/40 rounded-[2rem] p-12 text-center">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-2">Your Canon is empty</h3>
                                <p className="text-muted-foreground mb-6">
                                    Attend moments and upload photos to build your digital passport of experiences. 
                                    A rich canon unlocks higher Access Ranks.
                                </p>
                            </div>
                        ) : (
                            <MasonryGrid columns={{ sm: 1, md: 2 }} gap={24}>
                                {pastMoments.map((moment) => (
                                    <MomentCard key={moment.id} moment={moment as any} />
                                ))}
                            </MasonryGrid>
                        )}
                    </section>
                </div>

                {/* Sidebar / Context */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Digital Passport Card */}
                    <div className="bg-gradient-to-br from-card to-card/50 rounded-[2rem] p-8 border border-border/60 shadow-soft-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Digital Passport</h4>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">Access Rank</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-foreground">Level {maturityState || 1}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-gradient-primary" style={{ width: `${(maturityState || 1) * 20}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                    <div>
                                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Canon Entries</span>
                                        <span className="text-xl font-bold">{stats?.totalJoined || 0}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Check-ins</span>
                                        <span className="text-xl font-bold text-emerald-500">{stats?.checkedIn || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-border/50 flex flex-col gap-3">
                                <Button variant="hero" className="w-full shadow-lg" asChild>
                                    <Link to="/discover">Add to Canon +</Link>
                                </Button>
                                <Link to="/dashboard/rewards" className="flex items-center justify-center group text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                    View Rewards <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Hint / Tip */}
                    <div className="bg-card border border-border/40 rounded-[2rem] p-8">
                        <TrendingUp className="w-8 h-8 text-primary mb-4" />
                        <h4 className="font-serif text-xl font-bold mb-2">Consistency pays off</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Participants with a 7-day streak get 2x Priority Access to exclusive drops.
                        </p>
                    </div>

                    {/* Local Leaderboard - The Clout Loop */}
                    <div className="bg-card border border-border/40 rounded-[2rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Trophy className="w-20 h-20" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h4 className="font-serif text-xl font-bold">Kingston <span className="text-primary italic">Elite</span></h4>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { rank: 1, name: "Marcus D.", score: 2450, avatar: "M", color: "bg-yellow-500", glow: "shadow-[0_0_15px_-3px_rgba(234,179,8,0.5)]" },
                                    { rank: 2, name: "Sarah J.", score: 2100, avatar: "S", color: "bg-slate-300" },
                                    { rank: 3, name: "Chris L.", score: 1980, avatar: "C", color: "bg-orange-400" },
                                    { rank: 4, name: "You", score: 1240, avatar: (user?.email?.charAt(0)?.toUpperCase() || "?"), color: "bg-primary", isUser: true },
                                    { rank: 5, name: "Elena R.", score: 1150, avatar: "E", color: "bg-muted" },
                                ].map((player, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border border-transparent",
                                            player.isUser ? "bg-primary/10 border-primary/20 scale-[1.05] shadow-soft" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 text-[10px] font-black text-muted-foreground">#{player.rank}</div>
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-soft",
                                                player.color,
                                                player.glow
                                            )}>
                                                {player.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("text-sm font-bold leading-none", player.isUser ? "text-primary" : "text-foreground")}>
                                                    {player.name}
                                                </span>
                                                {(player.isUser || player.rank === 1) && <PioneerBadge showText={false} className="scale-[0.6] origin-left mt-0.5" />}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black tracking-tighter">{player.score.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-border/50">
                                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                                    Next Drop: 48h 12m
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default MomentsApp;
