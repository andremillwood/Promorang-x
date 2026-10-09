import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import "./DiscoveryHeadline.css";

const phrases = ["events", "food", "experiences", "offers"] as const;

export function DiscoveryHeadline() {
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  return (
    <div data-paused={paused} className="discovery-headline-wrapper relative mt-4 max-w-[min(11ch,calc(100%_-_3.25rem))] font-sans text-[clamp(2.65rem,12vw,5.8rem)] font-black leading-[.92] tracking-[-.055em]">
      <h1 className="discovery-headline">
        <span className="sr-only">{t("publicHome.title")}</span>
        <span aria-hidden="true" className="discovery-headline__original">{t("publicHome.title")}</span>
        {phrases.map((phrase, index) => <span key={phrase} aria-hidden="true" className="discovery-headline__phrase text-orange-400" style={{ animationDelay: `${3 + index * 2.5}s` }}>{t(`publicHome.motion.${phrase}`)}</span>)}
      </h1>
      <button type="button" onClick={() => setPaused(value => !value)} aria-label={t(paused ? "publicHome.motion.resume" : "publicHome.motion.pause")} className="discovery-headline__control absolute bottom-0 left-full ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-orange-400 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>
    </div>
  );
}
