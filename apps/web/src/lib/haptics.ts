/**
 * Native Web Haptics Utility
 * Taps into mobile hardware vibration API (navigator.vibrate) for tactile feedback.
 */

type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

export const triggerHaptic = (style: HapticStyle = "light"): void => {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (style) {
      case "selection":
        navigator.vibrate(8);
        break;
      case "light":
        navigator.vibrate(12);
        break;
      case "medium":
        navigator.vibrate(25);
        break;
      case "heavy":
        navigator.vibrate(40);
        break;
      case "success":
        navigator.vibrate([15, 40, 20]);
        break;
      case "warning":
        navigator.vibrate([25, 60, 25]);
        break;
      case "error":
        navigator.vibrate([40, 80, 40, 80, 40]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Ignore unsupported or user-restricted vibration calls
  }
};
