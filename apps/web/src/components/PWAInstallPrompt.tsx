import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { triggerHaptic } from "@/lib/nativeWebApis";
import logo from "@/assets/promorang-logo-full.png";
import { useI18n } from "@/i18n/I18nContext";
import { useLocation } from "react-router-dom";
import { clearInstallPrompt, getInstallPrompt, isStandalone, subscribeInstallPrompt } from "@/lib/pwa-install";

const PWA_DISMISSAL_KEY = "promorang:pwa_prompt_dismissed:mobile-home-v2";

export function PWAInstallPrompt() {
  const { t } = useI18n();
  const webT = t;
  const location = useLocation();
  const suppressed = /^\/(auth|login|signup|reset-password|checkout|app-preview|drop)(\/|$)/.test(location.pathname);
  const deferredPrompt = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, () => null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!window.matchMedia("(max-width: 900px), (pointer: coarse)").matches) return;
    try {
      const lastDismissed = Number(localStorage.getItem(PWA_DISMISSAL_KEY));
      if (lastDismissed && Date.now() - lastDismissed < 7 * 24 * 60 * 60 * 1000) return;
    } catch { /* Storage restrictions must not prevent installation. */ }
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
      (userAgent.includes("macintosh") && navigator.maxTouchPoints > 1);
    const timer = window.setTimeout(() => {
      setShowIOSPrompt(isIOS);
      setDismissed(false);
    }, 2500);
    const installed = () => { clearTimeout(timer); setDismissed(true); setShowIOSPrompt(false); };
    const mode = window.matchMedia("(display-mode: standalone)");
    const changed = () => { if (isStandalone()) installed(); };
    window.addEventListener("appinstalled", installed);
    mode.addEventListener("change", changed);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("appinstalled", installed);
      mode.removeEventListener("change", changed);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt || installing) return;
    triggerHaptic("medium");
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      handleDismiss();
    } catch {
      // A consumed or unsupported browser prompt cannot be used again.
      setDismissed(true);
    } finally {
      clearInstallPrompt();
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    setDismissed(true);
    setShowIOSPrompt(false);
    try { localStorage.setItem(PWA_DISMISSAL_KEY, String(Date.now())); } catch { /* Session dismissal still applies. */ }
  };

  if (suppressed || dismissed || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <aside aria-label={t("pwa.installTitle")} className="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-30 max-h-[50dvh] overflow-y-auto rounded-2xl border border-primary/30 bg-[#0e0e11]/95 p-4 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300 sm:left-auto sm:right-4 sm:w-96 lg:bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 p-1.5 flex items-center justify-center shrink-0 shadow-md">
            <img src={logo} alt="Promorang" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">{t("pwa.installTitle")}</h4>
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
          className="grid min-h-11 min-w-11 place-items-center rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
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
            disabled={installing}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-black text-black shadow-[0_0_15px_rgba(255,106,0,0.4)] transition-all hover:bg-orange-400 active:scale-95"
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
