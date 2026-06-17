import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import MomentsSection from "@/components/MomentsSection";
import HomeActionStrip from "@/components/HomeActionStrip";
import ForBrands from "@/components/ForBrands";
import ForCreatorsSection from "@/components/ForCreatorsSection";
import EconomyLoop from "@/components/EconomyLoop";
import StakeholderPaths from "@/components/StakeholderPaths";
import { VaultTeaser } from "@/components/VaultTeaser";
import { ValueProposition } from "@/components/ValueProposition";
import FeaturedHeroBanner from "@/components/featured/FeaturedHeroBanner";
import FeaturedSection from "@/components/featured/FeaturedSection";
import { useLayoutEffect } from "react";
import { StandingLeaderboard } from "@/components/StandingLeaderboard";

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
      <Hero />
      <HomeActionStrip />
      <MomentsSection />
      
      {/* Featured Hero Banner - Premium Placements ($150/day) */}
      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <FeaturedHeroBanner />
      </div>

      <StakeholderPaths />

      <EconomyLoop />
      
      <ValueProposition />
      
      {/* Featured Section - Homepage Featured Grid ($75/day) */}
      <div className="container max-w-6xl mx-auto px-4">
        <FeaturedSection />
      </div>

      <StandingLeaderboard />
      <ForCreatorsSection />
      <VaultTeaser />
      <ForBrands />
    </div>
  );
};

export default Index;
