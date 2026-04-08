import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, CheckCircle, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Moment = Tables<"moments"> & {
    organizer: { full_name: string | null, avatar_url: string | null } | null
};

export function BrandFundingTab() {
    const { user } = useAuth();
    const [proposals, setProposals] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [fundingId, setFundingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            // Fetch submitted moments that need funding
            // In a real app, you might filter by category validation or relevance
            const { data, error } = await supabase
                .from("moments")
                .select(`
            *,
            organizer:profiles!moments_organizer_id_fkey(full_name, avatar_url)
        `)
                .eq("status", "submitted")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProposals(data as any || []);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            toast.error("Failed to load funding opportunities");
        } finally {
            setLoading(false);
        }
    };

    const handleFund = async (moment: Moment) => {
        if (!user) return;
        setFundingId(moment.id);

        try {
            // 1. Update Moment Status to 'funded' and assign Sponsor
            const { error } = await supabase
                .from("moments")
                .update({
                    status: "funded",
                    sponsor_id: user.id,
                    billing_status: "paid" // Simulating instant payment for MVP
                })
                .eq("id", moment.id);

            if (error) throw error;

            toast.success(`Successfully funded "${moment.title}"!`);

            // Refresh list
            setProposals(prev => prev.filter(p => p.id !== moment.id));

        } catch (error) {
            console.error("Error funding moment:", error);
            toast.error("Funding failed. Please try again.");
        } finally {
            setFundingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-serif font-bold">Funding Opportunities</h2>
                    <p className="text-muted-foreground">Discover and sponsor high-potential moments from the community.</p>
                </div>
            </div>

            {proposals.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No active proposals</h3>
                        <p className="text-muted-foreground max-w-sm">
                            There are currently no moments waiting for funding. Check back later!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proposals.map((proposal) => (
                        <Card key={proposal.id} className="group hover:shadow-soft-xl transition-all duration-300 border-border/60">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <Badge variant="outline" className="mb-2 capitalize">
                                        {proposal.type}
                                    </Badge>
                                    {proposal.moment_tier && (
                                        <Badge className="mb-2 bg-gradient-primary text-white border-0 capitalize">
                                            {proposal.moment_tier} Tier
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg font-bold line-clamp-2">{proposal.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                    {proposal.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                        {proposal.organizer?.full_name?.charAt(0) || "?"}
                                    </div>
                                    <span className="font-medium text-foreground">{proposal.organizer?.full_name || "Unknown Host"}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs font-medium">
                                    <div className="flex items-center gap-1.5 p-2 bg-secondary/50 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        <span className="truncate">{proposal.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 bg-secondary/50 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2">
                                <Button
                                    variant="hero"
                                    className="w-full"
                                    onClick={() => handleFund(proposal)}
                                    disabled={!!fundingId}
                                >
                                    {fundingId === proposal.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <DollarSign className="w-4 h-4 mr-2" />
                                    )}
                                    Fund Moment
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
