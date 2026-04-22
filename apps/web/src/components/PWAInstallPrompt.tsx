import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "promorang_install_prompt_dismissed";

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      showTimer = setTimeout(() => setIsVisible(true), 12000);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setIsVisible(false);
      localStorage.setItem(DISMISS_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  const handleInstall = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      setIsVisible(false);
      localStorage.setItem(DISMISS_KEY, "true");
    }
  };

  if (!isVisible || !installEvent) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 pb-safe sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-elevated backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Install Promorang</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add it to your home screen for faster launch, app-like navigation, and offline-ready basics.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="hero" className="flex-1" onClick={handleInstall}>
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
