import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export default function ProposalWorkspace() {
    const { user, activeRole, activeOrgId } = useAuth();

    const { data: proposals, isLoading } = useQuery({
        queryKey: ["proposals", activeOrgId],
        queryFn: async () => {
            if (!activeOrgId) return [];
            const { data, error } = await supabase
                .from("proposals")
                .select(`
          *,
          brand:brand_id (name)
        `)
                .or(`planner_id.eq.${user?.id},brand_id.eq.${activeOrgId}`)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user && !!activeOrgId,
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "sent": return <Send className="w-4 h-4 text-blue-500" />;
            case "review": return <Clock className="w-4 h-4 text-orange-500" />;
            case "approved": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "rejected": return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <FileText className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Proposal Workspace</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage your service proposals and collaborations.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
                    <TabsTrigger value="sent" className="rounded-lg px-6">Sent</TabsTrigger>
                    <TabsTrigger value="in_review" className="rounded-lg px-6">In Review</TabsTrigger>
                    <TabsTrigger value="approved" className="rounded-lg px-6">Approved</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 gap-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="animate-pulse h-24 bg-muted/40" />
                            ))
                        ) : proposals?.length === 0 ? (
                            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">No proposals found</h3>
                                <p className="text-muted-foreground">Sent proposals will appear here.</p>
                            </div>
                        ) : (
                            proposals?.map((proposal) => (
                                <Card key={proposal.id} className="group hover:border-primary/50 transition-all duration-300 shadow-soft bg-card/60 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    {getStatusIcon(proposal.status || "draft")}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{proposal.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{proposal.brand?.name || "Open Proposal"}</span>
                                                        <span>•</span>
                                                        <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <div className="font-bold text-foreground">
                                                        {proposal.budget ? `$${proposal.budget.toLocaleString()}` : "Custom"}
                                                    </div>
                                                    <Badge variant="outline" className="capitalize text-[10px]">
                                                        {proposal.status}
                                                    </Badge>
                                                </div>
                                                <Button variant="outline" size="icon" className="rounded-xl">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
