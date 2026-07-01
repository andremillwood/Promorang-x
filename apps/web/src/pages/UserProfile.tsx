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
import { demoMoments } from "@/data/demo-moments";
import { cultureImages } from "@/data/culture-demo";
import VerifiedPioneerBadge from "@/components/pioneer/VerifiedPioneerBadge";

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
    full_name: "Andre Millwood",
    avatar_url: null,
    bio: "Building and backing moments where culture, proof, and participation create value people can keep.",
    location: "Kingston, Jamaica",
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

const mockMoments = demoMoments.slice(0, 4);

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
                    setProfile({
                        ...data,
                        full_name: (data as any).display_name || (data as any).full_name || "User"
                    } as any);
                } else if (isOwnProfile && user) {
                    // Fallback for current user if no profile record exists yet
                    setProfile({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
                        avatar_url: user.user_metadata?.avatar_url || null,
                        bio: "New to the Promorang scene.",
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
                        <Link to="/discover">Explore Moments</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090909] text-white">
            <main className="pb-16">
                <section className="relative overflow-hidden border-b border-white/10">
                    <img src={cultureImages.momentConcert} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/30" />
                <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-28 sm:px-8">
                    {/* Profile Header */}
                    <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-black bg-orange-500 text-4xl font-black text-black shadow-2xl md:h-36 md:w-36">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                                ) : (
                                    (profile.full_name || "?").charAt(0)
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
                                <div className="flex flex-wrap items-center gap-3"><h1 className="text-4xl font-black tracking-tight md:text-5xl">{profile.full_name}</h1><VerifiedPioneerBadge beneficiaryType="user" beneficiaryId={profile.id} /></div>
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
                                <p className="mb-3 flex items-center gap-1 text-white/55">
                                    <MapPin className="h-4 w-4" />
                                    {profile.location}
                                </p>
                            )}

                            {profile.bio && (
                                <p className="mb-5 max-w-xl leading-7 text-white/70">{profile.bio}</p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                {isOwnProfile ? (
                                    <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white" asChild>
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
                </div>
                </section>
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="rounded-lg border border-white/10 bg-[#111] p-4 text-center">
                            <p className="text-2xl font-black text-white">{stats?.momentsHosted}</p>
                            <p className="text-sm text-white/40">Moments hosted</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#111] p-4 text-center">
                            <p className="text-2xl font-black text-white">{stats?.momentsAttended}</p>
                            <p className="text-sm text-white/40">Verified marks</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#111] p-4 text-center">
                            <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                                {stats?.rating}
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </p>
                            <p className="text-sm text-white/40">{stats?.reviewCount} trust signals</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#111] p-4 text-center">
                            <p className="text-2xl font-black text-white">{stats?.followers?.toLocaleString()}</p>
                            <p className="text-sm text-white/40">People connected</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10">
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
                                        ? "border-orange-500 text-white"
                                        : "border-transparent text-white/40 hover:text-white"
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
