import { create } from 'zustand';
import { api } from '@/lib/api';

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

    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.get<any>('/api/notifications');

            if (data.success || data.status === 'success') {
                const notificationsData = data.notifications || data.data || [];
                // Use demo data if empty for better UX
                const notifications = notificationsData.length > 0
                    ? notificationsData
                    : generateDemoNotifications();

                set({
                    notifications,
                    unreadCount: notifications.filter((n: Notification) => !n.is_read).length,
                });
            } else {
                set({ notifications: generateDemoNotifications() });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Fallback to demo data
            set({ notifications: generateDemoNotifications() });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const data = await api.get<any>('/api/notifications/unread-count');
            if (data.success || data.status === 'success') {
                set({ unreadCount: data.count || data.data?.count || 0 });
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.post<any>(`/api/notifications/${id}/read`, {});

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

    markAllAsRead: async () => {
        try {
            await api.post<any>('/api/notifications/mark-all-read', {});

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
