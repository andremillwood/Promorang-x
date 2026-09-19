import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { authPathForReturn } from "@/lib/post-auth-next";
import { rememberResumableIntent } from "@/lib/resumable-intent";

interface FollowButtonProps {
    userId: string;
    isFollowing?: boolean;
    followerCount?: number;
    variant?: "default" | "compact" | "icon";
    className?: string;
    onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Follow/Unfollow button with Supabase integration
 * Uses user_follows table from social amplification schema
 */
export function FollowButton({
    userId,
    isFollowing: initialFollowing = false,
    followerCount: initialCount,
    variant = "default",
    className,
    onFollowChange,
}: FollowButtonProps) {
    const { t, formatNumber } = useI18n();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [statusError, setStatusError] = useState(false);
    const [followerCount, setFollowerCount] = useState(initialCount);

    // Check authoritative follow state before exposing a mutation.
    useEffect(() => {
        if (!user || user.id === userId) {
            setCheckingStatus(false);
            setStatusError(false);
            return;
        }

        let active = true;
        const checkFollowStatus = async () => {
            setCheckingStatus(true);
            setStatusError(false);
            const { data, error } = await supabase
                .from('user_follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', userId)
                .maybeSingle();

            if (!active) return;
            if (error) {
                setStatusError(true);
                setCheckingStatus(false);
                return;
            }

            setIsFollowing(!!data);
            setCheckingStatus(false);
        };

        void checkFollowStatus();
        return () => {
            active = false;
        };
    }, [user, userId]);

    useEffect(() => {
        setFollowerCount(initialCount);
    }, [initialCount]);

    const handleToggleFollow = async () => {
        if (statusError) {
            toast({
                title: "Follow status unavailable",
                description: "PROMORANG could not verify the current follow state, so nothing was changed.",
                variant: "destructive"
            });
            return;
        }

        if (!user) {
            const returnPath = typeof window === "undefined"
                ? `/profile/${userId}`
                : `${window.location.pathname}${window.location.search}${window.location.hash}`;
            rememberResumableIntent({
                kind: "market_watch",
                returnPath,
                targetId: `profile:${userId}`,
            });
            if (typeof window !== "undefined") {
                window.location.assign(authPathForReturn(returnPath, { mode: "login", role: "participant" }));
            }
            return;
        }

        if (user.id === userId) {
            toast({
                title: "Cannot follow yourself",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('user_follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', userId);

                if (error) throw error;

                setIsFollowing(false);
                if (followerCount !== undefined) {
                    setFollowerCount(prev => Math.max(0, (prev ?? 0) - 1));
                }

                toast({
                    title: t("followButton.unfollowed"),
                    description: t("followButton.unfollowedDesc"),
                });
            } else {
                // Follow
                const { error } = await supabase
                    .from('user_follows')
                    .insert({
                        follower_id: user.id,
                        following_id: userId,
                        notification_enabled: true
                    });

                if (error) throw error;

                setIsFollowing(true);
                if (followerCount !== undefined) {
                    setFollowerCount(prev => (prev ?? 0) + 1);
                }

                toast({
                    title: t("followButton.followingToast"),
                    description: t("followButton.followingToastDesc"),
                });
            }

            onFollowChange?.(!isFollowing);
        } catch (error) {
            console.error('Follow error:', error);
            toast({
                title: t("common.error"),
                description: "Failed to update follow status. Please try again.",
                variant: "destructive"
            });
            // Revert optimistic update
            setIsFollowing(isFollowing);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "icon") {
        return (
            <Button
                variant={isFollowing ? "outline" : "default"}
                size="icon"
                className={cn("rounded-full", className)}
                onClick={handleToggleFollow}
                disabled={isLoading || checkingStatus || statusError}
            >
                {isLoading || checkingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                    <UserMinus className="h-4 w-4" />
                ) : (
                    <UserPlus className="h-4 w-4" />
                )}
            </Button>
        );
    }

    if (variant === "compact") {
        return (
            <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className={cn("h-8 px-3", className)}
                onClick={handleToggleFollow}
                disabled={isLoading || checkingStatus || statusError}
            >
                {isLoading || checkingStatus ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : isFollowing ? (
                    <UserMinus className="h-3 w-3 mr-1" />
                ) : (
                    <UserPlus className="h-3 w-3 mr-1" />
                )}
                {statusError ? "Unavailable" : isFollowing ? t("followButton.following") : t("followButton.follow")}
            </Button>
        );
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Button
                variant={isFollowing ? "outline" : "hero"}
                onClick={handleToggleFollow}
                disabled={isLoading || checkingStatus || statusError}
                className="min-w-[100px]"
            >
                {isLoading || checkingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isFollowing ? (
                    <UserMinus className="h-4 w-4 mr-2" />
                ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                )}
                {statusError ? "Follow unavailable" : isFollowing ? t("followButton.following") : t("followButton.follow")}
            </Button>

            {followerCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                    {followerCount === 1
                        ? t("followButton.followers", { count: formatNumber(followerCount) })
                        : t("followButton.followersPlural", { count: formatNumber(followerCount) })}
                </span>
            )}
        </div>
    );
}

export default FollowButton;
