import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { operationalSupabase } from "@/integrations/supabase/operational";

interface ReactionBarProps {
    entityType: "moment" | "comment";
    entityId: string;
    initialReactions?: Record<string, number>;
    userReaction?: string | null;
    className?: string;
    size?: "sm" | "md" | "lg";
    canInteract?: boolean;
    disabledReason?: string;
}

const REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "🔥", label: "Hot" },
    { emoji: "👏", label: "Applause" },
    { emoji: "✨", label: "Amazing" },
];
const EMPTY_REACTIONS: Record<string, number> = {};

/**
 * Emoji reaction bar for moments and comments
 * Inspired by modern social apps - quick, visual reactions
 */
export function ReactionBar({
    entityType,
    entityId,
    initialReactions = EMPTY_REACTIONS,
    userReaction: initialUserReaction = null,
    className,
    size = "md",
    canInteract = true,
    disabledReason = "Join this Moment to react.",
}: ReactionBarProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [reactions, setReactions] = useState(initialReactions);
    const [userReaction, setUserReaction] = useState(initialUserReaction);
    const [isAnimating, setIsAnimating] = useState<string | null>(null);

    const canPersist = /^[0-9a-f-]{36}$/i.test(entityId);
    const loadReactions = useCallback(async () => {
        if (!canPersist) return;
        const { data, error } = await operationalSupabase
            .from("reactions")
            .select("user_id,reaction_type")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId);
        if (error) return;

        const counts: Record<string, number> = {};
        let mine: string | null = null;
        (data || []).forEach((reaction) => {
            counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
            if (user?.id === reaction.user_id) mine = reaction.reaction_type;
        });
        setReactions(counts);
        setUserReaction(mine);
    }, [canPersist, entityId, entityType, user?.id]);

    useEffect(() => {
        setReactions(initialReactions);
        setUserReaction(initialUserReaction);
    }, [initialReactions, initialUserReaction]);

    useEffect(() => {
        loadReactions();
        if (!canPersist) return;
        const channel = operationalSupabase
            .channel(`reactions-${entityType}-${entityId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "reactions", filter: `entity_id=eq.${entityId}` },
                loadReactions,
            )
            .subscribe();
        return () => {
            operationalSupabase.removeChannel(channel);
        };
    }, [canPersist, entityId, entityType, loadReactions]);

    const handleReaction = async (emoji: string) => {
        if (!user) {
            toast({ title: "Sign in to react", description: "Your reaction is connected to your Promorang profile." });
            return;
        }
        if (!canInteract || !canPersist) {
            toast({ title: "Reactions unlock through participation", description: disabledReason });
            return;
        }

        // Optimistic update
        const previousReaction = userReaction;
        const previousReactions = { ...reactions };

        if (userReaction === emoji) {
            // Remove reaction
            setUserReaction(null);
            setReactions(prev => ({
                ...prev,
                [emoji]: Math.max(0, (prev[emoji] || 0) - 1)
            }));
        } else {
            // Add/change reaction
            setIsAnimating(emoji);
            setTimeout(() => setIsAnimating(null), 300);

            // Remove previous reaction if exists
            if (previousReaction) {
                setReactions(prev => ({
                    ...prev,
                    [previousReaction]: Math.max(0, (prev[previousReaction] || 0) - 1)
                }));
            }

            // Add new reaction
            setUserReaction(emoji);
            setReactions(prev => ({
                ...prev,
                [emoji]: (prev[emoji] || 0) + 1
            }));
        }

        const result = previousReaction === emoji
            ? await operationalSupabase
                .from("reactions")
                .delete()
                .eq("user_id", user.id)
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
            : await operationalSupabase
                .from("reactions")
                .upsert(
                    { user_id: user.id, entity_type: entityType, entity_id: entityId, reaction_type: emoji },
                    { onConflict: "user_id,entity_type,entity_id" },
                );

        if (result.error) {
            setReactions(previousReactions);
            setUserReaction(previousReaction);
            toast({ title: "Reaction not saved", description: result.error.message, variant: "destructive" });
        }
    };

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    const sizeClasses = {
        sm: "text-sm gap-1 p-1",
        md: "text-base gap-1.5 p-1.5",
        lg: "text-lg gap-2 p-2",
    };

    const buttonSizes = {
        sm: "px-2 py-0.5",
        md: "px-2.5 py-1",
        lg: "px-3 py-1.5",
    };

    return (
        <div className={cn("flex items-center flex-wrap", sizeClasses[size], className)}>
            {REACTIONS.map(({ emoji, label }) => {
                const count = reactions[emoji] || 0;
                const isSelected = userReaction === emoji;
                const isActive = isAnimating === emoji;

                return (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        aria-pressed={isSelected}
                        className={cn(
                            "flex items-center gap-1 rounded-full transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200",
                            buttonSizes[size],
                            isSelected
                                ? "bg-primary/10 ring-1 ring-primary"
                                : "bg-secondary/50 hover:bg-secondary",
                            isActive && "scale-125"
                        )}
                        title={label}
                    >
                        <span className={cn(
                            "transition-transform duration-200",
                            isActive && "animate-bounce"
                        )}>
                            {emoji}
                        </span>
                        {count > 0 && (
                            <span className={cn(
                                "text-xs font-medium",
                                isSelected ? "text-primary" : "text-muted-foreground"
                            )}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}

            {totalReactions > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                    {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
}

export default ReactionBar;
