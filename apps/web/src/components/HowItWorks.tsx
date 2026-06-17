import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Gift, Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "1. Find your kind of moment",
    description: "Browse drops, tastings, service rituals, creator missions, and neighborhood gatherings that match how you like to spend real time.",
  },
  {
    icon: MapPin,
    title: "2. Show up and leave a Mark",
    description: "Arrive, check in, and let the moment count. Your Mark starts the reward loop without making the experience feel like paperwork.",
  },
  {
    icon: Sparkles,
    title: "3. Earn pieces and standing",
    description: "Early participants and power performers can unlock complementary pieces tied to verified participation, referral movement, and repeat momentum.",
  },
  {
    icon: Gift,
    title: "4. Unlock PromoShare and Gems",
    description: "Use points, Keys, pieces, and PromoShare entries to reach better access, recurring reward cycles, and Gems that power the marketplace.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Promorang Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple enough for a night out. Structured enough to power a whole local economy around verified participation, pieces, and network growth.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden text-center p-8 rounded-2xl bg-card border border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-gradient-primary opacity-80" />
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-charcoal p-8 text-center shadow-elevated md:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-accent/20" />
          <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-primary/30 blur-[90px]" />
          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4 italic">
              Ready to find your first Mark?
            </h3>
            <p className="text-zinc-200 max-w-xl mx-auto mb-10 text-lg">
              Start with one moment. Then let Marks, pieces, PromoShare, and your growing network turn that consistency into something that compounds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button variant="hero" size="xl" className="font-bold uppercase tracking-widest px-10 h-14 shadow-glow rounded-2xl" asChild>
                <Link to="/explore/moments">Find Moments</Link>
              </Button>
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white font-bold uppercase tracking-wider" asChild>
                <Link to="/why-join">See Why Join</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
