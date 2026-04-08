import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Users,
  Sparkles,
  Calendar,
  BarChart3,
  QrCode,
  Gift,
  Check,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Event Creation",
    description:
      "Create moments in minutes with our intuitive wizard. Add images, set capacity, define rewards, and publish.",
  },
  {
    icon: Users,
    title: "Participant Management",
    description:
      "Track RSVPs, manage check-ins, and engage with your community before, during, and after events.",
  },
  {
    icon: QrCode,
    title: "QR Check-In System",
    description:
      "Auto-generated QR codes for seamless check-ins. Verify attendance and trigger rewards automatically.",
  },
  {
    icon: Gift,
    title: "Built-In Rewards",
    description:
      "Incentivize participation with discounts, freebies, and exclusive access. Keep your community engaged.",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description:
      "Understand your community with participation trends, engagement metrics, and growth insights.",
  },
  {
    icon: Sparkles,
    title: "Brand Partnerships",
    description:
      "Attract sponsors who want to support your community. Earn from sponsorships while keeping events authentic.",
  },
];

const pricingTiers = [
  {
    name: "The Founder's Pass",
    price: "$0",
    period: "forever",
    description: "Launch in 5 minutes with proven event templates.",
    features: [
      "Run Unlimited Moments & Gatherings",
      "Build a Continuous Verified Record",
      "Earn Community Reputation (Trust Index)",
      "Collect Participation Proof (PoW)",
      "Access to Local Brand Bounties",
      "0% Platform Fee on Free Events",
    ],
    cta: "Start Building Record",
    popular: true,
  },
  {
    name: "Syndicate Operator",
    price: "Apply",
    period: "",
    description: "For city-scale operators and community leaders.",
    features: [
      "City-Exclusive Bounty Distribution",
      "Priority Verification SLA (1-hour)",
      "Dedicated Brand Partner Broker",
      "Multi-Hosting Command Center",
      "Revenue Share on Community Growth",
      "Custom Reward Structures",
    ],
    cta: "Request Invitation",
    popular: false,
  },
];

const ForCommunities = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promorang for Communities - Host Events & Gatherings"
        description="Gather your people. Create magic. Tools for community hosts to organize events, manage RSVPs, and build lasting connections."
        type="website"
      />


      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-hero">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">The Host Economy</span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
              Build a Record. <br />
              <span className="text-gradient-primary">Scale What Works.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Create Community Moments for free. Claim Bounties from brands.
              Build a verified execution record. Payment unlocks scale, not basic ability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/propose">
                  Pitch Your Moment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">Start Hosting Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to host magic
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From automated check-ins to brand funding—we provide the stack.
              You provide the energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-gradient-warm">
        <div className="container px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Earn Your Way In. Pay to Go Faster.
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Build your execution record. Scale when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-card rounded-2xl p-8 border ${tier.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border"
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-semibold text-foreground text-xl mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-serif text-4xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? "hero" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to="/auth">{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-charcoal text-cream">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Ready to bring your community together?
            </h2>
            <p className="text-cream/70 text-lg mb-8">
              Join thousands of hosts creating meaningful experiences every day.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">
                Create Your First Moment
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


    </div>
  );
};

export default ForCommunities;
