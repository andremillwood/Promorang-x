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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import VerifiedPioneerBadge from "@/components/pioneer/VerifiedPioneerBadge";
import { useI18n } from "@/i18n/I18nContext";

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

const emptyStats: ProfileStats = {
    momentsHosted: 0,
    momentsAttended: 0,
    followers: 0,
    following: 0,
    rating: 0,
    reviewCount: 0,
};

const UserProfilePage = () => {
    const { t, formatNumber } = useI18n();
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [moments, setMoments] = useState<Tables<"moments">[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"hosted" | "attended" | "saved">("hosted");
    const [isFollowing, setIsFollowing] = useState(false);

    // If userId is not provided, it means we are at /profile, so use the current user's ID
    const effectiveUserId = userId || user?.id;

    // Check if viewing own profile
    const isOwnProfile = effectiveUserId === user?.id || userId === "me";

    // 1. Fetch main user profile and aggregate stats
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!effectiveUserId) return;

            setLoading(true);
            try {
                // Fetch profile from Supabase
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", effectiveUserId)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setProfile({
                        id: data.user_id,
                        full_name:
                            data.full_name ||
                            (isOwnProfile ? user?.user_metadata?.full_name : null) ||
                            (isOwnProfile ? user?.email?.split("@")[0] : null) ||
                            t("profile.user"),
                        avatar_url:
                            data.avatar_url ||
                            (isOwnProfile ? user?.user_metadata?.avatar_url : null) ||
                            null,
                        bio: data.bio,
                        location: data.location,
                        created_at: data.created_at,
                        is_verified: false,
                        is_superhost: false,
                    });
                } else if (isOwnProfile && user) {
                    // Fallback for current user if no profile record exists yet
                    setProfile({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || t("profile.user"),
                        avatar_url: user.user_metadata?.avatar_url || null,
                        bio: t("profile.newBio"),
                        location: t("profile.global"),
                        is_verified: false,
                        is_superhost: false,
                        created_at: user.created_at
                    });
                } else {
                    setProfile(null);
                }

                // Fetch real stats
                const [{ count: hostedCount }, { count: attendedCount }] = await Promise.all([
                    supabase.from("moments").select("*", { count: "exact", head: true }).eq("host_id", effectiveUserId),
                    supabase.from("moment_participants").select("*", { count: "exact", head: true }).eq("user_id", effectiveUserId),
                ]);

                setStats({
                    momentsHosted: hostedCount || 0,
                    momentsAttended: attendedCount || 0,
                    followers: 0,
                    following: 0,
                    rating: 5.0,
                    reviewCount: 0,
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [effectiveUserId, isOwnProfile, user]);

    // 2. Fetch moments tab content (Hosted / Attended / Saved)
    useEffect(() => {
        const fetchTabMoments = async () => {
            if (!effectiveUserId) return;
            setTabLoading(true);
            try {
                if (activeTab === "hosted") {
                    const { data, error } = await supabase
                        .from("moments")
                        .select("*")
                        .eq("host_id", effectiveUserId)
                        .order("starts_at", { ascending: false });

                    if (!error && data) {
                        setMoments(data);
                    } else {
                        setMoments([]);
                    }
                } else if (activeTab === "attended") {
                    const { data, error } = await supabase
                        .from("moment_participants")
                        .select("moment_id, moments(*)")
                        .eq("user_id", effectiveUserId);

                    if (!error && data) {
                        const attendedMoments = data
                            .map((item: any) => item.moments)
                            .filter((m): m is Tables<"moments"> => Boolean(m));
                        setMoments(attendedMoments);
                    } else {
                        setMoments([]);
                    }
                } else {
                    // Saved tab
                    setMoments([]);
                }
            } catch (err) {
                console.error("Error fetching moments for tab:", err);
                setMoments([]);
            } finally {
                setTabLoading(false);
            }
        };

        fetchTabMoments();
    }, [effectiveUserId, activeTab]);

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
                    <h1 className="font-serif text-2xl font-bold mb-4">{t("profile.notFound")}</h1>
                    <Button asChild>
                        <Link to="/discover">{t("saved.explore")}</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090909] text-white">
            <main className="pb-16">
                <section className="relative overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(249,115,22,0.3),transparent_34%),linear-gradient(135deg,#20150f,#090909_62%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/30" />
                <div className="relative mx-auto max-w-[1600px] px-5 pb-10 pt-28 sm:px-8 xl:px-12 2xl:px-16">
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
                                        {t("profile.verified")}
                                    </span>
                                )}
                                {profile.is_superhost && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                        <Star className="h-3 w-3" />
                                        {t("profile.superhost")}
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
                                    <>
                                        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white" asChild>
                                            <Link to="/dashboard/settings">
                                                <Settings className="h-4 w-4 mr-2" />
                                                {t("profile.edit")}
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success("Profile link copied to clipboard!");
                                            }}
                                        >
                                            Share Profile
                                        </Button>
                                        <Button variant="default" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-lg" asChild>
                                            <Link to="/vault">
                                                Open My Vault
                                            </Link>
                                        </Button>
                                    </>
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
                                            className="border-white/20 bg-black/30 text-white hover:bg-white/10"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success("Profile link copied to clipboard!");
                                            }}
                                        >
                                            Share Profile
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => toast.info(t("profile.messageSoon"), {
                                                description: t("profile.messageSoonCopy")
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
                <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 xl:px-12 2xl:px-16">

                    {/* Stats */}
                    <div className="mb-10 grid grid-cols-2 border-y border-white/10 md:grid-cols-4">
                        <div className="border-b border-r border-white/10 px-3 py-6 md:border-b-0 md:px-6">
                            <p className="text-2xl font-black text-white">{stats?.momentsHosted}</p>
                            <p className="text-sm text-white/40">{t("profile.hostedCount")}</p>
                        </div>
                        <div className="border-b border-white/10 px-3 py-6 md:border-b-0 md:border-r md:px-6">
                            <p className="text-2xl font-black text-white">{stats?.momentsAttended}</p>
                            <p className="text-sm text-white/40">{t("profile.verifiedMarks")}</p>
                        </div>
                        <div className="border-r border-white/10 px-3 py-6 md:px-6">
                            <p className="flex items-center justify-center gap-1 text-2xl font-black text-white">
                                {stats?.rating}
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </p>
                            <p className="text-sm text-white/40">{t("profile.trustSignals", { count: formatNumber(stats?.reviewCount || 0) })}</p>
                        </div>
                        <div className="px-3 py-6 md:px-6">
                            <p className="text-2xl font-black text-white">{stats?.followers?.toLocaleString()}</p>
                            <p className="text-sm text-white/40">{t("profile.connected")}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10">
                        {[
                            { id: "hosted" as const, label: t("profile.hosted"), icon: Grid },
                            { id: "attended" as const, label: t("profile.attended"), icon: Calendar },
                            { id: "saved" as const, label: t("profile.saved"), icon: Bookmark },
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
                                <MomentCard key={moment.id} moment={moment} />
                            ))}
                        </MasonryGrid>
                    ) : (
                        <div className="text-center py-16">
                            <Grid className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">{t("profile.empty")}</h3>
                            <p className="text-muted-foreground">
                                {activeTab === "hosted"
                                    ? t("profile.emptyHosted")
                                    : activeTab === "attended"
                                        ? t("profile.emptyAttended")
                                        : t("profile.emptySaved")}
                            </p>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

export default UserProfilePage;
