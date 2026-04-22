import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Users,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";

const pricingTiers = [
  {
    name: "The Host's Path",
    price: "Earned",
    period: "through action",
    description: "Build trust. Grow your reputation. Unlock the Vault.",
    features: [
      "Create Unlimited Moments & Gatherings",
      "Build a Verified Social History",
      "Progress through Community Levels",
      "Link Socials for Sharing Bonuses",
      "Redeem Gratitude in the Private Vault",
      "0% Fee on community-funded events",
    ],
    cta: "Start Your Journey",
    popular: true,
  },
  {
    name: "Community Leader",
    price: "Apply",
    period: "for credentials",
    description: "For city-wide leaders and community organizers.",
    features: [
      "Orchestrate Large-Scale Moments",
      "Priority Support & Verification",
      "Direct Brand Partnership Services",
      "Manage Multiple Partner Venues",
      "Revenue Share on Community Growth",
      "Private Custom Rewards",
    ],
    cta: "Request Invite",
    popular: false,
  },
];

const ForCommunities = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promorang for Communities - The Art of Hosting"
        description="Create the moments that define your niche. Build your reputation, unlock sharing bonuses, and enter the private Vault."
        type="website"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-20 pt-24 text-white sm:pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -top-12 -right-12" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">The Community Economy</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-[18rem] break-words font-serif text-[1.8rem] font-bold italic leading-tight sm:max-w-4xl sm:text-5xl md:text-7xl">
              Grow Your <span className="text-primary italic">Reputation.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-[20rem] text-base leading-relaxed text-white/60 sm:max-w-2xl sm:text-lg md:text-xl">
              Hosting moments is the heartbeat of any community. By consistently 
              bringing people together, you build a verified history that increases 
              your community level—unlocking sharing bonuses and the private 
              rewards of the **Vault.**
            </p>

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/propose">
                  Start Hosting Moments
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/5" size="lg" asChild>
                <Link to="/discover">See what's happening</Link>
              </Button>
            </div>

            <div className="mt-6 -mx-4 overflow-x-auto px-4 touch-pan-x snap-x-mandatory scrollbar-none sm:hidden">
              <div className="flex gap-3 pb-1 text-left">
                <div className="min-w-[230px] snap-start rounded-2xl border border-primary/20 bg-white/5 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Journey</p>
                  <p className="mt-2 text-sm font-medium text-white">Host consistently, level up your reputation, then unlock better rewards and partner opportunities.</p>
                </div>
                <div className="min-w-[220px] snap-start rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">App-like</p>
                  <p className="mt-2 text-sm text-white/70">This page now behaves more like a progressive onboarding flow than a wide brochure layout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Community Level Section */}
      <section className="py-24 bg-background border-b border-border">
        <div className="container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
              Your <span className="text-primary">Community Level.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Your journey from a new face to a community leader is recognized 
              with care and rewarded with exclusive perks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { name: "Seeker", desc: "The start of your journey.", icon: Sparkles, color: "text-slate-400" },
              { name: "Herald", desc: "A trusted voice in the community.", icon: Flame, color: "text-orange-500" },
              { name: "Luminary", desc: "A leader known for consistency.", icon: TrendingUp, color: "text-amber-500" },
              { name: "Eminence", desc: "A pillar of the local scene.", icon: ShieldCheck, color: "text-primary" },
            ].map((tier, i) => (
              <div key={i} className="group rounded-[2.5rem] border border-border bg-card p-6 text-center transition-all hover:border-primary/40 md:p-8">
                <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6 ${tier.color} group-hover:scale-110 transition-transform`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</p>
                <div className="mt-6 pt-6 border-t border-border flex justify-center gap-1">
                  {Array.from({ length: i + 1 }).map((_, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${tier.color} opacity-60`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing Boost Section */}
      <section className="py-24 bg-charcoal text-white overflow-hidden relative">
        <div className="container px-6 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-black uppercase tracking-widest text-[10px]">
                <Zap className="w-3 h-3" />
                The Sharing Bonus
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
                Your Reach is <span className="text-primary italic">Impact.</span>
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                We believe your social presence is a gift to the community. Link your 
                accounts to unlock **Sharing Bonuses** that help you progress faster 
                through the community levels.
              </p>
              <div className="space-y-4">
                {[
                  { tier: "Whisper", reach: "500+", boost: "1.1x" },
                  { tier: "Echo", reach: "2k+", boost: "1.25x" },
                  { tier: "Thunder", reach: "10k+", boost: "1.5x" },
                  { tier: "Tempest", reach: "50k+", boost: "2.0x" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-bold">{item.tier} <span className="ml-2 font-normal text-white/40">({item.reach} Followers)</span></span>
                    <span className="font-black text-primary">{item.boost} Bonus</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-8 text-center md:p-12">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold italic mb-4">The Vault Awaits</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-8">
                  Highly active community members gain exclusive access to premium rewards 
                  funded by our brand partners—from special gifts to unforgettable experiences.
                </p>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/auth">Check Your Community Level</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container px-6 text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8 italic">
            Ready to <span className="text-primary italic">Bring People Together?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Join a network of people creating meaningful, real-life experiences 
            in their local communities.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/propose">
              Create Your First Moment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForCommunities;
