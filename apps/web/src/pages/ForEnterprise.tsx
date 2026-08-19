import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import {
  Building2,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  Lock,
  Layers,
  Users2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Headphones,
  FileCheck,
  TrendingUp,
} from "lucide-react";

const enterpriseFeatures = [
  {
    icon: Globe2,
    title: "Multi-Region Orchestration",
    description: "Deploy coordinated multi-city campaigns, localized venue activations, and nationwide creator drops from a unified control deck.",
  },
  {
    icon: Lock,
    title: "SOC-2 & Enterprise Compliance",
    description: "Enterprise-grade data security, strict role-based permissions (RBAC), and custom privacy boundaries to protect brand reputation.",
  },
  {
    icon: Layers,
    title: "Custom API & POS Integration",
    description: "Seamlessly connect Promorang check-ins and coupon redemptions directly into your existing CRM, POS, or loyalty platforms.",
  },
  {
    icon: BarChart3,
    title: "Real-Time BI & Telemetry Exports",
    description: "Stream raw engagement events, O2O conversion data, and participant receipts into Snowflake, BigQuery, or custom BI dashboards.",
  },
  {
    icon: ShieldCheck,
    title: "Escrowed Reward Pools & Governance",
    description: "Manage large-scale budget allocation with automated circuit breakers, fraud detection, and ring-fenced reward pools.",
  },
  {
    icon: Headphones,
    title: "Dedicated Solutions Architect",
    description: "White-glove onboarding, custom campaign strategy, 24/7 priority SLA support, and dedicated campaign optimization team.",
  },
];

const useCases = [
  {
    role: "National Retail & Dining Chains",
    impact: "Drive measurable, verified foot-traffic to hundreds of locations simultaneously with location-gated drops and instant store check-ins.",
  },
  {
    role: "Festival & Mega Event Sponsors",
    impact: "Transform passive brand signage into interactive content missions, physical QR unlocks, and post-event re-engagement campaigns.",
  },
  {
    role: "Global Beverage & CPG Brands",
    impact: "Activate sampling campaigns at scale with verified proof-of-try-on, receipt scans, and direct creator amplification.",
  },
  {
    role: "Agencies & Holding Companies",
    impact: "Manage client portfolios under white-label tenant controls, custom billing workflows, and automated client ROI presentations.",
  },
];

export default function ForEnterprise() {
  return (
    <>
      <SEO
        title="Promorang for Enterprise | Scaled O2O Brand Activation Engine"
        description="Empower enterprise brands, national franchises, and agency holding groups to launch multi-region, verified physical and digital engagement campaigns at scale."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container px-4 sm:px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary">
                <Building2 className="w-4 h-4 mr-2 inline" /> Promorang Enterprise Solutions
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-foreground">
                Scaled Brand Activation & Verified Physical Movement
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Connect national marketing budgets to verified real-world actions. Multi-city campaigns, custom API integrations, enterprise security, and full BI data telemetry.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/contact">
                    Schedule Enterprise Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/pricing">
                    View Enterprise Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <MarketingPromiseStrip />

        {/* Core Enterprise Capabilities */}
        <section className="py-20 md:py-28 bg-muted/10">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">Built for Scale</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                Enterprise Infrastructure for Physical & Digital Engagement
              </h2>
              <p className="text-muted-foreground text-lg">
                Engineered from the ground up for high-volume campaigns, strict brand compliance, and seamless IT stack integration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enterpriseFeatures.map((feat, idx) => (
                <Card key={idx} className="border-border/60 hover:border-primary/40 transition-all shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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

        {/* Enterprise Use Cases */}
        <section className="py-20 border-t border-border bg-background">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">Proven Scenarios</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                How Major Brands Leverage Promorang
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {useCases.map((uc, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{uc.role}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{uc.impact}</p>
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
              roleTitle="Enterprise Brand Leaders"
              headline="Replace Unverified Impressions with Verified Action Receipts"
              points={[
                "Guaranteed ROI transparency through verified venue check-ins and coupon redemptions",
                "Dedicated custom integrations into your CRM, POS, and loyalty frameworks",
                "Full brand safety filters, escrow-backed budget controls, and fraud detection",
                "Executive BI dashboards and raw telemetry export pipelines"
              ]}
              ctaText="Talk to an Enterprise Specialist"
              ctaHref="/contact"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5 border-t border-border text-center">
          <div className="container px-4 sm:px-6 mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">Ready to Scale Your Brand Activation?</h2>
            <p className="text-muted-foreground text-lg">
              Partner with Promorang to design, execute, and verify your next national or multi-region campaign.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/contact">Request Demo & Strategy Call</Link>
              </Button>
            </div>
          </div>
        </section>

        <PioneerCallout />
      </div>
    </>
  );
}
