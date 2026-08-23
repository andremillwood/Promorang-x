import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
import { useLayoutEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";

const Index = () => {
  const { t } = useI18n();
  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <SEO
        title={t("home.seoTitle")}
        description={t("home.seoDescription")}
      />
      <CinematicCultureHome />
    </div>
  );
};

export default Index;
