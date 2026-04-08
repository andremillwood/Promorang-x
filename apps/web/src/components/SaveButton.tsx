import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SaveButtonProps {
    momentId: string;
    isSaved?: boolean;
    variant?: "icon" | "full";
    size?: "sm" | "md" | "lg";
    className?: string;
    onSaved?: (saved: boolean) => void;
}

/**
 * Pinterest-style Save Button
 * Uses optimistic updates - will persist to Supabase after migration is applied
 */
export function SaveButton({
    momentId,
    isSaved: initialSaved = false,
    variant = "icon",
    size = "md",
    className,
    onSaved,
}: SaveButtonProps) {
    const { toast } = useToast();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        // Toggle state optimistically
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);

        if (newSavedState) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
            toast({
                title: "Saved!",
                description: "Added to your collection",
            });
        } else {
            toast({
                title: "Removed",
                description: "Removed from your collection",
            });
        }

        onSaved?.(newSavedState);
        setIsLoading(false);

        // TODO: Persist to Supabase once migration is applied
        // This will use the saved_moments table
    };

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-10 w-10",
    };

    if (variant === "icon") {
        return (
            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "rounded-full bg-white/90 backdrop-blur-sm shadow-soft",
                    "hover:bg-white hover:scale-110 transition-all duration-200",
                    isSaved && "bg-primary text-primary-foreground hover:bg-primary/90",
                    showSuccess && "bg-green-500 text-white",
                    sizeClasses[size],
                    className
                )}
                onClick={handleSave}
                disabled={isLoading}
            >
                {showSuccess ? (
                    <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                ) : (
                    <Bookmark className={cn(
                        "h-4 w-4 transition-transform",
                        isSaved && "fill-current",
                        isLoading && "animate-pulse"
                    )} />
                )}
            </Button>
        );
    }

    return (
        <Button
            variant={isSaved ? "hero" : "outline"}
            size={size === "lg" ? "lg" : "sm"}
            className={cn(
                "gap-2 transition-all duration-200",
                className
            )}
            onClick={handleSave}
            disabled={isLoading}
        >
            {showSuccess ? (
                <>
                    <Check className="h-4 w-4" />
                    Saved!
                </>
            ) : (
                <>
                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save"}
                </>
            )}
        </Button>
    );
}

export default SaveButton;
