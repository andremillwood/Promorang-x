import { useEffect, useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SaveButtonProps {
    momentId: string;
    isSaved?: boolean;
    variant?: "icon" | "full";
    size?: "sm" | "md" | "lg";
    className?: string;
    onSaved?: (saved: boolean) => void;
}

export function SaveButton({
    momentId,
    isSaved: initialSaved = false,
    variant = "icon",
    size = "md",
    className,
    onSaved,
}: SaveButtonProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isLoading, setIsLoading] = useState(Boolean(user));
    const [available, setAvailable] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        let active = true;
        const loadSavedState = async () => {
            if (!user) {
                if (active) {
                    setIsSaved(false);
                    setIsLoading(false);
                    setAvailable(true);
                }
                return;
            }

            setIsLoading(true);
            const { data, error } = await (supabase as any)
                .from("saved_moments")
                .select("id")
                .eq("user_id", user.id)
                .eq("moment_id", momentId)
                .maybeSingle();

            if (!active) return;
            if (error) {
                setAvailable(false);
                setIsLoading(false);
                return;
            }
            setAvailable(true);
            setIsSaved(Boolean(data));
            setIsLoading(false);
        };

        void loadSavedState();
        return () => { active = false; };
    }, [momentId, user?.id]);

    const handleSave = async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user) {
            toast({ title: "Sign in to save", description: "Saved Moments are attached to your account." });
            return;
        }
        if (!available) {
            toast({ title: "Saved state unavailable", description: "PROMORANG could not read your saved-moment ledger. Nothing was changed.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        const nextSaved = !isSaved;
        const mutation = nextSaved
            ? await (supabase as any).from("saved_moments").insert({ user_id: user.id, moment_id: momentId, collection_name: "Saved" })
            : await (supabase as any).from("saved_moments").delete().eq("user_id", user.id).eq("moment_id", momentId);

        if (mutation.error) {
            setIsLoading(false);
            toast({ title: nextSaved ? "Not saved" : "Not removed", description: "The saved-moment ledger did not accept the change.", variant: "destructive" });
            return;
        }

        setIsSaved(nextSaved);
        setShowSuccess(nextSaved);
        if (nextSaved) setTimeout(() => setShowSuccess(false), 1500);
        onSaved?.(nextSaved);
        setIsLoading(false);
        toast({ title: nextSaved ? "Saved" : "Removed", description: nextSaved ? "This Moment is now in All Saved." : "This Moment was removed from your saved ledger." });
    };

    const sizeClasses = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-10 w-10" };

    if (variant === "icon") {
        return (
            <Button variant="secondary" size="icon" className={cn(
                "rounded-full bg-white/90 backdrop-blur-sm shadow-soft",
                "hover:bg-white hover:scale-110 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200",
                isSaved && "bg-primary text-primary-foreground hover:bg-primary/90",
                showSuccess && "bg-green-500 text-white",
                sizeClasses[size], className
            )} onClick={handleSave} disabled={isLoading} aria-label={isSaved ? "Remove saved Moment" : "Save Moment"}>
                {showSuccess ? <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" /> : <Bookmark className={cn("h-4 w-4 transition-transform", isSaved && "fill-current", isLoading && "animate-pulse")} />}
            </Button>
        );
    }

    return (
        <Button variant={isSaved ? "hero" : "outline"} size={size === "lg" ? "lg" : "sm"} className={cn("gap-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200", className)} onClick={handleSave} disabled={isLoading}>
            {showSuccess ? <><Check className="h-4 w-4" />Saved</> : <><Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />{isSaved ? "Saved" : "Save"}</>}
        </Button>
    );
}

export default SaveButton;
