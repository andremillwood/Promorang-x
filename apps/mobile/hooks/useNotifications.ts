import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * useNotifications.ts
 * 
 * Foundational hook for proactive user engagement.
 * Handles permission states and provides methods to trigger sample alerts.
 */

export function useNotifications() {
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

    useEffect(() => {
        async function checkPermissions() {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            setPermissionStatus(finalStatus);
        }

        if (Platform.OS !== 'web') {
            checkPermissions();
        }
    }, []);

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
        sendLocalNotification,
    };
}
