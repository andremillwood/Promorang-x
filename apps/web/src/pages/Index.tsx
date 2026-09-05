import SEO from "@/components/SEO";
import ConsumerHomePreview from "@/pages/ConsumerHomePreview";
import ConsumerMomentPreview from "@/pages/ConsumerMomentPreview";
import { useLayoutEffect } from "react";

const Index = () => {
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

  return (
    <div className="min-h-screen">
      <SEO
        title="Today — Promorang"
        description="Find what is worth moving for tonight. PromoCard, Moments, passes, and proof — not a directory of deals."
      />
      <ConsumerHomePreview />
    </div>
  );
};

export default Index;
