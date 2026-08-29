import { Link } from "react-router-dom";
import { ArrowRight, Coins, KeyRound, Sparkles } from "lucide-react";
import type { PromoCardNextSuccessId } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const copyById: Record<PromoCardNextSuccessId, { title: TranslationKey; text: TranslationKey; cta: TranslationKey }> = {
  claim_card: {
    title: "promoCardLoop.claimTitle",
    text: "promoCardLoop.claimCopy",
    cta: "promoCardLoop.claimCta",
  },
  show_up: {
    title: "promoCardLoop.showUpTitle",
    text: "promoCardLoop.showUpCopy",
    cta: "promoCardLoop.showUpCta",
  },
  earn_points: {
    title: "promoCardLoop.earnPointsTitle",
    text: "promoCardLoop.earnPointsCopy",
    cta: "promoCardLoop.earnPointsCta",
  },
  convert_key: {
    title: "promoCardLoop.convertTitle",
    text: "promoCardLoop.convertCopy",
    cta: "promoCardLoop.convertCta",
  },
  use_key: {
    title: "promoCardLoop.useKeyTitle",
    text: "promoCardLoop.useKeyCopy",
    cta: "promoCardLoop.useKeyCta",
  },
  recharge: {
    title: "promoCardLoop.rechargeTitle",
    text: "promoCardLoop.rechargeCopy",
    cta: "promoCardLoop.rechargeCta",
  },
  keep_loop: {
    title: "promoCardLoop.keepTitle",
    text: "promoCardLoop.keepCopy",
    cta: "promoCardLoop.keepCta",
  },
};

type Props = {
  id: PromoCardNextSuccessId;
  href: string;
  creditHint: number;
  pointsHint: number;
  keysHint: number;
  onAction?: () => void;
};

export function PromoCardNextMove({ id, href, creditHint, pointsHint, keysHint, onAction }: Props) {
  const { t } = useI18n();
  const copy = copyById[id];
  const vars = {
    amount: creditHint.toFixed(0),
    count: String(pointsHint),
    keys: String(keysHint),
  };

  const className =
    "group flex w-full items-start justify-between gap-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4 text-left transition hover:bg-amber-300/[0.12]";

  const body = (
    <>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">
          <Sparkles className="h-3.5 w-3.5" />
          {t("promoCardLoop.nextMove")}
        </p>
        <h3 className="mt-1.5 text-sm font-black text-white sm:text-base">{t(copy.title, vars)}</h3>
        <p className="mt-1 text-xs leading-5 text-white/65">{t(copy.text, vars)}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-white/55">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
            ${vars.amount} {t("promoCardLoop.creditChip")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
            <Coins className="h-3 w-3 text-amber-300" /> {vars.count} {t("promoCardLoop.points")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
            <KeyRound className="h-3 w-3 text-orange-300" /> {vars.keys} {t("promoCardLoop.keys")}
          </span>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-amber-200">
        {t(copy.cta)}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (onAction) {
    return (
      <button type="button" onClick={onAction} className={className}>
        {body}
      </button>
    );
  }

  return (
    <Link to={href} className={className}>
      {body}
    </Link>
  );
}
