import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
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
        title="Promorang — Your city gives something back"
        description="Discover Moments, local benefits and cultural experiences. Show up with your PromoCard and unlock more from your city."
      />
      <CinematicCultureHome />
    </div>
  );
};

export default Index;
