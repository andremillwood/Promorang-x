import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, Receipt, Camera, Trophy, Sparkles, Building2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CaseStudy {
  id: string;
  client: string;
  category: string;
  badge: string;
  title: string;
  challenge: string;
  solution: string;
  metrics: Array<{ label: string; value: string; hint?: string }>;
  icon: typeof Receipt;
  accentColor: string;
  glowColor: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "fmcg-retail",
    client: "Lifespan Spring Water & Sunshine Snacks",
    category: "Enterprise Retail Promotion",
    badge: "FMCG / Retail Capture",
    title: "Automated Supermarket Receipt Capture & Sweepstakes Engine",
    challenge: "Traditional paper-entry and agency sweepstakes suffered from high friction, delayed validation, and zero attributable first-party consumer data.",
    solution: "Deployed Promorang's automated receipt verification engine. Shoppers scanned retail receipts for instant verified entries, automated random winner draws, and live email/SMS winner notifications.",
    metrics: [
      { label: "Verification Speed", value: "< 5s", hint: "Automated OCR capture" },
      { label: "Winner Selection", value: "100%", hint: "Compliant & auditable" },
      { label: "First-Party Data", value: "Verified", hint: "Direct customer leads" },
    ],
    icon: Receipt,
    accentColor: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30",
    glowColor: "bg-cyan-500/10",
  },
  {
    id: "ladies-expo",
    client: "Ladies Expo Jamaica",
    category: "Live Event & Expo Activation",
    badge: "Live Expo Growth",
    title: "Selfie & Win: 800+ On-the-Ground Verified Signups in 48 Hours",
    challenge: "High-traffic expo booth needed an engaging, viral mechanism to convert passing footfall into active, authenticated platform users.",
    solution: "Launched the 'Engage' Selfie Activation with a $500 cash draw. Attendees snapped a branded selfie, registered their profile, and immediately received digital entry receipts.",
    metrics: [
      { label: "New Signups", value: "800+", hint: "Single weekend activation" },
      { label: "Photo Submissions", value: "800+", hint: "Authentic UGC captured" },
      { label: "Cost Per Lead", value: "Near-Zero", hint: "Driven by cash hook" },
    ],
    icon: Camera,
    accentColor: "from-pink-500/20 to-rose-500/20 border-rose-500/30",
    glowColor: "bg-rose-500/10",
  },
  {
    id: "venue-revival",
    client: "I Luv Hip Hop & Encore Throwback Series",
    category: "Nightlife & Venue Optimization",
    badge: "Dead-Night Revival",
    title: "Filling Empty Venues: Scaling Footfall from 0 to 230+ In-Person Guests",
    challenge: "Partner venues suffered from slow, unprofitable weeknights with near-zero baseline foot traffic and high overhead.",
    solution: "Curated exclusive, high-energy cultural rituals (Kingston's only dedicated Hip Hop & 2000s throwback scenes) paired with digital guestlist passes and PromoShare crew incentives.",
    metrics: [
      { label: "Footfall Growth", value: "0 ➔ 230+", hint: "Average per event night" },
      { label: "Bar & Food Spend", value: "+340%", hint: "Direct venue revenue" },
      { label: "Community Retention", value: "Repeat", hint: "Bi-weekly loyal crowd" },
    ],
    icon: Flame,
    accentColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    glowColor: "bg-amber-500/10",
  },
];

export function BrandCaseStudies() {
  return (
    <section className="py-20 bg-charcoal text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary mb-4 border border-primary/30">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Proven Commercial Track Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Tested on the ground. <br />
            <span className="text-gradient-primary">Proven with real brands & crowds.</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg">
            From household FMCG brands to high-energy cultural nightlife, Promorang turns passive promotions into verified human movement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CASE_STUDIES.map((study, index) => {
            const Icon = study.icon;
            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`rounded-3xl border bg-gradient-to-b ${study.accentColor} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl`}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 ${study.glowColor} rounded-full blur-3xl`} />
                
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-medium text-xs">
                      {study.badge}
                    </Badge>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{study.client}</p>
                  <h3 className="text-xl font-black tracking-tight text-white mb-4 leading-snug">{study.title}</h3>
                  
                  <div className="space-y-3 mb-8 text-sm text-zinc-300">
                    <p className="leading-relaxed"><strong className="text-white">Challenge:</strong> {study.challenge}</p>
                    <p className="leading-relaxed"><strong className="text-white">Execution:</strong> {study.solution}</p>
                  </div>
                </div>

                <div>
                  <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    {study.metrics.map((m, idx) => (
                      <div key={idx} className="bg-black/30 rounded-xl p-2.5">
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
