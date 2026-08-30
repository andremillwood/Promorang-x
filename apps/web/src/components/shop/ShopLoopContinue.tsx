import { Link } from "react-router-dom";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";

type NearbyMoment = {
  id: string;
  title: string;
  place: string;
  href: string;
};

type ShopLoopContinueProps = {
  showingPreviews: boolean;
  signedIn: boolean;
  nearbyMoment?: NearbyMoment | null;
};

export function ShopLoopContinue({ showingPreviews, signedIn, nearbyMoment }: ShopLoopContinueProps) {
  const { t } = useI18n();
  const momentHref = nearbyMoment?.href || "/discover/moments";
  const momentTitle = nearbyMoment?.title || t("market.nearbyFallback");
  const momentPlace = nearbyMoment?.place || t("market.placesNearby");

  return (
    <section className="rounded-[1.75rem] border border-amber-200/15 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_36%),#0d0c0a] p-5 md:p-7">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">
        {showingPreviews ? t("market.previewNoticeKicker") : t("market.keepMoving")}
      </p>
      <h2 className="mt-2 max-w-xl font-serif text-3xl font-black text-white">
        {showingPreviews ? t("market.previewNoticeTitle") : t("market.keepMovingTitle")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
        {showingPreviews ? t("market.previewNotice") : t("market.keepMovingCopy")}
      </p>

      <div className="mt-6 max-w-xl">
        <TicketPass
          kicker={t("market.joinMoment")}
          title={momentTitle}
          detail={momentPlace}
          stub={t("market.refillStub")}
          stubLabel={t("market.refill")}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <TactileButton variant="primary" asChild>
          <Link to={momentHref}>{nearbyMoment ? t("market.openMoment") : t("market.findMoment")}</Link>
        </TactileButton>
        <TactileButton variant="obsidian" asChild>
          <Link to="/#home-discover-path">{t("market.voteNext")}</Link>
        </TactileButton>
        {!signedIn ? (
          <TactileButton variant="outline" asChild>
            <Link to="/auth?mode=signup&next=/wallet">{t("market.getCard")}</Link>
          </TactileButton>
        ) : (
          <TactileButton variant="outline" asChild>
            <Link to="/discover">{t("market.checkIn")}</Link>
          </TactileButton>
        )}
      </div>
      <p className="mt-5 text-xs text-white/40">
        <Link to="/for-merchants" className="underline decoration-white/20 underline-offset-4 hover:text-white/70">
          {t("market.merchantLater")}
        </Link>
      </p>
    </section>
  );
}
