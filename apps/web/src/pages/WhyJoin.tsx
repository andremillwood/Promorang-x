import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  Crown,
  Key,
  TrendingUp,
  Users,
  Gift,
  Zap,
  ArrowRight,
  Check,
  Star,
  Lock,
  Unlock,
  Flame,
  Target,
  Camera,
  MapPin,
} from "lucide-react";
import SEO from "@/components/SEO";
import { StandingLeaderboard } from "@/components/StandingLeaderboard";

// Instagram-style story highlights
const statusTiers = [
  {
    level: 1,
    name: "Newcomer",
    color: "from-slate-400 to-slate-500",
    unlocks: "Join moments",
    socialValue: "Just visiting",
    icon: Users,
  },
  {
    level: 2,
    name: "Regular",
    color: "from-blue-400 to-blue-600",
    unlocks: "Early access to drops",
    socialValue: "Known by hosts",
    icon: Star,
  },
  {
    level: 3,
    name: "Insider",
    color: "from-amber-400 to-orange-500",
    unlocks: "VIP moments unlocked",
    socialValue: "Hosts save spots",
    icon: Key,
  },
  {
    level: 4,
    name: "Luminary",
    color: "from-purple-400 to-pink-500",
    unlocks: "Exclusive brand experiences",
    socialValue: "Brands DM you",
    icon: Crown,
  },
  {
    level: 5,
    name: "Icon",
    color: "from-primary to-accent",
    unlocks: "Co-host with brands",
    socialValue: "You're the sponsor magnet",
    icon: Sparkles,
  },
];

// The "Reframe": Instead of listing features, show psychological outcomes
const psychologicalBenefits = [
  {
    before: "RSVP to events",
    after: "Build your city reputation",
    insight: "Every check-in is a social signal that you show up",
  },
  {
    before: "Get free stuff",
    after: "Unlock experiences others can't access",
    insight: "Status is having access others don't",
  },
  {
    before: "Earn points",
    after: "Convert attention into social capital",
    insight: "Your consistency becomes your currency",
  },
  {
    before: "Join community",
    after: "Become someone worth knowing",
    insight: "The platform makes your reliability visible",
  },
];

// Instagram-style "Stories" of what users are earning right now
const liveActivity = [
  { user: "Sarah", action: "checked in", moment: "Sunset Yoga", points: 50, time: "2m ago" },
  { user: "Marcus", action: "unlocked", moment: "VIP Coffee Tasting", points: 0, time: "5m ago" },
  { user: "Elena", action: "earned", moment: "7-day streak bonus", points: 100, time: "12m ago" },
  { user: "Chris", action: "ranked up to", moment: "Insider status", points: 0, time: "18m ago" },
  { user: "Lisa", action: "joined", moment: "Founder's Table", points: 25, time: "23m ago" },
];

// The economy breakdown - visual and simple
const earnBreakdown = [
  { action: "Join a moment", points: 25, icon: Check, frequency: "Every moment" },
  { action: "Check in at venue", points: 50, icon: MapPin, frequency: "Proof of presence" },
  { action: "Share a photo", points: 15, icon: Camera, frequency: "UGC reward" },
  { action: "7-day streak", points: 100, icon: Flame, frequency: "Weekly bonus" },
  { action: "Refer a friend", points: 50, icon: Users, frequency: "Per signup" },
];

export default function WhyJoin() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Why Join Promorang - Turn Your Presence Into Status"
        description="Your city is full of free experiences. We just make sure your reputation grows every time you show up. Join moments, earn points, unlock status."
      />

      {/* HERO: Reframe the entire premise */}
      <section className="relative overflow-hidden bg-gradient-hero pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* The Hook: Reframe from "events" to "status game" */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">
                The Status Game You Play IRL
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              Your City is Full of{" "}
              <span className="text-gradient-primary">Free Experiences.</span>
              <br />
              <span className="text-2xl md:text-4xl font-normal text-muted-foreground">
                We Just Make Sure You Get Rewarded for Showing Up.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Join moments → Earn points → Build status → Unlock experiences others can't access.
              It's not RSVPing. It's building your reputation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" asChild className="shadow-glow">
                <Link to="/discover">
                  Start Building Status
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/rewards">See the Economy</Link>
              </Button>
            </motion.div>

            {/* Social Proof: Live activity feed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 max-w-lg mx-auto"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                  Live Activity • People earning right now
                </p>
                <div className="space-y-2">
                  {liveActivity.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-white font-bold">
                          {item.user[0]}
                        </div>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{item.user}</span> {item.action} {item.moment}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.points > 0 && (
                          <span className="text-amber-600 font-bold text-xs">+{item.points}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE REFRAME SECTION: Before/After Psychology */}
      <section className="py-20 md:py-32 bg-charcoal text-cream">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              It's Not About Events.
              <br />
              <span className="text-primary italic">It's About Becoming Someone.</span>
            </h2>
            <p className="text-cream/60 text-lg">
              The same action. Completely different psychological value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {psychologicalBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-xs font-bold">WAS</span>
                  </div>
                  <div>
                    <p className="text-cream/50 line-through text-sm">{benefit.before}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">NOW</span>
                      </div>
                      <p className="text-cream font-bold text-lg">{benefit.after}</p>
                    </div>
                    <p className="text-cream/40 text-sm mt-3 italic">"{benefit.insight}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATUS TIERS: Instagram-style visual progression */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">
              <Crown className="w-3 h-3 mr-1" />
              Status Levels
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Climb the Ranks. Unlock the City.
            </h2>
            <p className="text-muted-foreground text-lg">
              Your consistency becomes your currency. The more you show up, the more exclusive access you unlock.
            </p>
          </div>

          {/* Instagram Story-style tier display */}
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {statusTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-64 snap-start"
              >
                <div className={`bg-gradient-to-br ${tier.color} rounded-3xl p-1 h-full`}>
                  <div className="bg-card rounded-[22px] p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                        <tier.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-3xl font-black text-muted-foreground/20">{tier.level}</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{tier.name}</h3>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{tier.unlocks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">{tier.socialValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Swipe to see all levels • Points required increase with each tier
          </p>
        </div>
      </section>

      {/* EARN BREAKDOWN: Simple, visual, Instagram-style */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              The Economy
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              How You Earn
            </h2>
            <p className="text-muted-foreground text-lg">
              Every action has a value. Stack them to build your status.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              {earnBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-600">+{item.points}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary">1,000 points = 1 Key</span> • Keys unlock exclusive funded moments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE VIRTUOUS CYCLE: Show the flywheel */}
      <section className="py-20 md:py-32 bg-charcoal text-cream">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              The Flywheel
            </h2>
            <p className="text-cream/60 text-lg">
              Your participation makes the whole platform better. Here's how:
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "You Join", desc: "Commit to showing up", icon: Users },
                { step: "2", title: "You Check In", desc: "Prove you attended", icon: MapPin },
                { step: "3", title: "Brands See", desc: "Verified audiences = sponsor interest", icon: Target },
                { step: "4", title: "More Funded Moments", desc: "Better experiences for everyone", icon: Gift },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Step {item.step}</p>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-cream/50">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-cream/40 text-sm italic">
                "Your reliability becomes the platform's social proof. Brands pay for that."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF: Leaderboard */}
      <StandingLeaderboard />

      {/* FINAL CTA: Loss aversion + Default action */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elevated"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Every Moment You Miss is Status Someone Else Gains.
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                The early adopters are building their reputation right now. 
                In 6 months, their status will unlock experiences you'll be waiting in line for.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" asChild className="shadow-glow">
                  <Link to="/discover">
                    Claim Your Status
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Free to join • Earn on your first moment
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
