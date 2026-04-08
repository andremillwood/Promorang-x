import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
    userId: string;
    isFollowing?: boolean;
    followerCount?: number;
    variant?: "default" | "compact" | "icon";
    className?: string;
    onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Follow/Unfollow button with optimistic updates
 * Integrates with follows table (migration required)
 */
export function FollowButton({
    userId,
    isFollowing: initialFollowing = false,
    followerCount: initialCount,
    variant = "default",
    className,
    onFollowChange,
}: FollowButtonProps) {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(initialCount);

    const handleToggleFollow = async () => {
        setIsLoading(true);

        // Optimistic update
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);

        if (followerCount !== undefined) {
            setFollowerCount(prev => (prev ?? 0) + (newFollowState ? 1 : -1));
        }

        onFollowChange?.(newFollowState);

        toast({
            title: newFollowState ? "Following!" : "Unfollowed",
            description: newFollowState
                ? "You'll see their moments in your feed"
                : "Removed from your following list",
        });

        setIsLoading(false);

        // TODO: Persist to Supabase once migration is applied
        // await supabase.from('follows')...
    };

    if (variant === "icon") {
        return (
            <Button
                variant={isFollowing ? "outline" : "default"}
                size="icon"
                className={cn("rounded-full", className)}
                onClick={handleToggleFollow}
                disabled={isLoading}
            >
                {isLoading ? (
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
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : isFollowing ? (
                    <UserMinus className="h-3 w-3 mr-1" />
                ) : (
                    <UserPlus className="h-3 w-3 mr-1" />
                )}
                {isFollowing ? "Following" : "Follow"}
            </Button>
        );
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Button
                variant={isFollowing ? "outline" : "hero"}
                onClick={handleToggleFollow}
                disabled={isLoading}
                className="min-w-[100px]"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isFollowing ? (
                    <UserMinus className="h-4 w-4 mr-2" />
                ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isFollowing ? "Following" : "Follow"}
            </Button>

            {followerCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                    {followerCount.toLocaleString()} follower{followerCount !== 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
}

export default FollowButton;
