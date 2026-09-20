import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import BusinessOutcomeNavigator from "@/components/business/BusinessOutcomeNavigator";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function BusinessStart() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#060606] text-white">
      <SEO title="PROMORANG for Business — Start with the outcome" description="Tell PROMORANG what needs to change. Get a recommended programme, customize it, and measure what happened." />
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-12 pt-24 sm:px-6 md:pb-16 md:pt-32">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">PROMORANG for business</p>
          <h1 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Start with the change you need.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">You do not need to arrive with a campaign brief. Tell PROMORANG what needs to improve and we will help construct a measurable route.</p>
          <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold">
            <Link to="/demand" className="inline-flex items-center gap-2 text-orange-300">Show me what people want <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/solutions" className="inline-flex items-center gap-2 text-white/50">See all business solutions</Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-6 md:py-20">
        <BusinessOutcomeNavigator />
      </section>
    </main>
  );
}
