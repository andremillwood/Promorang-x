import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
import { useI18n } from "@/i18n/I18nContext";

export default function Welcome() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen">
      <SEO title={t("home.seoTitle")} description={t("home.seoDescription")} />
      <CinematicCultureHome />
    </div>
  );
}
