import { Button } from "@/components/ui/button";
import { Users, Gift, Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "1. Begin the Search",
    description: "Find the pulse of your niche. From secret tastings to hidden workshops, discover the experiences that bring people together.",
  },
  {
    icon: MapPin,
    title: "2. The Digital Handshake",
    description: "A shared moment, verified by your presence. Your authentic participation generates Community Gratitude—the fuel of our ecosystem.",
  },
  {
    icon: Sparkles,
    title: "3. Building Your Standing",
    description: "From Seeker to Eminence. Your consistency builds your Community Standing, unlocking whispers of restricted brand privileges.",
  },
  {
    icon: Gift,
    title: "4. Stepping Into the Vault",
    description: "Redeem your reputation for stories yet to be told. Use your keys to unlock once-in-a-lifetime perks from the brands you love.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Gatherings made simple
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect in the real world. Share authentic stories that resonate across your community and beyond.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group text-center p-8 rounded-3xl bg-card border border-border/40 hover:shadow-soft-xl transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
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
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-sunset p-10 md:p-16 text-center shadow-elevated"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThDMzYgMTMuNzkxIDM0LjIwOSAxMiAzMiAxMnMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4 italic">
              Ready to begin your journey?
            </h3>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-10 text-lg">
              Whether you're looking to find a story or lead your community as a Steward, 
              your place in the standing ladder starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button variant="warm" size="xl" className="font-bold uppercase tracking-widest px-10 h-14 shadow-glow rounded-2xl">
                Enter the Community
              </Button>
              <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-bold uppercase tracking-wider">
                Browse Stories
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
