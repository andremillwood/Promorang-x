/**
 * Utility functions leveraging Native Mobile Web Browser APIs.
 */

// 1. Web Share API
export async function shareContent(data: { title: string; text?: string; url?: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Native share error:', err);
      }
    }
  }

  // Fallback to clipboard
  if (data.url && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(data.url);
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }
  return false;
}

// 2. Web Haptics / Vibration API
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(20);
      break;
    case 'heavy':
      navigator.vibrate(35);
      break;
    case 'success':
      navigator.vibrate([10, 30, 20]);
      break;
    case 'warning':
      navigator.vibrate([30, 50, 30]);
      break;
  }
}

// 3. Web Push Notifications Permission
export async function requestWebPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// 4. Mobile Camera Stream for QR / Media Verification
export async function requestCameraStream(): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
  } catch (err) {
    console.error('Camera access error:', err);
    return null;
  }
}
