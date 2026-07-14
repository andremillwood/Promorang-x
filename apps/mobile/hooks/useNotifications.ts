import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest } from '@/lib/api';

/**
 * useNotifications.ts
 * 
 * Foundational hook for proactive user engagement.
 * Checks permission without prompting on launch. The system prompt is shown
 * only after the user explicitly enables notifications in Settings.
 */

export function useNotifications() {
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

    useEffect(() => {
        async function checkPermissions() {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            setPermissionStatus(existingStatus);
        }

        if (Platform.OS !== 'web') {
            checkPermissions();
        }
    }, []);

    const enableNotifications = async () => {
        if (Platform.OS === 'web') return { enabled: false, error: 'Push notifications require the mobile app.' };
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') return { enabled: false, error: 'Notification permission was not granted.' };

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
            if (!projectId) throw new Error('The Expo project ID is not configured yet.');
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            await apiRequest('/api/notifications/push-token', {
                method: 'POST',
                body: JSON.stringify({ push_token: token }),
            });
            return { enabled: true, error: null };
        } catch (error) {
            return { enabled: false, error: error instanceof Error ? error.message : 'Could not register notifications.' };
        }
    };

    const sendLocalNotification = async (title: string, body: string, data = {}) => {
        if (permissionStatus !== 'granted') return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // deliver immediately
        });
    };

    return {
        permissionStatus,
        enableNotifications,
        sendLocalNotification,
    };
}
