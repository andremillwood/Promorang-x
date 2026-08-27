import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Users, Shield, BarChart3 } from "lucide-react";

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
              Turn promotions
              <span className="text-gradient-primary"> into participation </span>
              people remember
            </h2>

            <p className="text-cream/70 text-lg mb-8 leading-relaxed">
              People do not want another ad. They want a better night, a useful perk,
              a reason to try a place, or a memory worth keeping. Promorang helps brands
              create Moments where people choose to show up, take part, and leave proof of real engagement.
            </p>

            <div className="space-y-5 mb-10">
              {[
                {
                  icon: Users,
                  title: "Create the Moment",
                  text: "Shape an activation around a place, audience, and human reason to participate",
                },
                {
                  icon: Shield,
                  title: "Build Trust",
                  text: "Show up as the brand making something useful, social, or memorable happen",
                },
                {
                  icon: BarChart3,
                  title: "Measure Participation",
                  text: "See check-ins, redemptions, content, QR engagement, and return signals",
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
                      <p className="text-2xl font-bold text-foreground">800+</p>
                      <p className="text-xs text-muted-foreground">Expo UGC Signups</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4">
                      <p className="text-2xl font-bold text-foreground">0 ➔ 230</p>
                      <p className="text-xs text-muted-foreground">Nightlife Footfall</p>
                    </div>
                  </div>

                  {/* Mock Proven Campaigns */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proven Enterprise Proofs</p>
                    {[
                      { name: "Lifespan & Sunshine Snacks", type: "Receipt OCR & Draw", status: "Verified" },
                      { name: "Ladies Expo Sweepstakes", type: "Selfie / 800+ Leads", status: "Completed" },
                      { name: "I Luv Hip Hop Series", type: "Dead-Night Revival", status: "230 Footfall" },
                    ].map((campaign, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="text-xs text-foreground font-semibold">{campaign.name}</p>
                          <p className="text-[10px] text-muted-foreground">{campaign.type}</p>
                        </div>
                        <span className="text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10">{campaign.status}</span>
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
