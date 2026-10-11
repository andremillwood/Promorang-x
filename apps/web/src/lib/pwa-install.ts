export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let pending: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
// Capture independently of route eligibility and React mounting: the browser may
// emit this once while the user is on an auth or otherwise suppressed route.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    pending = event as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => { pending = null; emit(); });
}
export const subscribeInstallPrompt = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const getInstallPrompt = () => pending;
export const clearInstallPrompt = () => { pending = null; emit(); };
export const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
