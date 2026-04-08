import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FileText, CheckCircle, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Moment = Tables<"moments">;

export default function ProposalsDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProposals();
        }
    }, [user]);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("moments")
                .select("*")
                .eq("organizer_id", user?.id)
                .in("status", ["draft", "submitted", "reviewed", "approved_unfunded", "funded"])
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProposals(data || []);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline" className="bg-secondary/50">Draft</Badge>;
            case "submitted":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Submitted</Badge>;
            case "reviewed":
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Under Review</Badge>;
            case "funded":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Funded & Live</Badge>;
            case "approved_unfunded":
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Approved (Needs Funding)</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
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
                    <h2 className="text-2xl font-serif font-bold">My Proposals</h2>
                    <p className="text-muted-foreground">Track the status of your proposed moments.</p>
                </div>
                <Button onClick={() => navigate("/propose/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Proposal
                </Button>
            </div>

            {proposals.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Have an idea for a Moment? Submit a proposal and get funded by brands.
                        </p>
                        <Button onClick={() => navigate("/propose")} variant="outline">
                            Start a Draft
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {proposals.map((proposal) => (
                        <Card key={proposal.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{proposal.title}</h3>
                                            {getStatusBadge(proposal.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {proposal.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Created {new Date(proposal.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Type: {proposal.type || "Community"}
                                            </div>
                                        </div>
                                    </div>

                                    {proposal.status === 'draft' && (
                                        <Button variant="ghost" size="sm" onClick={() => navigate("/propose")}>
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
