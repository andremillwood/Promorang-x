import SEO from "@/components/SEO";
import CinematicCultureHome from "@/components/CinematicCultureHome";
import { useLayoutEffect } from "react";

const Index = () => {
  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <SEO
        title="Promorang - Show Up. Get Known. Unlock More."
        description="Discover real-world moments, leave your Mark, unlock points, keys, complementary pieces, PromoShare eligibility, Gems, and stronger network growth from the communities you join."
      />
      <CinematicCultureHome />
    </div>
  );
};

export default Index;
