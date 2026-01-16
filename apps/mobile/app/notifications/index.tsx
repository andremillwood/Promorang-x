import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, Gift, Users, Zap, Calendar, Wallet, CheckCheck, ArrowLeft } from 'lucide-react-native';
import { useNotificationStore, Notification } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { safeBack } from '@/lib/navigation';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'reward': return Gift;
        case 'social': return Users;
        case 'drop': return Zap;
        case 'event': return Calendar;
        case 'transaction': return Wallet;
        default: return Bell;
    }
};

const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'reward': return '#10B981';
        case 'social': return '#3B82F6';
        case 'drop': return '#8B5CF6';
        case 'event': return '#F59E0B';
        case 'transaction': return '#06B6D4';
        default: return colors.primary;
    }
};

const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function NotificationsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const loadNotifications = useCallback(async () => {
        if (token) {
            await fetchNotifications(token);
        }
    }, [token, fetchNotifications]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = (notification: Notification) => {
        if (!notification.is_read && token) {
            markAsRead(notification.id, token);
        }
        // Navigate based on notification type/data
        // For now, just mark as read
    };

    const handleMarkAllRead = () => {
        if (token && unreadCount > 0) {
            markAllAsRead(token);
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const IconComponent = getNotificationIcon(item.type);
        const iconColor = getNotificationColor(item.type);

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <Card
                    style={[
                        styles.notificationCard,
                        {
                            backgroundColor: item.is_read ? theme.card : theme.surface,
                            borderColor: item.is_read ? theme.border : iconColor + '30',
                            borderLeftWidth: item.is_read ? 1 : 3,
                            borderLeftColor: item.is_read ? theme.border : iconColor,
                        }
                    ]}
                >
                    <View style={styles.notificationContent}>
                        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                            <IconComponent size={20} color={iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text style={[
                                    styles.title,
                                    { color: theme.text },
                                    !item.is_read && styles.unreadTitle
                                ]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {!item.is_read && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
                                {item.message}
                            </Text>
                            <Text style={[styles.time, { color: theme.textSecondary }]}>
                                {formatTimeAgo(item.created_at)}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (isLoading && notifications.length === 0) {
        return <LoadingIndicator fullScreen text="Loading notifications..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Notifications',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: '700' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => safeBack(router)} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => unreadCount > 0 ? (
                        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                            <CheckCheck size={20} color={colors.primary} />
                            <Text style={styles.markAllText}>Mark all</Text>
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            {unreadCount > 0 && (
                <View style={[styles.unreadBanner, { backgroundColor: colors.primary + '10' }]}>
                    <Bell size={16} color={colors.primary} />
                    <Text style={styles.unreadBannerText}>
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Notifications"
                        description="You're all caught up! Check back later for updates."
                        icon={<Bell size={48} color={theme.textSecondary} />}
                        style={styles.emptyState}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        marginLeft: 8,
        padding: 8,
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        gap: 4,
    },
    markAllText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    unreadBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    unreadBannerText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    notificationCard: {
        marginBottom: 12,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
    },
    emptyState: {
        marginTop: 80,
    },
});
