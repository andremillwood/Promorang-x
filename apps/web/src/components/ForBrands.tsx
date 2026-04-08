import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Shield, BarChart3 } from "lucide-react";

const ForBrands = () => {
  return (
    <section id="for-brands" className="py-20 md:py-32 bg-charcoal text-cream">
      <div className="container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">For Brands & Businesses</span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Be present where
              <span className="text-gradient-primary"> meaning </span>
              already exists
            </h2>

            <p className="text-cream/70 text-lg mb-8 leading-relaxed">
              Stop interrupting. Start participating. Promorang lets you connect with
              real people at real moments—without forcing attention or corrupting
              the experience.
            </p>

            <div className="space-y-5 mb-10">
              {[
                {
                  icon: TrendingUp,
                  title: "Real Participation",
                  text: "Reward people who actually show up and engage",
                },
                {
                  icon: Shield,
                  title: "Credible Presence",
                  text: "Build goodwill through genuine contribution",
                },
                {
                  icon: BarChart3,
                  title: "Measurable Outcomes",
                  text: "Track real participation, not vanity metrics",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cream mb-1">{item.title}</h4>
                    <p className="text-cream/60 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/for-brands">Partner with Promorang</Link>
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 md:p-12">
              {/* Mock Dashboard Preview */}
              <div className="bg-card rounded-2xl shadow-elevated h-full p-6 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    P
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-sm">Brand Dashboard</p>
                    <p className="text-muted-foreground text-xs">Active Moments</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-xl p-4">
                      <p className="text-2xl font-bold text-foreground">2,450</p>
                      <p className="text-xs text-muted-foreground">Participants</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4">
                      <p className="text-2xl font-bold text-foreground">89%</p>
                      <p className="text-xs text-muted-foreground">Redemption</p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-md transition-all"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Weekly participation</p>
                  </div>

                  {/* Mock Moment List */}
                  <div className="space-y-2">
                    {["Summer Launch Event", "Coffee Tasting Week"].map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <span className="text-sm text-foreground font-medium">{name}</span>
                        <span className="text-xs text-primary font-semibold">Live</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBrands;
