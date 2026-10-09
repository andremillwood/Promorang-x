import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/nativeWebApis";
import logo from "@/assets/promorang-logo-full.png";
import { useI18n } from "@/i18n/I18nContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isParticipantWorldRoute } from "@/lib/participant-world-route";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_DISMISSAL_KEY = "promorang:pwa_prompt_dismissed:mobile-home-v2";

export function PWAInstallPrompt() {
  const { t: webT } = useI18n();
  const { t } = useI18n();
  const location = useLocation();
  const { activeRole } = useAuth();
  const suppressedForParticipantWorld = location.pathname === "/" || isParticipantWorldRoute(
    location.pathname,
    location.search,
    activeRole,
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (suppressedForParticipantWorld) return;
    if (window.location.pathname.startsWith("/app-preview") || window.location.pathname.startsWith("/drop/")) {
      return;
    }

    // Check if running in standalone display mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    const isMobileBrowser = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    if (!isMobileBrowser) return;

    // Check 7-day dismissal cooldown
    const lastDismissed = localStorage.getItem(PWA_DISMISSAL_KEY);
    if (lastDismissed) {
      const daysSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return;
      }
    }

    // iOS does not expose beforeinstallprompt. All modern iOS browsers use
    // the share sheet for installation, so keep the guidance browser-agnostic.
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
      (userAgent.includes("macintosh") && window.navigator.maxTouchPoints > 1);

    if (isIOS) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
        setDismissed(false);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome beforeinstallprompt handler
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => {
      setDeferredPrompt(null);
      setDismissed(true);
      localStorage.setItem("promorang:pwa_installed", String(Date.now()));
    };
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [suppressedForParticipantWorld]);

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
    localStorage.setItem(PWA_DISMISSAL_KEY, String(Date.now()));
  };

  if (suppressedForParticipantWorld || dismissed || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <aside aria-label={t("pwa.installTitle")} className={`fixed ${location.pathname === "/" ? "bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))]" : "bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"} left-3 right-3 z-[9998] rounded-2xl border border-primary/30 bg-[#0e0e11]/95 p-4 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 p-1.5 flex items-center justify-center shrink-0 shadow-md">
            <img src={logo} alt="Promorang" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">{t("pwa.installTitle")}</h4>
              <span className="flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-black text-primary font-mono">
                <Sparkles className="h-2 w-2" /> PWA
              </span>
            </div>
            <p className="text-[11px] text-white/80 leading-tight mt-0.5 font-medium">
              {t("pwa.installSub")}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={t("pwa.dismiss")}
          onClick={handleDismiss}
          className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
        {showIOSPrompt ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-white/90">
            <span>{webT("web.tap")}</span>
            <Share className="h-3.5 w-3.5 text-primary inline" />
            <span>{webT("web.then")}</span>
            <strong className="text-white font-bold">{webT("web.addHome")}</strong>
            <PlusSquare className="h-3.5 w-3.5 text-primary inline" />
          </p>
        ) : (
          <p className="text-[11px] text-white/75 font-medium">{t("pwa.fastLightweight")}</p>
        )}

        {!showIOSPrompt && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-black text-black shadow-[0_0_15px_rgba(255,106,0,0.4)] transition-all hover:bg-orange-400 active:scale-95"
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
