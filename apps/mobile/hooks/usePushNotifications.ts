import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';

// Note: Push notifications require a development build in SDK 53+
// This is a simplified version that works with Expo Go
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const { user } = useAuthStore();

    async function registerForPushNotificationsAsync() {
        let token;

        // Skip on simulators and in Expo Go (SDK 53+ doesn't support remote notifications in Expo Go)
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return undefined;
        }

        if (Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            } catch (e) {
                console.log('Failed to set notification channel:', e);
            }
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Push notification permission not granted');
                return undefined;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                console.log('No projectId found - push notifications require EAS configuration');
                return undefined;
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (e) {
            console.log('Failed to get push token:', e);
            return undefined;
        }

        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token) {
                console.log('Expo Push Token:', token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
        });

        return () => {
            // Use the modern cleanup API
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
}
