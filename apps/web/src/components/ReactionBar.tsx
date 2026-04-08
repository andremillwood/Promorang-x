import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ReactionBarProps {
    entityType: "moment" | "comment";
    entityId: string;
    initialReactions?: Record<string, number>;
    userReaction?: string | null;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "🔥", label: "Hot" },
    { emoji: "👏", label: "Applause" },
    { emoji: "✨", label: "Amazing" },
];

/**
 * Emoji reaction bar for moments and comments
 * Inspired by modern social apps - quick, visual reactions
 */
export function ReactionBar({
    entityType,
    entityId,
    initialReactions = {},
    userReaction: initialUserReaction = null,
    className,
    size = "md",
}: ReactionBarProps) {
    const { toast } = useToast();
    const [reactions, setReactions] = useState(initialReactions);
    const [userReaction, setUserReaction] = useState(initialUserReaction);
    const [isAnimating, setIsAnimating] = useState<string | null>(null);

    const handleReaction = async (emoji: string) => {
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

        // TODO: Persist to Supabase once migration is applied
        // await supabase.from('reactions')...
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
                        className={cn(
                            "flex items-center gap-1 rounded-full transition-all duration-200",
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
