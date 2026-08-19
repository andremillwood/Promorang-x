import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiRequest } from './api';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushTokenResult {
  token: string | null;
  platform: 'android' | 'ios' | 'web';
  error?: string;
}

/**
 * Register the device for push notifications (FCM on Android, APNs on iOS)
 */
export async function registerForPushNotificationsAsync(): Promise<PushTokenResult> {
  if (Platform.OS === 'web') {
    return { token: null, platform: 'web', error: 'Push notifications handled via Web Push API on web' };
  }

  if (!Device.isDevice) {
    return { token: null, platform: Platform.OS as 'android' | 'ios', error: 'Must use physical device for Push Notifications' };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { token: null, platform: Platform.OS as 'android' | 'ios', error: 'Permission not granted for push notifications' };
    }

    // Android channel configuration for FCM notifications
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('promorang-updates', {
        name: 'Promorang Updates & Rewards',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6A00',
        sound: 'default',
      });
    }

    // Fetch Expo Push Token (which routes through FCM on Android)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Send token to Promorang backend
    try {
      await apiRequest('/api/notifications/register-device', {
        method: 'POST',
        body: JSON.stringify({
          push_token: token,
          platform: Platform.OS,
          device_name: Device.modelName || 'Mobile Device',
        }),
      });
    } catch (err) {
      console.warn('Failed to sync push token with backend:', err);
    }

    return { token, platform: Platform.OS as 'android' | 'ios' };
  } catch (err) {
    console.error('Error registering for push notifications:', err);
    return {
      token: null,
      platform: Platform.OS as 'android' | 'ios',
      error: err instanceof Error ? err.message : 'Registration failed',
    };
  }
}
