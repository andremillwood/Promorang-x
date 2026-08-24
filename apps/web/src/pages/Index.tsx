import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
import ConsumerHomePreview from "@/pages/ConsumerHomePreview";
import { useLayoutEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";

const Index = () => {
  const { t } = useI18n();
  const isConsumerPreview = new URLSearchParams(window.location.search).get("preview") === "consumer";

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (isConsumerPreview) {
    return <ConsumerHomePreview />;
  }

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
