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

interface NotificationApiResponse {
    success?: boolean;
    status?: string;
    error?: string;
    notifications?: Notification[];
    data?: Notification[] | { count?: number };
    count?: number;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.get<NotificationApiResponse>('/api/notifications');

            if (data.success || data.status === 'success') {
                const notificationsData = data.notifications || (Array.isArray(data.data) ? data.data : []);
                set({
                    notifications: notificationsData,
                    unreadCount: notificationsData.filter((n: Notification) => !n.is_read).length,
                });
            } else {
                set({ notifications: [], unreadCount: 0, error: 'Notifications are unavailable.' });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ notifications: [], unreadCount: 0, error: 'Notifications are unavailable.' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const data = await api.get<NotificationApiResponse>('/api/notifications/unread-count');
            if (data.success || data.status === 'success') {
                const nestedCount = !Array.isArray(data.data) ? data.data?.count : undefined;
                set({ unreadCount: data.count || nestedCount || 0 });
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            set({ error: 'Unread notification count is unavailable.' });
        }
    },

    markAsRead: async (id: string) => {
        try {
            const data = await api.post<NotificationApiResponse>(`/api/notifications/${id}/read`, {});
            if (!data.success && data.status !== 'success') throw new Error(data.error || 'Notification update failed');

            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            set({ error: 'Notification could not be marked as read.' });
        }
    },

    markAllAsRead: async () => {
        try {
            const data = await api.post<NotificationApiResponse>('/api/notifications/mark-all-read', {});
            if (!data.success && data.status !== 'success') throw new Error(data.error || 'Notification update failed');

            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            set({ error: 'Notifications could not be marked as read.' });
        }
    },

    clearError: () => set({ error: null }),
}));
