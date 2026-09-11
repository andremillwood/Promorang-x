import { Link, useSearchParams } from "react-router-dom";
import { Gift } from "lucide-react";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";

export default function CardDropClaim() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || searchParams.get("drop");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <SEO
        title={t("cardDrop.seoTitle")}
        description={t("cardDrop.seoDescription")}
      />
      <div className="w-full max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
          <Gift className="h-3.5 w-3.5" />
          {t("cardDrop.liveOnly")}
        </div>
        <h1 className="font-serif text-4xl font-bold">{t("cardDrop.notGift")}</h1>
        <p className="text-sm leading-6 text-white/60">
          {t("cardDrop.copy")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={slug ? `/drop/${slug}` : "/discover"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-black"
          >
            {slug ? t("cardDrop.openLive") : t("cardDrop.nearby")}
          </Link>
          <Link
            to="/card"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-bold"
          >
            {t("cardDrop.useCard")}
          </Link>
        </div>
      </div>
    </main>
  );
}
