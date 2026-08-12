import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import {
  Heart,
  HandHeart,
  Users,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Megaphone,
  Share2,
  TrendingUp,
} from "lucide-react";

const causeFeatures = [
  {
    icon: HandHeart,
    title: "Action-Backed Fundraising",
    description: "Turn participant check-ins, content drops, and social engagement directly into pledged micro-donations and corporate grant releases.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Impact Ledger",
    description: "Every volunteer check-in, donation match, and community contribution is recorded on an audit-ready, tamper-proof impact ledger.",
  },
  {
    icon: Gift,
    title: "Corporate Match Sponsorships",
    description: "Partner with enterprise brands to unlock 1:1 or 2:1 corporate gift matching whenever participants complete cause missions.",
  },
  {
    icon: Megaphone,
    title: "Viral Volunteer Mobilization",
    description: "Equip your supporters with social referral tools, verified attendance passes, and impact badges to recruit their personal networks.",
  },
  {
    icon: Award,
    title: "Zero Platform Fee Starter Program",
    description: "100% of community contributions go directly to verified 501(c)(3) non-profits and registered charitable organizations.",
  },
  {
    icon: Share2,
    title: "Creator & Influencer Amplification",
    description: "Connect your cause with creators willing to dedicate drops, promo shares, and audience engagement to fuel your mission.",
  },
];

const impactUseCases = [
  {
    title: "Community Cleanups & Volunteer Rallies",
    description: "Verify on-site volunteer attendance with location-based check-ins and reward participants with sponsor-backed local perk coupons.",
  },
  {
    title: "Charity Runs, Walks & Marathons",
    description: "Mobilize runners and supporters to log checkpoints, share milestones, and trigger corporate donation matches along the route.",
  },
  {
    title: "Cultural & Civic Advocacy Campaigns",
    description: "Build lasting momentum around civic initiatives, community arts projects, and local awareness drives with measurable participation.",
  },
  {
    title: "Crisis Relief & Food Bank Drives",
    description: "Rapidly deploy donation drops and volunteer sign-ups when urgent disaster relief or food distribution is needed.",
  },
];

export default function ForCauses() {
  return (
    <>
      <SEO
        title="Promorang for Causes & Non-Profits | Turn Engagement into Impact"
        description="Mobilize volunteers, rally community support, and unlock corporate matching funds with verified action-based fundraising for non-profits and civic movements."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background via-rose-500/5 to-background">
          <div className="container px-4 sm:px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Heart className="w-4 h-4 mr-2 inline fill-rose-500 text-rose-500" /> Promorang Impact Engine
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-foreground">
                Turn Real-World Action Into Measurable Social Impact
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Mobilize volunteers, inspire donors, and unlock corporate matching grants through verified check-ins, action drops, and community momentum.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/contact">
                    Launch a Cause Campaign
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/how-it-works">
                    Explore Impact Model
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <MarketingPromiseStrip />

        {/* Features Grid */}
        <section className="py-20 md:py-28 bg-muted/10">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">Cause Toolkit</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                Everything Non-Profits Need to Mobilize Movement
              </h2>
              <p className="text-muted-foreground text-lg">
                Purpose-built tools to transform passive social support into verified real-world volunteering and fundraising.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {causeFeatures.map((feat, idx) => (
                <Card key={idx} className="border-border/60 hover:border-rose-500/40 transition-all shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">{feat.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 border-t border-border bg-background">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">Impact Scenarios</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                How Causes Use Promorang to Make a Difference
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {impactUseCases.map((uc, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Value Section */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="container px-4 sm:px-6 mx-auto">
            <MissionRoleValue
              roleTitle="Non-Profit & Cause Leaders"
              headline="Turn Awareness into Transparent Action Receipts"
              points={[
                "Zero platform fee structure for verified 501(c)(3) organizations",
                "Corporate gift-matching integrations to amplify every community check-in",
                "Verified volunteer receipts and tamper-proof impact reporting",
                "Creator partnership tools to amplify your campaign reach organically"
              ]}
              ctaText="Apply for Non-Profit Status"
              ctaHref="/contact"
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-rose-500/5 border-t border-border text-center">
          <div className="container px-4 sm:px-6 mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">Rally Your Community Today</h2>
            <p className="text-muted-foreground text-lg">
              Start building action-backed momentum for your cause, non-profit, or civic organization.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/contact">Get Started for Causes</Link>
              </Button>
            </div>
          </div>
        </section>

        <PioneerCallout />
      </div>
    </>
  );
}
