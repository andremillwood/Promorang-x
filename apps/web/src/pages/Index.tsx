import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import MomentsSection from "@/components/MomentsSection";
import HowItWorks from "@/components/HowItWorks";
import ForBrands from "@/components/ForBrands";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const { startTour, isTourCompleted } = useTour();

  // Auto-start first-time user tour
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
      <HowItWorks />
      <ForBrands />
      <ProductTour tourId="first-time-user" />
    </div>
  );
};

export default Index;
