import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { requestWebPushPermission, urlBase64ToUint8Array, triggerHaptic } from "@/lib/nativeWebApis";
import { useToast } from "@/hooks/use-toast";

// Public VAPID Key for Promorang Web Push (fallback demo key)
const DEFAULT_VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, [user]);

  const checkExistingSubscription = async () => {
    try {
      if (!("serviceWorker" in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this browser/mode.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    triggerHaptic("medium");

    try {
      const granted = await requestWebPushPermission();
      setPermission(Notification.permission);

      if (!granted) {
        toast({
          title: "Permission Required",
          description: "Please allow notifications in your browser settings to receive live alerts.",
        });
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      setIsSubscribed(true);

      // Save subscription to Supabase if authenticated
      if (user && subscription) {
        const subJson = subscription.toJSON();
        if (subJson.keys?.p256dh && subJson.keys?.auth && subJson.endpoint) {
          await supabase.from("push_subscriptions").upsert(
            {
              user_id: user.id,
              endpoint: subJson.endpoint,
              p256dh: subJson.keys.p256dh,
              auth: subJson.keys.auth,
              user_agent: navigator.userAgent,
              is_active: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "endpoint" }
          );
        }
      }

      triggerHaptic("success");
      toast({
        title: "🔔 Notifications Enabled!",
        description: "You will now receive live alerts for upcoming Moments, Gems, and RSVPs.",
      });

      return true;
    } catch (error) {
      console.error("Push subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Could not complete push subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, user, toast]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    triggerHaptic("light");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);

        if (user) {
          await supabase
            .from("push_subscriptions")
            .update({ is_active: false })
            .eq("endpoint", subscription.endpoint);
        }

        toast({
          title: "Notifications Disabled",
          description: "Push notifications have been turned off for this device.",
        });
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const sendTestNotification = useCallback(async () => {
    triggerHaptic("medium");
    try {
      if (!("serviceWorker" in navigator)) return;
      const registration = await navigator.serviceWorker.ready;

      if (Notification.permission !== "granted") {
        await subscribe();
      }

      await registration.showNotification("✨ Promorang Test Alert", {
        body: "Your device is successfully connected! You'll receive live Moment and Gem alerts here.",
        icon: "/apple-touch-icon.png",
        badge: "/favicon.png",
        data: { url: "/wallet" },
      });

      triggerHaptic("success");
      toast({
        title: "Test Alert Sent!",
        description: "Check your phone lock screen or notification tray.",
      });
    } catch (error) {
      console.error("Test notification error:", error);
      toast({
        title: "Error Sending Test",
        description: "Make sure notifications are allowed in device settings.",
        variant: "destructive",
      });
    }
  }, [subscribe, toast]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
