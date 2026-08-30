import { useState } from "react";
import { Link } from "react-router-dom";
import { MoneyPots, NightTrail, PaperReceipt, RoleLens } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { formatShopGems, formatShopMoney, type PartnerOfferTerms } from "@/lib/shop/partner-offer";

type ShopAccountLoopProps = {
  signedIn: boolean;
  walletHref: string;
  example?: PartnerOfferTerms | null;
};

export function ShopAccountLoop({ signedIn, walletHref, example }: ShopAccountLoopProps) {
  const { t, locale } = useI18n();
  const [role, setRole] = useState(0);

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

      <RoleLens
        selectedIndex={role}
        onSelect={setRole}
        roles={[
          {
            role: t("market.roleMember"),
            why: t("market.roleMemberWhy"),
            outcome: t("market.roleMemberOutcome"),
            action: signedIn ? t("market.seePlaces") : t("market.getAccount"),
            href: signedIn ? "/shop#shop-places" : walletHref,
          },
          {
            role: t("market.roleShop"),
            why: t("market.roleShopWhy"),
            outcome: t("market.roleShopOutcome"),
            action: t("market.merchantLaterShort"),
            href: "/for-merchants",
          },
          {
            role: t("market.roleBrand"),
            why: t("market.roleBrandWhy"),
            outcome: t("market.roleBrandOutcome"),
            action: t("market.fundANight"),
            href: "/for-brands",
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

      {example ? (
        <div className="max-w-sm">
          <PaperReceipt
            heading={t("market.receiptHeading")}
            lines={offerReceiptLines(example, t, locale)}
            footer={example.funding === "brand" ? t("market.receiptFooterBrand") : t("market.receiptFooterShop")}
          />
        </div>
      ) : null}

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

export function offerReceiptLines(
  terms: PartnerOfferTerms,
  t: (key: TranslationKey) => string,
  locale: string,
) {
  const money = (amount: number) => formatShopMoney(amount, terms.currency, locale);
  const lines = [
    { label: t("market.cashPrice"), value: money(terms.cashPrice) },
    { label: t("market.payWithGems"), value: formatShopGems(terms.gemPrice, locale), strong: true },
    { label: t("market.youSave"), value: `−${money(terms.memberSave)}` },
  ];
  if (terms.funding === "brand") {
    lines.push({ label: t("market.potCovers"), value: money(terms.potCovers) });
  }
  lines.push({ label: t("market.platformFee"), value: money(terms.platformFee) });
  lines.push({ label: t("market.shopKeeps"), value: money(terms.shopNets), strong: true });
  return lines;
}
