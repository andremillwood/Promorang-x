import * as Notifications from 'expo-notifications';
import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { resolveNotificationJourney } from '@promorang/shared';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { rememberPendingNavigation } from '@/lib/pendingNavigation';

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
  const { session, isLoading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const open = async (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const destination = destinationFor(response.notification.request.content.data);
      if (!destination) return;

      // If auth/setup state is known to require a gate, persist the notification
      // job before navigating. If state is still hydrating, the root gate will
      // capture the destination after this push if a gate is actually needed.
      if (!isLoading && !onboardingLoading && (!session || !onboardingCompleted)) {
        await rememberPendingNavigation(String(destination));
      }
      router.push(destination);
    };

    void Notifications.getLastNotificationResponseAsync().then(open);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void open(response);
    });
    return () => subscription.remove();
  }, [router, session, isLoading, onboardingCompleted, onboardingLoading]);

  return null;
}
