import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    UserPlus,
    MessageCircle,
    Heart,
    Calendar,
    Gift,
    CheckCircle,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActivityEvent {
    id: string;
    user_id: string;
    target_user_id?: string;
    event_type: "follow" | "join" | "comment" | "reaction" | "reward" | "check_in" | "system" | "low_stock" | "payout" | "budget_alert" | "redemption";
    entity_type?: string;
    entity_id?: string;
    metadata: Record<string, unknown>;
    read_at?: string;
    created_at: string;
    actor?: {
        full_name: string;
        avatar_url: string | null;
    };
}

interface ActivityFeedProps {
    events: ActivityEvent[];
    onMarkRead?: (eventId: string) => void;
    onMarkAllRead?: () => void;
    className?: string;
}

const eventIcons: Record<string, typeof UserPlus> = {
    follow: UserPlus,
    join: Calendar,
    comment: MessageCircle,
    reaction: Heart,
    reward: Gift,
    check_in: CheckCircle,
    system: Bell,
    low_stock: Gift, // Shopping cart or alert icon would be better but keeping simple
    payout: CheckCircle,
    budget_alert: Bell,
    redemption: Gift
};

const eventColors: Record<string, string> = {
    follow: "bg-blue-500",
    join: "bg-green-500",
    comment: "bg-purple-500",
    reaction: "bg-rose-500",
    reward: "bg-amber-500",
    check_in: "bg-emerald-500",
};

/**
 * Activity feed component showing user notifications
 * Inspired by Twitter/Instagram notification patterns
 */
export function ActivityFeed({
    events: initialEvents,
    onMarkRead,
    onMarkAllRead,
    className,
}: ActivityFeedProps) {
    const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
    const unreadCount = events.filter(e => !e.read_at).length;

    const handleMarkRead = (eventId: string) => {
        setEvents(prev => prev.map(e =>
            e.id === eventId ? { ...e, read_at: new Date().toISOString() } : e
        ));
        onMarkRead?.(eventId);
    };

    const handleMarkAllRead = () => {
        setEvents(prev => prev.map(e => ({ ...e, read_at: new Date().toISOString() })));
        onMarkAllRead?.();
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    const getEventMessage = (event: ActivityEvent): string => {
        const actorName = event.actor?.full_name || "Someone";
        const metadata = event.metadata as Record<string, string>;

        switch (event.event_type) {
            case "follow":
                return `${actorName} started following you`;
            case "join":
                return `${actorName} joined your moment "${metadata.moment_title || "untitled"}"`;
            case "comment":
                return `${actorName} commented on your moment`;
            case "reaction":
                return `${actorName} reacted ${metadata.reaction || "❤️"} to your moment`;
            case "reward":
                return `You earned ${metadata.points || "some"} points!`;
            case "check_in":
                return `${actorName} checked in at your moment`;
            case "low_stock":
                return `Inventory Alert: ${metadata.product_name} is running low (${metadata.stock_level} left)`;
            case "payout":
                return `Payout Processed: $${metadata.amount} has been sent to your account`;
            case "budget_alert":
                return `Budget Alert: Your campaign "${metadata.campaign_name}" has reached ${metadata.percent}% of its budget`;
            case "redemption":
                return `Redemption: ${metadata.product_name} was redeemed by ${actorName}`;
            case "system":
                return metadata.message as string || "System notification";
            default:
                return "New activity";
        }
    };

    const getEventLink = (event: ActivityEvent): string | null => {
        const metadata = event.metadata as Record<string, string>;

        if (event.entity_type === "moment" && event.entity_id) {
            return `/moments/${event.entity_id}`;
        }
        if (event.event_type === "follow" && event.user_id) {
            return `/profile/${event.user_id}`;
        }
        return null;
    };

    return (
        <div className={cn("", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Activity</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Events List */}
            <div className="space-y-1">
                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No activity yet</p>
                        <p className="text-sm text-muted-foreground/70">
                            When people interact with your moments, you'll see it here
                        </p>
                    </div>
                ) : (
                    events.map(event => {
                        const Icon = eventIcons[event.event_type] || Bell;
                        const colorClass = eventColors[event.event_type] || "bg-gray-500";
                        const link = getEventLink(event);
                        const isUnread = !event.read_at;

                        const content = (
                            <div
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl transition-colors",
                                    isUnread ? "bg-primary/5" : "hover:bg-secondary/50",
                                    link && "cursor-pointer"
                                )}
                                onClick={() => isUnread && handleMarkRead(event.id)}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white",
                                    colorClass
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn(
                                            "text-sm leading-snug",
                                            isUnread ? "font-medium" : "text-muted-foreground"
                                        )}>
                                            {getEventMessage(event)}
                                        </p>
                                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                                            {formatTimeAgo(event.created_at)}
                                        </span>
                                    </div>

                                    {/* Actor Avatar if available */}
                                    {event.actor?.avatar_url && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img
                                                src={event.actor.avatar_url}
                                                alt=""
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {event.actor.full_name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Unread indicator */}
                                {isUnread && (
                                    <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                                )}
                            </div>
                        );

                        return link ? (
                            <Link key={event.id} to={link}>
                                {content}
                            </Link>
                        ) : (
                            <div key={event.id}>{content}</div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ActivityFeed;
