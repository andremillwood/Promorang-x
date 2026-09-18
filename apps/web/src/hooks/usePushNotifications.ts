import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { requestWebPushPermission, urlBase64ToUint8Array, triggerHaptic } from "@/lib/nativeWebApis";
import { useToast } from "@/hooks/use-toast";

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) || "";

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
      if (!("serviceWorker" in navigator) || !user) {
        setIsSubscribed(false);
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return;
      }
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", user.id)
        .eq("endpoint", subscription.endpoint)
        .eq("is_active", true)
        .maybeSingle();
      setIsSubscribed(!error && Boolean(data?.endpoint));
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this browser or mode.",
        variant: "destructive",
      });
      return false;
    }
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in before registering this device for account notifications.",
        variant: "destructive",
      });
      return false;
    }
    if (!VAPID_PUBLIC_KEY) {
      toast({
        title: "Notifications are not configured",
        description: "This environment does not have a production push key configured. No subscription was created.",
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
          title: "Notifications not enabled",
          description: "Permission was not granted. You can continue without notifications.",
        });
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      const subJson = subscription.toJSON();
      if (!subJson.keys?.p256dh || !subJson.keys?.auth || !subJson.endpoint) {
        throw new Error("Browser push subscription is incomplete");
      }

      const { error: persistError } = await supabase.from("push_subscriptions").upsert(
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
      if (persistError) {
        await subscription.unsubscribe().catch(() => undefined);
        throw persistError;
      }

      setIsSubscribed(true);
      triggerHaptic("success");
      toast({
        title: "Notifications enabled",
        description: "This device is registered for supported Promorang account and Moment notifications.",
      });
      return true;
    } catch (error) {
      console.error("Push subscription error:", error);
      setIsSubscribed(false);
      toast({
        title: "Subscription failed",
        description: "The device was not fully registered for push notifications. Please try again later.",
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
        body: "This device can display Promorang notifications when a supported account or Moment event is sent.",
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
