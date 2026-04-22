import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Filter, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";

const filterOptions = [
    { value: "all", label: "All" },
    { value: "system", label: "System Alerts" },
    { value: "payout", label: "Payouts" },
    { value: "inventory", label: "Inventory" },
    { value: "social", label: "Social" },
];

const Activity = () => {
    const { user, roles } = useAuth();
    const primaryRole = roles[0] || "participant";
    const [filter, setFilter] = useState("all");

    const { data: events, isLoading, refetch } = useQuery({
        queryKey: ["personalized-feed", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch personalized feed from followed users
            const { data: feedData, error: feedError } = await supabase.rpc(
                'fn_get_personalized_feed',
                {
                    p_user_id: user.id,
                    p_limit: 50,
                    p_offset: 0
                }
            );

            if (feedError) {
                console.error('Feed error:', feedError);
                // Fallback: just return empty array if function doesn't exist yet
                return [];
            }

            // Map feed data to ActivityFeed format
            const feedEvents = (feedData || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                event_type: item.activity_type,
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                created_at: item.created_at,
                actor: {
                    full_name: item.user_name,
                    avatar_url: item.user_avatar
                },
                metadata: {
                    likes_count: item.likes_count,
                    comments_count: item.comments_count,
                    source_id: item.source_id,
                    source_table: item.source_table
                }
            }));

            return feedEvents;
        },
        enabled: !!user
    });

    const filteredEvents = (events || []).filter(e => {
        if (filter === "all") return true;
        if (filter === "system") return ["low_stock", "budget_alert", "system", "notification"].includes(e.event_type);
        if (filter === "payout") return e.event_type === "payout";
        if (filter === "inventory") return e.event_type === "low_stock";
        if (filter === "social") return ["follow", "join", "comment", "reaction", "reward", "post", "drop_completion"].includes(e.event_type);
        return true;
    });

    const handleMarkRead = async (eventId: string) => {
        // Optimistically update or refetch
        // We could also call an API to mark as read
        refetch();
    };

    const handleMarkAllRead = async () => {
        // Logic to mark all as read
        refetch();
    };

    return (
        <main className="max-w-2xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl font-bold">Activity Log</h1>
                        <p className="text-sm text-muted-foreground">
                            History of your notifications and alerts
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border hover:bg-muted"
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Activity Feed */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading your feed...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">Your feed is empty</h3>
                        <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                            Follow creators and hosts to see their moments in your personalized feed
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button asChild variant="outline" size="sm">
                                <Link to="/search?category=user">Find People</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to="/following">Your Following</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-2">
                        <ActivityFeed
                            events={filteredEvents}
                            onMarkRead={handleMarkRead}
                            onMarkAllRead={handleMarkAllRead}
                        />
                    </div>
                )}
            </div>
        </main>
    );
};

export default Activity;
