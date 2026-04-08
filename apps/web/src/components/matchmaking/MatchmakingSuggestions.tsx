import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Sparkles as LucideSparkles,
    ArrowRight as LucideArrow,
    Building2 as LucideBuilding,
    Store as LucideStore,
    Plus as LucidePlus,
    Check as LucideCheck,
    Info as LucideInfo
} from "lucide-react";
const Sparkles = LucideSparkles as any;
const ArrowRight = LucideArrow as any;
const Building2 = LucideBuilding as any;
const Store = LucideStore as any;
const Plus = LucidePlus as any;
const Check = LucideCheck as any;
const Info = LucideInfo as any;
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Suggestion {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    logo_url: string;
    match_reason: string;
    compatibility_score: number;
}

interface MatchmakingSuggestionsProps {
    role: 'brand' | 'merchant' | 'host';
    category?: string;
    location?: string;
    onSelect?: (id: string, name: string) => void;
    selectedIds?: string[];
    title?: string;
}

export const MatchmakingSuggestions = ({
    role,
    category,
    location,
    onSelect,
    selectedIds = [],
    title
}: MatchmakingSuggestionsProps) => {
    const { data: suggestions, isLoading } = useQuery({
        queryKey: ["matchmaking-suggestions", role, category, location],
        enabled: !!role,
        queryFn: async () => {
            const { data, error } = await (supabase.rpc as any)('fn_get_matchmaking_suggestions', {
                target_role: role,
                target_category: category || null,
                target_location: location || null,
                limit_count: 3
            });
            if (error) throw error;
            return data as Suggestion[];
        }
    });

    if (isLoading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
        </div>
    );

    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {title || `Top ${role === 'brand' ? 'Sponsor' : 'Venue'} Matches`}
                </h4>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5">
                    Ecosystem Match
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {suggestions.map((item) => {
                    const isSelected = selectedIds.includes(item.id);

                    return (
                        <Card
                            key={item.id}
                            className={cn(
                                "p-3 group hover:border-primary/50 transition-all duration-300 relative overflow-hidden",
                                isSelected && "border-primary bg-primary/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 border overflow-hidden">
                                    {item.logo_url ? (
                                        <img src={item.logo_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            {role === 'brand' ? <Building2 className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <h5 className="font-bold text-sm truncate">{item.name}</h5>
                                    <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Info className="w-3 h-3 text-primary/60" />
                                        <span className="text-[10px] text-primary/80 font-medium">
                                            {item.match_reason}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="icon"
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex-shrink-0 transition-all",
                                        !isSelected && "opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={() => onSelect?.(item.id, item.name)}
                                >
                                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                These partners are actively looking for <span className="text-foreground font-medium underline decoration-primary/30">{category || 'new'}</span> activations.
            </p>
        </div>
    );
};
