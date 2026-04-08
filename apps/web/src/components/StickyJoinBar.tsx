import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/SaveButton";
import { Gift, Users, Flame, ChevronDown } from "lucide-react";

interface StickyJoinBarProps {
    momentId: string;
    title: string;
    reward?: string | null;
    participantCount: number;
    maxParticipants?: number | null;
    isJoined: boolean;
    isPast: boolean;
    isHost: boolean;
    isLoggedIn: boolean;
    onJoin: () => void;
    isJoining?: boolean;
    className?: string;
}

/**
 * Airbnb-style sticky booking/join bar
 * Appears when scrolled past the main CTA
 */
export function StickyJoinBar({
    momentId,
    title,
    reward,
    participantCount,
    maxParticipants,
    isJoined,
    isPast,
    isHost,
    isLoggedIn,
    onJoin,
    isJoining = false,
    className,
}: StickyJoinBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show sticky bar after scrolling past 400px
            const shouldShow = window.scrollY > 400;
            setIsVisible(shouldShow);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const spotsLeft = maxParticipants ? maxParticipants - participantCount : null;
    const isAlmostFull = spotsLeft !== null && spotsLeft <= 5;
    const isFull = spotsLeft !== null && spotsLeft <= 0;

    const getButtonContent = () => {
        if (isPast) return "Moment Ended";
        if (!isLoggedIn) return "Sign In to Join";
        if (isHost) return "Manage Moment";
        if (isJoined) return "You're Joined ✓";
        if (isFull) return "Moment Full";
        return isJoining ? "Joining..." : "Join This Moment";
    };

    const getButtonVariant = () => {
        if (isPast || isFull) return "secondary" as const;
        if (isJoined) return "outline" as const;
        return "hero" as const;
    };

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-full",
                className
            )}
        >
            {/* Expanded details panel */}
            {isExpanded && (
                <div className="bg-card border-t border-border px-4 py-3">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h4 className="font-medium text-foreground line-clamp-1">{title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {participantCount} joined
                                </span>
                                {reward && (
                                    <span className="flex items-center gap-1 text-accent">
                                        <Gift className="h-4 w-4" />
                                        {reward}
                                    </span>
                                )}
                            </div>
                        </div>
                        <SaveButton momentId={momentId} variant="full" size="sm" />
                    </div>
                </div>
            )}

            {/* Main bar */}
            <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left side - info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 transition-transform",
                                        isExpanded && "rotate-180"
                                    )}
                                />
                            </button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    {isAlmostFull && !isJoined && !isPast && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-red-500 animate-pulse">
                                            <Flame className="h-3 w-3" />
                                            {spotsLeft} spots left
                                        </span>
                                    )}
                                    {participantCount > 10 && !isAlmostFull && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                                            <Flame className="h-3 w-3" />
                                            Trending
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {participantCount} {participantCount === 1 ? "person" : "people"} joined
                                    {maxParticipants && ` • ${maxParticipants - participantCount} spots left`}
                                </p>
                            </div>
                        </div>

                        {/* Right side - CTA */}
                        <div className="flex items-center gap-2">
                            <SaveButton momentId={momentId} size="md" className="hidden sm:flex" />
                            <Button
                                variant={getButtonVariant()}
                                size="lg"
                                onClick={onJoin}
                                disabled={isPast || isFull || isJoining}
                                className="whitespace-nowrap"
                            >
                                {getButtonContent()}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StickyJoinBar;
