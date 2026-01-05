import { useState, useEffect } from 'react';
import { Bell, X, Check, Trophy, Star, Coins, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
<<<<<<< HEAD:frontend/src/react-app/components/NotificationCenter.tsx
import { apiFetch } from '@/lib/api';
=======
import ModalBase from '@/react-app/components/ModalBase';
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/components/NotificationCenter.tsx

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  metadata?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiFetch('/api/notifications/read-all', {
        method: 'POST'
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
      case 'drop_approved':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'reward':
        return <Coins className="w-5 h-5 text-blue-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'social':
        return <Star className="w-5 h-5 text-pink-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-pr-text-2" />;
    }
  };

  const formatTimestamp = (timestampStr: string) => {
    const timestamp = new Date(timestampStr);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${Math.max(0, minutes)}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-xl bg-pr-surface-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pr-surface-3 px-6 py-6">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-pr-text-1">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="border-b border-pr-border px-6 py-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <p className="text-sm text-pr-text-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium text-pr-text-1">No notifications</h3>
              <p className="text-sm text-pr-text-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
<<<<<<< HEAD:frontend/src/react-app/components/NotificationCenter.tsx
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
=======
                  className={`cursor-pointer p-4 transition-colors hover:bg-pr-surface-2 ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/components/NotificationCenter.tsx
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
                    // Handle navigation if needed
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
<<<<<<< HEAD:frontend/src/react-app/components/NotificationCenter.tsx
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimestamp(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'
                        }`}>
=======
                        <h4
                          className={`text-sm font-medium ${
                            !notification.read ? 'text-pr-text-1' : 'text-pr-text-1'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="ml-2 whitespace-nowrap text-xs text-pr-text-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          !notification.read ? 'text-pr-text-1' : 'text-pr-text-2'
                        }`}
                      >
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/components/NotificationCenter.tsx
                        {notification.message}
                      </p>
                      {notification.metadata && (
                        <div className="mt-2 flex items-center space-x-4">
<<<<<<< HEAD:frontend/src/react-app/components/NotificationCenter.tsx
                          {notification.metadata.gold_reward && (
                            <div className="flex items-center space-x-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                              <Trophy className="w-3 h-3" />
                              <span>+{notification.metadata.gold_reward} Gold</span>
                            </div>
                          )}
                          {notification.metadata.gems_earned && (
                            <div className="flex items-center space-x-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                              <Coins className="w-3 h-3" />
                              <span>+{notification.metadata.gems_earned} Gems</span>
=======
                          {notification.data.gold_reward && (
                            <div className="flex items-center space-x-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                              <Trophy className="h-3 w-3" />
                              <span>+{notification.data.gold_reward} Gold</span>
                            </div>
                          )}
                          {notification.data.points_earned && (
                            <div className="flex items-center space-x-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              <Coins className="h-3 w-3" />
                              <span>+{notification.data.points_earned} Points</span>
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/components/NotificationCenter.tsx
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-pr-surface-3 bg-pr-surface-2 px-4 py-4">
          <p className="text-center text-xs text-pr-text-2">
            Stay tuned for more updates and achievements!
          </p>
        </div>
      </div>
    </ModalBase>
  );
}
