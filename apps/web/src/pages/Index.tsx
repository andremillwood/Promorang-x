import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import MomentsSection from "@/components/MomentsSection";
import HowItWorks from "@/components/HowItWorks";
import ForBrands from "@/components/ForBrands";
import { VaultTeaser } from "@/components/VaultTeaser";
import { ValueProposition } from "@/components/ValueProposition";
import FeaturedHeroBanner from "@/components/featured/FeaturedHeroBanner";
import FeaturedSection from "@/components/featured/FeaturedSection";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";
import { useTour } from "@/contexts/TourContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProductTour from "@/components/tours/ProductTour";
import { StandingLeaderboard } from "@/components/StandingLeaderboard";

const Index = () => {
  const { user, loading } = useAuth();
  const { hasCompleted, isLoading: prefsLoading } = useHasCompletedOnboarding();
  const { startTour, isTourCompleted } = useTour();
  const navigate = useNavigate();

  // Removed auto-redirect for authenticated users so they can still view the marketing homepage.
  // Users will access the dashboard via the Header button instead.

  // Auto-start first-time user tour (only if not redirected)
  useEffect(() => {
    if (user && !isTourCompleted('first-time-user')) {
      const timer = setTimeout(() => {
        startTour('first-time-user');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isTourCompleted, startTour]);

  return (
    <div className="min-h-screen">
      <SEO
        title="Promorang - Your Presence Has Value"
        description="Join moments, leave your Mark, and earn money for helping communities thrive. Every time you show up, you create value. We make sure you get your share."
      />
      <Hero />
      
      {/* Featured Hero Banner - Premium Placements ($150/day) */}
      <div className="container max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <FeaturedHeroBanner />
      </div>
      
      <ValueProposition />
      
      {/* Featured Section - Homepage Featured Grid ($75/day) */}
      <div className="container max-w-6xl mx-auto px-4">
        <FeaturedSection />
      </div>
      
      <MomentsSection />
      <StandingLeaderboard />
      <HowItWorks />
      <VaultTeaser />
      <ForBrands />
      <ProductTour tourId="first-time-user" />
    </div>
  );
};

export default Index;
