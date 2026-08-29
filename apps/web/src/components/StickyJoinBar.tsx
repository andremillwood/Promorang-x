import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TactileButton } from "@/components/ui/TactileButton";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { SaveButton } from "@/components/SaveButton";
import { Gift, Users, Flame, ChevronUp, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
 * Sticky action rail for Moment detail.
 * Essential join/sign-in stays on the rail. Extra squad actions open in Drawer.
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

    useEffect(() => {
        const handleScroll = () => {
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
                    title: "Join my Squad on Promorang!",
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing", err);
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
    const canJoin = !(isPast || isFull || isJoining || accessState?.canAttempt === false);
    const showMissions = missionCount > 0 && Boolean(onExploreMissions);
    const showPingSquad = isJoined && !isPast && !isHost;

    const getButtonContent = () => {
        if (isPast) return "Moment Ended";
        if (!isLoggedIn) return "Sign In to Join";
        if (isHost) return "Manage Moment";
        if (isJoined) return "You're Joined";
        if (isFull) return "Moment Full";
        if (accessState && accessState.key !== "available") return accessState.ctaLabel;
        return isJoining ? "Joining..." : "Join This Moment";
    };

    const getTactileVariant = () => {
        if (isPast || isFull) return "obsidian" as const;
        if (isJoined) return "success" as const;
        if (accessState?.key === "requires_plus" || accessState?.key === "blocked") return "obsidian" as const;
        if (accessState?.key === "needs_keys") return "vault" as const;
        return "primary" as const;
    };

    const statusLine = [
        `${participantCount} ${participantCount === 1 ? "person" : "people"} joined`,
        maxParticipants ? `${maxParticipants - participantCount} spots left` : null,
        accessState && !isJoined ? accessState.label : null,
    ]
        .filter(Boolean)
        .join(" • ");

    const handleExploreMissions = () => {
        setIsExpanded(false);
        onExploreMissions?.();
    };

    const handlePrimaryAction = () => {
        setIsExpanded(false);
        onJoin();
    };

    const detailsDrawer = (
        <Drawer open={isExpanded} onOpenChange={setIsExpanded} shouldScaleBackground={false}>
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Close moment quick details" : "Open moment quick details"}
                >
                    <ChevronUp className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-180")} />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="z-[60]">
                <DrawerHeader className="text-left">
                    <DrawerTitle className="line-clamp-2">{title}</DrawerTitle>
                    <DrawerDescription className="flex flex-wrap items-center gap-3 pt-1">
                        <span className="inline-flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {participantCount} joined
                        </span>
                        {accessState && !isJoined ? <span className="font-medium text-foreground">{accessState.label}</span> : null}
                        {reward ? (
                            <span className="inline-flex items-center gap-1 text-accent">
                                <Gift className="h-4 w-4" />
                                {reward}
                            </span>
                        ) : null}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-3 px-4 pb-2">
                    <SaveButton momentId={momentId} variant="full" size="sm" />
                    {showMissions ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleExploreMissions}
                            className="w-full border-amber-400/40 text-amber-700 dark:text-amber-300"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {missionCount} Missions · +{missionPointTotal}
                        </Button>
                    ) : null}
                    {showPingSquad ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handlePingSquad}
                            className="w-full border-accent text-accent hover:bg-accent/10"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Ping Squad
                        </Button>
                    ) : null}
                </div>
                <DrawerFooter>
                    <TactileButton
                        type="button"
                        variant={getTactileVariant()}
                        size="lg"
                        fullWidth
                        onClick={handlePrimaryAction}
                        disabled={!canJoin}
                    >
                        {getButtonContent()}
                    </TactileButton>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 px-safe",
                isVisible ? "translate-y-0" : "translate-y-full",
                className,
            )}
        >
            <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated pb-safe">
                <div className="mx-auto max-w-4xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        {detailsDrawer}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {isAlmostFull && !isJoined && !isPast ? (
                                    <span className="flex items-center gap-1 text-xs font-medium text-red-500 animate-pulse">
                                        <Flame className="h-3 w-3" />
                                        {spotsLeft} spots left
                                    </span>
                                ) : null}
                                {participantCount > 10 && !isAlmostFull ? (
                                    <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                                        <Flame className="h-3 w-3" />
                                        Trending
                                    </span>
                                ) : null}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{statusLine}</p>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "mt-3 grid items-center gap-2",
                            showMissions ? "grid-cols-[auto_minmax(0,1fr)]" : "grid-cols-1",
                        )}
                    >
                        {showMissions ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={onExploreMissions}
                                className="shrink-0 whitespace-nowrap border-amber-400/40 text-amber-600 dark:text-amber-300"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {missionCount} Missions · +{missionPointTotal}
                            </Button>
                        ) : null}
                        <TactileButton
                            type="button"
                            variant={getTactileVariant()}
                            size="lg"
                            fullWidth
                            onClick={onJoin}
                            disabled={!canJoin}
                        >
                            {getButtonContent()}
                        </TactileButton>
                    </div>

                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:hidden">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Swipe up or tap the chevron for save, squad, and extra actions.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StickyJoinBar;
