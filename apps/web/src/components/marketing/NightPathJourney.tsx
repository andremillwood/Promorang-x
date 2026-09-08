import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const STEPS = [
  ["home.journey1Label", "home.journey1Title", "home.journey1Text"],
  ["home.journey2Label", "home.journey2Title", "home.journey2Text"],
  ["home.journey3Label", "home.journey3Title", "home.journey3Text"],
  ["home.journey4Label", "home.journey4Title", "home.journey4Text"],
  ["home.journey5Label", "home.journey5Title", "home.journey5Text"],
] as const;

type NightPathJourneyProps = {
  className?: string;
};

export function NightPathJourney({ className = "" }: NightPathJourneyProps) {
  const { t } = useI18n();

  return (
    <div className={`rounded-[2rem] border border-primary/20 bg-gradient-to-b from-primary/10 via-black/40 to-black/20 px-5 py-6 sm:px-6 sm:py-8 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.journeyEyebrow")}</p>
      <h3 className="mt-2 max-w-3xl text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-4xl">
        {t("home.journeyTitle")} <span className="text-primary">{t("home.journeyAccent")}</span>
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{t("home.journeyCopy")}</p>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">{t("home.journeyPaths")}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map(([label, title, text]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t(label)}</p>
            <p className="mt-2 font-serif text-lg font-bold text-white">{t(title)}</p>
            <p className="mt-2 text-xs leading-5 text-white/50">{t(text)}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link
          to="/progress"
          className="inline-flex items-center gap-2 text-sm font-black text-primary transition hover:translate-x-0.5"
        >
          {t("home.journeyCta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
