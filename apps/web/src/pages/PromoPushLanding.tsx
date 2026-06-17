import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, Megaphone, QrCode, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Megaphone, title: "Ads / QR", text: "Run Meta links, printed QR, direct links, creator referrals, or street activation." },
  { icon: ArrowRight, title: "Moment", text: "Every click enters one Moment. No dead-end form and no separate landing page." },
  { icon: ShieldCheck, title: "Proof", text: "Moves and submissions produce proof events tied to campaign and channel IDs." },
  { icon: Trophy, title: "Reward", text: "Rewards release only after verified action." },
];

export default function PromoPushLanding() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <section className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
            <BadgeDollarSign className="h-3.5 w-3.5" />
            PromoPush
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Run campaigns that convert real-world attention into verified action
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
            PromoPush is Promorang's geo-distribution layer for Moments. It gives hosts, brands, creators, and street teams one tracked path from attention to proof to reward.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-[#FF6A00] text-white hover:bg-[#e65f00]">
              <Link to="/promopush">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link to="/careers/promoters">Join Street Team</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-lg border border-white/10 bg-black/35 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#FF6A00] text-white">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFC300]">Step {index + 1}</p>
                  <h2 className="mt-1 text-lg font-black">{step.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/60">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#FFC300]/30 bg-[#FFC300]/10 p-4 text-sm text-[#FFC300]">
            <QrCode className="mb-2 h-5 w-5" />
            No distribution without tracking. No reward without proof. No campaign without a Moment.
          </div>
        </div>
      </section>
    </div>
  );
}
