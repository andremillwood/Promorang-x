import SEO from "@/components/SEO";
import PublicMarketHome from "@/components/marketing/PublicMarketHome";
import ConsumerMomentPreview from "@/pages/ConsumerMomentPreview";
import { useLayoutEffect } from "react";

const Index = () => {
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
        title="PROMORANG — Discover what moves you. Help shape what happens next."
        description="Discover things worth knowing, show what you want, join what other people are asking for, and keep your place in what happens next with PromoCard."
      />
      <PublicMarketHome />
    </div>
  );
};

export default Index;
