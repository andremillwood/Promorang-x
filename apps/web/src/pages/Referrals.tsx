import { BadgeDollarSign, Link2, Route, Share2, ShieldCheck, Sparkles } from "lucide-react";
import { ReferralsSection } from "@/components/participant/ReferralsSection";

export default function Referrals() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#FF6A00]/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
                <Sparkles className="h-3.5 w-3.5" />
                Distribution + credit
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[.94] tracking-tight sm:text-6xl">
                Move something useful.
                <br />
                <span className="text-[#FF6A00]">Get credit when it actually moves.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Share a Want, Moment, Challenge, Gig, Offer or Content Drop because someone else may genuinely value it. A recorded referral route can connect later activity back to you. Rewards and affiliate commission only exist when a specific funded rule says what qualifies.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Boundary icon={Share2} title="Sharing is optional" copy="PROMORANG should never require spam to make the product work." />
              <Boundary icon={Route} title="Credit needs attribution" copy="A generic share can move something; a recorded link is what lets PROMORANG credit the journey." />
              <Boundary icon={BadgeDollarSign} title="Earnings need a rule" copy="No funded rule + verified qualifying action means no commission promise." />
            </div>
          </div>
        </header>

        <section aria-labelledby="referral-dashboard-title" className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF6A00]">Your movement</p>
            <h2 id="referral-dashboard-title" className="mt-1 text-2xl font-black">What happened because your link travelled?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Clicks, joined people, active referrals and paid rewards are different states. PROMORANG should show each one without pretending the next one happened.</p>
          </div>
          <ReferralsSection />
        </section>
      </div>
    </main>
  );
}

function Boundary({ icon: Icon, title, copy }: { icon: typeof Link2; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#FF6A00]" />
        <p className="text-xs font-black text-white">{title}</p>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-white/42">{copy}</p>
    </div>
  );
}
