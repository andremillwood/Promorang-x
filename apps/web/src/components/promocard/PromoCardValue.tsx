import { describePromoCardValue, type FxQuote } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

type PromoCardValueProps = {
  gems: number;
  quote: FxQuote;
  size?: "hero" | "inline";
};

export function PromoCardValue({ gems, quote, size = "hero" }: PromoCardValueProps) {
  const { t, locale } = useI18n();
  const value = describePromoCardValue(gems, quote, locale);
  const fxWhen = quote.asOf.slice(0, 10);

  if (size === "inline") {
    return (
      <span className="text-white/70">
        {value.gemsLabel}
        <span className="mx-1.5 text-white/30">·</span>
        {t("vaultPage.localAbout", { amount: value.localLabel })}
      </span>
    );
  }

  return (
    <div>
      <p className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent sm:text-5xl">
        {value.gemsLabel}
      </p>
      <p className="mt-1 text-sm text-amber-100/80">
        {t("vaultPage.localAbout", { amount: value.localLabel })}
      </p>
      <p className="mt-1 text-[11px] text-white/45">
        {value.usdLabel} · {t("vaultPage.fxAsOf", { when: fxWhen })}
      </p>
    </div>
  );
}
