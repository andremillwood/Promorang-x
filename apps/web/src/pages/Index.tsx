import { useI18n } from "@/i18n/I18nContext";
import SEO from "@/components/SEO";
import PublicMarketHome from "@/components/marketing/PublicMarketHome";
import ConsumerMomentPreview from "@/pages/ConsumerMomentPreview";
import { useLayoutEffect } from "react";

const Index = () => {
  const { t } = useI18n();
  const searchParams = new URLSearchParams(window.location.search);
  const consumerMomentId = searchParams.get("moment");

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (consumerMomentId && new URLSearchParams(window.location.search).get("preview") === "consumer") {
    return <ConsumerMomentPreview />;
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`PROMORANG — ${t("publicHome.title")}`}
        description={t("compression.interestsCopy")}
      />
      <PublicMarketHome />
    </div>
  );
};

export default Index;
