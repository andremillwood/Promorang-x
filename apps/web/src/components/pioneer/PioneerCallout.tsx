import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

type PioneerCalloutProps = {
  eyebrow?: string;
  title?: string;
  copy?: string;
  action?: string;
  className?: string;
};

export default function PioneerCallout({
  eyebrow,
  title,
  copy,
  action,
  className = "",
}: PioneerCalloutProps) {
  const { t } = useI18n();

  const displayEyebrow = eyebrow ?? t("pioneerCallout.eyebrow");
  const displayTitle = title ?? t("pioneerCallout.defaultTitle");
  const displayCopy = copy ?? t("pioneerCallout.defaultCopy");
  const displayAction = action ?? t("pioneerCallout.action");

  return (
    <aside className={`relative overflow-hidden border-y border-primary/20 bg-[#0b0907] text-white ${className}`}>
      <div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/15 blur-[90px]" />
      <div className="container relative flex flex-col gap-6 px-6 py-9 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-3xl gap-4">
          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{displayEyebrow}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] md:text-3xl">{displayTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{displayCopy}</p>
          </div>
        </div>
        <Link to="/pioneers" className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/15 px-5 py-3 text-sm font-black transition hover:border-primary hover:text-primary md:self-auto">
          {displayAction}<ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
