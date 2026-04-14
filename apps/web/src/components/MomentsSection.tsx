import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MomentCard } from "@/components/MomentCard";
import { DemoEventBanner } from "@/components/DemoEventBanner";
import { demoMoments as moments } from "@/data/demo-moments";

const categories = ["All", "food", "fitness", "arts", "music", "networking", "outdoor"];

const MomentsSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMoments = activeCategory === "All"
    ? moments
    : moments.filter(m => m.category === activeCategory);

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
            Moments happening near you
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse experiences worth joining. Each one is a chance to connect,
            learn something new, or simply enjoy being part of something together.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                }`}
            >
              {(category || "General").charAt(0).toUpperCase() + (category || "General").slice(1)}
            </button>
          ))}
        </div>

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
              Ready to create your own moments?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're a host, brand, or venue owner, Promorang makes it easy to bring people together and create memorable experiences.
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
