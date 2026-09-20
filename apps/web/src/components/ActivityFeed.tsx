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

interface ActivityEvent {
    id: string;
    user_id: string;
    target_user_id?: string;
    event_type: "follow" | "join" | "comment" | "reaction" | "reward" | "check_in" | "system" | "low_stock" | "payout" | "budget_alert" | "redemption";
    entity_type?: string;
    entity_id?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    actor?: {
        full_name: string;
        avatar_url: string | null;
    };
}

interface ActivityFeedProps {
    events: ActivityEvent[];
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
    low_stock: Gift,
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

export function ActivityFeed({ events, className }: ActivityFeedProps) {
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
            case "follow": return `${actorName} started following you`;
            case "join": return `${actorName} joined your moment "${metadata.moment_title || "untitled"}"`;
            case "comment": return `${actorName} commented on your moment`;
            case "reaction": return `${actorName} reacted ${metadata.reaction || "❤️"} to your moment`;
            case "reward": return `Reward recorded: ${metadata.points || "value"}`;
            case "check_in": return `${actorName} checked in at your moment`;
            case "low_stock": return `Inventory alert: ${metadata.product_name || "item"} is running low`;
            case "payout": return `Payout update: ${metadata.amount || "amount"}`;
            case "budget_alert": return `Budget update: ${metadata.campaign_name || "campaign"}`;
            case "redemption": return `Redemption recorded for ${metadata.product_name || "item"}`;
            case "system": return metadata.message || "System notification";
            default: return "Activity recorded";
        }
    };

    const getEventLink = (event: ActivityEvent): string | null => {
        if (event.entity_type === "moment" && event.entity_id) return `/moments/${event.entity_id}`;
        if (event.event_type === "follow" && event.user_id) return `/profile/${event.user_id}`;
        return null;
    };

    return (
        <div className={cn("", className)}>
            <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Latest signals</h3>
                <span className="text-xs text-white/35">Recorded feed entries</span>
            </div>

            <div className="space-y-1">
                {events.map((event) => {
                    const Icon = eventIcons[event.event_type] || Bell;
                    const colorClass = eventColors[event.event_type] || "bg-gray-500";
                    const link = getEventLink(event);
                    const content = (
                        <div className={cn(
                            "flex items-start gap-4 border-b border-white/[0.07] p-4 transition-colors last:border-0 sm:p-5",
                            link && "cursor-pointer hover:bg-white/[0.04]"
                        )}>
                            <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-white", colorClass)}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm leading-snug text-white/70">{getEventMessage(event)}</p>
                                    <span className="flex-shrink-0 text-xs text-white/35">{formatTimeAgo(event.created_at)}</span>
                                </div>
                                {event.actor?.avatar_url ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={event.actor.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                                        <span className="text-xs text-muted-foreground">{event.actor.full_name}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );

                    return link ? <Link key={event.id} to={link}>{content}</Link> : <div key={event.id}>{content}</div>;
                })}
            </div>
        </div>
    );
}

export default ActivityFeed;
