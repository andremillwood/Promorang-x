import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import MomentsSection from "@/components/MomentsSection";
import HowItWorks from "@/components/HowItWorks";
import ForBrands from "@/components/ForBrands";
import { VaultTeaser } from "@/components/VaultTeaser";
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

  // If user is already authenticated, check onboarding status
  useEffect(() => {
    if (!loading && user && !prefsLoading) {
      if (hasCompleted) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, prefsLoading, hasCompleted, navigate]);

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
        title="Promorang - Life is made of moments worth sharing"
        description="Discover experiences that matter. Join gatherings that bring people together. Remember the moments that define your story."
      />
      <Hero />
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
