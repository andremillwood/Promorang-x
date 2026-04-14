import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Filter, Loader2 } from "lucide-react";
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
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // 1. Fetch system notifications from email_logs
            const { data: emailLogs, error: emailError } = await supabase
                .from('email_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (emailError) throw emailError;

            // Map email logs to notification events
            const systemEvents = emailLogs.map((log: any) => ({
                id: log.id,
                user_id: user.id,
                event_type: log.email_type as any, // Map 'low_stock', 'payout', etc.
                metadata: log.template_data || {},
                created_at: log.created_at,
                read_at: log.opened_at, // Use opened_at as read_at
                actor: { full_name: "System", avatar_url: null }
            }));

            // 2. Fetch social activities (optional for now, or use existing notifications table)
            // Assuming a table 'notifications' exists for in-app social alerts
            const { data: socialNotifications } = await supabase
                .from('notifications' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const socialEvents = (socialNotifications || []).map((notif: any) => ({
                ...notif,
                event_type: notif.type // Mapping 'follow', 'join', etc.
            }));

            // Combine and sort
            return [...systemEvents, ...socialEvents].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        },
        enabled: !!user
    });

    const filteredEvents = (events || []).filter(e => {
        if (filter === "all") return true;
        if (filter === "system") return ["low_stock", "budget_alert", "system"].includes(e.event_type);
        if (filter === "payout") return e.event_type === "payout";
        if (filter === "inventory") return e.event_type === "low_stock";
        if (filter === "social") return ["follow", "join", "comment", "reaction", "reward"].includes(e.event_type);
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
                        <p>Loading your history...</p>
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
