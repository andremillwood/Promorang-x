import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/SaveButton";
import { SwipeRail } from "@/components/ui/SwipeRail";
import { Gift, Users, Flame, ChevronDown, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { AccessState } from "@/lib/access";

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
    accessState?: AccessState;
    className?: string;
    missionCount?: number;
    missionPointTotal?: number;
    onExploreMissions?: () => void;
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
    accessState,
    className,
    missionCount = 0,
    missionPointTotal = 0,
    onExploreMissions,
}: StickyJoinBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const { toast } = useToast();
    const { t, formatNumber } = useI18n();

    useEffect(() => {
        const handleScroll = () => {
            // Show sticky bar after scrolling past 400px
            const shouldShow = window.scrollY > 400;
            setIsVisible(shouldShow);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handlePingSquad = async () => {
        const text = `I'm going to ${title}! Download Promorang and join me so we can unlock the Squad Bounty 🔒🔥`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my Squad on Promorang!',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            await navigator.clipboard.writeText(`${text} ${window.location.href}`);
            toast({
                title: "Squad Link Copied! 🔗",
                description: "Paste this in your group chat to assemble your squad.",
            });
        }
    };

    const spotsLeft = maxParticipants ? maxParticipants - participantCount : null;
    const isAlmostFull = spotsLeft !== null && spotsLeft <= 5;
    const isFull = spotsLeft !== null && spotsLeft <= 0;

    const getButtonContent = () => {
        if (isPast) return t("join.ended");
        if (!isLoggedIn) return t("join.signIn");
        if (isHost) return t("join.manage");
        if (isJoined) return t("join.youreIn");
        if (isFull) return t("join.full");
        if (isJoining) return t("join.joining");
        if (accessState?.key === "needs_keys") return t("join.needKey");
        if (accessState && accessState.key !== "available") return accessState.ctaLabel;
        if (isAlmostFull && spotsLeft !== null) return t("join.spotsLeft", { count: formatNumber(spotsLeft) });
        return t("join.showUp");
    };

    const getButtonVariant = () => {
        if (isPast || isFull) return "secondary" as const;
        if (isJoined) return "outline" as const;
        if (accessState?.key === "requires_plus" || accessState?.key === "blocked") return "secondary" as const;
        if (accessState?.key === "needs_keys") return "default" as const;
        return "hero" as const;
    };

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 px-safe",
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
                                {accessState && !isJoined && (
                                    <span className="font-medium text-foreground">
                                        {accessState.label}
                                    </span>
                                )}
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
            <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated pb-safe">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        {/* Left side - info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex min-h-[44px] items-center gap-2 rounded-full px-2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? "Collapse moment quick details" : "Expand moment quick details"}
                            >
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 transition-transform",
                                        isExpanded && "rotate-180"
                                    )}
                                />
                            </button>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
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
                                    {accessState && !isJoined && ` • ${accessState.label}`}
                                </p>
                            </div>
                        </div>

                        {/* Right side - CTA */}
                        <SwipeRail compact fadeFrom="from-background" showDots={false} showChevrons={false} className="w-full min-w-0 sm:w-auto" scrollerClassName="items-center gap-2">
                        <SaveButton momentId={momentId} size="md" className="hidden shrink-0 snap-start sm:flex" />
                            {missionCount > 0 && onExploreMissions ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={onExploreMissions}
                                    className="shrink-0 snap-start whitespace-nowrap border-amber-400/40 text-amber-600 dark:text-amber-300"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {t("join.missions", { count: formatNumber(missionCount), points: formatNumber(missionPointTotal) })}
                                </Button>
                            ) : null}
                            {isJoined && !isPast && !isHost && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handlePingSquad}
                                    className="shrink-0 snap-start whitespace-nowrap border-accent text-accent hover:bg-accent/10"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    {t("join.bringFriends")}
                                </Button>
                            )}
                            <Button
                                variant={getButtonVariant()}
                                size="lg"
                                onClick={onJoin}
                                disabled={isPast || isFull || isJoining || accessState?.canAttempt === false}
                                className="shrink-0 snap-start whitespace-nowrap"
                            >
                                {getButtonContent()}
                            </Button>
                        </SwipeRail>
                    </div>
                    {!isExpanded && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:hidden">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Tap the chevron for quick details and squad actions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StickyJoinBar;
