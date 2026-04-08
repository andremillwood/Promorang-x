import { Button } from "@/components/ui/button";
import { Users, Calendar, Gift, Sparkles } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Join Together",
    description: "Find experiences worth sharing. From food festivals to sunrise yoga, discover what brings people together in your city.",
  },
  {
    icon: Calendar,
    title: "Host Your Moment",
    description: "Create gatherings that matter. Invite friends, neighbors, or your whole community to something meaningful.",
  },
  {
    icon: Gift,
    title: "Be Rewarded",
    description: "Sometimes, showing up is enough. Brands and local businesses appreciate real participation with real rewards.",
  },
  {
    icon: Sparkles,
    title: "Remember Forever",
    description: "Build your personal archive of moments. No likes, no followers—just the experiences that shaped your story.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Moments are simple
          </h2>
          <p className="text-lg text-muted-foreground">
            No algorithms. No endless feeds. Just real experiences you choose to be part of.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group text-center p-6 rounded-2xl bg-card hover:shadow-card transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-primary text-primary-foreground mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-sunset p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThDMzYgMTMuNzkxIDM0LjIwOSAxMiAzMiAxMnMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Ready to start your moment?
            </h3>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8">
              Whether you're looking to join something amazing or host your own gathering, 
              Promorang makes it simple to bring people together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="warm" size="lg" className="font-semibold">
                Create a Moment
              </Button>
              <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Browse Moments
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
