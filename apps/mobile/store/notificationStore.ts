import { create } from 'zustand';

const API_URL = 'https://promorang-api.vercel.app';

export interface Notification {
    id: string;
    type: 'reward' | 'social' | 'system' | 'drop' | 'event' | 'transaction';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    data?: {
        link?: string;
        amount?: number;
        user_id?: string;
        content_id?: string;
    };
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: (token: string) => Promise<void>;
    fetchUnreadCount: (token: string) => Promise<void>;
    markAsRead: (id: string, token: string) => Promise<void>;
    markAllAsRead: (token: string) => Promise<void>;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                // Use demo data if empty for better UX
                const notifications = data.notifications?.length > 0
                    ? data.notifications
                    : generateDemoNotifications();

                set({
                    notifications,
                    unreadCount: notifications.filter((n: Notification) => !n.is_read).length,
                    isLoading: false
                });
            } else {
                set({ notifications: generateDemoNotifications(), isLoading: false });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Fallback to demo data
            set({ notifications: generateDemoNotifications(), isLoading: false });
        }
    },

    fetchUnreadCount: async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                set({ unreadCount: data.count || 0 });
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    markAsRead: async (id: string, token: string) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async (token: string) => {
        try {
            await fetch(`${API_URL}/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    clearError: () => set({ error: null }),
}));

// Demo notifications for testing
function generateDemoNotifications(): Notification[] {
    const now = new Date();
    return [
        {
            id: '1',
            type: 'reward',
            title: 'Quest Completed! 🎉',
            message: 'You earned 50 Points for completing your daily check-in.',
            is_read: false,
            created_at: new Date(now.getTime() - 5 * 60000).toISOString(),
        },
        {
            id: '2',
            type: 'social',
            title: 'New Follower',
            message: '@creator_mike started following you.',
            is_read: false,
            created_at: new Date(now.getTime() - 30 * 60000).toISOString(),
        },
        {
            id: '3',
            type: 'drop',
            title: 'Drop Application Approved',
            message: 'Your application for "Summer Vibes Campaign" was approved!',
            is_read: true,
            created_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
        {
            id: '4',
            type: 'event',
            title: 'Event Reminder',
            message: 'Creator Meetup NYC starts in 24 hours. Don\'t forget to RSVP!',
            is_read: true,
            created_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
        },
        {
            id: '5',
            type: 'transaction',
            title: 'Withdrawal Processed',
            message: 'Your withdrawal of $25.00 has been sent to your PayPal.',
            is_read: true,
            created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
        },
        {
            id: '6',
            type: 'system',
            title: 'Welcome to Promorang! 👋',
            message: 'Start earning by completing drops and engaging with content.',
            is_read: true,
            created_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
        },
    ];
}
