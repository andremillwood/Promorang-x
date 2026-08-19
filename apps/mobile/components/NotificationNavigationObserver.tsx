import * as Notifications from 'expo-notifications';
import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { resolveNotificationJourney } from '@promorang/shared';

type NotificationData = Record<string, unknown>;

function destinationFor(data: NotificationData): Href | null {
  const stringValue = (value: unknown) => typeof value === 'string' ? value : null;
  return resolveNotificationJourney({
    type: stringValue(data.type || data.notification_type), relatedId: stringValue(data.related_id || data.relatedId),
    route: stringValue(data.route || data.path || data.href), momentId: stringValue(data.moment_id || data.momentId),
    memoryId: stringValue(data.memory_id || data.memoryId), sceneSlug: stringValue(data.scene_slug || data.sceneSlug),
    receiptId: stringValue(data.receipt_id || data.receiptId), proposalId: stringValue(data.proposal_id || data.proposalId), productId: stringValue(data.product_id || data.productId),
  }).destination as Href;
}

export function NotificationNavigationObserver() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const destination = destinationFor(response.notification.request.content.data);
      if (destination) router.push(destination);
    };

    void Notifications.getLastNotificationResponseAsync().then(open);
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [router]);

  return null;
}
