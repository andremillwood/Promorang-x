import { Link } from "react-router-dom";
import { MapPin, Sparkles, Ticket } from "lucide-react";
import { discoverHrefForAim, type PromoCardAim } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

type PromoCardActionsProps = {
  useThis?: { title?: string; redemption?: { code?: string | null } } | null;
  nearbyCount?: number;
  nextBenefit?: { title?: string } | null;
  aim?: PromoCardAim | null;
  onUseThis?: () => void;
};

export function PromoCardActions({ useThis, nearbyCount = 0, nextBenefit, aim, onUseThis }: PromoCardActionsProps) {
  const { t, formatNumber } = useI18n();
  const discoverHref = discoverHrefForAim(aim);
  return (
    <nav aria-label={t("card.actionsAria")} className="grid gap-2 sm:grid-cols-3">
      {onUseThis ? (
        <button type="button" onClick={onUseThis} className="rounded-2xl bg-primary px-4 py-4 text-left text-black">
          <Ticket className="h-4 w-4" />
          <p className="mt-2 text-sm font-black">{t("card.useThis")}</p>
          <p className="mt-1 text-xs text-black/70">{useThis?.title || t("card.flipDoor")}</p>
        </button>
      ) : (
      <a
        href="#use-this"
        className="rounded-2xl bg-primary px-4 py-4 text-black"
      >
        <Ticket className="h-4 w-4" />
        <p className="mt-2 text-sm font-black">{useThis ? t("card.showThis") : t("card.onCardKicker")}</p>
        <p className="mt-1 text-xs text-black/70">{useThis?.title || t("card.unlockFirst")}</p>
      </a>
      )}
      <Link to={discoverHref} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <MapPin className="h-4 w-4 text-amber-300" />
        <p className="mt-2 text-sm font-black">{t("card.availableNearby")}</p>
        <p className="mt-1 text-xs text-white/50">
          {nearbyCount ? t("card.participatingNow", { count: formatNumber(nearbyCount) }) : t("card.seePlaces")}
        </p>
      </Link>
      <Link to={nextBenefit ? discoverHref : "/give"} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <p className="mt-2 text-sm font-black">{t("card.nextBenefit")}</p>
        <p className="mt-1 text-xs text-white/50">{nextBenefit?.title || t("card.afterValidate")}</p>
      </Link>
    </nav>
  );
}
