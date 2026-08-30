import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
import ConsumerHomePreview from "@/pages/ConsumerHomePreview";
import ConsumerMomentPreview from "@/pages/ConsumerMomentPreview";
import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

const Index = () => {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const isConsumerPreview = searchParams.get("preview") === "consumer";
  const consumerMomentId = searchParams.get("moment");

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (isConsumerPreview && consumerMomentId) {
    return <ConsumerMomentPreview />;
  }

  if (isConsumerPreview) {
    return <ConsumerHomePreview />;
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0D0D0E]" />;
  }

  if (user) {
    return <Navigate to="/today" replace />;
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
