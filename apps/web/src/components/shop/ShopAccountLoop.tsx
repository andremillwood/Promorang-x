import { Link } from "react-router-dom";
import { MoneyPots, NightTrail } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";

type ShopAccountLoopProps = {
  signedIn: boolean;
  walletHref: string;
};

export function ShopAccountLoop({ signedIn, walletHref }: ShopAccountLoopProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-8 rounded-[2rem] border border-white/10 bg-[#0b0a09] p-5 md:p-8">
      <NightTrail
        eyebrow={t("market.accountEyebrow")}
        title={t("market.accountTitle")}
        steps={[
          {
            label: t("market.accountStep1Label"),
            title: t("market.accountStep1Title"),
            text: t("market.accountStep1Text"),
          },
          {
            label: t("market.accountStep2Label"),
            title: t("market.accountStep2Title"),
            text: t("market.accountStep2Text"),
          },
          {
            label: t("market.accountStep3Label"),
            title: t("market.accountStep3Title"),
            text: t("market.accountStep3Text"),
          },
          {
            label: t("market.accountStep4Label"),
            title: t("market.accountStep4Title"),
            text: t("market.accountStep4Text"),
          },
        ]}
      />

      <MoneyPots
        pots={[
          { label: t("market.potYou"), detail: t("market.potYouDetail"), mark: t("market.potYouMark") },
          { label: t("market.potShop"), detail: t("market.potShopDetail"), mark: t("market.potShopMark") },
          { label: t("market.potNights"), detail: t("market.potNightsDetail"), mark: t("market.potNightsMark") },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <TactileButton variant="primary" asChild>
          <Link to={walletHref}>{signedIn ? t("market.openCard") : t("market.getAccount")}</Link>
        </TactileButton>
        <TactileButton variant="obsidian" asChild>
          <a href="#shop-places">{t("market.seePlaces")}</a>
        </TactileButton>
      </div>
    </section>
  );
}
