import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/nativeWebApis";
import logo from "@/assets/promorang-logo-full.png";
import { useI18n } from "@/i18n/I18nContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone display mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check 7-day dismissal cooldown
    const lastDismissed = localStorage.getItem("promorang:pwa_prompt_dismissed");
    if (lastDismissed) {
      const daysSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return;
      }
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIOS && isSafari) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
        setDismissed(false);
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome beforeinstallprompt handler
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    triggerHaptic("medium");
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    setDismissed(true);
    setShowIOSPrompt(false);
    localStorage.setItem("promorang:pwa_prompt_dismissed", String(Date.now()));
  };

  if (dismissed || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <aside aria-label={t("pwa.installTitle")} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-[9998] md:left-auto md:right-6 md:bottom-6 md:w-96 rounded-3xl bg-popover text-popover-foreground border border-primary/30 p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 p-1.5 flex items-center justify-center shrink-0 shadow-md">
            <img src={logo} alt="Promorang" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">{t("pwa.installTitle")}</h4>
              <span className="flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-black text-primary font-mono">
                <Sparkles className="h-2 w-2" /> PWA
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-medium">
              {t("pwa.installSub")}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={t("pwa.dismiss")}
          onClick={handleDismiss}
          className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between gap-2">
        {showIOSPrompt ? (
          <p className="text-[11px] text-foreground flex items-center gap-1.5 font-medium">
            <span>Tap</span>
            <Share className="h-3.5 w-3.5 text-primary inline" />
            <span>then</span>
            <strong className="text-foreground font-bold">Add to Home Screen</strong>
            <PlusSquare className="h-3.5 w-3.5 text-primary inline" />
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground font-medium">{t("pwa.fastLightweight")}</p>
        )}

        {!showIOSPrompt && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-black font-black text-xs hover:bg-orange-400 transition-all shadow-[0_0_15px_rgba(255,106,0,0.4)] active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            {t("pwa.installButton")}
          </button>
        )}
      </div>
    </aside>
  );
}

export default PWAInstallPrompt;
