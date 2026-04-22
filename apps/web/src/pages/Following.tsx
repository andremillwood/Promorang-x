import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, Calendar, UserPlus, MapPin, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FollowButton } from "@/components/FollowButton";

interface FollowingUser {
    id: string;
    name: string;
    avatar: string | null;
    momentsCount: number;
}

interface FollowingMoment {
    id: string;
    title: string;
    description: string | null;
    category: string;
    starts_at: string;
    location: string;
    image_url: string | null;
    host_id: string;
    host_name: string;
    max_participants: number | null;
    participant_count: number;
    reward: string | null;
    created_at: string;
    updated_at: string;
}

interface SuggestedUser {
    id: string;
    name: string;
    avatar: string | null;
    username: string;
    bio?: string;
    followers_count: number;
    moments_count: number;
    reason: string;
}

const Following = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState<"all" | "upcoming" | "new">("all");
    const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
    const [moments, setMoments] = useState<FollowingMoment[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    // Fetch following users and their moments
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchFollowingData = async () => {
            setLoading(true);
            try {
                // 1. Get users we're following
                const { data: followsData, error: followsError } = await supabase
                    .from('user_follows')
                    .select('following_id, created_at')
                    .eq('follower_id', user.id)
                    .order('created_at', { ascending: false });

                if (followsError) throw followsError;

                if (!followsData?.length) {
                    setFollowingUsers([]);
                    setMoments([]);
                    setLoading(false);
                    return;
                }

                const followingIds = followsData.map(f => f.following_id);

                // 2. Get user profiles
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, display_name, username, avatar_url')
                    .in('id', followingIds);

                if (usersError) throw usersError;

                // 3. Get moments count for each user
                const usersWithMoments = await Promise.all(
                    (usersData || []).map(async (u) => {
                        const { count } = await supabase
                            .from('moments')
                            .select('*', { count: 'exact', head: true })
                            .eq('host_id', u.id)
                            .eq('is_active', true);

                        return {
                            id: u.id,
                            name: u.display_name || u.username || 'Unknown',
                            avatar: u.avatar_url,
                            momentsCount: count || 0
                        };
                    })
                );

                setFollowingUsers(usersWithMoments);

                // 4. Get upcoming moments from followed users
                const { data: momentsData, error: momentsError } = await supabase
                    .from('moments')
                    .select(`
                        id, title, description, category, starts_at, location, image_url,
                        host_id, max_participants, reward, created_at, updated_at,
                        host:host_id(display_name, username)
                    `)
                    .in('host_id', followingIds)
                    .eq('is_active', true)
                    .gte('starts_at', new Date().toISOString())
                    .order('starts_at', { ascending: true });

                if (momentsError) throw momentsError;

                // 5. Get participant counts for each moment
                const momentsWithCounts = await Promise.all(
                    (momentsData || []).map(async (m: any) => {
                        const { count } = await supabase
                            .from('moment_participants')
                            .select('*', { count: 'exact', head: true })
                            .eq('moment_id', m.id);

                        return {
                            id: m.id,
                            title: m.title,
                            description: m.description,
                            category: m.category,
                            starts_at: m.starts_at,
                            location: m.location,
                            image_url: m.image_url,
                            host_id: m.host_id,
                            host_name: m.host?.display_name || m.host?.username || 'Unknown Host',
                            max_participants: m.max_participants,
                            participant_count: count || 0,
                            reward: m.reward,
                            created_at: m.created_at,
                            updated_at: m.updated_at
                        };
                    })
                );

                setMoments(momentsWithCounts);
            } catch (error) {
                console.error('Error fetching following data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSuggestedUsers = async () => {
            setLoadingSuggestions(true);
            try {
                // Get users with most moments who aren't followed yet
                const { data: topHosts, error } = await supabase
                    .from('users')
                    .select(`
                        id, 
                        display_name, 
                        username, 
                        avatar_url,
                        bio
                    `)
                    .neq('id', user?.id || '')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                // Get moments count and followers for each
                const usersWithStats = await Promise.all(
                    (topHosts || []).map(async (u) => {
                        const { count: momentsCount } = await supabase
                            .from('moments')
                            .select('*', { count: 'exact', head: true })
                            .eq('host_id', u.id)
                            .eq('is_active', true);

                        const { count: followersCount } = await supabase
                            .from('user_follows')
                            .select('*', { count: 'exact', head: true })
                            .eq('following_id', u.id);

                        // Check if already following
                        const { data: isFollowing } = await supabase
                            .from('user_follows')
                            .select('id')
                            .eq('follower_id', user?.id || '')
                            .eq('following_id', u.id)
                            .maybeSingle();

                        // Only include if has moments and not following
                        if ((momentsCount || 0) > 0 && !isFollowing) {
                            return {
                                id: u.id,
                                name: u.display_name || u.username || 'Unknown',
                                avatar: u.avatar_url,
                                username: u.username || '',
                                bio: u.bio,
                                followers_count: followersCount || 0,
                                moments_count: momentsCount || 0,
                                reason: (momentsCount || 0) > 5 ? 'Popular Host' : 'Active Creator'
                            };
                        }
                        return null;
                    })
                );

                // Filter out nulls and limit to 4
                const validUsers = usersWithStats.filter(Boolean).slice(0, 4) as SuggestedUser[];
                setSuggestedUsers(validUsers);
            } catch (error) {
                console.error('Error fetching suggested users:', error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        fetchFollowingData();
        fetchSuggestedUsers();
    }, [user]);

    const filteredMoments = moments.filter(moment => {
        if (filter === "upcoming") {
            const startsAt = new Date(moment.starts_at);
            const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 3600000);
            return startsAt <= threeDaysFromNow;
        }
        return true;
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-20 pb-16 px-4">
                    <div className="max-w-6xl mx-auto text-center py-16">
                        <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">Sign in to see your following</h3>
                        <p className="text-muted-foreground mb-4">
                            Follow creators and hosts to see their moments here
                        </p>
                        <Button asChild>
                            <Link to="/auth">Sign In</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-20 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold">Following</h1>
                            <p className="text-muted-foreground">
                                Moments from people you follow
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/discover">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Discover More
                            </Link>
                        </Button>
                    </div>

                    {/* Following Stats */}
                    <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                People you follow ({followingUsers.length})
                            </h3>
                            <Link to="/search?category=user" className="text-sm text-primary hover:underline">
                                Find people
                            </Link>
                        </div>
                        
                        {loading ? (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : followingUsers.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {followingUsers.map(person => (
                                    <Link
                                        key={person.id}
                                        to={`/profile/${person.id}`}
                                        className="flex flex-col items-center gap-2 min-w-[80px] group"
                                    >
                                        {person.avatar ? (
                                            <img 
                                                src={person.avatar} 
                                                alt={person.name}
                                                className="h-14 w-14 rounded-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-lg text-white font-medium">
                                                {(person.name || "?").charAt(0)}
                                            </div>
                                        )}
                                        <span className="text-xs text-center truncate w-full">
                                            {person.name.split(" ")[0]}
                                        </span>
                                    </Link>
                                ))}
                                <Link
                                    to="/search?category=user"
                                    className="flex flex-col items-center gap-2 min-w-[80px]"
                                >
                                    <div className="h-14 w-14 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Find more</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {loadingSuggestions ? (
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex flex-col items-center gap-2 min-w-[100px]">
                                                <Skeleton className="h-14 w-14 rounded-full" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                ) : suggestedUsers.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Suggested for you
                                        </p>
                                        <div className="flex gap-4 overflow-x-auto pb-2">
                                            {suggestedUsers.map(person => (
                                                <div
                                                    key={person.id}
                                                    className="flex flex-col items-center gap-2 min-w-[100px] group"
                                                >
                                                    <Link to={`/profile/${person.id}`} className="relative">
                                                        {person.avatar ? (
                                                            <img 
                                                                src={person.avatar} 
                                                                alt={person.name}
                                                                className="h-14 w-14 rounded-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        ) : (
                                                            <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-lg text-white font-medium">
                                                                {(person.name || "?").charAt(0)}
                                                            </div>
                                                        )}
                                                        {person.moments_count > 5 && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                                                                <Star className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div className="text-center">
                                                        <Link 
                                                            to={`/profile/${person.id}`}
                                                            className="text-xs font-medium truncate w-full block hover:text-primary transition-colors"
                                                        >
                                                            {person.name.split(" ")[0]}
                                                        </Link>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {person.followers_count} followers
                                                        </span>
                                                    </div>
                                                    <FollowButton 
                                                        userId={person.id} 
                                                        variant="compact"
                                                        className="scale-90"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground text-sm mb-3">
                                            You're not following anyone yet
                                        </p>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link to="/search?category=user">
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Find people to follow
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { value: "all" as const, label: "All", icon: null },
                            { value: "upcoming" as const, label: "Coming Soon", icon: Calendar },
                            { value: "new" as const, label: "New Posts", icon: Sparkles },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${filter === option.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-secondary/80"
                                    }`}
                            >
                                {option.icon && <option.icon className="h-4 w-4" />}
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Moments Grid */}
                    {loading ? (
                        <MasonryGrid>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                                    <Skeleton className="w-full h-48" />
                                    <div className="p-4">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full mb-3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </MasonryGrid>
                    ) : filteredMoments.length > 0 ? (
                        <MasonryGrid>
                            {filteredMoments.map(moment => (
                                <MomentCard
                                    key={moment.id}
                                    moment={moment as any}
                                />
                            ))}
                        </MasonryGrid>
                    ) : (
                        <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">
                                {followingUsers.length === 0 ? "Start following people" : "No upcoming moments"}
                            </h3>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                {followingUsers.length === 0 
                                    ? "Follow creators and hosts to see their moments in your feed"
                                    : "People you follow haven't posted any upcoming moments matching this filter"
                                }
                            </p>
                            <Button asChild>
                                <Link to="/discover">Discover Moments</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Following;
