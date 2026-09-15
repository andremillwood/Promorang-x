import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resolveNotificationJourney } from "@promorang/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
  type Notification,
} from "@/hooks/useNotifications";

type ProductionNotificationMenuProps = {
  tone?: "app" | "dark";
  className?: string;
};

function relativeAge(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1d ago" : `${days}d ago`;
}

function destinationFor(notification: Notification) {
  return resolveNotificationJourney({
    type: notification.type,
    relatedId: notification.related_id,
  }).destination;
}

export function ProductionNotificationMenu({ tone = "app", className }: ProductionNotificationMenuProps) {
  const navigate = useNavigate();
  const notificationsQuery = useNotifications();
  const unreadQuery = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsQuery.data || [];
  const unreadCount = unreadQuery.data || 0;
  const hasError = notificationsQuery.isError || unreadQuery.isError;
  const isDark = tone === "dark";

  const openNotification = (notification: Notification) => {
    const destination = destinationFor(notification);
    if (!notification.is_read) markAsRead.mutate(notification.id);
    navigate(destination);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className={cn(
          "relative rounded-full p-2 outline-none transition-colors",
          isDark ? "text-white/65 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          className,
        )}
      >
        <Bell className="h-4 w-4" />
        {!hasError && unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black leading-none text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-80 overflow-hidden rounded-2xl border p-2 shadow-2xl",
          isDark ? "border-white/10 bg-[#111] text-white" : "border-border/60 bg-popover text-popover-foreground",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <div>
            <p className={cn("text-xs font-black uppercase tracking-wider", isDark ? "text-white/70" : "text-muted-foreground")}>Notifications</p>
            <p className={cn("mt-0.5 text-[10px]", isDark ? "text-white/40" : "text-muted-foreground")}>
              {hasError ? "Account activity could not be loaded." : unreadCount > 0 ? `${unreadCount} unread` : "You're up to date."}
            </p>
          </div>
          {!hasError && unreadCount > 0 ? (
            <button
              type="button"
              disabled={markAllAsRead.isPending}
              onClick={() => markAllAsRead.mutate()}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition disabled:opacity-50",
                isDark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <CheckCheck className="h-3 w-3" />
              Mark read
            </button>
          ) : null}
        </div>

        <DropdownMenuSeparator className={isDark ? "bg-white/10" : undefined} />

        {hasError ? (
          <div className={cn("px-3 py-5 text-center text-xs leading-5", isDark ? "text-white/55" : "text-muted-foreground")}>
            Notifications are unavailable right now. No unread state is being inferred.
          </div>
        ) : notificationsQuery.isLoading ? (
          <div className={cn("px-3 py-5 text-center text-xs", isDark ? "text-white/45" : "text-muted-foreground")}>Checking account activity…</div>
        ) : notifications.length === 0 ? (
          <div className={cn("px-3 py-5 text-center text-xs leading-5", isDark ? "text-white/50" : "text-muted-foreground")}>
            No account notifications yet.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={() => openNotification(notification)}
                className={cn(
                  "my-0.5 cursor-pointer items-start gap-2.5 rounded-xl p-2.5",
                  isDark ? "focus:bg-white/10" : "focus:bg-muted",
                  !notification.is_read && (isDark ? "bg-white/[0.06]" : "bg-primary/5"),
                )}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", notification.is_read ? "bg-transparent" : "bg-primary")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold leading-5">{notification.title}</span>
                  {notification.message ? (
                    <span className={cn("mt-0.5 line-clamp-2 block text-[11px] leading-4", isDark ? "text-white/50" : "text-muted-foreground")}>{notification.message}</span>
                  ) : null}
                  <span className={cn("mt-1 block text-[10px]", isDark ? "text-white/35" : "text-muted-foreground")}>{relativeAge(notification.created_at)}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator className={isDark ? "bg-white/10" : undefined} />
        <button
          type="button"
          onClick={() => navigate("/activity")}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-center text-xs font-bold transition",
            isDark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          View all activity →
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProductionNotificationMenu;
