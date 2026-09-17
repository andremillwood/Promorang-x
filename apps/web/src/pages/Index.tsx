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
        title="PROMORANG — Make demand visible"
        description="Ask for what you want, join live demand signals, and help turn customer actions into a marketplace businesses can respond to."
      />
      <PublicMarketHome />
    </div>
  );
};

export default Index;
