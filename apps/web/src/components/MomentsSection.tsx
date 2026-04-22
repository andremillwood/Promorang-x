import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MomentCard } from "@/components/MomentCard";
import { DemoEventBanner } from "@/components/DemoEventBanner";
import { demoMoments as moments } from "@/data/demo-moments";
import { supabase } from "@/integrations/supabase/client";
import { getTaxonomyLabel } from "@/lib/moment-taxonomy";

const filters = [
  { value: "All", label: "All" },
  { value: "drop", label: "Drops" },
  { value: "ritual", label: "Rituals" },
  { value: "service", label: "Services" },
  { value: "content", label: "Creator Missions" },
  { value: "grocery", label: "Grocery" },
];

const MomentsSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: liveMoments } = useQuery({
    queryKey: ["public-home-moments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    retry: 0,
  });

  const sourceMoments = Array.isArray(liveMoments) && liveMoments.length > 0 ? liveMoments : moments;
  const showingExamples = sourceMoments === moments;

  const filteredMoments = activeCategory === "All"
    ? sourceMoments
    : sourceMoments.filter((m: any) =>
      m.category === activeCategory ||
      m.venue_category === activeCategory ||
      m.moment_archetype === activeCategory
    );

  return (
    <section className="py-20 md:py-32 bg-gradient-warm" data-tour="moments-section">
      <div className="container px-6">
        {/* Demo Event Banner */}
        <div className="max-w-5xl mx-auto mb-12">
          <DemoEventBanner variant="home" />
        </div>

        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real-world moments taking shape around you
          </h2>
          <p className="text-lg text-muted-foreground">
            {showingExamples
              ? "These examples show how drops, service rituals, grocery missions, and creator unlocks can look in your city. Launch the first one, claim founding status, and start the mayor story."
              : "Browse live moments across retail, service, wellness, community, and creator-led unlocks. Each one is a real-world interaction with proof, reward, and memory potential."}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveCategory(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {showingExamples && (
          <div className="mb-8 flex flex-wrap gap-2">
            {["fashion_retail", "personal_service", "grocery", "fitness_wellness", "content"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
              >
                {getTaxonomyLabel(tag)}
              </span>
            ))}
          </div>
        )}

        {/* Moments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredMoments.map((moment) => (
            <MomentCard key={moment.id} moment={moment as any} />
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              {showingExamples ? "Ready to create the first real moment?" : "Ready to create your own moments?"}
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              {showingExamples
                ? "If your area is still quiet, that is the opportunity. Launch the first drop, ritual, service unlock, or community gathering, become a founding mayor, and give the neighborhood something real to rally around."
                : "Whether you're a host, creator, merchant, or brand, Promorang makes it possible to program real-world interactions that people can verify, remember, and return to."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create-moment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-soft hover:shadow-elevated"
              >
                Host a Moment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/for-brands"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-full font-medium hover:bg-secondary/80 transition-all"
              >
                For Businesses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
              >
                Explore all moments
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MomentsSection;
