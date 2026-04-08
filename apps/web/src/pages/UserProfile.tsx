import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FollowButton } from "@/components/FollowButton";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    Star,
    MapPin,
    Calendar,
    Shield,
    MessageCircle,
    Settings,
    Grid,
    Bookmark,
    Users,
    Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    created_at: string;
    is_verified: boolean;
    is_superhost: boolean;
}

interface ProfileStats {
    momentsHosted: number;
    momentsAttended: number;
    followers: number;
    following: number;
    rating: number;
    reviewCount: number;
}

// Mock data
const mockProfile: UserProfile = {
    id: "user-123",
    full_name: "Sarah Chen",
    avatar_url: null,
    bio: "Yoga instructor & wellness enthusiast. Creating meaningful moments through mindful experiences. 🧘‍♀️✨",
    location: "San Francisco, CA",
    created_at: "2024-03-15",
    is_verified: true,
    is_superhost: true,
};

const mockStats: ProfileStats = {
    momentsHosted: 24,
    momentsAttended: 47,
    followers: 1234,
    following: 89,
    rating: 4.9,
    reviewCount: 156,
};

const mockMoments = [
    {
        id: "pm1",
        title: "Morning Yoga Flow",
        description: "Start your day right with energizing yoga",
        category: "fitness",
        starts_at: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
        location: "Sunrise Studio",
        image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        host_id: "user-123",
        max_participants: 15,
        reward: "Free yoga mat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "pm2",
        title: "Meditation Workshop",
        description: "Learn the art of mindfulness",
        category: "workshop",
        starts_at: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
        location: "Zen Garden",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
        host_id: "user-123",
        max_participants: 20,
        reward: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

const UserProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [moments, setMoments] = useState(mockMoments);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"hosted" | "attended" | "saved">("hosted");
    const [isFollowing, setIsFollowing] = useState(false);

    // If userId is not provided, it means we are at /profile, so use the current user's ID
    const effectiveUserId = userId || user?.id;

    // Check if viewing own profile
    const isOwnProfile = effectiveUserId === user?.id || userId === "me";

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!effectiveUserId) return;

            setLoading(true);
            try {
                // 1. Fetch profile from Supabase
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", effectiveUserId)
                    .single();

                if (data) {
                    setProfile(data as any);
                } else if (isOwnProfile && user) {
                    // Fallback for current user if no profile record exists yet
                    setProfile({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
                        avatar_url: user.user_metadata?.avatar_url || null,
                        bio: "New member of the Promorang community.",
                        location: "Global",
                        is_verified: false,
                        is_superhost: false,
                        created_at: user.created_at
                    } as any);
                } else {
                    // Generic fallback for other users not found
                    setProfile({
                        ...mockProfile,
                        id: effectiveUserId,
                        full_name: `User ${effectiveUserId.slice(0, 5)}...`,
                    });
                }

                // 2. Fetch or set mock stats (placeholder for real stats API)
                setStats(mockStats);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [effectiveUserId, isOwnProfile, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start gap-6 mb-8">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-32 mb-4" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-24 pb-12 px-4 text-center">
                    <h1 className="font-serif text-2xl font-bold mb-4">User not found</h1>
                    <Button asChild>
                        <Link to="/discover">Discover Moments</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">

            <main className="pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-primary flex items-center justify-center text-4xl text-white font-medium overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                                ) : (
                                    profile.full_name.charAt(0)
                                )}
                            </div>
                            {profile.is_superhost && (
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                    <Star className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="font-serif text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
                                {profile.is_verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-medium rounded-full">
                                        <Shield className="h-3 w-3" />
                                        Verified
                                    </span>
                                )}
                                {profile.is_superhost && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                        <Star className="h-3 w-3" />
                                        Superhost
                                    </span>
                                )}
                            </div>

                            {profile.location && (
                                <p className="text-muted-foreground flex items-center gap-1 mb-2">
                                    <MapPin className="h-4 w-4" />
                                    {profile.location}
                                </p>
                            )}

                            {profile.bio && (
                                <p className="text-foreground mb-4 max-w-xl">{profile.bio}</p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                {isOwnProfile ? (
                                    <Button variant="outline" asChild>
                                        <Link to="/dashboard/settings">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <FollowButton
                                            userId={profile.id}
                                            isFollowing={isFollowing}
                                            followerCount={stats?.followers}
                                            onFollowChange={setIsFollowing}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => toast.info("Messaging coming soon!", {
                                                description: "Direct messaging is currently being built."
                                            })}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="font-semibold text-2xl text-foreground">{stats?.momentsHosted}</p>
                            <p className="text-sm text-muted-foreground">Moments Hosted</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="font-semibold text-2xl text-foreground">{stats?.momentsAttended}</p>
                            <p className="text-sm text-muted-foreground">Attended</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="font-semibold text-2xl text-foreground flex items-center justify-center gap-1">
                                {stats?.rating}
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </p>
                            <p className="text-sm text-muted-foreground">{stats?.reviewCount} reviews</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="font-semibold text-2xl text-foreground">{stats?.followers?.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-border mb-6">
                        {[
                            { id: "hosted" as const, label: "Hosted", icon: Grid },
                            { id: "attended" as const, label: "Attended", icon: Calendar },
                            { id: "saved" as const, label: "Saved", icon: Bookmark },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                                    activeTab === tab.id
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {moments.length > 0 ? (
                        <MasonryGrid>
                            {moments.map(moment => (
                                <MomentCard key={moment.id} moment={moment as any} />
                            ))}
                        </MasonryGrid>
                    ) : (
                        <div className="text-center py-16">
                            <Grid className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No moments yet</h3>
                            <p className="text-muted-foreground">
                                {activeTab === "hosted"
                                    ? "This user hasn't hosted any moments yet"
                                    : activeTab === "attended"
                                        ? "This user hasn't attended any moments yet"
                                        : "This user hasn't saved any moments yet"}
                            </p>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

export default UserProfilePage;
