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
    <section className="relative overflow-hidden bg-gradient-warm py-14 md:py-20" data-tour="moments-section">
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="container relative z-10 px-6">
        {/* Demo Event Banner */}
        {showingExamples && (
          <div className="max-w-5xl mx-auto mb-8">
            <DemoEventBanner variant="home" />
          </div>
        )}

        {/* Section Header */}
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-primary">
              {showingExamples ? "Example Playbooks" : "Live Discovery"}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              {showingExamples ? "Learn the moment pattern." : "Find something worth showing up for."}
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {showingExamples
                ? "These examples show the kinds of drops, rituals, creator missions, and local experiences Promorang can bring into your city. The point is simple: find the room, show up, and let the Mark start opening more."
                : "Browse live moments across retail, service, wellness, community, and creator-led unlocks. Each one can help you earn points, become known, and unlock what comes next."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Moment signal</p>
            <p className="mt-2 font-serif text-3xl font-bold text-foreground">
              {showingExamples ? "Examples teach." : "Join once."}
            </p>
            <p className="font-serif text-3xl font-bold text-primary">
              {showingExamples ? "Live moments convert." : "Return stronger."}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {showingExamples
                ? "Example cards are labeled as patterns. Real supply should feel normal when it appears."
                : "Every card below is a doorway into people, places, perks, and progress."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/explore/moments"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Explore all
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/create/moment"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveCategory(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === filter.value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border shadow-sm"
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
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              {showingExamples ? "Nothing near you yet? That can be your opening." : "Ready to create your own moments?"}
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              {showingExamples
                ? "If your area is still quiet, help start the first drop, ritual, service unlock, or community gathering. Promorang is built for the people who make a place feel alive."
                : "Whether you're a host, creator, merchant, or brand, Promorang makes it possible to program real-world interactions people want to join, remember, and return to."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create/moment"
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
                to="/explore/moments"
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
