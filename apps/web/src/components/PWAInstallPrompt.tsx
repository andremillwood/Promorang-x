import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Landmark,
  Moon,
  ShoppingBag,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import { triggerHaptic } from "@/lib/nativeWebApis";
import { useI18n } from "@/i18n/I18nContext";
import { localizePath } from "@/i18n/locale-routing";
import {
  MOMENT_INTENT_IDS,
  type MomentIntentId,
  buildDiscoverIntentPath,
  isRouteBootBlocking,
  shouldHideMomentPrompt,
  shouldRevealMomentPrompt,
} from "@/lib/promocard-moment-intent";

const DISMISS_KEY = "promorang:pwa_prompt_dismissed";
const SESSION_USED_KEY = "promorang:moment_prompt_used";

const INTENT_CHIPS: Array<{
  id: MomentIntentId;
  labelKey: "pwa.intentFood" | "pwa.intentShops" | "pwa.intentTrade" | "pwa.intentSport" | "pwa.intentCulture" | "pwa.intentNight";
  Icon: typeof Utensils;
  chip: string;
}> = [
  { id: "food", labelKey: "pwa.intentFood", Icon: Utensils, chip: "bg-orange-500 text-white" },
  { id: "shops", labelKey: "pwa.intentShops", Icon: ShoppingBag, chip: "bg-violet-500 text-white" },
  { id: "trade", labelKey: "pwa.intentTrade", Icon: Briefcase, chip: "bg-sky-600 text-white" },
  { id: "sport", labelKey: "pwa.intentSport", Icon: Trophy, chip: "bg-emerald-600 text-white" },
  { id: "culture", labelKey: "pwa.intentCulture", Icon: Landmark, chip: "bg-amber-500 text-black" },
  { id: "night", labelKey: "pwa.intentNight", Icon: Moon, chip: "bg-indigo-950 text-white" },
];

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(SESSION_USED_KEY)) return true;
  const lastDismissed = localStorage.getItem(DISMISS_KEY);
  if (!lastDismissed) return false;
  const daysSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
  return daysSince < 7;
}

export function PWAInstallPrompt() {
  const { t, locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<MomentIntentId>(MOMENT_INTENT_IDS[0]);

  const hiddenByRoute = shouldHideMomentPrompt(location.pathname);

  useEffect(() => {
    let cancelled = false;

    const syncVisibility = () => {
      if (cancelled) return;
      const routeBooting =
        document.readyState !== "complete" || isRouteBootBlocking(document);
      setVisible(
        shouldRevealMomentPrompt({
          pathname: location.pathname,
          standalone: isStandaloneDisplay(),
          dismissed: wasRecentlyDismissed(),
          routeBooting,
        }),
      );
    };

    syncVisibility();
    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("load", syncVisibility);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("load", syncVisibility);
    };
  }, [hiddenByRoute, location.pathname]);

  const handleDismiss = () => {
    triggerHaptic("light");
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleSpend = () => {
    triggerHaptic("medium");
    setVisible(false);
    sessionStorage.setItem(SESSION_USED_KEY, "1");
    navigate(localizePath(buildDiscoverIntentPath(selectedIntent), locale));
  };

  if (!visible || hiddenByRoute) return null;

  return (
    <aside
      aria-label={t("pwa.questionTitle")}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-[9998] md:left-auto md:right-6 md:bottom-6 md:w-[26rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101114]/96 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="h-1.5 bg-gradient-to-r from-amber-300 via-primary to-orange-600" aria-hidden />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/90">
            {t("pwa.kicker")}
          </p>
          <button
            type="button"
            aria-label={t("pwa.dismiss")}
            onClick={handleDismiss}
            className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="mt-2 font-serif text-[1.65rem] font-bold leading-tight tracking-tight text-white">
          {t("pwa.questionTitle")}
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-white/70">{t("pwa.outcome")}</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
          {t("pwa.worksFor")}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-2">
          {INTENT_CHIPS.map(({ id, labelKey, Icon, chip }) => {
            const selected = selectedIntent === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedIntent(id);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition-all ${
                  selected
                    ? `${chip} shadow-md ring-2 ring-white/70`
                    : "border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSpend}
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-sm font-black text-white shadow-[0_0_20px_rgba(255,106,0,0.35)] transition-all hover:bg-orange-400 active:scale-[0.98]"
        >
          {t("pwa.ctaSpend")}
        </button>

        <p className="mt-3 text-center text-[11px] leading-5 text-white/55">
          {t("pwa.installLater")}
        </p>
      </div>
    </aside>
  );
}

export default PWAInstallPrompt;
